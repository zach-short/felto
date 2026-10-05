import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { dropSteps, evenSteps, flashSteps, shakeSteps, tiltSteps } from "@/motion/answer-steps";
import type { MotionStep } from "@/motion/motion-steps";

const total = (steps: MotionStep[]) => steps.reduce((sum, step) => sum + step.ms, 0);
const last = (steps: MotionStep[]) => steps[steps.length - 1].to;

describe("evenSteps", () => {
  it("splits the time evenly and gives the rounding to the last leg", () => {
    expect(evenSteps([1, 2, 0], 100)).toEqual([
      { to: 1, ms: 33 },
      { to: 2, ms: 33 },
      { to: 0, ms: 34 },
    ]);
  });
});

describe("shakeSteps", () => {
  it("swings the dial's number of times, then rests", () => {
    const steps = shakeSteps();
    expect(steps).toHaveLength(DIALS.shakeSwings + 1);
    expect(last(steps)).toBe(0);
  });

  it("alternates sides and never goes further than the dial's distance", () => {
    const swings = shakeSteps().slice(0, -1);
    swings.forEach((step, i) => {
      expect(Math.abs(step.to)).toBe(DIALS.shakeDistance);
      if (i > 0) expect(Math.sign(step.to)).toBe(-Math.sign(swings[i - 1].to));
    });
  });

  it("takes exactly the dial's time", () => {
    expect(total(shakeSteps())).toBe(DIALS.shakeMs);
  });
});

describe("tiltSteps", () => {
  it("tips by the dial's angle, swings back less far, and rests in the dial's time", () => {
    const steps = tiltSteps();
    expect(Math.abs(steps[0].to)).toBe(DIALS.tiltDegrees);
    expect(Math.abs(steps[1].to)).toBeLessThan(DIALS.tiltDegrees);
    expect(last(steps)).toBe(0);
    expect(total(steps)).toBe(DIALS.tiltMs);
  });
});

describe("flashSteps", () => {
  it("comes up to the dial's opacity and fades back to nothing in the dial's time", () => {
    const steps = flashSteps();
    expect(steps[0].to).toBe(DIALS.flashOpacity);
    expect(last(steps)).toBe(0);
    expect(total(steps)).toBe(DIALS.flashMs);
  });
});

describe("dropSteps", () => {
  it("falls and shrinks by the dials, and both legs come back to rest together", () => {
    const { fall, shrink } = dropSteps();
    expect(fall[0].to).toBe(DIALS.heartDropDistance);
    expect(shrink[0].to).toBe(DIALS.heartDropScale);
    expect(last(fall)).toBe(0);
    expect(last(shrink)).toBe(1);
    expect(total(fall)).toBe(DIALS.heartDropMs);
    expect(total(shrink)).toBe(DIALS.heartDropMs);
  });
});
