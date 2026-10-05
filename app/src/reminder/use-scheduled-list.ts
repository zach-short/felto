import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { runInTurn } from "@/reminder/queue";
import type { ScheduledReminder } from "@/reminder/reminder-device";
import { listOwnReminders } from "@/reminder/reminder-device";

export type ScheduledList = ScheduledReminder[] | "loading" | "failed";

// The phone's own list of this app's scheduled reminders, read each time the screen comes into
// view and after any replan queued before it. A failed read is reported, not left loading.
export function useScheduledList(): ScheduledList {
  const [list, setList] = useState<ScheduledList>("loading");
  useFocusEffect(
    useCallback(() => {
      void runInTurn(async () => {
        try {
          setList(await listOwnReminders());
        } catch {
          setList("failed");
        }
      });
    }, []),
  );
  return list;
}
