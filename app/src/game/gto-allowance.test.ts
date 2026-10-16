import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { countDealtHand, handsDealtToday, handsLeftToday, trainerOpen } from "@/game/gto-allowance";
import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";

// vitest runs in America/New_York (vitest.config.mts), so these local times are New York times
const start = new Date(2026, 9, 16, 9);

function dealt(state: PlayerState, now: Date, hands: number): PlayerState {
  let current = state;
  for (let i = 0; i < hands; i++) {
    const outcome = countDealtHand(current, now);
    if (!outcome.ok) throw new Error(`hand ${i + 1} was refused`);
    current = outcome.state;
  }
  return current;
}

describe("the free allowance of the GTO trainer (BD-T9, board item 44)", () => {
  it("reads its dials", () => {
    expect(DIALS.gtoFreeHandsPerDay).toBe(10);
    expect(DIALS.gtoHandsPerSession).toBe(10);
    expect(DIALS.gtoRequiresUnit).toBeNull();
  });

  it("gives a new player the whole allowance", () => {
    expect(handsLeftToday(freshState(start), start)).toBe(10);
  });

  it("takes one hand off for each hand dealt, and refuses the eleventh", () => {
    const three = dealt(freshState(start), start, 3);
    expect(handsDealtToday(three, start)).toBe(3);
    expect(handsLeftToday(three, start)).toBe(7);
    const ten = dealt(three, start, 7);
    expect(handsLeftToday(ten, start)).toBe(0);
    expect(countDealtHand(ten, start)).toEqual({ ok: false, reason: "none-left" });
  });

  it("is never below 0, even for a count above the dial", () => {
    const over = { ...freshState(start), gto: { day: "2026-10-16", handsToday: 14, sessions: [] } };
    expect(handsLeftToday(over, start)).toBe(0);
  });

  it("resets at local midnight, not before", () => {
    const ten = dealt(freshState(start), start, 10);
    expect(handsLeftToday(ten, new Date(2026, 9, 16, 23, 59, 59, 999))).toBe(0);
    expect(handsLeftToday(ten, new Date(2026, 9, 17, 0, 0, 0, 0))).toBe(10);
  });

  it("counts a hand dealt after midnight on the new day", () => {
    const late = dealt(freshState(start), new Date(2026, 9, 16, 23, 50), 6);
    const after = dealt(late, new Date(2026, 9, 17, 0, 5), 1);
    expect(after.gto).toEqual({ day: "2026-10-17", handsToday: 1, sessions: [] });
    expect(handsLeftToday(after, new Date(2026, 9, 17, 0, 5))).toBe(9);
  });

  // 2026-11-01 is 25 hours long in New York: the clocks go from 02:00 back to 01:00
  it("keeps one count for the whole of a daylight-saving day, and resets at its midnight", () => {
    const early = new Date(2026, 10, 1, 0, 30);
    const four = dealt(freshState(early), early, 4);
    expect(handsLeftToday(four, new Date(2026, 10, 1, 1, 30))).toBe(6);
    expect(handsLeftToday(four, new Date(2026, 10, 1, 23, 59))).toBe(6);
    expect(handsLeftToday(four, new Date(2026, 10, 2, 0, 0))).toBe(10);
  });

  // 2026-03-08 is 23 hours long in New York: the clocks go from 02:00 to 03:00
  it("resets on the short daylight-saving day too", () => {
    const night = new Date(2026, 2, 7, 23, 0);
    const ten = dealt(freshState(night), night, 10);
    expect(handsLeftToday(ten, new Date(2026, 2, 8, 0, 0))).toBe(10);
    expect(handsLeftToday(ten, new Date(2026, 2, 8, 3, 30))).toBe(10);
  });

  it("opens the trainer for every player while no unit is required", () => {
    expect(trainerOpen(freshState(start))).toBe(true);
  });
});
