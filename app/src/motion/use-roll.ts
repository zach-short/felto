import { useEffect } from "react";
import { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// GF-15: one column of a rolling number slides its strip of glyphs from the glyph at `from` to the
// glyph at `to`, `cell` points each, over the dial's time, slowing as it lands. Reduced motion
// shows the `to` glyph at once. The end comes from the props, never from the end of the animation,
// so a column drawn again, or mounted anew mid-roll, shows the right digit.
export function useRoll(from: number, to: number, cell: number) {
  const allowed = motionAllowed("roll", useReducedMotion());
  const index = useSharedValue(allowed ? from : to);
  useEffect(() => {
    const timing = { duration: allowed ? DIALS.rollMs : 0, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never };
    index.set(withTiming(to, timing));
  }, [allowed, to, index]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -index.get() * cell }] }));
}
