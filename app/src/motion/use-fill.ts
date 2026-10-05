import { useEffect } from "react";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// The lesson's progress bar grows to its new share after each answer (PLAN.md phase 4, step 4).
// `done` is from 0 to 1. The fill shows progress, so reduced motion keeps it (reduced-motion.ts);
// if the dial ever lists "fill", the bar jumps instead.
export function useFill(done: number) {
  const animate = motionAllowed("fill", useReducedMotion());
  const share = useSharedValue(done);
  useEffect(() => {
    share.set(withTiming(done, { duration: animate ? DIALS.progressFillMs : 0, reduceMotion: ReduceMotion.Never }));
  }, [done, animate, share]);
  return useAnimatedStyle(() => ({ width: `${share.get() * 100}%` }));
}
