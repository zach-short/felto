import { useEffect, useRef } from "react";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { dropSteps } from "@/motion/answer-steps";
import { motionAllowed } from "@/motion/reduced-motion";
import { sequenceOf } from "@/motion/sequence";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// A counter that falls a little and shrinks each time its value goes down: the heart in the lesson
// header when a heart is lost (PLAN.md phase 4). A rise, such as a heart won back over time, does
// not move it. It is a bounce of a kind, so reduced motion skips it and the number alone changes.
export function useDrop(value: number | null) {
  const allowed = motionAllowed("bounce", useReducedMotion());
  const previous = useRef(value);
  const fall = useSharedValue(0);
  const shrink = useSharedValue(1);
  useEffect(() => {
    const fell = value !== null && previous.current !== null && value < previous.current;
    previous.current = value;
    if (!fell || !allowed) return;
    const steps = dropSteps();
    fall.set(sequenceOf(steps.fall));
    shrink.set(sequenceOf(steps.shrink));
  }, [value, allowed, fall, shrink]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: fall.get() }, { scale: shrink.get() }] }));
}
