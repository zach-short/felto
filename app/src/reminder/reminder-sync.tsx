import { useReminderSync } from "@/reminder/use-reminder-sync";

// Draws nothing: it sits once at the root, under the player provider, so the reminders follow
// the player's state from any screen (D11, BD-18)
export function ReminderSync() {
  useReminderSync();
  return null;
}
