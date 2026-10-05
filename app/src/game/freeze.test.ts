import { describe, expect, it } from "vitest";

import { buyFreeze } from "@/game/freeze";
import { freshState } from "@/game/player-state";

const now = new Date(2026, 9, 8, 12);
const start = freshState(now);

describe("buying a streak freeze (D19)", () => {
  it("costs 10 gems", () => {
    expect(buyFreeze({ ...start, gems: 9 }, now)).toEqual({ ok: false, reason: "not-enough-gems" });
    const outcome = buyFreeze({ ...start, gems: 10 }, now);
    expect(outcome.ok && outcome.state.freezes).toBe(1);
    expect(outcome.ok && outcome.state.gems).toBe(0);
  });

  it("holds at most 2", () => {
    expect(buyFreeze({ ...start, gems: 50, freezes: 2 }, now)).toEqual({ ok: false, reason: "freezes-full" });
  });

  it("cannot cover a day that was already missed", () => {
    // Last finish 2026-10-06; 2026-10-07 was missed with no freeze held
    const state = { ...start, gems: 10, streak: { length: 5, lastDay: "2026-10-06" } };
    const outcome = buyFreeze(state, now);
    expect(outcome.ok && outcome.state.streak.length).toBe(0);
    expect(outcome.ok && outcome.state.freezes).toBe(1);
  });
});
