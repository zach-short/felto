import { describe, expect, it } from "vitest";

import { bossPasses, drawBoss } from "@/game/boss";

const unit = Array.from({ length: 50 }, (_, i) => `u1-e${i + 1}`);

describe("the boss (D8)", () => {
  it("draws the same ten for the same seed", () => {
    expect(drawBoss(unit, 42)).toEqual(drawBoss(unit, 42));
  });

  it("draws ten different exercises from the unit", () => {
    const draw = drawBoss(unit, 7);
    expect(draw).toHaveLength(10);
    expect(new Set(draw).size).toBe(10);
    expect(draw.every((id) => unit.includes(id))).toBe(true);
  });

  it("draws differently for another seed", () => {
    expect(drawBoss(unit, 1)).not.toEqual(drawBoss(unit, 2));
  });

  it("passes at 8 right and not at 7", () => {
    expect(bossPasses(8)).toBe(true);
    expect(bossPasses(7)).toBe(false);
  });
});
