import { describe, expect, it } from "vitest";

import { OPENING_CHART } from "@/content/catalog";
import { computeKey } from "@/content/compute-key";
import { validateExercise } from "@/content/validate";

import { dealPreflop } from "./preflop";
import { answerShares, parse, shareLimit } from "./second-count";

const SEEDS = 10_000;
const dealt = Array.from({ length: SEEDS }, (_, seed) => dealPreflop(seed));
const RANKS = "23456789TJQKA";

// The 169-hand name written again from the two codes, without `cards/hand-class.ts`.
function className([a, b]: readonly [string, string]): string {
  const [x, y] = [parse(a), parse(b)];
  const [high, low] = x.rank >= y.rank ? [x, y] : [y, x];
  const ranks = `${RANKS[high.rank - 2]}${RANKS[low.rank - 2]}`;
  if (high.rank === low.rank) return ranks;
  return `${ranks}${high.suit === low.suit ? "s" : "o"}`;
}

describe("dealPreflop over 10,000 seeds", { timeout: 60_000 }, () => {
  it("passes the validator and computeKey agrees with the key", () => {
    for (const ex of dealt) {
      expect(validateExercise(ex), ex.id).toEqual([]);
      expect(computeKey(ex, { chart: OPENING_CHART }), ex.id).toBe(ex.answer);
    }
  });

  it("keys raise exactly when the chart lists the hand for the seat", () => {
    for (const ex of dealt) {
      const listed = (OPENING_CHART[ex.seat] as readonly string[]).includes(className(ex.hole));
      expect(ex.options[ex.answer], ex.id).toBe(listed ? "raise" : "fold");
    }
  });

  it("names the hand and says the key in the explanation", () => {
    for (const ex of dealt) {
      expect(ex.explanation.startsWith(`${className(ex.hole)} is `), ex.id).toBe(true);
      expect(ex.explanation, ex.id).toContain(`so ${ex.options[ex.answer]}.`);
    }
  });

  it("names, after a fold, exactly the seats the chart opens the hand from", () => {
    const places = { UTG: "UTG", HJ: "the hijack", CO: "the cutoff", BTN: "the button", SB: "the small blind" };
    for (const ex of dealt.filter((e) => e.options[e.answer] === "fold")) {
      const name = className(ex.hole);
      const opens = (Object.keys(places) as (keyof typeof places)[]).filter((seat) =>
        (OPENING_CHART[seat] as readonly string[]).includes(name),
      );
      const said = opens.length === 0 ? "No seat on the chart opens it." : "The chart opens it from";
      expect(ex.explanation, ex.id).toContain(said);
      for (const seat of Object.keys(places) as (keyof typeof places)[]) {
        const named = new RegExp(`(from|,|and) ${places[seat]}[ ,.]`).test(ex.explanation);
        expect(named, `${ex.id} ${seat}`).toBe(opens.includes(seat));
      }
    }
  });

  it("deals every seat, and raises and folds about half each", () => {
    expect(new Set(dealt.map((ex) => ex.seat)).size).toBe(5);
    const raises = dealt.filter((ex) => ex.options[ex.answer] === "raise").length / SEEDS;
    expect(raises).toBeGreaterThan(0.45);
    expect(raises).toBeLessThan(0.55);
  });

  it("gives the same deal for the same seed", () => {
    for (const seed of [0, 1, 77, 9_999, 4_294_967_295]) {
      expect(dealPreflop(seed)).toEqual(dealPreflop(seed));
    }
  });

  it("spreads the key over the option positions", () => {
    for (const { count, maxShare } of answerShares(dealt)) expect(maxShare).toBeLessThanOrEqual(shareLimit(count));
  });
});
