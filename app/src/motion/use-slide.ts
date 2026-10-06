import { useEffect } from "react";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// GF-10: a switch's knob slides `travel` points to its new side when the value flips. The slide
// shows the new state, a change of state and not a flourish, so reduced motion keeps it
// (reduced-motion.ts), as it keeps a chosen row's lift; if the dial ever lists "slide", the knob
// moves at once instead.
export function useSlide(on: boolean, travel: number) {
  const animate = motionAllowed("slide", useReducedMotion());
  const share = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    share.set(withTiming(on ? 1 : 0, { duration: animate ? DIALS.switchSlideMs : 0, reduceMotion: ReduceMotion.Never }));
  }, [on, animate, share]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: share.get() * travel }] }));
}
