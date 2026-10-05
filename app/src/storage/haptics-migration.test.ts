import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
import { STATE_VERSION } from "@/storage/migrations";
import type { KeyValueStore } from "@/storage/player-store";
import { BACKUP_KEY_PREFIX, loadPlayer, PLAYER_KEY } from "@/storage/player-store";

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
  return { store, data };
}

const now = new Date(2026, 9, 5, 12);

// A player exactly as version 2 stored it (board item 15): settings held Sound and the reminder.
// The two fields no version knows stand for whatever a later or an odd build may have written.
const VERSION_2_PLAYER = {
  lives: 2,
  livesClock: 1_790_000_000_000,
  gems: 45,
  xp: 1_280,
  streak: { length: 9, lastDay: "2026-10-04" },
  freezes: 2,
  finishedLessons: ["hands-1", "hands-2", "hands-3"],
  passedBosses: ["hands"],
  placedUnits: [],
  openedChests: ["hands"],
  missedExercises: ["hands-3-07"],
  onboarded: true,
  placement: "passed",
  settings: { sound: false, reminder: { on: false, hour: 7, minute: 30 }, theme: "kept" },
  note: "kept too",
};

function loadVersion2(player: unknown) {
  const raw = JSON.stringify({ version: 2, player });
  const { store, data } = memoryStore({ [PLAYER_KEY]: raw });
  return { raw, data, result: loadPlayer(store, now) };
}

describe("the version 3 migration (GF-3, rule Q2, board item 27)", () => {
  it("is at least version 3", () => {
    expect(STATE_VERSION).toBeGreaterThanOrEqual(3);
  });

  it("loads a stored version 2 player with every field kept, extra ones too, and Haptics on", () => {
    const { result } = loadVersion2(VERSION_2_PLAYER);
    expect(result).toEqual({
      status: "loaded",
      state: { ...VERSION_2_PLAYER, settings: { ...VERSION_2_PLAYER.settings, haptics: true, loganMode: false } },
    });
  });

  it("starts a new player with Haptics on", () => {
    expect(freshState(now).settings.haptics).toBe(true);
  });

  it.each([
    ["settings that are not a record", { ...VERSION_2_PLAYER, settings: "loud" }],
    ["no settings", { ...VERSION_2_PLAYER, settings: undefined }],
    ["a player that is not a record", ["hands-1"]],
  ])("backs up a version 2 value with %s, and never drops it", (_, player) => {
    const { raw, data, result } = loadVersion2(player);
    expect(result.status).toBe("recovered");
    expect(data.get(`${BACKUP_KEY_PREFIX}${now.getTime()}`)).toBe(raw);
  });

  it("refuses a version 3 player whose Haptics setting is not on or off", () => {
    const player = { ...freshState(now), settings: { ...freshState(now).settings, haptics: "yes" } };
    const raw = JSON.stringify({ version: 3, player });
    expect(loadPlayer(memoryStore({ [PLAYER_KEY]: raw }).store, now).status).toBe("recovered");
  });
});
