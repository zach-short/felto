import type { PlayerState } from "@/game/player-state";

// The stored value comes from disk, so its type is proven field by field before the app uses
// it; a value that fails here is backed up, never trusted (rule Q2).
type Check = (value: unknown) => boolean;

const isNumber: Check = (v) => typeof v === "number" && Number.isFinite(v);
const isBoolean: Check = (v) => typeof v === "boolean";
const isStringList: Check = (v) => Array.isArray(v) && v.every((item) => typeof item === "string");
const isDayKeyOrNull: Check = (v) => v === null || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v));
const isPlacement: Check = (v) => v === "not-taken" || v === "passed" || v === "failed";
const isWholeIn = (low: number, high: number): Check => (v) =>
  typeof v === "number" && Number.isInteger(v) && v >= low && v <= high;
const isReminder: Check = (v) => hasFields(v, { on: isBoolean, hour: isWholeIn(0, 23), minute: isWholeIn(0, 59) });
const isCount = isWholeIn(0, Number.MAX_SAFE_INTEGER);
const GTO_ACTIONS: readonly unknown[] = ["fold", "open", "call", "3bet", "4bet", "5bet"];
const isActionList: Check = (v) => Array.isArray(v) && v.length > 0 && v.every((item) => GTO_ACTIONS.includes(item));
const isListOf = (check: Check): Check => (v) => Array.isArray(v) && v.every(check);
const isWorst: Check = (v) => v === null || hasFields(v, { seed: isCount, actions: isActionList, decision: isCount });
const isGtoSession: Check = (v) =>
  hasFields(v, {
    day: (d) => typeof d === "string" && isDayKeyOrNull(d),
    firstSeed: isCount,
    hands: isCount,
    decisions: isCount,
    mistakes: isCount,
    costBb: (c) => typeof c === "number" && Number.isFinite(c) && c >= 0,
    worst: isWorst,
  });

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasFields(value: unknown, checks: Record<string, Check>): boolean {
  return isRecord(value) && Object.entries(checks).every(([key, check]) => check(value[key]));
}

const PLAYER_CHECKS: Record<string, Check> = {
  lives: isNumber,
  livesClock: isNumber,
  gems: isNumber,
  xp: isNumber,
  streak: (v) => hasFields(v, { length: isNumber, lastDay: isDayKeyOrNull }),
  freezes: isNumber,
  finishedLessons: isStringList,
  passedBosses: isStringList,
  placedUnits: isStringList,
  openedChests: isStringList,
  chestSeed: isWholeIn(0, 0xffff_ffff),
  missedExercises: isStringList,
  onboarded: isBoolean,
  placement: isPlacement,
  settings: (v) => hasFields(v, { sound: isBoolean, haptics: isBoolean, loganMode: isBoolean, reminder: isReminder }),
  gto: (v) => hasFields(v, { day: isDayKeyOrNull, handsToday: isCount, sessions: isListOf(isGtoSession) }),
};

export function isPlayerState(value: unknown): value is PlayerState {
  return hasFields(value, PLAYER_CHECKS);
}
