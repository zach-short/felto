import { describe, expect, it } from "vitest";

import type { GtoSessionRecord } from "@/game/player-state";
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

const now = new Date(2026, 9, 16, 12);

// A player exactly as version 5 stored it (the chest seed, board item 50), part way through the
// path. The two fields no version knows stand for whatever a later or an odd build may have written.
const VERSION_5_PLAYER = {
  lives: 2,
  livesClock: 1_790_000_000_000,
  gems: 140,
  xp: 3_100,
  streak: { length: 9, lastDay: "2026-10-15" },
  freezes: 2,
  finishedLessons: ["hands-1", "hands-2", "hands-3", "hands-4", "hands-5", "hands-6", "position-1"],
  passedBosses: ["hands"],
  placedUnits: [],
  openedChests: ["hands"],
  chestSeed: 3_293_604_864,
  missedExercises: ["position-1-04"],
  onboarded: true,
  placement: "not-taken",
  settings: { sound: false, haptics: true, loganMode: true, reminder: { on: false, hour: 7, minute: 45 }, theme: "kept" },
  note: "kept too",
};

const NO_HANDS = { day: null, handsToday: 0, sessions: [] };

const SESSION: GtoSessionRecord = {
  day: "2026-10-16",
  firstSeed: 1_760_600_000,
  hands: 10,
  decisions: 14,
  mistakes: 2,
  costBb: 0.6098,
  worst: { seed: 1_760_600_003, actions: ["call"], decision: 0 },
};

function loadVersion(version: number, player: unknown) {
  const raw = JSON.stringify({ version, player });
  const { store, data } = memoryStore({ [PLAYER_KEY]: raw });
  return { raw, store, data, result: loadPlayer(store, now) };
}

describe("the version 6 migration (GTO trainer phase 9, rule Q2, board item 44)", () => {
  it("is version 6", () => {
    expect(STATE_VERSION).toBe(6);
  });

  it("loads a stored version 5 player with every field kept, extra ones too, and no hand dealt", () => {
    expect(loadVersion(5, VERSION_5_PLAYER).result).toEqual({
      status: "loaded",
      state: { ...VERSION_5_PLAYER, gto: NO_HANDS },
    });
  });

  it("keeps the migrated player through a save and a second load", () => {
    const { store, result } = loadVersion(5, VERSION_5_PLAYER);
    savePlayer(store, result.state);
    expect(loadPlayer(store, now)).toEqual({ status: "loaded", state: { ...VERSION_5_PLAYER, gto: NO_HANDS } });
  });

  it.each([
    ["no chest seed", { ...VERSION_5_PLAYER, chestSeed: undefined }],
    ["a chest seed that is not a number", { ...VERSION_5_PLAYER, chestSeed: "7" }],
    ["a player that is not a record", ["hands-1"]],
  ])("backs up a version 5 value with %s, and never drops it", (_, player) => {
    const { raw, data, result } = loadVersion(5, player);
    expect(result.status).toBe("recovered");
    expect(data.get(`${BACKUP_KEY_PREFIX}${now.getTime()}`)).toBe(raw);
  });

  it("loads a version 6 player with a day's count and a finished session", () => {
    const gto = { day: "2026-10-16", handsToday: 10, sessions: [SESSION, { ...SESSION, worst: null, mistakes: 0 }] };
    const player = { ...freshState(now), gto };
    expect(loadVersion(6, player).result).toEqual({ status: "loaded", state: player });
  });

  it.each([
    ["no record", undefined],
    ["a day that is not a day", { ...NO_HANDS, day: "16 October" }],
    ["a count below 0", { ...NO_HANDS, handsToday: -1 }],
    ["a count that is not whole", { ...NO_HANDS, handsToday: 2.5 }],
    ["sessions that are not a list", { ...NO_HANDS, sessions: {} }],
    ["a session with no day", { ...NO_HANDS, sessions: [{ ...SESSION, day: null }] }],
    ["a session with a cost below 0", { ...NO_HANDS, sessions: [{ ...SESSION, costBb: -0.1 }] }],
    ["a worst hand with an action the key has not", { ...NO_HANDS, sessions: [{ ...SESSION, worst: { ...SESSION.worst, actions: ["limp"] } }] }],
    ["a worst hand with no action", { ...NO_HANDS, sessions: [{ ...SESSION, worst: { ...SESSION.worst, actions: [] } }] }],
  ])("refuses a version 6 player with %s", (_, gto) => {
    expect(loadVersion(6, { ...freshState(now), gto }).result.status).toBe("recovered");
  });

  it("starts a new player with no hand dealt and no session", () => {
    expect(freshState(now).gto).toEqual(NO_HANDS);
  });

  // BD-T37: a reset starts the path again, and the trainer is not the path
  it("keeps the trainer's count and sessions through a reset of progress", () => {
    const gto = { day: "2026-10-16", handsToday: 7, sessions: [SESSION] };
    const reset = resetProgress({ ...freshState(now), xp: 900, gto }, new Date(2026, 9, 16, 18));
    expect(reset.gto).toEqual(gto);
    expect(reset.xp).toBe(0);
  });
});
