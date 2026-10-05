import { useState } from "react";
import { useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { compactSaving, exerciseDensity, lessonBodySpace, type Arrangement, type Density } from "@/components/exercise/exercise-layout";

// D17 and GF-11: the density of the exercise on screen. The rows report where they end each time
// their layout changes; the rule of exercise-layout.ts turns that into roomy or compact. The
// first draw is roomy, and a change of density draws once more, after which the rule gives the
// same answer, so it settles in one step.
export function useExerciseDensity(arrangement: Arrangement, rows: number, blocksAbove: number) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [density, setDensity] = useState<Density>("roomy");
  const onRowsLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const saving = compactSaving(rows, blocksAbove, arrangement);
    const next = exerciseDensity(lessonBodySpace(window, insets), y + height, density, saving);
    if (next !== density) setDensity(next);
  };
  return { density, onRowsLayout };
}
