import { useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";

import type { MotionStep } from "@/motion/motion-steps";
import { motionAllowed, type MotionKind } from "@/motion/reduced-motion";
import { sequenceOf } from "@/motion/sequence";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// A value at rest that plays a sequence each time `active` turns true, so a component says when a
// movement happens and never starts one itself. Under reduced motion a kind the dial skips stays
// at rest (GF-8). `steps` is a function of a module, so it is the same on every render.
export function useStepsOn(kind: MotionKind, active: boolean, steps: () => MotionStep[], rest: number, delayMs = 0) {
  const allowed = motionAllowed(kind, useReducedMotion());
  const value = useSharedValue(rest);
  useEffect(() => {
    if (active && allowed) value.set(sequenceOf(steps(), delayMs));
  }, [active, allowed, value, steps, delayMs]);
  return value;
}
