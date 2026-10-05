import { ListItem, Text } from "@expo/ui";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";

import type { ReminderTimeDialogProps, ReminderTimeRowProps } from "@/components/profile/reminder-time";
import { clockStyle, formatClockTime } from "@/reminder/clock-format";
import { useTheme } from "@/theme/use-theme";

// DESIGN.md 10.3: on Android the time is a row that shows the time and opens Compose's time
// dialog. With the reminder off the row is drawn muted and a press does nothing.
export function ReminderTimeRow({ time, label, disabled, onOpen }: ReminderTimeRowProps) {
  const { colours } = useTheme();
  const textStyle = { color: disabled ? colours.textMuted : colours.text };
  // The row keeps its press handler while disabled: taking it away removes the Compose modifier
  // list, which @expo/ui 57.0.21 then fails to set ("Cannot set prop 'modifiers'", seen on the
  // Pixel_9 on 2026-10-05)
  return (
    <ListItem onPress={() => (disabled ? undefined : onOpen())} trailing={<Text textStyle={textStyle}>{formatClockTime(time)}</Text>}>
      <Text textStyle={textStyle}>{label}</Text>
    </ListItem>
  );
}

// The dialog is a window of its own, drawn from a Host outside the Form while it is open. Its
// clock face uses the app's 12- or 24-hour style, as the row does.
export function ReminderTimeDialog({ time, open, onChange, onClose }: ReminderTimeDialogProps) {
  if (!open) return null;
  return (
    <DateTimePicker
      value={time}
      mode="time"
      presentation="dialog"
      is24Hour={clockStyle().uses24Hour}
      onValueChange={(_event, chosen) => {
        onChange(chosen);
        onClose();
      }}
      onDismiss={onClose}
    />
  );
}
