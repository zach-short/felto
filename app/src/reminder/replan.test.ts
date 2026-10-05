import { describe, expect, it } from "vitest";

import { dayKey } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";
import { finishSession } from "@/game/session";
import type { PlannedReminder } from "@/reminder/plan";
import type { ReminderDevice } from "@/reminder/replan";
import { noticeFinish, replan, seenAtMount } from "@/reminder/replan";

const lesson = { kind: "lesson", id: "hands-1", size: 10, answered: 10, right: 8 } as const;

// A phone like iOS: a trigger time already past throws (a time interval must be positive)
function fakePhone(clock: () => Date, failOn: string[] = []) {
  const held: PlannedReminder[] = [];
  const device: ReminderDevice = {
    permission: async () => "granted",
    ask: async () => undefined,
    cancelOwn: async () => void held.splice(0),
    schedule: async (reminder) => {
      if (reminder.date.getTime() <= clock().getTime()) throw new Error("trigger in the past");
      if (failOn.includes(dayKey(reminder.date))) throw new Error("refused");
      held.push(reminder);
    },
  };
  return { device, days: () => held.map((reminder) => dayKey(reminder.date)) };
}

describe("a replan reads the clock when it runs (audit of item 15, B1)", () => {
  it("does not plan today's 19:00 at 19:30, though the app opened at 18:00", async () => {
    const mount = new Date(2026, 9, 5, 18, 0);
    let now = mount;
    const clock = () => now;
    const state: PlayerState = freshState(mount);
    now = new Date(2026, 9, 5, 19, 30);
    const phone = fakePhone(clock);
    expect(await replan(state, clock, phone.device)).toBe(6);
    expect(phone.days()[0]).toBe("2026-10-06");
  });

  it("keeps the rest of the week when one reminder is refused", async () => {
    const now = new Date(2026, 9, 5, 9, 0);
    const phone = fakePhone(() => now, ["2026-10-05"]);
    expect(await replan(freshState(now), () => now, phone.device)).toBe(6);
  });

  it("schedules nothing without permission, and still cancels the old ones", async () => {
    const now = new Date(2026, 9, 5, 9, 0);
    const phone = fakePhone(() => now);
    await replan(freshState(now), () => now, phone.device);
    const refused = { ...phone.device, permission: async () => "denied" as const };
    expect(await replan(freshState(now), () => now, refused)).toBe(0);
    expect(phone.days()).toEqual([]);
  });
});

describe("the permission is asked at the first finish of a day (D11)", () => {
  it("asks for a finish at 00:05 after a mount at 23:50", () => {
    const mount = new Date(2026, 9, 5, 23, 50);
    const seen = seenAtMount(finishSession(freshState(mount), lesson, mount), mount);
    expect(seen).toBe("2026-10-05");
    const later = new Date(2026, 9, 6, 0, 5);
    const played = finishSession(freshState(mount), lesson, later);
    expect(noticeFinish(seen, played, later)).toEqual({ ask: true, seenDay: "2026-10-06" });
  });

  it("never asks at mount for a day already played, and asks once a day", () => {
    const now = new Date(2026, 9, 5, 12, 0);
    const played = finishSession(freshState(now), lesson, now);
    const seen = seenAtMount(played, now);
    expect(noticeFinish(seen, played, now).ask).toBe(false);
    const first = noticeFinish(null, played, now);
    expect(first.ask).toBe(true);
    expect(noticeFinish(first.seenDay, played, now).ask).toBe(false);
  });
});
