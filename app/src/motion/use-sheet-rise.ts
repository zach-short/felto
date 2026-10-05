import { useEffect } from "react";
import type { LayoutChangeEvent } from "react-native";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// The feedback sheet rises from below the screen on a spring and sinks back when it closes
// (PLAN.md phase 4, step 3; section 3: spring, 320 ms). The sheet measures itself, so it moves by
// its own height whatever its words. It is fully see-through while all the way down, which also
// hides it before its first measure. Reduced motion keeps the rise, as it kept the native
// sheet's (reduced-motion.ts); if the dial ever lists "rise", the sheet appears at once.
export function useSheetRise(shown: boolean) {
  const animate = motionAllowed("rise", useReducedMotion());
  const height = useSharedValue(0);
  const up = useSharedValue(shown ? 1 : 0);
  useEffect(() => {
    const to = shown ? 1 : 0;
    const spring = { duration: DIALS.sheetRiseMs, dampingRatio: DIALS.sheetRiseDamping, reduceMotion: ReduceMotion.Never };
    up.set(animate ? withSpring(to, spring) : to);
  }, [shown, animate, up]);
  const onLayout = (event: LayoutChangeEvent) => height.set(event.nativeEvent.layout.height);
  const style = useAnimatedStyle(() => ({
    opacity: up.get() > 0.001 ? 1 : 0,
    transform: [{ translateY: Math.max(0, (1 - up.get()) * height.get()) }],
  }));
  return { style, onLayout };
}
