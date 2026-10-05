import { FieldGroup, Switch, Text } from "@expo/ui";

import { reminderLine } from "@/components/profile/profile-view-model";
import { ReminderTimeRow } from "@/components/profile/reminder-time";
import type { ReminderSetting } from "@/game/player-state";
import { formatClockTime } from "@/reminder/clock-format";
import type { PermissionState } from "@/reminder/reminder-device";

type SettingsSectionProps = {
  sound: boolean;
  reminder: ReminderSetting;
  reminderTime: Date;
  permission: PermissionState | null;
  playedToday: boolean;
  onSound: (on: boolean) => void;
  onReminder: (on: boolean) => void;
  onTime: (time: Date) => void;
  onOpenTime: () => void;
};

// DESIGN.md 10.3 and 10.7: the native Switch for Sound (D15) and for the reminder, and the
// reminder's time (D11). Dark mode has no switch: it follows the phone (D16).
export function SettingsSection(props: SettingsSectionProps) {
  const { sound, reminder, reminderTime, permission, playedToday } = props;
  return (
    <FieldGroup.Section title="Settings">
      <Switch label="Sound effects" value={sound} onValueChange={props.onSound} />
      <Switch label="Daily reminder" value={reminder.on} onValueChange={props.onReminder} />
      <ReminderTimeRow
        time={reminderTime}
        label="Reminder time"
        disabled={!reminder.on}
        onChange={props.onTime}
        onOpen={props.onOpenTime}
      />
      <FieldGroup.SectionFooter>
        <Text>{reminderLine(reminder.on, permission, formatClockTime(reminderTime), playedToday)}</Text>
      </FieldGroup.SectionFooter>
    </FieldGroup.Section>
  );
}
