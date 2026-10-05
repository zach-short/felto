import { DatePicker } from "@expo/ui/swift-ui";
import { disabled as disabledModifier, environment } from "@expo/ui/swift-ui/modifiers";

import type { ReminderTimeDialogProps, ReminderTimeRowProps } from "@/components/profile/reminder-time";
import { clockStyle } from "@/reminder/clock-format";

// DESIGN.md 10.3: the time picker. The community datetime-picker is this same SwiftUI DatePicker
// inside its own Host, and a Host cannot sit inside the Form's Host, so the Form row draws the
// DatePicker itself: the compact time button that opens the wheel. It is given the app's locale,
// so it writes the time as the line under it does (reminder/clock-format.ts).
export function ReminderTimeRow({ time, label, disabled, onChange }: ReminderTimeRowProps) {
  return (
    <DatePicker
      title={label}
      selection={time}
      displayedComponents={["hourAndMinute"]}
      onDateChange={onChange}
      modifiers={[disabledModifier(disabled), environment("locale", clockStyle().locale)]}
    />
  );
}

// iOS opens the picker in place, so there is no separate dialog
export function ReminderTimeDialog(_props: ReminderTimeDialogProps) {
  return null;
}
