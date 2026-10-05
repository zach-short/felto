// Rule U3: the reminder time is a platform pair. On iOS it is SwiftUI's DatePicker as a row of
// the Form (reminder-time.ios.tsx); on Android it is a list row that opens the Compose time
// dialog of @expo/ui/community/datetime-picker (reminder-time.android.tsx). The dialog is drawn
// outside the Form's Host, so each file exports both parts; this is the one shape both export.
import type { JSX } from "react";

export type ReminderTimeRowProps = {
  time: Date;
  label: string;
  disabled: boolean;
  onChange: (time: Date) => void;
  onOpen: () => void;
};

export type ReminderTimeDialogProps = {
  time: Date;
  open: boolean;
  onChange: (time: Date) => void;
  onClose: () => void;
};

export declare function ReminderTimeRow(props: ReminderTimeRowProps): JSX.Element;
export declare function ReminderTimeDialog(props: ReminderTimeDialogProps): JSX.Element | null;
