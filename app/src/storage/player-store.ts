import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";
import { isPlayerState, isRecord } from "@/storage/check-state";
import { migrate, STATE_VERSION } from "@/storage/migrations";

// D3 and BD-8: all player state is one JSON value under one key. This core is pure apart from
// the store it is given, so vitest runs it with a map in place of the SQLite store.
export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export const PLAYER_KEY = "felto.player";
export const BACKUP_KEY_PREFIX = "felto.player.backup.";

export type LoadResult =
  | { status: "new" | "loaded"; state: PlayerState }
  | { status: "recovered"; state: PlayerState; backupKey: string };

export function loadPlayer(store: KeyValueStore, now: Date): LoadResult {
  const raw = store.getItem(PLAYER_KEY);
  if (raw === null) return { status: "new", state: freshState(now) };
  const state = readStored(raw);
  if (state) return { status: "loaded", state };
  // Never drop a value we cannot read: a later version of the app may read it (rule Q2). The
  // time in the key keeps every backup, so a second failure cannot overwrite the first.
  const backupKey = `${BACKUP_KEY_PREFIX}${now.getTime()}`;
  store.setItem(backupKey, raw);
  return { status: "recovered", state: freshState(now), backupKey };
}

// Reset progress (PLAN.md phase 11) writes a fresh path over the player's own, so the state is
// copied first, as an unreadable value is: progress lives only on this phone (rule Q2). It takes
// the latest state, not the saved one, because the save runs after the render.
export function backupPlayer(store: KeyValueStore, state: PlayerState, now: Date): string {
  const backupKey = `${BACKUP_KEY_PREFIX}${now.getTime()}`;
  store.setItem(backupKey, JSON.stringify({ version: STATE_VERSION, player: state }));
  return backupKey;
}

export function savePlayer(store: KeyValueStore, state: PlayerState): void {
  store.setItem(PLAYER_KEY, JSON.stringify({ version: STATE_VERSION, player: state }));
}

// A value from a newer app version is unreadable here, and so is backed up, not guessed at
function readStored(raw: string): PlayerState | null {
  const parsed = parseJson(raw);
  if (!isRecord(parsed)) return null;
  const { version } = parsed;
  if (typeof version !== "number" || !Number.isInteger(version)) return null;
  if (version < 1 || version > STATE_VERSION) return null;
  const player = migrate(parsed.player, version);
  return isPlayerState(player) ? player : null;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
