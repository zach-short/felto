import { describe, expect, it } from "vitest";

import { addDays, dayKey, daysBetween } from "@/game/day-key";

describe("the day key (BD-12)", () => {
  it("uses the local date, not the UTC one", () => {
    expect(dayKey(new Date(2026, 9, 5, 23, 30))).toBe("2026-10-05");
  });

  it("counts days across the spring-forward and fall-back dates", () => {
    expect(daysBetween("2027-03-13", "2027-03-15")).toBe(2);
    expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
    expect(addDays("2027-03-13", 1)).toBe("2027-03-14");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
  });

  it("crosses month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
  });
});
