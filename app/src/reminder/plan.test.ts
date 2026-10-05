import { describe, expect, it } from "vitest";

import { addDays, dayKey } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";
import { finishSession } from "@/game/session";
import { setReminderOn, setReminderTime } from "@/game/settings";
import { planReminders, REMINDER_ID_PREFIX } from "@/reminder/plan";

// The test script fixes TZ=America/New_York (BD-12), so these are New York wall-clock times
const morning = new Date(2026, 9, 5, 9, 30);
const lesson = { kind: "lesson", id: "hands-1", size: 10, answered: 10, right: 8 } as const;

function withStreak(length: number, lastDay: string, freezes = 0): PlayerState {
  return { ...freshState(morning), streak: { length, lastDay }, freezes };
}

describe("the reminder plan (D11, BD-18)", () => {
  it("plans seven dates at the reminder time, from today", () => {
    const plan = planReminders(freshState(morning), morning);
    expect(plan).toHaveLength(7);
    plan.forEach((reminder, offset) => {
      expect(dayKey(reminder.date)).toBe(addDays("2026-10-05", offset));
      expect([reminder.date.getHours(), reminder.date.getMinutes()]).toEqual([19, 0]);
      expect(reminder.id).toBe(`${REMINDER_ID_PREFIX}${dayKey(reminder.date)}`);
    });
  });

  it("plans none for a day with a finish", () => {
    const played = finishSession(freshState(morning), lesson, morning);
    const days = planReminders(played, morning).map((reminder) => dayKey(reminder.date));
    expect(days).toHaveLength(6);
    expect(days).not.toContain("2026-10-05");
    expect(days[0]).toBe("2026-10-06");
  });

  it("skips today once today's time has passed", () => {
    const late = new Date(2026, 9, 5, 21, 0);
    const days = planReminders(freshState(late), late).map((reminder) => dayKey(reminder.date));
    expect(days).toEqual(["2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"]);
  });

  it("plans nothing while the reminder is off", () => {
    expect(planReminders(setReminderOn(freshState(morning), false), morning)).toEqual([]);
  });

  it("uses the chosen time, on local wall-clock time across the daylight-saving change", () => {
    // New York leaves daylight saving on 2026-11-01; 07:45 stays 07:45 on both sides of it
    const start = new Date(2026, 9, 29, 6, 0);
    const state = setReminderTime(freshState(start), 7, 45);
    const plan = planReminders(state, start);
    expect(plan.map((reminder) => dayKey(reminder.date))).toContain("2026-11-01");
    plan.forEach((reminder) => expect([reminder.date.getHours(), reminder.date.getMinutes()]).toEqual([7, 45]));
    const offsets = new Set(plan.map((reminder) => reminder.date.getTimezoneOffset()));
    expect(offsets).toEqual(new Set([240, 300]));
  });

  it("names the streak only while it will still be alive at that moment", () => {
    const state = withStreak(4, "2026-10-04");
    const bodies = planReminders(state, morning).map((reminder) => reminder.body);
    expect(bodies[0]).toBe("Your 4-day streak is waiting. One quick lesson keeps it going.");
    expect(bodies[1]).toBe("One quick lesson starts a new streak.");
  });

  it("counts held freezes when it reads the streak ahead (D19)", () => {
    const bodies = planReminders(withStreak(4, "2026-10-04", 2), morning).map((reminder) => reminder.body);
    expect(bodies.slice(0, 3)).toEqual(Array(3).fill("Your 4-day streak is waiting. One quick lesson keeps it going."));
    expect(bodies[3]).toBe("One quick lesson starts a new streak.");
  });

  it("refuses a time that is not on a clock", () => {
    const state = freshState(morning);
    expect(setReminderTime(state, 24, 0)).toBe(state);
    expect(setReminderTime(state, 7, 60)).toBe(state);
    expect(setReminderTime(state, 7.5, 0)).toBe(state);
  });
});
