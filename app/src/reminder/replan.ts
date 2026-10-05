import { dayKey } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";
import { finishedToday } from "@/game/streak";
import type { PlannedReminder } from "@/reminder/plan";
import { planReminders } from "@/reminder/plan";

// The phone's side of a replan, passed in so the order and the clock are tested in node
export type ReminderDevice = {
  permission: () => Promise<"granted" | "denied" | "undetermined">;
  ask: () => Promise<unknown>;
  cancelOwn: () => Promise<void>;
  schedule: (reminder: PlannedReminder) => Promise<void>;
};

// BD-18 and BD-12: the clock is read when the replan runs, not when the screen last rendered, so
// a replan at 19:30 never plans today's 19:00 (audit of item 15, B1). Each reminder is scheduled
// on its own: one that fails, as iOS fails a trigger time already past, never empties the week.
// Returns the number scheduled.
export async function replan(state: PlayerState, clock: () => Date, device: ReminderDevice): Promise<number> {
  await device.cancelOwn();
  if ((await device.permission()) !== "granted") return 0;
  let scheduled = 0;
  for (const reminder of planReminders(state, clock())) {
    if (reminder.date.getTime() <= clock().getTime()) continue;
    try {
      await device.schedule(reminder);
      scheduled++;
    } catch {
      // Dropped on purpose: see above
    }
  }
  return scheduled;
}

// D11: the permission is asked at the first finish of a local day seen while the app runs. The
// day is the current one at each check, so a finish just after midnight counts for the new day
// (audit of item 15, B1). seenDay is the last day already counted, or null.
export function noticeFinish(seenDay: string | null, state: PlayerState, now: Date) {
  const today = dayKey(now);
  const done = finishedToday(state, now);
  return { ask: done && seenDay !== today, seenDay: done ? today : seenDay };
}

// At mount a day already played is counted as seen, so opening the app never asks (D11)
export function seenAtMount(state: PlayerState, now: Date): string | null {
  return finishedToday(state, now) ? dayKey(now) : null;
}
