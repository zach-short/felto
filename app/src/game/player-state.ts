import { DIALS } from "@/config/dials";

// Every field is plain JSON (times are epoch milliseconds), because the data module stores this
// value as one JSON string (BD-8). A change to this shape needs a new stored version and a
// migration (rule Q2).
export type PlayerState = {
  lives: number;
  // When the current 4-hour regain period started; ignored while lives are full (D8)
  livesClock: number;
  gems: number;
  xp: number;
  // lastDay is the last local day the streak covers, by a finish or by a freeze (D19)
  streak: { length: number; lastDay: string | null };
  freezes: number;
  finishedLessons: string[];
  // Unit ids whose boss was passed by playing it; only these earn a chest (D8)
  passedBosses: string[];
  // Unit ids the placement check marked finished without a boss played (D20)
  placedUnits: string[];
  openedChests: string[];
  // GF-13 (stored version 5): a whole number from 0 to 2^32 - 1, fixed for this player, from
  // which each unit's chest tier and its reveal are drawn (chest-tier.ts), so neither changes when
  // the app is closed and reopened
  chestSeed: number;
  // Exercises missed in a lesson or a boss and not since answered right in a review (D8)
  missedExercises: string[];
  onboarded: boolean;
  placement: PlacementResult;
  settings: Settings;
};

export type PlacementResult = "not-taken" | "passed" | "failed";

// D11: the daily streak reminder, at a local hour and minute on the phone (stored version 2)
export type ReminderSetting = { on: boolean; hour: number; minute: number };

// GF-3: haptics is the Haptics switch in Profile, on by default (stored version 3). Logan Mode
// (stored version 4) is off by default: the finish screens only say the loving line when asked.
export type Settings = { sound: boolean; haptics: boolean; loganMode: boolean; reminder: ReminderSetting };

export function defaultReminder(): ReminderSetting {
  return { on: true, hour: DIALS.reminderHour, minute: DIALS.reminderMinute };
}

export function freshState(now: Date): PlayerState {
  return {
    lives: DIALS.maxLives,
    livesClock: now.getTime(),
    gems: 0,
    xp: 0,
    streak: { length: 0, lastDay: null },
    freezes: 0,
    finishedLessons: [],
    passedBosses: [],
    placedUnits: [],
    openedChests: [],
    // The millisecond the player starts, as a 32-bit number: the edge reads the clock (rule B3),
    // and two players rarely start in the same millisecond
    chestSeed: now.getTime() >>> 0,
    missedExercises: [],
    onboarded: false,
    placement: "not-taken",
    settings: { sound: true, haptics: true, loganMode: false, reminder: defaultReminder() },
  };
}

export function withItem(list: readonly string[], item: string): string[] {
  return list.includes(item) ? [...list] : [...list, item];
}
