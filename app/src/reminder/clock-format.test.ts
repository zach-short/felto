import { describe, expect, it } from "vitest";

import { formatClockTime } from "@/reminder/clock-format";

const twelve = { locale: "en-US", uses24Hour: false };
const twentyFour = { locale: "en-GB", uses24Hour: true };

describe("one clock format (audit of item 15)", () => {
  it("writes a 12-hour time", () => {
    expect(formatClockTime(new Date(2026, 9, 5, 19, 3), twelve)).toBe("7:03 PM");
    expect(formatClockTime(new Date(2026, 9, 5, 0, 5), twelve)).toBe("12:05 AM");
    expect(formatClockTime(new Date(2026, 9, 5, 12, 0), twelve)).toBe("12:00 PM");
  });

  it("writes a 24-hour time", () => {
    expect(formatClockTime(new Date(2026, 9, 5, 19, 3), twentyFour)).toBe("19:03");
    expect(formatClockTime(new Date(2026, 9, 5, 7, 0), twentyFour)).toBe("07:00");
  });
});
