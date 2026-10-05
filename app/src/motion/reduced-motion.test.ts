import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";

describe("motionAllowed", () => {
  it("allows every kind when the phone does not ask for reduced motion", () => {
    for (const kind of ["press", "fade", ...DIALS.reducedMotionSkips] as const) {
      expect(motionAllowed(kind, false)).toBe(true);
    }
  });

  it.each(DIALS.reducedMotionSkips)("skips %s under reduced motion", (kind) => {
    expect(motionAllowed(kind, true)).toBe(false);
  });

  // GF-8: no screen needs motion to be understood, but a press that does not move feels broken
  // and a fade is the gentle change Reduce Motion asks for in place of a jump
  it("keeps the press and the fade under reduced motion", () => {
    expect(motionAllowed("press", true)).toBe(true);
    expect(motionAllowed("fade", true)).toBe(true);
  });

  it("skips what the plan's dial table names: bounce, shake, tilt, pulse, bob and particles", () => {
    expect([...DIALS.reducedMotionSkips].sort()).toEqual(["bob", "bounce", "particles", "pulse", "shake", "swim", "tilt"]);
  });
});
