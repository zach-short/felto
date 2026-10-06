import { useEffect } from "react";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// BD-G10: motionAllowed has already asked the phone, so Reanimated is told never to skip
const NEVER = ReduceMotion.Never;

// GF-10: a popover or a dialog springs up from a smaller size and fades in, each time `shown` turns
// true; the caller sets the point it grows from (a popover's arrow) with transformOrigin. Reduced
// motion skips the spring, because the dial lists "pop", and keeps the fade (GF-8). It vanishes at
// once when `shown` turns false, as a native dialog does.
export function usePop(shown: boolean) {
  const reduced = useReducedMotion();
  const springs = motionAllowed("pop", reduced);
  const fades = motionAllowed("fade", reduced);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (!shown) {
      opacity.set(0);
      return;
    }
    const from = springs ? DIALS.popFromScale : 1;
    const spring = { duration: DIALS.popMs, dampingRatio: DIALS.popDamping, reduceMotion: NEVER };
    scale.set(withSequence(NEVER, withTiming(from, { duration: 0, reduceMotion: NEVER }), withSpring(1, spring)));
    opacity.set(withSequence(NEVER, withTiming(0, { duration: 0, reduceMotion: NEVER }), withTiming(1, { duration: fades ? DIALS.fadeMs : 0, reduceMotion: NEVER })));
  }, [shown, springs, fades, scale, opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));
}
