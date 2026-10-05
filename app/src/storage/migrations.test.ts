import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
import { STATE_VERSION } from "@/storage/migrations";
import type { KeyValueStore } from "@/storage/player-store";
import { BACKUP_KEY_PREFIX, backupPlayer, loadPlayer, PLAYER_KEY } from "@/storage/player-store";

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
  return { store, data };
}

const now = new Date(2026, 9, 5, 12);

// A player exactly as version 1 stored it (board item 8): settings held the Sound switch only
const VERSION_1_PLAYER = {
  lives: 3,
  livesClock: 1_790_000_000_000,
  gems: 30,
  xp: 640,
  streak: { length: 6, lastDay: "2026-10-04" },
  freezes: 1,
  finishedLessons: ["hands-1", "hands-2"],
  passedBosses: ["hands"],
  placedUnits: [],
  openedChests: ["hands"],
  missedExercises: ["hands-2-03"],
  onboarded: true,
  placement: "not-taken",
  settings: { sound: false },
};

describe("the version 2 migration (rule Q2, PLAN.md phase 11)", () => {
  it("is version 2", () => {
    expect(STATE_VERSION).toBe(2);
  });

  it("loads a stored version 1 player with every field kept and the reminder on at 19:00", () => {
    const raw = JSON.stringify({ version: 1, player: VERSION_1_PLAYER });
    const result = loadPlayer(memoryStore({ [PLAYER_KEY]: raw }).store, now);
    expect(result).toEqual({
      status: "loaded",
      state: { ...VERSION_1_PLAYER, settings: { sound: false, reminder: { on: true, hour: 19, minute: 0 } } },
    });
  });

  it("backs up a version 1 value that is not a player, and never drops it", () => {
    const raw = JSON.stringify({ version: 1, player: { ...VERSION_1_PLAYER, settings: "loud" } });
    const { store, data } = memoryStore({ [PLAYER_KEY]: raw });
    const result = loadPlayer(store, now);
    expect(result.status).toBe("recovered");
    expect(data.get(`${BACKUP_KEY_PREFIX}${now.getTime()}`)).toBe(raw);
  });

  it("refuses a version 2 player whose reminder time is not on a clock", () => {
    const player = { ...freshState(now), settings: { sound: true, reminder: { on: true, hour: 25, minute: 0 } } };
    const raw = JSON.stringify({ version: 2, player });
    expect(loadPlayer(memoryStore({ [PLAYER_KEY]: raw }).store, now).status).toBe("recovered");
  });

  it("copies the latest state to a backup key before a reset", () => {
    const { store, data } = memoryStore();
    const state = { ...freshState(now), xp: 300 };
    const key = backupPlayer(store, state, now);
    expect(JSON.parse(data.get(key) ?? "{}")).toEqual({ version: STATE_VERSION, player: state });
  });
});
