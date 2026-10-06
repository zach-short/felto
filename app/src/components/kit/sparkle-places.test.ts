import { describe, expect, it } from "vitest";

import { burstAngles, twinklePlaces } from "@/components/kit/sparkle-places";

const BOX = { width: 200, height: 120 };

describe("twinklePlaces", () => {
  it("places the asked number of stars, each wholly inside the box", () => {
    const places = twinklePlaces(6, BOX, 16, 1800);
    expect(places).toHaveLength(6);
    places.forEach((star) => {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.x + star.size).toBeLessThanOrEqual(BOX.width);
      expect(star.y + star.size).toBeLessThanOrEqual(BOX.height);
    });
  });

  it("starts the twinkles at different times within one period", () => {
    const delays = twinklePlaces(6, BOX, 16, 1800).map((star) => star.delayMs);
    expect(new Set(delays).size).toBe(6);
    delays.forEach((delay) => expect(delay).toBeLessThan(1800));
  });

  it("draws every second star smaller, and the same places on every call", () => {
    const places = twinklePlaces(4, BOX, 16, 1800);
    expect(places.map((star) => star.size)).toEqual([16, 9.6, 16, 9.6]);
    expect(twinklePlaces(4, BOX, 16, 1800)).toEqual(places);
  });

  it("keeps stars at the box's corner when the box is smaller than a star", () => {
    expect(twinklePlaces(2, { width: 4, height: 4 }, 16, 1800).every((star) => star.x === 0 && star.y === 0)).toBe(true);
  });
});

describe("burstAngles", () => {
  it("spreads the stars evenly round the circle", () => {
    expect(burstAngles(4)).toEqual([0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]);
  });
});
