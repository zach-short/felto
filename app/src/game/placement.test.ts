import { describe, expect, it } from "vitest";

import { chestState } from "@/game/chest";
import type { PathOutline } from "@/game/path";
import { pathNodes } from "@/game/path";
import { completeOnboarding, finishPlacement } from "@/game/placement";
import { freshState } from "@/game/player-state";

const outline: PathOutline = {
  units: ["u1", "u2", "u3"].map((id) => ({
    id,
    lessonIds: [1, 2, 3, 4, 5].map((n) => `${id}-l${n}`),
  })),
};
const start = freshState(new Date(2026, 9, 5, 12));
const run = (right: number, size = 10, answered = size) => ({ size, answered, right });

describe("the placement check (D20)", () => {
  it("marks units 1 and 2 finished on a pass and gives no gems", () => {
    const state = finishPlacement(start, run(8), outline);
    expect(state.placement).toBe("passed");
    expect(state.gems).toBe(0);
    expect(state.xp).toBe(0);
    expect(state.placedUnits).toEqual(["u1", "u2"]);
    expect(state.finishedLessons).toHaveLength(10);
    expect(chestState(state, "u1")).toBe("closed");
    const current = pathNodes(state, outline).filter((node) => node.status === "current");
    expect(current.map((node) => node.id)).toEqual(["u3-l1"]);
  });

  it("starts at unit 1 below 8 right", () => {
    const state = finishPlacement(start, run(7), outline);
    expect(state.placement).toBe("failed");
    expect(state.finishedLessons).toEqual([]);
  });

  it("runs once", () => {
    const failed = finishPlacement(start, run(3), outline);
    expect(finishPlacement(failed, run(10), outline)).toBe(failed);
  });

  it("ignores a run that is not the whole 10-exercise check, and stays open", () => {
    expect(finishPlacement(start, run(3, 3), outline)).toBe(start);
    expect(finishPlacement(start, run(8, 10, 9), outline)).toBe(start);
  });

  it("sets the first-launch flag", () => {
    expect(start.onboarded).toBe(false);
    expect(completeOnboarding(start).onboarded).toBe(true);
  });
});
