import { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { bounceSteps } from "@/motion/motion-steps";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

const NEVER = ReduceMotion.Never;

// PLAN.md section 3: a right answer swells and settles. The caller starts it with bounce(); under
// reduced motion bounce() does nothing and the view stays at rest (GF-8).
export function useBounce() {
  const allowed = motionAllowed("bounce", useReducedMotion());
  const scale = useSharedValue(1);
  const bounce = () => {
    if (!allowed) return;
    const [out, back] = bounceSteps();
    const leg = (step: typeof out) => withTiming(step.to, { duration: step.ms, reduceMotion: NEVER });
    scale.set(withSequence(NEVER, leg(out), leg(back)));
  };
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return { style, bounce };
}
