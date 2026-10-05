// One way to write a time of day in the whole app, so the reminder row, its picker and the line
// under it agree (audit of item 15). It follows the locale the JavaScript engine reports for the
// phone; the phone's own 12/24-hour switch is not visible to it (no localization package, BD-15).
// components/lesson/closed-copy.ts ("One more is ready at {time}") uses it too.
export type ClockStyle = { locale: string; uses24Hour: boolean };

export function clockStyle(): ClockStyle {
  const options = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions();
  const cycle = options.hourCycle;
  return { locale: options.locale, uses24Hour: cycle === "h23" || cycle === "h24" || options.hour12 === false };
}

export function formatClockTime(time: Date, style: ClockStyle = clockStyle()): string {
  const hour = time.getHours();
  const minute = String(time.getMinutes()).padStart(2, "0");
  if (style.uses24Hour) return `${String(hour).padStart(2, "0")}:${minute}`;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${suffix}`;
}
