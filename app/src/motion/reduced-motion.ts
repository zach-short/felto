import { DIALS } from "@/config/dials";

// Every kind of movement the app makes (GF-6, PLAN.md section 3). The press and the fade are the
// two that reduced motion keeps.
export type MotionKind = "press" | "fade" | (typeof DIALS.reducedMotionSkips)[number];

// GF-8: when the phone asks for reduced motion, the kinds the dial lists are skipped. The dial,
// not this function, says which, so a kind is moved in or out of the list in one place.
export function motionAllowed(kind: MotionKind, reduced: boolean): boolean {
  if (!reduced) return true;
  return !DIALS.reducedMotionSkips.some((skipped) => skipped === kind);
}
