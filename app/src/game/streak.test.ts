import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
import type { PlayerState } from "@/game/player-state";
import { currentStreak, heldFreezes, recordFinishDay } from "@/game/streak";

// The test script sets TZ=America/New_York (BD-12), so these local times are New York times.
const at = (y: number, m: number, d: number, h = 12, min = 0, s = 0) =>
  new Date(y, m - 1, d, h, min, s);

function finishOn(state: PlayerState, ...times: Date[]): PlayerState {
  return times.reduce((s, time) => recordFinishDay(s, time), state);
}

const start = freshState(at(2026, 10, 1));

describe("the streak (D8, hazard 9)", () => {
  it("gives a 2-day streak for a finish at 21:00 New York time and another at 08:00 the next morning", () => {
    const evening = at(2026, 10, 5, 21);
    // 21:00 in New York is already the next day in UTC: the bug hazard 9 names
    expect(evening.getUTCDate()).toBe(6);
    const state = finishOn(start, evening, at(2026, 10, 6, 8));
    expect(currentStreak(state, at(2026, 10, 6, 8))).toBe(2);
  });

  it("resets the streak after a day with no finish", () => {
    const state = finishOn(start, at(2026, 10, 5), at(2026, 10, 6), at(2026, 10, 8));
    expect(state.streak.length).toBe(1);
  });

  it("shows 0 once a whole day has passed with no finish", () => {
    const state = finishOn(start, at(2026, 10, 5));
    expect(currentStreak(state, at(2026, 10, 6, 23, 59))).toBe(1);
    expect(currentStreak(state, at(2026, 10, 7, 0, 0))).toBe(0);
  });

  it("counts a finish on the spring-forward date of 2027-03-14 once", () => {
    const beforeSkip = at(2027, 3, 14, 1, 30);
    const afterSkip = at(2027, 3, 14, 3, 30);
    expect(afterSkip.getTime() - beforeSkip.getTime()).toBe(3_600_000);
    const state = finishOn(start, at(2027, 3, 13, 23), beforeSkip, afterSkip, at(2027, 3, 15, 0, 30));
    expect(state.streak.length).toBe(3);
  });

  it("counts two finishes on one day once", () => {
    const state = finishOn(start, at(2026, 10, 5, 0, 1), at(2026, 10, 5, 23, 59));
    expect(state.streak.length).toBe(1);
  });

  it("does not count a clock set back to an earlier day", () => {
    const state = finishOn(start, at(2026, 10, 5), at(2026, 10, 6), at(2026, 10, 4));
    expect(state.streak).toEqual({ length: 2, lastDay: "2026-10-06" });
  });
});

describe("the streak freeze (D19)", () => {
  const withFreezes = (freezes: number) => ({ ...start, freezes });

  it("covers one missed day with one freeze", () => {
    const state = finishOn(withFreezes(1), at(2026, 10, 5), at(2026, 10, 6), at(2026, 10, 8));
    expect(state.streak.length).toBe(3);
    expect(state.freezes).toBe(0);
  });

  it("breaks the streak on two missed days with one freeze", () => {
    const state = finishOn(withFreezes(1), at(2026, 10, 5), at(2026, 10, 6), at(2026, 10, 9));
    expect(state.streak.length).toBe(1);
    expect(state.freezes).toBe(0);
  });

  it("covers two missed days with two freezes", () => {
    const state = finishOn(withFreezes(2), at(2026, 10, 5), at(2026, 10, 8));
    expect(state.streak.length).toBe(2);
    expect(state.freezes).toBe(0);
  });

  it("does not spend a freeze on a day with a finish", () => {
    const days = [5, 6, 7, 8].map((d) => at(2026, 10, d));
    const state = finishOn(withFreezes(2), ...days);
    expect(state.freezes).toBe(2);
    expect(heldFreezes(state, at(2026, 10, 8, 23))).toBe(2);
  });

  it("does not spend a freeze on the day that is still running", () => {
    const state = finishOn(withFreezes(1), at(2026, 10, 5));
    expect(heldFreezes(state, at(2026, 10, 6, 23, 59))).toBe(1);
    expect(heldFreezes(state, at(2026, 10, 7, 0, 1))).toBe(0);
    expect(currentStreak(state, at(2026, 10, 7, 0, 1))).toBe(1);
  });
});
