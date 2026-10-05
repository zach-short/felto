import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
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

describe("the data module (D3, BD-8, rule Q2)", () => {
  it("gives a fresh state when nothing is stored", () => {
    const { store } = memoryStore();
    expect(loadPlayer(store, now)).toEqual({ status: "new", state: freshState(now) });
  });

  it("reads back what it saved", () => {
    const { store } = memoryStore();
    const state = { ...freshState(now), xp: 120, finishedLessons: ["u1-l1"] };
    savePlayer(store, state);
    expect(loadPlayer(store, now)).toEqual({ status: "loaded", state });
  });

  it("saves the version with the player", () => {
    const { store, data } = memoryStore();
    savePlayer(store, freshState(now));
    expect(JSON.parse(data.get(PLAYER_KEY) ?? "{}").version).toBe(STATE_VERSION);
  });

  it.each([
    ["not JSON", "{oops"],
    ["no version", JSON.stringify({ player: freshState(now) })],
    ["a newer version", JSON.stringify({ version: STATE_VERSION + 1, player: freshState(now) })],
    ["a wrong shape", JSON.stringify({ version: STATE_VERSION, player: { lives: "five" } })],
  ])("puts an unreadable stored value (%s) in the backup key", (_, raw) => {
    const { store, data } = memoryStore({ [PLAYER_KEY]: raw });
    const result = loadPlayer(store, now);
    const backupKey = `${BACKUP_KEY_PREFIX}${now.getTime()}`;
    expect(result).toEqual({ status: "recovered", state: freshState(now), backupKey });
    expect(data.get(backupKey)).toBe(raw);
  });

  it("keeps an earlier backup when a later value is also unreadable", () => {
    const { store, data } = memoryStore({ [PLAYER_KEY]: "bad one" });
    loadPlayer(store, now);
    data.set(PLAYER_KEY, "bad two");
    loadPlayer(store, new Date(now.getTime() + 1000));
    const backups = [...data.keys()].filter((key) => key.startsWith(BACKUP_KEY_PREFIX));
    expect(backups.map((key) => data.get(key))).toEqual(["bad one", "bad two"]);
  });
});
