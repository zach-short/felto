import { describe, expect, it } from "vitest";

import { computeKey } from "@/content/compute-key";
import type { CallExercise, EquityExercise, PotOddsExercise } from "@/content/schema";
import { validateExercise } from "@/content/validate";

import { dealOdds } from "./odds";
import { answerShares, shareLimit } from "./second-count";

const SEEDS = 10_000;
const dealt = Array.from({ length: SEEDS }, (_, seed) => dealOdds(seed));
const potOdds = dealt.filter((ex): ex is PotOddsExercise => ex.ask === "pot-odds");
const equity = dealt.filter((ex): ex is EquityExercise => ex.ask === "equity");
const calls = dealt.filter((ex): ex is CallExercise => ex.ask === "call");

// The arithmetic again, from the definitions in unit 4 and not from `cards/odds.ts`: the price is
// the call over the final pot; the exact chance is one less the chance that every card misses.
function price(pot: number, bet: number): number {
  return (100 * bet) / (pot + bet + bet);
}

function exactChance(outs: number, street: string, cards: number): number {
  const unseen = street === "flop" ? 47 : 46;
  let miss = 1;
  for (let i = 0; i < cards; i += 1) miss *= (unseen - i - outs) / (unseen - i);
  return 100 * (1 - miss);
}

describe("dealOdds over 10,000 seeds", { timeout: 60_000 }, () => {
  it("passes the validator and computeKey agrees with the key", () => {
    for (const ex of dealt) {
      expect(validateExercise(ex), ex.id).toEqual([]);
      expect(computeKey(ex), ex.id).toBe(ex.answer);
    }
  });

  it("deals all three asks", () => {
    for (const set of [potOdds, equity, calls]) expect(set.length).toBeGreaterThan(SEEDS / 4);
  });

  it("keys the price within half a point, never on a half, with every wrong option 3 points away", () => {
    for (const ex of potOdds) {
      const exact = price(ex.pot, ex.bet);
      expect(Math.abs(ex.options[ex.answer] - exact), ex.id).toBeLessThan(0.5);
      const wrong = ex.options.filter((_, i) => i !== ex.answer);
      for (const o of wrong) expect(Math.abs(o - exact), ex.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("keys outs times 2 or 4, with no wrong option within 1.5 points of the exact chance", () => {
    for (const ex of equity) {
      expect(ex.options[ex.answer], ex.id).toBe(ex.outs * (ex.cardsToCome === 2 ? 4 : 2));
      const exact = exactChance(ex.outs, ex.street, ex.cardsToCome);
      const wrong = ex.options.filter((_, i) => i !== ex.answer);
      for (const o of wrong) expect(Math.abs(o - exact), ex.id).toBeGreaterThanOrEqual(1.5);
    }
  });

  it("keys a call that the rule and the exact chance both make, each 3 points clear of the price", () => {
    for (const ex of calls) {
      const target = price(ex.pot, ex.bet);
      const rule = ex.outs * (ex.cardsToCome === 2 ? 4 : 2);
      const exact = exactChance(ex.outs, ex.street, ex.cardsToCome);
      const key = ex.options[ex.answer];
      expect(key, ex.id).toBe(rule > target ? "call" : "fold");
      expect(exact > target, ex.id).toBe(rule > target);
      expect(Math.min(Math.abs(rule - target), Math.abs(exact - target)), ex.id).toBeGreaterThanOrEqual(3);
      expect(ex.explanation.endsWith(`so ${key}.`), ex.id).toBe(true);
    }
  });

  it("deals two cards to come only from the flop, and says so in the prompt", () => {
    for (const ex of [...equity, ...calls]) {
      if (ex.cardsToCome === 2) {
        expect(ex.street, ex.id).toBe("flop");
        expect(ex.prompt, ex.id).toMatch(/both the turn and the river|see the turn and the river/);
      }
    }
  });

  it("calls and folds about half each", () => {
    const share = calls.filter((ex) => ex.options[ex.answer] === "call").length / calls.length;
    expect(share).toBeGreaterThan(0.45);
    expect(share).toBeLessThan(0.55);
  });

  it("gives the same deal for the same seed", () => {
    for (const seed of [0, 1, 77, 9_999, 4_294_967_295]) {
      expect(dealOdds(seed)).toEqual(dealOdds(seed));
    }
  });

  it("spreads the key over the option positions, for each ask", () => {
    for (const set of [potOdds, equity, calls]) {
      for (const { count, maxShare } of answerShares(set)) expect(maxShare).toBeLessThanOrEqual(shareLimit(count));
    }
  });
});
