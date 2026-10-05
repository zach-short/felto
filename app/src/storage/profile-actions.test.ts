import { describe, expect, it } from "vitest";

import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";
import { playerActions } from "@/storage/player-actions";
import { createPlayerCell } from "@/storage/player-cell";

const now = new Date(2026, 9, 5, 12);

function setUp(initial: PlayerState) {
  const backups: PlayerState[] = [];
  const cell = createPlayerCell(initial, () => undefined);
  const actions = playerActions(cell, () => now, (latest) => backups.push(latest));
  return { cell, backups, actions };
}

describe("the Profile actions (PLAN.md phase 11)", () => {
  it("keeps a bought freeze and a settings change made in the same tick", () => {
    const { cell, actions } = setUp({ ...freshState(now), gems: 20 });
    expect(actions.buyFreeze().ok).toBe(true);
    actions.setSound(false);
    actions.setReminderTime(8, 15);
    actions.setReminderOn(false);
    expect(cell.get().freezes).toBe(1);
    expect(cell.get().gems).toBe(10);
    expect(cell.get().settings).toEqual({ sound: false, haptics: true, loganMode: false, reminder: { on: false, hour: 8, minute: 15 } });
  });

  it("refuses a third freeze, and a freeze without 10 gems (D19)", () => {
    const { actions } = setUp({ ...freshState(now), gems: 100, freezes: 2 });
    expect(actions.buyFreeze()).toEqual({ ok: false, reason: "freezes-full" });
    const poor = setUp({ ...freshState(now), gems: 9 });
    expect(poor.actions.buyFreeze()).toEqual({ ok: false, reason: "not-enough-gems" });
  });

  it("backs up the latest state before a reset, and keeps the settings", () => {
    const start = { ...freshState(now), xp: 500, gems: 30, onboarded: true };
    const { cell, backups, actions } = setUp(start);
    actions.setSound(false);
    actions.resetProgress();
    expect(backups).toEqual([{ ...start, settings: { ...start.settings, sound: false } }]);
    expect(cell.get()).toEqual({ ...freshState(now), onboarded: true, settings: cell.get().settings });
    expect(cell.get().settings.sound).toBe(false);
    expect(cell.get().xp).toBe(0);
  });
});
