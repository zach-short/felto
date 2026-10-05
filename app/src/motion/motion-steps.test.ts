import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { bounceSteps, pressedShape } from "@/motion/motion-steps";

describe("bounceSteps", () => {
  it("goes out to the dial's scale and comes back to rest", () => {
    const [out, back] = bounceSteps();
    expect(out.to).toBe(DIALS.bounceScale);
    expect(back.to).toBe(1);
  });

  it("takes exactly the dial's time, split between the two legs", () => {
    const [out, back] = bounceSteps();
    expect(out.ms + back.ms).toBe(DIALS.bounceMs);
    expect(Math.abs(out.ms - back.ms)).toBeLessThanOrEqual(1);
  });
});

describe("pressedShape", () => {
  it("is the button at rest when nothing presses it", () => {
    expect(pressedShape(0)).toEqual({ scale: 1, sink: 0 });
  });

  // GF-2: a full press puts the face's bottom on the edge's bottom, so the edge disappears
  it("sinks the face by the whole raised edge and shrinks by the press scale when fully pressed", () => {
    expect(pressedShape(1)).toEqual({ scale: DIALS.pressScale, sink: DIALS.buttonEdge });
  });

  // A spring back overshoots past rest for a moment; the shape must follow it, not clamp it
  it("follows a spring past rest without clamping", () => {
    const overshoot = pressedShape(-0.1);
    expect(overshoot.sink).toBeLessThan(0);
    expect(overshoot.scale).toBeGreaterThan(1);
  });
});
