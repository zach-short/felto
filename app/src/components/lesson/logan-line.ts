// Logan Mode, asked for by Zach on 2026-10-05: when the switch is on, a finished stage ends with
// the mascot saying it is proud of the player and loves them. Zach's own words fixed the meaning;
// the first person is the mascot speaking, so the line names no one.
export const LOGAN_LINE = "I am so proud of you. I love you.";

export function loganLine(loganMode: boolean): string | null {
  return loganMode ? LOGAN_LINE : null;
}
