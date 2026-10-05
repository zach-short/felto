import { describe, expect, it } from "vitest";

import { computeKey } from "@/content/compute-key";
import { validateExercise } from "@/content/validate";

import { dealHandName } from "./hand-name";
import { CATEGORY_ORDER, answerShares, categoryIndex, chooseFive, parse, shareLimit } from "./second-count";

const SEEDS = 10_000;
const dealt = Array.from({ length: SEEDS }, (_, seed) => dealHandName(seed));

describe("dealHandName over 10,000 seeds", { timeout: 60_000 }, () => {
  it("passes the validator and computeKey agrees with the key", () => {
    for (const ex of dealt) {
      expect(validateExercise(ex), ex.id).toEqual([]);
      expect(computeKey(ex), ex.id).toBe(ex.answer);
    }
  });

  it("keys the category a second evaluator finds, by bit masks", () => {
    for (const ex of dealt) {
      const found = CATEGORY_ORDER[categoryIndex(ex.cards.map(parse))];
      expect(ex.options[ex.answer], `${ex.id} ${ex.cards.join(" ")}`).toBe(found);
    }
  });

  it("says 'X beats Y' only when Y is weaker and some five of the cards make it", () => {
    const phrases = ["high card", "one pair", "two pair", "three of a kind", "a straight", "a flush",
      "a full house", "four of a kind", "a straight flush", "a royal flush"];
    for (const ex of dealt) {
      const match = /\. ([A-Z][a-z ]+) beats ([a-z ]+)\.$/.exec(ex.explanation);
      if (!match) continue;
      const [winner, loser] = [phrases.indexOf(match[1].toLowerCase()), phrases.indexOf(match[2])];
      expect(CATEGORY_ORDER[winner], ex.id).toBe(ex.options[ex.answer]);
      expect(loser, ex.id).toBeLessThan(winner);
      expect(chooseFive(ex.cards.map(parse)).some((five) => categoryIndex(five) === loser), ex.id).toBe(true);
    }
  });

  it("deals five or seven cards and never offers a straight flush beside a royal flush key", () => {
    for (const ex of dealt) {
      expect([5, 7]).toContain(ex.cards.length);
      if (ex.options[ex.answer] === "royal-flush") expect(ex.options).not.toContain("straight-flush");
    }
  });

  it("deals every category", () => {
    const keys = new Set(dealt.map((ex) => ex.options[ex.answer]));
    expect([...keys].sort()).toEqual([...CATEGORY_ORDER].sort());
  });

  it("gives the same deal for the same seed", () => {
    for (const seed of [0, 1, 77, 9_999, 4_294_967_295]) {
      expect(dealHandName(seed)).toEqual(dealHandName(seed));
    }
  });

  it("spreads the key over the option positions", () => {
    for (const { count, maxShare } of answerShares(dealt)) expect(maxShare).toBeLessThanOrEqual(shareLimit(count));
  });

  it("names the keyed hand in the explanation", () => {
    for (const ex of dealt) {
      const word = ex.options[ex.answer].replace(/-/g, " ").replace("one pair", "pair");
      expect(ex.explanation.toLowerCase(), ex.id).toContain(word);
    }
  });
});
