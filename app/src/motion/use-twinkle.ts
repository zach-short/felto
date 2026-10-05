import { useEffect } from "react";
import {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// BD-G10: motionAllowed has already asked the phone, so Reanimated is told never to skip
const NEVER = ReduceMotion.Never;

// GF-17: one star of a sparkle layer grows and brightens, then shrinks and fades, over and over,
// starting `delayMs` into the cycle so the stars of a box never twinkle together. It loops only
// while `active` (the screen is in view): turning it off, or unmounting the star, cancels the
// loop, so nothing turns where no one can see it. A particle, so reduced motion keeps it hidden.
export function useTwinkle(active: boolean, delayMs: number) {
  const allowed = motionAllowed("particles", useReducedMotion());
  const glow = useSharedValue(0);
  const smallest = DIALS.sparkleMinScale;
  useEffect(() => {
    if (!active || !allowed) return;
    const half = { duration: DIALS.sparklePeriodMs / 2, reduceMotion: NEVER };
    const cycle = withSequence(NEVER, withTiming(1, half), withTiming(0, half));
    glow.set(withDelay(delayMs, withRepeat(cycle, -1, false, undefined, NEVER), NEVER));
    return () => {
      cancelAnimation(glow);
      glow.set(0);
    };
  }, [active, allowed, delayMs, glow]);
  return useAnimatedStyle(() => ({ opacity: glow.get(), transform: [{ scale: smallest + (1 - smallest) * glow.get() }] }));
}
