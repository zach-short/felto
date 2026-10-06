import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
import { freezeShop, heldLine, profileStats, reminderLine } from "@/components/profile/profile-view-model";

const now = new Date(2026, 9, 5, 12);

describe("the Profile view model (PLAN.md phase 11)", () => {
  it("lists the stats with their icons", () => {
    const state = { ...freshState(now), xp: 240, gems: 20, finishedLessons: ["a", "b"], passedBosses: ["hands"] };
    expect(profileStats(state, now).map(({ art, value }) => [art, value])).toEqual([
      ["streak_flame", 0],
      ["xp_bolt", 240],
      ["lives_heart", 5],
      ["gem", 20],
      ["node_complete", 2],
      ["node_boss", 1],
    ]);
  });

  it("sells a freeze for 10 gems while fewer than 2 are held (D19)", () => {
    expect(freezeShop({ ...freshState(now), gems: 10 }, now)).toMatchObject({ held: 0, price: 10, canBuy: true });
    expect(freezeShop({ ...freshState(now), gems: 9 }, now)).toMatchObject({ canBuy: false });
    expect(freezeShop({ ...freshState(now), gems: 9 }, now).line).toBe(
      "1 more gem to go. Beat a boss and claim a reward.",
    );
    expect(freezeShop({ ...freshState(now), gems: 0 }, now).line).toMatch(/^10 more gems to go/);
    expect(freezeShop({ ...freshState(now), gems: 50, freezes: 2 }, now)).toMatchObject({ held: 2, canBuy: false });
  });

  it("counts a freeze already used up by a missed day as gone", () => {
    const state = { ...freshState(now), gems: 10, freezes: 2, streak: { length: 3, lastDay: "2026-10-03" } };
    expect(freezeShop(state, now)).toMatchObject({ held: 1, canBuy: true });
  });

  it("says one freeze in the singular", () => {
    expect([heldLine(0), heldLine(1), heldLine(2)]).toEqual(["0 freezes held", "1 freeze held", "2 freezes held"]);
  });

  it("says under the reminder switch whether a nudge can arrive (D11)", () => {
    expect(reminderLine(true, "granted", "7:00 PM", false)).toBe("Flop sends one nudge at 7:00 PM on a day you have not played yet.");
    expect(reminderLine(true, "denied", "7:00 PM", false)).toMatch(/^Notifications are off/);
    expect(reminderLine(true, "undetermined", "7:00 PM", false)).toMatch(/after your next lesson\.$/);
    // The ask fires only at the first finish of a day, so a played day points at tomorrow
    expect(reminderLine(true, "undetermined", "7:00 PM", true)).toBe(
      "Flop will ask to send you notifications after your first lesson tomorrow.",
    );
    expect(reminderLine(false, "granted", "7:00 PM", false)).toBe("No nudges. Flop will wait for you here.");
  });
});
