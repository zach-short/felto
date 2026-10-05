import { ReduceMotion, withDelay, withSequence, withTiming } from "react-native-reanimated";

import type { MotionStep } from "@/motion/motion-steps";

// BD-G10: motionAllowed has already asked the phone, so Reanimated is told never to skip
const NEVER = ReduceMotion.Never;

// The legs of a pure sequence (motion-steps.ts, answer-steps.ts) as one animation, started after
// an optional delay
export function sequenceOf(steps: MotionStep[], delayMs = 0): number {
  const legs = steps.map((step) => withTiming(step.to, { duration: step.ms, reduceMotion: NEVER }));
  const sequence = withSequence(NEVER, ...legs);
  return delayMs > 0 ? withDelay(delayMs, sequence, NEVER) : sequence;
}
