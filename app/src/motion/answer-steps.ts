import { DIALS } from "@/config/dials";
import type { MotionStep } from "@/motion/motion-steps";

// The legs of the answer loop's movements (game-feel PLAN.md phase 4), as plain numbers so a
// node test can check them. Each sequence ends at rest and takes exactly its dial's time.

// Legs of equal time to the given values; the last leg takes what rounding left, so the total is
// exactly `ms` whatever the dial is set to
export function evenSteps(values: number[], ms: number): MotionStep[] {
  const leg = Math.floor(ms / values.length);
  return values.map((to, i) => ({ to, ms: i === values.length - 1 ? ms - leg * i : leg }));
}

// A wrong answer: the row swings sideways shakeSwings times, alternating sides, then rests
export function shakeSteps(): MotionStep[] {
  const swings = Array.from({ length: DIALS.shakeSwings }, (_, i) => (i % 2 === 0 ? 1 : -1) * DIALS.shakeDistance);
  return evenSteps([...swings, 0], DIALS.shakeMs);
}

// The host on a wrong answer: the head tips one way, comes back half as far past rest, then rests
export function tiltSteps(): MotionStep[] {
  return evenSteps([-DIALS.tiltDegrees, DIALS.tiltDegrees / 2, 0], DIALS.tiltMs);
}

// The right answer's row: its colour comes up over the face and fades back
export function flashSteps(): MotionStep[] {
  return evenSteps([DIALS.flashOpacity, 0], DIALS.flashMs);
}

// A lost heart: it falls a little and shrinks, then comes back, both in the same time
export function dropSteps(): { fall: MotionStep[]; shrink: MotionStep[] } {
  return {
    fall: evenSteps([DIALS.heartDropDistance, 0], DIALS.heartDropMs),
    shrink: evenSteps([DIALS.heartDropScale, 1], DIALS.heartDropMs),
  };
}
