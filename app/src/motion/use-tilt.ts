import { useAnimatedStyle } from "react-native-reanimated";

import { tiltSteps } from "@/motion/answer-steps";
import { useStepsOn } from "@/motion/use-steps-on";

// GF-6: the host tilts its head at a wrong answer, each time `active` turns true
export function useTilt(active: boolean, delayMs = 0) {
  const angle = useStepsOn("tilt", active, tiltSteps, 0, delayMs);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.get()}deg` }] }));
}
