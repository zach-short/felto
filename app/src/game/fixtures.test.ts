import { describe, expect, it } from "vitest";

import { FIXTURE_NAMES, fixtureState, isFixtureName } from "@/game/fixtures";
import { livesAt } from "@/game/lives";
import type { PathOutline } from "@/game/path";
import { pathNodes } from "@/game/path";
import { currentStreak } from "@/game/streak";

const outline: PathOutline = {
  units: ["u1", "u2"].map((id) => ({
    id,
    lessonIds: [1, 2, 3, 4, 5].map((n) => `${id}-l${n}`),
  })),
};
const now = new Date(2026, 9, 5, 12);
const currentOf = (name: (typeof FIXTURE_NAMES)[number]) =>
  pathNodes(fixtureState(name, outline, now), outline).find((node) => node.status === "current")?.id;

describe("the named fixtures (BD-13)", () => {
  it("has unit1-mid: lessons 1 to 3 of unit 1 finished, 2 lives, a 4-day streak, 20 gems", () => {
    const state = fixtureState("unit1-mid", outline, now);
    expect(state.finishedLessons).toEqual(["u1-l1", "u1-l2", "u1-l3"]);
    expect(livesAt(state, now)).toBe(2);
    expect(currentStreak(state, now)).toBe(4);
    expect(state.gems).toBe(20);
  });

  it("puts each fixture at the node its name says", () => {
    expect(currentOf("fresh")).toBe("u1-l1");
    expect(currentOf("unit1-mid")).toBe("u1-l4");
    expect(currentOf("boss-ready")).toBe("u1:boss");
    expect(livesAt(fixtureState("zero-lives", outline, now), now)).toBe(0);
  });

  it("knows its names", () => {
    expect(FIXTURE_NAMES.every(isFixtureName)).toBe(true);
    expect(isFixtureName("nope")).toBe(false);
  });
});
