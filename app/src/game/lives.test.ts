import { describe, expect, it } from "vitest";

import { isOpenAtLives, livesAt, nextLifeAt, refillLives, spendLife } from "@/game/lives";
import { freshState } from "@/game/player-state";

const t0 = new Date(2026, 9, 5, 10, 0, 0);
const after = (h: number, m = 0, s = 0) => new Date(t0.getTime() + ((h * 60 + m) * 60 + s) * 1000);

describe("lives (D8)", () => {
  it("brings a life back at 4:00:00 and not at 3:59:59", () => {
    const state = spendLife(freshState(t0), t0);
    expect(livesAt(state, after(3, 59, 59))).toBe(4);
    expect(livesAt(state, after(4))).toBe(5);
    expect(nextLifeAt(state, t0)).toEqual(after(4));
  });

  it("starts the clock at the first life spent, not at a later one", () => {
    let state = spendLife(freshState(t0), t0);
    state = spendLife(state, after(1));
    expect(livesAt(state, after(4))).toBe(4);
    expect(livesAt(state, after(8))).toBe(5);
  });

  it("never goes above the maximum or below zero", () => {
    let state = freshState(t0);
    for (let i = 0; i < 7; i++) state = spendLife(state, t0);
    expect(state.lives).toBe(0);
    expect(livesAt(state, after(100))).toBe(5);
  });

  it("closes lessons and the boss at 0 lives, and keeps the review open", () => {
    const state = { ...freshState(t0), lives: 0 };
    expect(isOpenAtLives("lesson", state, t0)).toBe(false);
    expect(isOpenAtLives("boss", state, t0)).toBe(false);
    expect(isOpenAtLives("review", state, t0)).toBe(true);
    expect(isOpenAtLives("practice", state, t0)).toBe(true);
  });
});

describe("the life refill (D8)", () => {
  const empty = { ...freshState(t0), lives: 0 };

  it("needs 20 gems", () => {
    expect(refillLives({ ...empty, gems: 19 }, t0)).toEqual({ ok: false, reason: "not-enough-gems" });
    const outcome = refillLives({ ...empty, gems: 20 }, t0);
    expect(outcome.ok && outcome.state.lives).toBe(5);
    expect(outcome.ok && outcome.state.gems).toBe(0);
  });

  it("is refused while lives are full", () => {
    expect(refillLives({ ...freshState(t0), gems: 40 }, t0)).toEqual({ ok: false, reason: "lives-full" });
  });
});
