import { describe, expect, it } from "vitest";

import { computeKey } from "@/content/compute-key";
import { validateExercise } from "@/content/validate";

import { dealOuts } from "./outs";
import { CATEGORY_ORDER, answerShares, bruteOuts, categoryIndex, parse, shareLimit } from "./second-count";

const SEEDS = 10_000;
const dealt = Array.from({ length: SEEDS }, (_, seed) => dealOuts(seed));

function counts(values: readonly (string | number)[]): number[] {
  const tally = new Map<string | number, number>();
  for (const v of values) tally.set(v, (tally.get(v) ?? 0) + 1);
  return [...tally.values()];
}

// The target's own shape in the cards, checked without the evaluator: five of a suit, five
// ranks in a row (the ace also low), or three of a rank.
function holdsShape(codes: readonly string[], target: string): boolean {
  const cards = codes.map(parse);
  if (target === "flush") return Math.max(...counts(cards.map((c) => c.suit))) >= 5;
  if (target === "three-of-a-kind") return Math.max(...counts(cards.map((c) => c.rank))) >= 3;
  const ranks = new Set(cards.flatMap((c) => (c.rank === 14 ? [14, 1] : [c.rank])));
  return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14].some((top) => [0, 1, 2, 3, 4].every((d) => ranks.has(top - d)));
}

describe("dealOuts over 10,000 seeds", { timeout: 60_000 }, () => {
  it("passes the validator and computeKey agrees with the key", () => {
    for (const ex of dealt) {
      expect(validateExercise(ex), ex.id).toEqual([]);
      expect(computeKey(ex), ex.id).toBe(ex.answer);
    }
  });

  it("keys the count of every card left in the deck that makes the target, by a second count", () => {
    for (const ex of dealt) {
      const outs = bruteOuts(ex.hole, ex.board, CATEGORY_ORDER.indexOf(ex.target));
      expect(ex.options[ex.answer], `${ex.id} ${ex.hole} | ${ex.board}`).toBe(outs.length);
    }
  });

  it("deals only spots with one reading", () => {
    for (const ex of dealt) {
      const target = CATEGORY_ORDER.indexOf(ex.target);
      const known = [...ex.hole, ...ex.board];
      expect(["flush", "straight", "three-of-a-kind"], ex.id).toContain(ex.target);
      expect(ex.prompt, ex.id).toContain("with one card to come");
      expect(Math.max(...counts(ex.board.map((c) => c[0]))), `${ex.id} paired board`).toBe(1);
      expect(Math.max(...counts(ex.board.map((c) => c[1]))), `${ex.id} three of a suit on the board`).toBeLessThanOrEqual(2);
      expect(categoryIndex(known.map(parse)), `${ex.id} target already made`).toBeLessThan(target);
      for (const out of bruteOuts(ex.hole, ex.board, target)) {
        expect(holdsShape([...known, out], ex.target), `${ex.id} ${out} is counted for another hand`).toBe(true);
        if (ex.board.length === 4) {
          expect(categoryIndex([...ex.board, out].map(parse)), `${ex.id} ${out} plays from the board`).toBeLessThan(target);
        }
      }
    }
  });

  it("ends the explanation with the keyed count", () => {
    for (const ex of dealt) {
      const n = ex.options[ex.answer];
      expect(ex.explanation.endsWith(`: ${n} outs.`), ex.id).toBe(true);
    }
  });

  it("names in the explanation exactly the ranks or the suit of the outs", () => {
    const rankWords = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king", "ace"];
    const suitWords = { s: "spades", h: "hearts", d: "diamonds", c: "clubs" } as const;
    for (const ex of dealt) {
      const outs = bruteOuts(ex.hole, ex.board, CATEGORY_ORDER.indexOf(ex.target));
      const text = ex.explanation.replace(/three of a kind/g, "");
      if (ex.target === "flush") {
        const suit = outs[0][1] as keyof typeof suitWords;
        const [inHand, onBoard] = [ex.hole, ex.board].map((cs) => cs.filter((c) => c[1] === suit).length);
        expect(text, ex.id).toContain(`You have ${inHand + onBoard} ${suitWords[suit]}: ${inHand} in your hand and ${onBoard} on the board.`);
        expect(outs.every((o) => o[1] === suit), ex.id).toBe(true);
        continue;
      }
      const named = rankWords.filter((w) => new RegExp(`\\b(an? ${w}|${w}e?s)\\b`, "i").test(text));
      const expected = [...new Set(outs.map((o) => rankWords["23456789TJQKA".indexOf(o[0])]))];
      expect(named.sort(), ex.id).toEqual(expected.sort());
    }
  });

  it("deals every target, on the flop and the turn", () => {
    expect(new Set(dealt.map((ex) => ex.target)).size).toBe(3);
    expect(new Set(dealt.map((ex) => ex.board.length))).toEqual(new Set([3, 4]));
  });

  it("gives the same deal for the same seed", () => {
    for (const seed of [0, 1, 77, 9_999, 4_294_967_295]) {
      expect(dealOuts(seed)).toEqual(dealOuts(seed));
    }
  });

  it("spreads the key over the option positions", () => {
    for (const { count, maxShare } of answerShares(dealt)) expect(maxShare).toBeLessThanOrEqual(shareLimit(count));
  });
});
