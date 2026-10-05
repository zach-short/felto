import { describe, expect, it } from "vitest";

import { SUITS, type Card } from "./card";
import { fullDeck } from "./deck";
import { CATEGORIES, compareHands, evaluate } from "./evaluate";

// A second evaluator, written apart from `evaluate.ts` and by another method (hazard 4, rule Q3).
// `evaluate` tries every five-card subset; this one reads the five to seven cards in one pass,
// by suit counts and rank counts, the way a player does. It returns the category index of
// `CATEGORIES` followed by the tie-break ranks. Where the two disagree, one of them is wrong.
type Reference = number[];

function straightTop(ranks: ReadonlySet<number>): number {
  for (let top = 14; top >= 5; top -= 1) {
    const run = [top, top - 1, top - 2, top - 3, top - 4].map((r) => (r === 1 ? 14 : r));
    if (run.every((r) => ranks.has(r))) return top;
  }
  return 0;
}

function flushRanks(cards: readonly Card[]): number[] | null {
  for (const suit of SUITS) {
    const ranks = cards.filter((c) => c.suit === suit).map((c) => c.rank).sort((a, b) => b - a);
    if (ranks.length >= 5) return ranks;
  }
  return null;
}

function ranksWithCount(counts: Map<number, number>, n: number): number[] {
  return [...counts].filter(([, c]) => c === n).map(([r]) => r).sort((a, b) => b - a);
}

function highest(cards: readonly Card[], skip: readonly number[], n: number): number[] {
  const left = [...new Set(cards.map((c) => c.rank))].filter((r) => !skip.includes(r));
  return left.sort((a, b) => b - a).slice(0, n);
}

function reference(cards: readonly Card[]): Reference {
  const flush = flushRanks(cards);
  const flushTop = flush ? straightTop(new Set(flush)) : 0;
  if (flushTop) return [flushTop === 14 ? 9 : 8, flushTop];
  const counts = new Map<number, number>();
  for (const c of cards) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  const [quads, trips, pairs] = [4, 3, 2].map((n) => ranksWithCount(counts, n));
  if (quads.length) return [7, quads[0], ...highest(cards, [quads[0]], 1)];
  const fill = Math.max(trips[1] ?? 0, pairs[0] ?? 0);
  if (trips.length && fill) return [6, trips[0], fill];
  if (flush) return [5, ...flush.slice(0, 5)];
  const top = straightTop(new Set(cards.map((c) => c.rank)));
  if (top) return [4, top];
  if (trips.length) return [3, trips[0], ...highest(cards, [trips[0]], 2)];
  if (pairs.length >= 2) return [2, pairs[0], pairs[1], ...highest(cards, pairs.slice(0, 2), 1)];
  if (pairs.length) return [1, pairs[0], ...highest(cards, [pairs[0]], 3)];
  return [0, ...highest(cards, [], 5)];
}

function lexCompare(a: Reference, b: Reference): number {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return Math.sign((a[i] ?? 0) - (b[i] ?? 0));
  }
  return 0;
}

function asReference(cards: readonly Card[]): Reference {
  const value = evaluate(cards);
  return [CATEGORIES.indexOf(value.category), ...value.ranks];
}

// mulberry32: a small seeded generator, so a failing deal can be replayed from its seed.
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deal(pool: readonly Card[], n: number, random: () => number): Card[] {
  const cards = [...pool];
  for (let i = 0; i < n; i += 1) {
    const j = i + Math.floor(random() * (cards.length - i));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.slice(0, n);
}

// The full five-card pass takes about 4.4 seconds alone (2026-10-05), near vitest's 5-second
// default; a gate that runs other suites beside it must not fail it on time alone.
const SLOW_TEST_MS = 60_000;

// Pools that make the rare hands common: two suits give flushes and straight flushes, eight
// ranks give full houses and quads, and A to 6 or 9 to A give wheels, straights and royals.
const DECK = fullDeck();
const POOLS: readonly (readonly Card[])[] = [
  DECK,
  DECK.filter((c) => c.suit === "h" || c.suit === "s"),
  DECK.filter((c) => c.rank <= 6 || c.rank === 14),
  DECK.filter((c) => c.rank >= 9),
  DECK.filter((c) => c.rank % 2 === 0 || c.rank === 5),
];

describe("the evaluator against a second, independent evaluator", () => {
  it("agrees on every five-card hand, category and tie-break", () => {
    let disagreements = 0;
    for (let a = 0; a < 48; a += 1)
      for (let b = a + 1; b < 49; b += 1)
        for (let c = b + 1; c < 50; c += 1)
          for (let d = c + 1; d < 51; d += 1)
            for (let e = d + 1; e < 52; e += 1) {
              const cards = [DECK[a], DECK[b], DECK[c], DECK[d], DECK[e]];
              if (lexCompare(asReference(cards), reference(cards)) !== 0) disagreements += 1;
            }
    expect(disagreements).toBe(0);
  }, SLOW_TEST_MS);

  it.each([6, 7])("agrees on 100,000 seeded deals of %i cards, and on who wins each pair", (n) => {
    const random = seeded(20261005 + n);
    const wrong: string[] = [];
    let previous = { value: evaluate(DECK.slice(0, n)), want: reference(DECK.slice(0, n)) };
    for (let i = 0; i < 100000; i += 1) {
      const cards = deal(POOLS[i % POOLS.length], n, random);
      const value = evaluate(cards);
      const want = reference(cards);
      const same = lexCompare([CATEGORIES.indexOf(value.category), ...value.ranks], want) === 0;
      const order = compareHands(value, previous.value) === lexCompare(want, previous.want);
      if (!same || !order) wrong.push(cards.map((c) => `${c.rank}${c.suit}`).join(" "));
      previous = { value, want };
    }
    expect(wrong.slice(0, 5)).toEqual([]);
  }, SLOW_TEST_MS);
});
