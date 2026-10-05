import { describe, expect, it } from "vitest";

import { effectHeight, effectMode } from "@/art/effects";

describe("effectMode", () => {
  it("plays an effect whenever motion is allowed", () => {
    expect(effectMode(false, true, false)).toBe("play");
    expect(effectMode(true, true, false)).toBe("play");
  });

  it("draws nothing for a one-shot effect under reduced motion (GF-8)", () => {
    expect(effectMode(false, false, false)).toBe("none");
  });

  it("holds a loop still under reduced motion, so the flame still shows", () => {
    expect(effectMode(true, false, false)).toBe("still");
  });

  it("draws nothing when the file failed to load, looped or not", () => {
    expect(effectMode(false, true, true)).toBe("none");
    expect(effectMode(true, false, true)).toBe("none");
  });
});

describe("effectHeight", () => {
  it("keeps the file's shape at any width", () => {
    expect(effectHeight(180, { w: 360, h: 480 })).toBe(240);
    expect(effectHeight(95, { w: 190, h: 210 })).toBe(105);
  });
});
