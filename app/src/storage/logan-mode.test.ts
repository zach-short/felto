import { describe, expect, it } from "vitest";

import { loganLine, LOGAN_LINE } from "@/components/lesson/logan-line";
import { freshState } from "@/game/player-state";
import { STATE_VERSION } from "@/storage/migrations";
import { playerActions } from "@/storage/player-actions";
import { createPlayerCell } from "@/storage/player-cell";
import type { KeyValueStore } from "@/storage/player-store";
import { BACKUP_KEY_PREFIX, loadPlayer, PLAYER_KEY } from "@/storage/player-store";

const now = new Date(2026, 9, 5, 12);

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
  return { store, data };
}

// A player exactly as version 3 stored it: settings held Sound, Haptics and the reminder
const VERSION_3_PLAYER = {
  ...freshState(now),
  xp: 900,
  finishedLessons: ["hands-1"],
  settings: { sound: false, haptics: false, reminder: { on: false, hour: 7, minute: 30 } },
};

describe("Logan Mode", () => {
  it("starts off for a new player", () => {
    expect(freshState(now).settings.loganMode).toBe(false);
  });

  it("is version 4 or later", () => {
    expect(STATE_VERSION).toBeGreaterThanOrEqual(4);
  });

  it("loads a stored version 3 player with every field kept and Logan Mode off", () => {
    const raw = JSON.stringify({ version: 3, player: VERSION_3_PLAYER });
    const result = loadPlayer(memoryStore({ [PLAYER_KEY]: raw }).store, now);
    expect(result).toEqual({
      status: "loaded",
      state: { ...VERSION_3_PLAYER, settings: { ...VERSION_3_PLAYER.settings, loganMode: false } },
    });
  });

  it("backs up a version 3 value with no settings, and never drops it", () => {
    const raw = JSON.stringify({ version: 3, player: { ...VERSION_3_PLAYER, settings: undefined } });
    const { store, data } = memoryStore({ [PLAYER_KEY]: raw });
    expect(loadPlayer(store, now).status).toBe("recovered");
    expect(data.get(`${BACKUP_KEY_PREFIX}${now.getTime()}`)).toBe(raw);
  });

  it("refuses a current player whose Logan Mode is not on or off", () => {
    const player = { ...freshState(now), settings: { ...freshState(now).settings, loganMode: "yes" } };
    const raw = JSON.stringify({ version: STATE_VERSION, player });
    expect(loadPlayer(memoryStore({ [PLAYER_KEY]: raw }).store, now).status).toBe("recovered");
  });

  it("turns on and off and leaves the other settings alone, through a reset too", () => {
    const start = { ...freshState(now), xp: 500, onboarded: true };
    const cell = createPlayerCell(start, () => undefined);
    const actions = playerActions(cell, () => now);
    actions.setLoganMode(true);
    expect(cell.get().settings).toEqual({ ...start.settings, loganMode: true });
    actions.resetProgress();
    expect(cell.get().settings.loganMode).toBe(true);
    actions.setLoganMode(false);
    expect(cell.get().settings).toEqual(start.settings);
  });

  it("says the line only when the switch is on", () => {
    expect(loganLine(true)).toBe(LOGAN_LINE);
    expect(loganLine(false)).toBeNull();
  });
});
