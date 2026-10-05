import { addDays, dayKey, daysBetween } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";

// D8 and D19. Missed days are applied lazily, the first time the state is read or changed after
// them: each missed local day uses one held freeze, and the first missed day with no freeze left
// breaks the streak. A day with a finish never uses a freeze, and the day that is still running
// is not missed yet.
export function settleStreak(state: PlayerState, now: Date): PlayerState {
  const { lastDay } = state.streak;
  if (lastDay === null) return state;
  const missed = daysBetween(lastDay, dayKey(now)) - 1;
  if (missed <= 0) return state;
  if (missed <= state.freezes) {
    const streak = { ...state.streak, lastDay: addDays(lastDay, missed) };
    return { ...state, freezes: state.freezes - missed, streak };
  }
  return { ...state, freezes: 0, streak: { length: 0, lastDay: null } };
}

export function recordFinishDay(state: PlayerState, now: Date): PlayerState {
  const settled = settleStreak(state, now);
  const today = dayKey(now);
  const { lastDay, length } = settled.streak;
  if (lastDay === null) return { ...settled, streak: { length: 1, lastDay: today } };
  // A clock set back to an earlier day counts as the same day, never as a new one
  if (daysBetween(lastDay, today) <= 0) return settled;
  return { ...settled, streak: { length: length + 1, lastDay: today } };
}

export function currentStreak(state: PlayerState, now: Date): number {
  return settleStreak(state, now).streak.length;
}

export function heldFreezes(state: PlayerState, now: Date): number {
  return settleStreak(state, now).freezes;
}

export function finishedToday(state: PlayerState, now: Date): boolean {
  return state.streak.lastDay === dayKey(now) && state.streak.length > 0;
}
