import { describe, expect, it } from "vitest";

import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";
import { playerActions } from "@/storage/player-actions";
import { createPlayerCell } from "@/storage/player-cell";

const now = new Date(2026, 9, 5, 12);

function setUp(initial: PlayerState) {
  const cell = createPlayerCell(initial, () => undefined);
  return { cell, actions: playerActions(cell, () => now) };
}

describe("the Haptics switch (GF-3, board item 27)", () => {
  it("turns Haptics off and on and leaves Sound and the reminder alone", () => {
    const start = { ...freshState(now), gems: 20 };
    const { cell, actions } = setUp(start);
    actions.setHaptics(false);
    expect(cell.get().settings).toEqual({ ...start.settings, haptics: false });
    actions.setHaptics(true);
    expect(cell.get()).toEqual(start);
  });

  it("keeps a Haptics change and a Sound change made in the same tick", () => {
    const { cell, actions } = setUp(freshState(now));
    actions.setHaptics(false);
    actions.setSound(false);
    expect(cell.get().settings.haptics).toBe(false);
    expect(cell.get().settings.sound).toBe(false);
  });

  it("keeps Haptics off through a reset, as every setting is kept", () => {
    const { cell, actions } = setUp({ ...freshState(now), xp: 500, onboarded: true });
    actions.setHaptics(false);
    actions.resetProgress();
    expect(cell.get().settings.haptics).toBe(false);
    expect(cell.get().xp).toBe(0);
  });
});
