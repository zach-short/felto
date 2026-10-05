import { describe, expect, it } from "vitest";

import { parseCards } from "./card";
import { fullDeck } from "./deck";
import { CATEGORIES, compareHands, evaluate, type HandCategory } from "./evaluate";

const hand = (codes: string) => evaluate(parseCards(codes.split(" ")));
const beats = (a: string, b: string) => compareHands(hand(a), hand(b));

// The known counts over all C(52, 5) = 2,598,960 five-card hands (hazard 4, `PLAN.md` phase 5),
// and the number of distinct hand strengths in each category: 7,462 in all. The second table
// proves the tie-break keeps exactly the ranks that matter, no more and no fewer.
const HANDS: Readonly<Record<HandCategory, number>> = {
  "royal-flush": 4,
  "straight-flush": 36,
  "four-of-a-kind": 624,
  "full-house": 3744,
  flush: 5108,
  straight: 10200,
  "three-of-a-kind": 54912,
  "two-pair": 123552,
  "one-pair": 1098240,
  "high-card": 1302540,
};
const STRENGTHS: Readonly<Record<HandCategory, number>> = {
  "royal-flush": 1,
  "straight-flush": 9,
  "four-of-a-kind": 156,
  "full-house": 156,
  flush: 1277,
  straight: 10,
  "three-of-a-kind": 858,
  "two-pair": 858,
  "one-pair": 2860,
  "high-card": 1277,
};

function enumerateFiveCardHands() {
  const deck = fullDeck();
  const counts = new Map<HandCategory, number>();
  const scores = new Map<HandCategory, Set<number>>(CATEGORIES.map((c) => [c, new Set<number>()]));
  for (let a = 0; a < 48; a += 1)
    for (let b = a + 1; b < 49; b += 1)
      for (let c = b + 1; c < 50; c += 1)
        for (let d = c + 1; d < 51; d += 1)
          for (let e = d + 1; e < 52; e += 1) {
            const value = evaluate([deck[a], deck[b], deck[c], deck[d], deck[e]]);
            counts.set(value.category, (counts.get(value.category) ?? 0) + 1);
            scores.get(value.category)?.add(value.score);
          }
  return { counts, scores };
}

describe("every five-card hand", () => {
  const { counts, scores } = enumerateFiveCardHands();

  it.each(CATEGORIES)("has the known count of %s", (category) => {
    expect(counts.get(category) ?? 0).toBe(HANDS[category]);
  });

  it("adds up to 2,598,960 hands, with 40 straight flushes of which 4 are royal", () => {
    expect([...counts.values()].reduce((sum, n) => sum + n, 0)).toBe(2598960);
    expect((counts.get("straight-flush") ?? 0) + (counts.get("royal-flush") ?? 0)).toBe(40);
  });

  it.each(CATEGORIES)("has the known number of distinct strengths of %s", (category) => {
    expect(scores.get(category)?.size).toBe(STRENGTHS[category]);
  });

  it("has 7,462 distinct strengths, and every category outranks the one below it", () => {
    const ordered = CATEGORIES.map((category) => [...(scores.get(category) ?? [])]);
    expect(ordered.flat().length).toBe(7462);
    for (let i = 1; i < ordered.length; i += 1) {
      expect(Math.min(...ordered[i])).toBeGreaterThan(Math.max(...ordered[i - 1]));
    }
  });
});

describe("straights and the ace", () => {
  it("reads A-2-3-4-5 as a five-high straight, the lowest one", () => {
    expect(hand("As 2d 3c 4h 5s").category).toBe("straight");
    expect(hand("As 2d 3c 4h 5s").ranks).toEqual([5]);
    expect(beats("2s 3d 4c 5h 6s", "As 2d 3c 4h 5s")).toBe(1);
  });

  it("reads T-J-Q-K-A as the highest straight", () => {
    expect(hand("Ts Jd Qc Kh As").ranks).toEqual([14]);
    expect(beats("Ts Jd Qc Kh As", "9s Td Jc Qh Ks")).toBe(1);
  });

  it("never wraps the ace round the corner", () => {
    expect(hand("Qs Kd Ac 2h 3s").category).toBe("high-card");
  });

  it("reads the steel wheel as a five-high straight flush, and ten to ace suited as royal", () => {
    expect(hand("Ah 2h 3h 4h 5h").category).toBe("straight-flush");
    expect(hand("Ah 2h 3h 4h 5h").ranks).toEqual([5]);
    expect(hand("Th Jh Qh Kh Ah").category).toBe("royal-flush");
  });
});

describe("comparison inside a category", () => {
  it("lets a higher flush win on the fifth card alone", () => {
    expect(beats("Ah Jh 9h 6h 3h", "As Js 9s 6s 2s")).toBe(1);
  });

  it("compares two full houses by the trips first", () => {
    expect(beats("Ks Kd Kc 2h 2s", "Qs Qd Qc Ah As")).toBe(1);
    expect(beats("Ks Kd Kc 3h 3s", "Kh Kd Kc 2h 2s")).toBe(1);
  });

  it("compares two pair by the top pair, then the second, then the kicker", () => {
    expect(beats("Ks Kd 2c 2h 3s", "Qs Qd Jc Jh As")).toBe(1);
    expect(beats("Ks Kd 5c 5h 3s", "Kh Kc 4c 4h As")).toBe(1);
    expect(beats("Ks Kd 5c 5h 4s", "Kh Kc 5d 5s 3s")).toBe(1);
  });

  it("compares one pair by its kickers in order", () => {
    expect(beats("8s 8d Ac Th 3s", "8h 8c Ad 9h 7s")).toBe(1);
    expect(beats("8s 8d Ac Th 3s", "8h 8c Ad 9h Ks")).toBe(-1);
    expect(beats("8s 8d Ac Th 3s", "8h 8c Ad Ts 3d")).toBe(0);
  });

  it("splits when the suits differ and the ranks do not", () => {
    expect(beats("Ah Kd 9c 6h 3s", "As Kc 9d 6s 3h")).toBe(0);
  });
});

describe("the best five of six or seven cards", () => {
  it("keeps a straight over a pair", () => {
    expect(hand("5s 5d 6c 7h 8s 9d 2c").category).toBe("straight");
  });

  it("keeps a straight flush over a higher plain straight", () => {
    const value = hand("5h 6h 7h 8h 9h Td 2c");
    expect(value.category).toBe("straight-flush");
    expect(value.ranks).toEqual([9]);
  });

  it("makes a full house from two sets of trips, the higher trips first", () => {
    const value = hand("9s 9d 9c 4h 4s 4d Ac");
    expect(value.category).toBe("full-house");
    expect(value.ranks).toEqual([9, 4]);
  });

  it("plays the best two of three pairs and the best kicker left", () => {
    expect(hand("Ks Kd 7c 7h 3s 3d 2c").ranks).toEqual([13, 7, 3]);
    expect(hand("Ks Kd 7c 7h 3s 3d Qc").ranks).toEqual([13, 7, 12]);
  });

  it("takes the five highest of six suited cards", () => {
    expect(hand("Ah Jh 9h 6h 3h 2h Kc").ranks).toEqual([14, 11, 9, 6, 3]);
  });

  it("plays the highest kicker beside four of a kind", () => {
    expect(hand("7s 7d 7c 7h Ks Qd 2c").ranks).toEqual([7, 13]);
  });

  it("exports no five-card-only scorer, which would misread six or seven cards", async () => {
    expect(Object.keys(await import("./evaluate"))).not.toContain("evaluateFive");
  });

  it("refuses fewer than five cards, more than seven, or a card twice", () => {
    expect(() => hand("As Kd Qc Jh")).toThrow();
    expect(() => hand("As Kd Qc Jh Ts 9s 8s 7s")).toThrow();
    expect(() => hand("As As Qc Jh Ts")).toThrow();
  });
});
