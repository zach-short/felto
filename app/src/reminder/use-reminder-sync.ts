import { useEffect, useRef } from "react";

import { planReminders } from "@/reminder/plan";
import { runInTurn } from "@/reminder/queue";
import { PHONE } from "@/reminder/reminder-device";
import { noticeFinish, replan, seenAtMount } from "@/reminder/replan";
import { useResumeTime } from "@/reminder/use-resume-time";
import { usePlayer } from "@/storage/use-player";

const clock = () => new Date();

// BD-18 and D11: keeps the phone's scheduled reminders equal to the plan. A replan runs at start,
// on return to the front, after a finish and on each settings change: the key below changes for
// each. The replan itself reads the clock when it runs (reminder/replan.ts), so a key built at an
// older render never schedules an old time (audit of item 15, B1).
export function useReminderSync(): void {
  const { state } = usePlayer();
  const resumed = useResumeTime();
  const key = planKey(state, clock());
  const seenDay = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const now = clock();
    if (seenDay.current === undefined) seenDay.current = seenAtMount(state, now);
    const notice = noticeFinish(seenDay.current, state, now);
    seenDay.current = notice.seenDay;
    const ask = notice.ask && state.settings.reminder.on;
    void runInTurn(async () => {
      if (ask) await PHONE.ask();
      await replan(state, clock, PHONE);
    });
    // The state is read at the commit that changed the key; the key holds every part of it that
    // the plan or the permission ask reads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, resumed]);
}

// What the phone should hold, plus the day and whether it is played, so a finish just after
// midnight also changes the key
function planKey(state: Parameters<typeof planReminders>[0], now: Date): string {
  const plan = planReminders(state, now).map((reminder) => `${reminder.id}@${reminder.date.getTime()}:${reminder.body}`);
  return `${state.streak.lastDay}|${plan.join("|")}`;
}
