import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PlannedReminder } from "@/reminder/plan";
import { REMINDER_ID_PREFIX } from "@/reminder/plan";
import type { ReminderDevice } from "@/reminder/replan";

// The one file that imports expo-notifications. D11: local notifications only, never a server, so
// no push token is ever asked for.

export type PermissionState = "granted" | "denied" | "undetermined";

// Android 13 and later shows its permission prompt only once a channel exists, and every reminder
// is posted to this one channel (PLAN.md phase 11)
const CHANNEL_ID = "streak-reminder";

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Streak reminder",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function readPermission(): Promise<PermissionState> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  if (granted) return "granted";
  return canAskAgain ? "undetermined" : "denied";
}

// D11: asked only after a finished lesson or when the player turns the reminder on, never at
// launch. A player who already answered is not asked again; the phone would not show it anyway.
export async function askPermission(): Promise<PermissionState> {
  const current = await readPermission();
  if (current !== "undetermined") return current;
  await ensureChannel();
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted ? "granted" : "denied";
}

// BD-18: this app's reminders only, by their id prefix; the plan and the clock are in replan.ts
export async function cancelOwnReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const own = scheduled.filter((request) => request.identifier.startsWith(REMINDER_ID_PREFIX));
  for (const request of own) await Notifications.cancelScheduledNotificationAsync(request.identifier);
}

export async function scheduleOne({ id, date, title, body }: PlannedReminder): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
  });
}

// The phone's side of a replan (reminder/replan.ts)
export const PHONE: ReminderDevice = {
  permission: readPermission,
  ask: askPermission,
  cancelOwn: cancelOwnReminders,
  schedule: scheduleOne,
};

// For the development list of scheduled reminders (PLAN.md phase 11, done-when)
export type ScheduledReminder = { id: string; body: string; trigger: string };

export async function listOwnReminders(): Promise<ScheduledReminder[]> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled
    .filter((request) => request.identifier.startsWith(REMINDER_ID_PREFIX))
    .map((request) => ({
      id: request.identifier,
      body: request.content.body ?? "",
      // The phone's own record of when it fires, shown as it reports it
      trigger: JSON.stringify(request.trigger),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
