import { CAST } from "@/content/cast";
import { addDays, dayKey } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";
import { currentStreak, finishedToday } from "@/game/streak";

// BD-18: a week of single reminders, planned ahead, not one repeating trigger, so a day that is
// already played never gets one. The plan is redone at each app start, after each finish and on
// each settings change, so the week always starts from today.
export const PLAN_DAYS = 7;

// Every reminder this app schedules has an id with this prefix, so a replan cancels only its own
export const REMINDER_ID_PREFIX = "felto.reminder.";

export type PlannedReminder = { id: string; date: Date; title: string; body: string };

export function planReminders(state: PlayerState, now: Date): PlannedReminder[] {
  const { on, hour, minute } = state.settings.reminder;
  if (!on) return [];
  const today = dayKey(now);
  const planned: PlannedReminder[] = [];
  for (let offset = 0; offset < PLAN_DAYS; offset++) {
    const day = addDays(today, offset);
    const date = atLocalTime(day, hour, minute);
    if (date.getTime() <= now.getTime()) continue;
    if (offset === 0 && finishedToday(state, now)) continue;
    planned.push(reminderFor(state, day, date));
  }
  return planned;
}

// Hazard 9 and BD-12: the time is the phone's local clock on that calendar day, never UTC
export function atLocalTime(day: string, hour: number, minute: number): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date, hour, minute);
}

// The streak is read as it will stand at that moment if the player does not play before it, so a
// streak that a missed day will break is never promised as waiting (D19's freezes count)
function reminderFor(state: PlayerState, day: string, date: Date): PlannedReminder {
  const streak = currentStreak(state, date);
  return { id: `${REMINDER_ID_PREFIX}${day}`, date, title: reminderTitle(), body: reminderBody(streak) };
}

// D10, the warm register; the streak line is D10's own table row
export function reminderTitle(): string {
  return `${CAST.fish} saved you a seat`;
}

export function reminderBody(streak: number): string {
  if (streak > 0) return `Your ${streak}-day streak is waiting. One quick lesson keeps it going.`;
  return "One quick lesson starts a new streak.";
}
