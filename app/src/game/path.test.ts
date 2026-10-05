import { describe, expect, it } from "vitest";

import type { PathOutline } from "@/game/path";
import { finishedInUnit, pathNodes } from "@/game/path";
import { freshState } from "@/game/player-state";

const outline: PathOutline = {
  units: ["u1", "u2"].map((id) => ({
    id,
    lessonIds: [1, 2, 3, 4, 5].map((n) => `${id}-l${n}`),
  })),
};
const start = freshState(new Date(2026, 9, 5, 12));
const statuses = (state: typeof start) =>
  Object.fromEntries(pathNodes(state, outline).map((node) => [node.id, node.status]));

describe("the path (DESIGN.md 10.1, D8)", () => {
  it("opens only the first lesson for a new player", () => {
    const s = statuses(start);
    expect(s["u1-l1"]).toBe("current");
    expect(s["u1-l2"]).toBe("locked");
    expect(s["u1:boss"]).toBe("locked");
    expect(s["u1:review"]).toBe("locked");
    expect(s["u2-l1"]).toBe("locked");
  });

  it("opens the next lesson when one is finished", () => {
    const s = statuses({ ...start, finishedLessons: ["u1-l1", "u1-l2"] });
    expect([s["u1-l1"], s["u1-l2"], s["u1-l3"], s["u1-l4"]]).toEqual([
      "complete",
      "complete",
      "current",
      "locked",
    ]);
  });

  it("opens the boss when the unit's five lessons are finished", () => {
    const state = { ...start, finishedLessons: outline.units[0].lessonIds.slice() };
    expect(statuses(state)["u1:boss"]).toBe("current");
    expect(statuses(state)["u2-l1"]).toBe("locked");
  });

  it("opens the review and the next unit when the boss is passed", () => {
    const state = { ...start, finishedLessons: outline.units[0].lessonIds.slice(), passedBosses: ["u1"] };
    const s = statuses(state);
    expect([s["u1:boss"], s["u1:review"], s["u2-l1"]]).toEqual(["complete", "open", "current"]);
  });

  it("orders each unit as five lessons, the boss and the review", () => {
    expect(pathNodes(start, outline).map((node) => node.kind).slice(0, 7)).toEqual([
      "lesson", "lesson", "lesson", "lesson", "lesson", "boss", "review",
    ]);
  });

  it("counts the unit's finished lessons for the ring", () => {
    const state = { ...start, finishedLessons: ["u1-l1", "u1-l2", "u2-l1"] };
    expect(finishedInUnit(state, outline.units[0].lessonIds)).toBe(2);
  });
});
