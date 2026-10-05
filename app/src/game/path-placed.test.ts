import { describe, expect, it } from "vitest";

import { chestState } from "@/game/chest";
import type { PathOutline } from "@/game/path";
import { pathNodes, placedPast } from "@/game/path";
import { finishPlacement } from "@/game/placement";
import { freshState } from "@/game/player-state";

// The audit of item 12 (HANDOFF.md step 19): a placed player saw three current lessons at once
// and a faded chest under a complete boss. These pin the one rule that replaced it.
const outline: PathOutline = {
  units: ["u1", "u2", "u3", "u4"].map((id) => ({
    id,
    lessonIds: [1, 2, 3, 4, 5].map((n) => `${id}-l${n}`),
  })),
};
const start = freshState(new Date(2026, 9, 5, 12));
const passed = finishPlacement(start, { size: 10, answered: 10, right: 8 }, outline);
const currents = (state: typeof start) =>
  pathNodes(state, outline).filter((node) => node.status === "current").map((node) => node.id);
const statusOf = (state: typeof start, id: string) => pathNodes(state, outline).find((node) => node.id === id)?.status;

describe("one current lesson (DESIGN.md 10.1, D20)", () => {
  it("after a passed check, only unit 3's first lesson is current", () => {
    expect(currents(passed)).toEqual(["u3-l1"]);
  });

  it("holds even when the placed units' lessons are not in finishedLessons", () => {
    const placedOnly = { ...start, placement: "passed" as const, placedUnits: ["u1", "u2"] };
    expect(currents(placedOnly)).toEqual(["u3-l1"]);
    expect(statusOf(placedOnly, "u1-l3")).toBe("complete");
  });

  it("shows a placed unit's boss complete and its review open", () => {
    expect([statusOf(passed, "u1:boss"), statusOf(passed, "u2:boss")]).toEqual(["complete", "complete"]);
    expect([statusOf(passed, "u1:review"), statusOf(passed, "u2:review")]).toEqual(["open", "open"]);
  });

  it("after a failed check, only unit 1's first lesson is current", () => {
    const failed = finishPlacement(start, { size: 10, answered: 10, right: 7 }, outline);
    expect(currents(failed)).toEqual(["u1-l1"]);
  });

  it("locks every unit after the one in play, keeping lessons already finished", () => {
    const state = { ...start, finishedLessons: ["u1-l1", "u2-l1"] };
    expect(currents(state)).toEqual(["u1-l2"]);
    expect(statusOf(state, "u2-l1")).toBe("complete");
    expect(statusOf(state, "u2-l2")).toBe("locked");
  });

  it("makes the boss the current stop once the unit's lessons are all finished", () => {
    const state = { ...passed, finishedLessons: [...passed.finishedLessons, "u3-l1", "u3-l2", "u3-l3", "u3-l4", "u3-l5"] };
    expect(currents(state)).toEqual(["u3:boss"]);
  });
});

describe("a placed unit's chest (D20)", () => {
  it("stays closed, and the unit reads as placed past until its boss is beaten in play", () => {
    expect(chestState(passed, "u1")).toBe("closed");
    expect(placedPast(passed, "u1")).toBe(true);
    expect(placedPast(passed, "u3")).toBe(false);
  });

  it("is won by beating the placed unit's boss", () => {
    const beaten = { ...passed, passedBosses: ["u1"] };
    expect(placedPast(beaten, "u1")).toBe(false);
    expect(chestState(beaten, "u1")).toBe("ready");
  });
});
