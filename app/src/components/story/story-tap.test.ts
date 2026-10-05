import { describe, expect, it } from "vitest";

import { storyTapAction } from "@/components/story/story-tap";
import { DIALS } from "@/config/dials";

// docs/incomplete/unit-stories/PLAN.md phase 2, done-when: the 30/70 split is pinned at its edge
describe("storyTapAction", () => {
  const zone = DIALS.storyBackZone;

  it.each([390, 402, 412, 1024, 1366])("splits a %i point wide screen at the zone line", (width) => {
    const line = width * zone;
    expect(storyTapAction(line - 0.01, width, zone)).toBe("back");
    expect(storyTapAction(line, width, zone)).toBe("forward");
  });

  it("goes back from the left edge and forward from the right edge", () => {
    expect(storyTapAction(0, 390, zone)).toBe("back");
    expect(storyTapAction(390, 390, zone)).toBe("forward");
  });

  it("gives the left 30 percent to back, as US-6 decided", () => {
    expect(zone).toBe(0.3);
    expect(storyTapAction(29.99, 100, zone)).toBe("back");
    expect(storyTapAction(30, 100, zone)).toBe("forward");
  });

  it("goes forward when the press came with no position", () => {
    expect(storyTapAction(Number.NaN, 390, zone)).toBe("forward");
  });
});
