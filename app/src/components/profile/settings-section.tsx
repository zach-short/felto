import { FieldGroup, Switch, Text } from "@expo/ui";

import { reminderLine } from "@/components/profile/profile-view-model";
import { ReminderTimeRow } from "@/components/profile/reminder-time";
import type { ReminderSetting } from "@/game/player-state";
import { formatClockTime } from "@/reminder/clock-format";
import type { PermissionState } from "@/reminder/reminder-device";

type SettingsSectionProps = {
  sound: boolean;
  haptics: boolean;
  reminder: ReminderSetting;
  reminderTime: Date;
  permission: PermissionState | null;
  playedToday: boolean;
  onSound: (on: boolean) => void;
  onHaptics: (on: boolean) => void;
  onReminder: (on: boolean) => void;
  onTime: (time: Date) => void;
  onOpenTime: () => void;
};

// GF-3: the words Zach chose on 2026-10-05, in the warm register (D10). The native Switch takes a
// label only, so the help line opens the section's footer, above the reminder line.
const HAPTICS_HELP = "Little taps as you answer and press.";

// DESIGN.md 10.3 and 10.7: the native Switch for Sound (D15), Haptics (GF-3) and the reminder,
// and the reminder's time (D11). Dark mode has no switch: it follows the phone (D16).
export function SettingsSection(props: SettingsSectionProps) {
  const { sound, haptics, reminder, reminderTime, permission, playedToday } = props;
  const reminderWords = reminderLine(reminder.on, permission, formatClockTime(reminderTime), playedToday);
  return (
    <FieldGroup.Section title="Settings">
      <Switch label="Sound effects" value={sound} onValueChange={props.onSound} />
      <Switch label="Haptics" value={haptics} onValueChange={props.onHaptics} />
      <Switch label="Daily reminder" value={reminder.on} onValueChange={props.onReminder} />
      <ReminderTimeRow
        time={reminderTime}
        label="Reminder time"
        disabled={!reminder.on}
        onChange={props.onTime}
        onOpen={props.onOpenTime}
      />
      <FieldGroup.SectionFooter>
        {/* One Text with a line break, so both platforms draw the two lines the same way */}
        <Text>{`${HAPTICS_HELP}\n${reminderWords}`}</Text>
      </FieldGroup.SectionFooter>
    </FieldGroup.Section>
  );
}
