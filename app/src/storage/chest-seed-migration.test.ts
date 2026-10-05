import { describe, expect, it } from "vitest";

import type { ChestOdds } from "@/game/chest-tier";
import { chestTier } from "@/game/chest-tier";
import { freshState } from "@/game/player-state";
import { resetProgress } from "@/game/settings";
import { STATE_VERSION } from "@/storage/migrations";
import type { KeyValueStore } from "@/storage/player-store";
import { BACKUP_KEY_PREFIX, loadPlayer, PLAYER_KEY, savePlayer } from "@/storage/player-store";

function memoryStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const store: KeyValueStore = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
  return { store, data };
}

const now = new Date(2026, 9, 5, 12);
const ODDS: ChestOdds = { common: 55, rare: 30, mythic: 12, legendary: 3 };

// A player exactly as version 4 stored it (Logan Mode), with the hands chest ready and not opened.
// The two fields no version knows stand for whatever a later or an odd build may have written.
const VERSION_4_PLAYER = {
  lives: 4,
  livesClock: 1_790_000_000_000,
  gems: 80,
  xp: 2_400,
  streak: { length: 12, lastDay: "2026-10-04" },
  freezes: 1,
  finishedLessons: ["hands-1", "hands-2", "hands-3", "hands-4", "hands-5"],
  passedBosses: ["hands"],
  placedUnits: [],
  openedChests: [],
  missedExercises: ["hands-4-02"],
  onboarded: true,
  placement: "passed",
  settings: { sound: true, haptics: false, loganMode: true, reminder: { on: true, hour: 20, minute: 15 }, theme: "kept" },
  note: "kept too",
};

// 1_790_000_000_000 modulo 2^32: the lives clock as a 32-bit number
const VERSION_4_SEED = 3_293_604_864;

function loadVersion4(player: unknown) {
  const raw = JSON.stringify({ version: 4, player });
  const { store, data } = memoryStore({ [PLAYER_KEY]: raw });
  return { raw, store, data, result: loadPlayer(store, now) };
}

describe("the version 5 migration (GF-13, rule Q2, board item 50)", () => {
  it("is at least version 5", () => {
    expect(STATE_VERSION).toBeGreaterThanOrEqual(5);
  });

  it("loads a stored version 4 player with every field kept, extra ones too, and a seed from its lives clock", () => {
    expect(loadVersion4(VERSION_4_PLAYER).result).toEqual({
      status: "loaded",
      state: { ...VERSION_4_PLAYER, chestSeed: VERSION_4_SEED },
    });
  });

  it("keeps a ready chest's tier on every load of the old save, and after the first save", () => {
    const { store, result } = loadVersion4(VERSION_4_PLAYER);
    const tier = chestTier(result.state.chestSeed, "hands", ODDS);
    expect(chestTier(loadPlayer(store, now).state.chestSeed, "hands", ODDS)).toBe(tier);
    savePlayer(store, { ...result.state, lives: 2, livesClock: now.getTime() });
    const reopened = loadPlayer(store, new Date(2026, 9, 6, 9));
    expect(reopened.state.chestSeed).toBe(VERSION_4_SEED);
    expect(chestTier(reopened.state.chestSeed, "hands", ODDS)).toBe(tier);
  });

  it.each([
    ["no lives clock", { ...VERSION_4_PLAYER, livesClock: undefined }],
    ["a lives clock that is not a number", { ...VERSION_4_PLAYER, livesClock: "soon" }],
    ["a player that is not a record", ["hands-1"]],
  ])("backs up a version 4 value with %s, and never drops it", (_, player) => {
    const { raw, data, result } = loadVersion4(player);
    expect(result.status).toBe("recovered");
    expect(data.get(`${BACKUP_KEY_PREFIX}${now.getTime()}`)).toBe(raw);
  });

  it.each([-1, 1.5, 2 ** 32, "7", null])("refuses a version 5 player whose chest seed is %s", (chestSeed) => {
    const raw = JSON.stringify({ version: 5, player: { ...freshState(now), chestSeed } });
    expect(loadPlayer(memoryStore({ [PLAYER_KEY]: raw }).store, now).status).toBe("recovered");
  });

  it("starts a new player with the millisecond it starts as its seed", () => {
    expect(freshState(now).chestSeed).toBe(now.getTime() >>> 0);
  });

  it("takes a fresh seed on a reset, which also clears every chest", () => {
    const later = new Date(2026, 9, 7, 8, 30);
    const reset = resetProgress({ ...freshState(now), passedBosses: ["hands"] }, later);
    expect(reset.chestSeed).toBe(later.getTime() >>> 0);
    expect(reset.passedBosses).toEqual([]);
  });
});
