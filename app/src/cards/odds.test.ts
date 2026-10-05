import { describe, expect, it } from "vitest";

import {
  exactEquity,
  potOddsRatio,
  requiredEquity,
  requiredPercent,
  ruleOfTwoAndFour,
  toPercent,
} from "./odds";

describe("pot odds", () => {
  it("needs 25% to call a half-pot bet, and the pot lays 3 to 1", () => {
    expect(requiredEquity(100, 50)).toBe(0.25);
    expect(requiredPercent(100, 50)).toBe(25);
    expect(potOddsRatio(100, 50)).toEqual({ win: 150, risk: 50 });
  });

  it("needs 33% to call a pot-sized bet, and 20% to call a third of the pot", () => {
    expect(requiredPercent(100, 100)).toBe(33);
    expect(requiredPercent(90, 30)).toBe(20);
  });

  it("gives the same price as a ratio and as a percentage", () => {
    for (const [pot, bet] of [[100, 50], [60, 20], [80, 80], [45, 15], [200, 150]]) {
      const { win, risk } = potOddsRatio(pot, bet);
      expect(requiredEquity(pot, bet)).toBeCloseTo(risk / (win + risk), 12);
    }
  });

  it("refuses a pot or a bet of zero or less", () => {
    expect(() => requiredEquity(0, 10)).toThrow();
    expect(() => requiredPercent(100, -5)).toThrow();
  });
});

describe("the rule of 2 and 4", () => {
  it("gives 36% for 9 outs with two cards to come and 18% with one", () => {
    expect(ruleOfTwoAndFour(9, 2)).toBe(36);
    expect(ruleOfTwoAndFour(9, 1)).toBe(18);
  });

  it("stays within 3 points of the exact chance for 1 to 9 outs", () => {
    for (let outs = 1; outs <= 9; outs += 1) {
      expect(Math.abs(ruleOfTwoAndFour(outs, 2) - 100 * exactEquity(outs, "flop", 2))).toBeLessThan(3);
      expect(Math.abs(ruleOfTwoAndFour(outs, 1) - 100 * exactEquity(outs, "turn", 1))).toBeLessThan(3);
    }
  });
});

describe("exact equity", () => {
  it("gives 35% for 9 outs with two cards to come, 19.1% with one from the flop and 19.6% from the turn", () => {
    expect(toPercent(exactEquity(9, "flop", 2))).toBe(35);
    expect(exactEquity(9, "flop", 1)).toBeCloseTo(9 / 47, 12);
    expect(exactEquity(9, "turn", 1)).toBeCloseTo(9 / 46, 12);
  });

  it("matches a count of every two-card runout for 8 outs", () => {
    let hits = 0;
    let runouts = 0;
    for (let a = 0; a < 47; a += 1)
      for (let b = a + 1; b < 47; b += 1) {
        runouts += 1;
        if (a < 8 || b < 8) hits += 1;
      }
    expect(exactEquity(8, "flop", 2)).toBeCloseTo(hits / runouts, 12);
  });

  it("refuses two cards to come from the turn", () => {
    expect(() => exactEquity(9, "turn", 2)).toThrow();
  });
});
