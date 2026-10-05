import { useAnimatedStyle } from "react-native-reanimated";

import { flashSteps } from "@/motion/answer-steps";
import { useStepsOn } from "@/motion/use-steps-on";

// The right answer's colour comes up over a view and fades back. It is a fade, so GF-8 keeps it
// under reduced motion: the colour, not the movement, says the answer was right.
export function useFlash(active: boolean) {
  const opacity = useStepsOn("fade", active, flashSteps, 0);
  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}
