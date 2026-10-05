import { useEffect } from "react";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// A chosen row rises above its edge and settles back when it stops being the choice. The lift
// says which row is chosen, a change of state, so reduced motion keeps it (reduced-motion.ts); if
// the dial ever lists "lift", the row moves at once instead.
export function useLift(lifted: boolean) {
  const animate = motionAllowed("lift", useReducedMotion());
  const offset = useSharedValue(lifted ? -DIALS.chooseLift : 0);
  useEffect(() => {
    const to = lifted ? -DIALS.chooseLift : 0;
    offset.set(withTiming(to, { duration: animate ? DIALS.liftMs : 0, reduceMotion: ReduceMotion.Never }));
  }, [lifted, animate, offset]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));
}
