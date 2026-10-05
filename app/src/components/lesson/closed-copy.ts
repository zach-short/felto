import { clockStyle, formatClockTime, type ClockStyle } from "@/reminder/clock-format";

// D10's out-of-lives line, shared with the out-of-lives sheet (components/lives)
export const OUT_OF_HEARTS = "Out of hearts for now.";

// The time goes through the one clock format of the app, so this line agrees with the reminder row
// (audit of item 15); the style is a parameter so a test can name the phone's setting.
export function nextLifeLine(nextLife: Date | null, style: ClockStyle = clockStyle()): string {
  if (!nextLife) return "One more is ready soon.";
  return `One more is ready at ${formatClockTime(nextLife, style)}.`;
}
