import { FieldGroup } from "@expo/ui";

import { FORM_MODIFIERS } from "@/components/profile/form-modifiers";
import { FreezeShopSection } from "@/components/profile/freeze-shop-section";
import { ProfileFrame } from "@/components/profile/profile-frame";
import { ProfileStatsSection } from "@/components/profile/profile-stats-section";
import { freezeShop, profileStats } from "@/components/profile/profile-view-model";
import { RecoveredSection } from "@/components/profile/recovered-section";
import { ReminderTimeDialog } from "@/components/profile/reminder-time";
import { ResetSection } from "@/components/profile/reset-section";
import { SettingsSection } from "@/components/profile/settings-section";
import { useProfileControls } from "@/components/profile/use-profile-controls";
import { useTimeDialog } from "@/components/profile/use-time-dialog";
import { dayKey } from "@/game/day-key";
import { finishedToday } from "@/game/streak";
import { atLocalTime } from "@/reminder/plan";
import { usePlayer } from "@/storage/use-player";
import { useTheme } from "@/theme/use-theme";

// PLAN.md phase 11 and DESIGN.md 10.3: the stats, the freeze shop (D19), the settings (D11, D15,
// GF-3) and reset. Rule U4: no loading state, because the provider reads the player before the first
// frame; the empty state is a new player, whose stats read zero and whose shop says how to earn
// gems; the error state is a save that could not be read, shown as the first section.
export function ProfileScreen() {
  const { status, state } = usePlayer();
  const { colours } = useTheme();
  const controls = useProfileControls();
  const dialog = useTimeDialog();
  // BD-12: the screen is the edge that reads the clock, once per render
  const now = new Date();
  const { reminder } = state.settings;
  const reminderTime = atLocalTime(dayKey(now), reminder.hour, reminder.minute);
  const outside = (
    <ReminderTimeDialog time={reminderTime} open={dialog.open} onChange={controls.setReminderTime} onClose={dialog.hide} />
  );
  return (
    <ProfileFrame outside={outside}>
      {/* D16: the form shows the app's page colour behind its sections, in light and dark */}
      <FieldGroup style={{ backgroundColor: colours.page }} modifiers={FORM_MODIFIERS}>
        {status === "recovered" ? <RecoveredSection /> : null}
        <ProfileStatsSection stats={profileStats(state, now)} />
        <FreezeShopSection shop={freezeShop(state, now)} gems={state.gems} onBuy={controls.buyFreeze} />
        <SettingsSection
          sound={state.settings.sound}
          haptics={state.settings.haptics}
          reminder={reminder}
          reminderTime={reminderTime}
          permission={controls.permission}
          playedToday={finishedToday(state, now)}
          onSound={controls.setSound}
          onHaptics={controls.setHaptics}
          onReminder={controls.setReminderOn}
          onTime={controls.setReminderTime}
          onOpenTime={dialog.show}
        />
        <ResetSection onReset={controls.confirmReset} />
      </FieldGroup>
    </ProfileFrame>
  );
}
