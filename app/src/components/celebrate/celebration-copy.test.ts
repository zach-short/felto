import { describe, expect, it } from "vitest";

import { HEARTS_REFILLED, layerCopy, sheetHeading } from "@/components/celebrate/celebration-copy";

describe("the celebration lines (GF-27)", () => {
  it("writes the layer's titles and lines as Zach chose them", () => {
    expect(layerCopy({ name: "streak_extended", count: 2 })).toEqual({
      title: "2 day streak!",
      line: "You came back. That is how it sticks.",
    });
    expect(layerCopy({ name: "streak_milestone", count: 7 })).toEqual({
      title: "7 day streak!",
      line: "7 days in a row. Flop is proud of you.",
    });
    expect(layerCopy({ name: "xp_milestone", count: 250 })).toEqual({ title: "250 XP!", line: "Every right answer got you here." });
    expect(layerCopy({ name: "welcome" })).toEqual({
      title: "Welcome aboard!",
      line: "Flop, Kicker and Ace are glad you sat down.",
    });
    expect(HEARTS_REFILLED).toEqual({ title: "Hearts full!", line: "Back to the table." });
  });

  it("groups thousands with a comma in a title", () => {
    expect(layerCopy({ name: "xp_milestone", count: 10000 }).title).toBe("10,000 XP!");
    expect(layerCopy({ name: "streak_milestone", count: 365 }).title).toBe("365 day streak!");
  });

  it("names each moment in the feedback sheet's heading", () => {
    expect(sheetHeading("royal_flush")).toBe("Royal flush!");
    expect(sheetHeading("all_in_win")).toBe("All in, and right!");
    expect(sheetHeading("hot_streak")).toBe("5 in a row!");
  });
});
