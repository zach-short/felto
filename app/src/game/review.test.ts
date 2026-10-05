import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
import { reviewSet } from "@/game/review";

const unit = Array.from({ length: 50 }, (_, i) => `u1-e${i + 1}`);
const start = freshState(new Date(2026, 9, 5, 12));

describe("the review set (D8)", () => {
  it("puts the unit's misses first, in unit order, and fills up to ten", () => {
    const state = { ...start, missedExercises: ["u1-e30", "u2-e1", "u1-e4"] };
    const set = reviewSet(state, unit, 9);
    expect(set).toHaveLength(10);
    expect(set.slice(0, 2)).toEqual(["u1-e4", "u1-e30"]);
    expect(new Set(set).size).toBe(10);
    expect(set).not.toContain("u2-e1");
  });

  it("holds at most ten misses", () => {
    const state = { ...start, missedExercises: unit.slice(0, 14) };
    expect(reviewSet(state, unit, 1)).toEqual(unit.slice(0, 10));
  });

  it("fills the same way for the same seed", () => {
    expect(reviewSet(start, unit, 5)).toEqual(reviewSet(start, unit, 5));
  });
});
