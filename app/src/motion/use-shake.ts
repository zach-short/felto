import { useAnimatedStyle } from "react-native-reanimated";

import { shakeSteps } from "@/motion/answer-steps";
import { useStepsOn } from "@/motion/use-steps-on";

// A wrong answer's row swings sideways (PLAN.md section 3). The caller puts this style on a view
// inside its pressable, never on the pressable, so the tap target does not move under a finger.
export function useShake(active: boolean) {
  const offset = useStepsOn("shake", active, shakeSteps, 0);
  return useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));
}
