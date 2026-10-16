import { describe, expect, it } from "vitest";

import { CELEBRATION_NAMES, celebrationMode } from "@/art/celebrations";

describe("celebrationMode", () => {
  it("plays a celebration whenever motion is allowed", () => {
    expect(celebrationMode(true, false)).toBe("play");
  });

  it("draws the held last frame under reduced motion, so the hero still shows (GF-8)", () => {
    expect(celebrationMode(false, false)).toBe("end");
  });

  it("draws nothing when the file failed to load, with motion or without", () => {
    expect(celebrationMode(true, true)).toBe("none");
    expect(celebrationMode(false, true)).toBe("none");
  });
});

describe("CELEBRATION_NAMES", () => {
  it("names the eighteen celebrations of GF-21 once each", () => {
    expect(CELEBRATION_NAMES).toHaveLength(18);
    expect(new Set(CELEBRATION_NAMES).size).toBe(CELEBRATION_NAMES.length);
  });
});
