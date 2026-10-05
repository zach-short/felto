import { describe, expect, it } from "vitest";

import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";
import { playerActions } from "@/storage/player-actions";
import { createPlayerCell } from "@/storage/player-cell";

const now = new Date(2026, 9, 5, 12);

// The render snapshot never changes inside one tick, as in React: only the cell moves
function setUp(initial: PlayerState) {
  const renders: PlayerState[] = [];
  const cell = createPlayerCell(initial, (next) => renders.push(next));
  return { cell, renders, actions: playerActions(cell, () => now) };
}

describe("the player actions", () => {
  it("keeps both effects of a wrong answer and a refill in the same tick", () => {
    const { cell, renders, actions } = setUp({ ...freshState(now), lives: 1, gems: 25 });
    actions.recordAnswer({ kind: "lesson", exerciseId: "u1-e3", right: false });
    const outcome = actions.refillLives();
    expect(outcome.ok).toBe(true);
    expect(cell.get().lives).toBe(5);
    expect(cell.get().gems).toBe(5);
    expect(cell.get().missedExercises).toEqual(["u1-e3"]);
    expect(renders.at(-1)).toBe(cell.get());
  });

  it("keeps a finished lesson when a freeze is bought in the same tick", () => {
    const { cell, actions } = setUp({ ...freshState(now), gems: 10 });
    actions.finishSession({ kind: "lesson", id: "u1-l1", size: 10, answered: 10, right: 9 });
    expect(actions.buyFreeze().ok).toBe(true);
    expect(cell.get().finishedLessons).toEqual(["u1-l1"]);
    expect(cell.get().xp).toBe(90);
    expect(cell.get().freezes).toBe(1);
  });

  it("leaves the state unchanged when a refill or a freeze is refused", () => {
    const start = { ...freshState(now), lives: 0, gems: 3 };
    const { cell, renders, actions } = setUp(start);
    expect(actions.refillLives()).toEqual({ ok: false, reason: "not-enough-gems" });
    expect(actions.buyFreeze()).toEqual({ ok: false, reason: "not-enough-gems" });
    expect(cell.get()).toBe(start);
    expect(renders).toEqual([]);
  });
});
