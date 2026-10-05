import { DIALS } from "@/config/dials";

// One leg of a sequence: move to a value over a number of milliseconds
export type MotionStep = { to: number; ms: number };

// The right-answer bounce of PLAN.md section 3: out to the dial's scale and back to rest. The two
// legs share the dial's time, so the whole bounce takes exactly bounceMs whatever it is set to.
export function bounceSteps(): [MotionStep, MotionStep] {
  const out = Math.round(DIALS.bounceMs / 2);
  return [
    { to: DIALS.bounceScale, ms: out },
    { to: 1, ms: DIALS.bounceMs - out },
  ];
}

// GF-2: how far a pressed primary button moves. The face sinks by the whole raised edge, so its
// bottom meets the edge's bottom, and the button shrinks by the press scale. A worklet, because
// the press style calls it on the UI thread every frame; in a node test the directive is inert.
export function pressedShape(progress: number): { scale: number; sink: number } {
  "worklet";
  return { scale: 1 + (DIALS.pressScale - 1) * progress, sink: DIALS.buttonEdge * progress };
}
