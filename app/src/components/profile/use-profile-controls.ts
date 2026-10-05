import { Alert } from "react-native";

import { stopEffects } from "@/feedback/effects";
import { safely } from "@/feedback/safely";
import { useNotificationPermission } from "@/reminder/use-notification-permission";
import { usePlayer } from "@/storage/use-player";

// What each Profile control does. The actions read the clock and the latest state themselves
// (storage/player-actions.ts), so two taps in one tick never lose either.
export function useProfileControls() {
  const { actions } = usePlayer();
  const { permission, ask } = useNotificationPermission();
  return {
    permission,
    // D15: Sound off cuts off a playing effect and never loads the players
    setSound: (on: boolean) => {
      actions.setSound(on);
      if (!on) safely(stopEffects);
    },
    // GF-3: a buzz is over as it starts, so turning Haptics off has nothing to stop
    setHaptics: (on: boolean) => actions.setHaptics(on),
    // D11: turning the reminder on is the one other moment the permission is asked. The ask is
    // queued before the change, so the replan that follows it can already schedule.
    setReminderOn: (on: boolean) => {
      if (on) ask();
      actions.setReminderOn(on);
    },
    setReminderTime: (time: Date) => actions.setReminderTime(time.getHours(), time.getMinutes()),
    buyFreeze: () => void actions.buyFreeze(),
    confirmReset: () => confirmReset(actions.resetProgress),
  };
}

// DESIGN.md 10.3: reset progress sits behind the platform's own alert, with the safe choice first
function confirmReset(reset: () => void): void {
  Alert.alert(
    "Start over?",
    "Your lessons, XP, gems, freezes and streak go back to zero. Your settings stay as they are.",
    [
      { text: "Keep my progress", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: reset },
    ],
  );
}
