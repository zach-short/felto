import { describe, expect, it } from "vitest";

import { nextLifeLine } from "@/components/lesson/closed-copy";

const AT = new Date(2026, 9, 5, 19, 30);

describe("nextLifeLine", () => {
  it("writes the time in the one clock format, 12 hour", () => {
    expect(nextLifeLine(AT, { locale: "en-US", uses24Hour: false })).toBe("One more is ready at 7:30 PM.");
  });

  it("writes the time in the one clock format, 24 hour", () => {
    expect(nextLifeLine(AT, { locale: "en-GB", uses24Hour: true })).toBe("One more is ready at 19:30.");
  });

  it("says soon when no time is known", () => {
    expect(nextLifeLine(null)).toBe("One more is ready soon.");
  });
});
