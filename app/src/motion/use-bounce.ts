import { useAnimatedStyle } from "react-native-reanimated";

import { bounceSteps } from "@/motion/motion-steps";
import { useStepsOn } from "@/motion/use-steps-on";

// PLAN.md section 3: a right answer swells and settles, each time `active` turns true. Under
// reduced motion the view stays at rest (GF-8). Phase 4 made this declarative, as every hook of
// the answer loop is; before it, a caller started it with bounce(), and nothing called it.
export function useBounce(active: boolean, delayMs = 0) {
  const scale = useStepsOn("bounce", active, bounceSteps, 1, delayMs);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
}
