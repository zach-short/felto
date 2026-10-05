import { describe, expect, it } from "vitest";

import { computeKey } from "@/content/compute-key";
import type { ShowdownExercise } from "@/content/schema";
import { validateExercise } from "@/content/validate";

import { answerShares, bestTuple, bruteWinners, compareTuples, parse, shareLimit } from "./second-count";
import { dealShowdown } from "./showdown";

const SEEDS = 10_000;
const dealt = Array.from({ length: SEEDS }, (_, seed) => dealShowdown(seed));

function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((n) => b.includes(n));
}

// Reading the explanation back, so its words can be checked against the second count.
const RANK_WORDS = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king", "ace"];
const PLURALS = RANK_WORDS.map((w) => (w === "six" ? "sixes" : `${w}s`));
const PHRASES = ["high card", "one pair", "two pair", "three of a kind", "a straight", "a flush", "a full house",
  "four of a kind", "a straight flush", "a royal flush"];
// How many ranks a hand phrase names after its category, by category index.
const LEAD = [1, 1, 2, 1, 1, 1, 2, 1, 1, 0];

function rankOfWord(word: string): number {
  const i = Math.max(RANK_WORDS.indexOf(word), PLURALS.indexOf(word));
  return i >= 0 ? i + 2 : -1;
}

function rankWordsIn(text: string): number[] {
  return [...text.matchAll(/[a-z]+/g)].map((m) => rankOfWord(m[0])).filter((r) => r > 0);
}

function phraseTuple(phrase: string): number[] {
  const lower = phrase.toLowerCase();
  const fits = PHRASES.map((p, i) => [p, i] as const).filter(([p]) => lower.startsWith(p));
  const [prefix, category] = fits.sort((a, b) => b[0].length - a[0].length)[0] ?? ["", -1];
  return [category, ...rankWordsIn(lower.slice(prefix.length))];
}

function tuplesOf(ex: ShowdownExercise): number[][] {
  return ex.players.map((hole) => bestTuple([...hole, ...ex.board].map(parse)));
}

type VerdictKind = "category" | "made" | "kickers" | "fromTop";

// Which verdict the second count calls for, checked against the sentence the dealer wrote.
function verdictKind(text: string, w: number, l: number, tw: number[], tl: number[], id: string): VerdictKind {
  const i = tw.findIndex((n, k) => n !== tl[k]);
  if (i === 0) {
    const m = /(?:^|\. )([A-Z][a-z ]+) beats ([a-z ]+)\.$/.exec(text);
    expect([PHRASES.indexOf(m?.[1].toLowerCase() ?? ""), PHRASES.indexOf(m?.[2] ?? "")], id).toEqual([tw[0], tl[0]]);
    return "category";
  }
  if (i <= LEAD[tw[0]]) {
    const m = /Player (\d)'s (.+?) beats? player (\d)'s (.+)\.$/.exec(text);
    expect([Number(m?.[1]) - 1, Number(m?.[3]) - 1], `${id} ${text}`).toEqual([w, l]);
    // "three kings" and "four nines" count cards before the rank; the count is not a rank.
    const made = (words: string) => rankWordsIn(words.replace(/^(three|four) /, ""));
    expect(made(m?.[2] ?? ""), id).toEqual(tw.slice(1, 1 + LEAD[tw[0]]));
    expect(made(m?.[4] ?? ""), id).toEqual(tl.slice(1, 1 + LEAD[tl[0]]));
    return "made";
  }
  const kickers = [1, 2, 3, 7].includes(tw[0]);
  const m = /both have [^.]+?(, so the kickers decide it|\. Compare the cards from the top): an? (\w+) beats an? (\w+)\.$/.exec(text);
  expect(m?.[1], `${id} ${text}`).toBe(kickers ? ", so the kickers decide it" : ". Compare the cards from the top");
  expect([rankOfWord(m?.[2] ?? ""), rankOfWord(m?.[3] ?? "")], id).toEqual([tw[i], tl[i]]);
  return kickers ? "kickers" : "fromTop";
}

describe("dealShowdown over 10,000 seeds", { timeout: 60_000 }, () => {
  it("passes the validator and computeKey agrees with the key", () => {
    for (const ex of dealt) {
      expect(validateExercise(ex), ex.id).toEqual([]);
      expect(computeKey(ex), ex.id).toBe(ex.answer);
    }
  });

  it("keys the winners that all 21 five-card choices of each player give", () => {
    for (const ex of dealt) {
      const winners = bruteWinners(ex.board, ex.players);
      expect(sameSet(ex.options[ex.answer], winners), `${ex.id} ${JSON.stringify(ex)}`).toBe(true);
    }
  });

  it("offers every single winner, and no option twice as a set", () => {
    for (const ex of dealt) {
      for (let p = 0; p < ex.players.length; p += 1) {
        expect(ex.options.some((o) => sameSet(o, [p])), ex.id).toBe(true);
      }
      const keys = ex.options.map((o) => [...o].sort().join());
      expect(new Set(keys).size, ex.id).toBe(ex.options.length);
    }
  });

  it("deals splits, two players and three players", () => {
    const splits = dealt.filter((ex) => ex.options[ex.answer].length > 1).length;
    expect(splits / SEEDS).toBeGreaterThan(0.15);
    expect(dealt.some((ex) => ex.players.length === 2)).toBe(true);
    expect(dealt.some((ex) => ex.players.length === 3)).toBe(true);
  });

  it("explains a split as a split and a win as a win", () => {
    for (const ex of dealt) {
      const split = ex.options[ex.answer].length > 1;
      expect(ex.explanation.includes("split the pot"), ex.id).toBe(split);
    }
  });

  it("names each player's hand as the second count finds it", () => {
    for (const ex of dealt) {
      const tuples = tuplesOf(ex);
      for (const [, seat, phrase] of ex.explanation.matchAll(/Player (\d): ([^.]+)\./g)) {
        const t = tuples[Number(seat) - 1];
        expect(phraseTuple(phrase), `${ex.id} ${phrase}`).toEqual(t.slice(0, 1 + LEAD[t[0]]));
      }
      const split = /each have ([^.]+), with the same five ranks/.exec(ex.explanation);
      for (const w of split ? ex.options[ex.answer] : []) {
        expect(phraseTuple(split?.[1] ?? ""), ex.id).toEqual(tuples[w].slice(0, 1 + LEAD[tuples[w][0]]));
      }
    }
  });

  it("gives the verdict the second count supports: category, made hand, or the first card that differs", () => {
    const seen = { category: 0, made: 0, kickers: 0, fromTop: 0 };
    for (const ex of dealt) {
      const tuples = tuplesOf(ex);
      const winners = ex.options[ex.answer];
      const losers = tuples.map((_, i) => i).filter((i) => !winners.includes(i));
      if (losers.length === 0) continue;
      const [w, l] = [winners[0], losers.sort((a, b) => compareTuples(tuples[b], tuples[a]))[0]];
      seen[verdictKind(ex.explanation, w, l, tuples[w], tuples[l], ex.id)] += 1;
    }
    for (const count of Object.values(seen)) expect(count).toBeGreaterThan(50);
  });

  it("gives the same deal for the same seed", () => {
    for (const seed of [0, 1, 77, 9_999, 4_294_967_295]) {
      expect(dealShowdown(seed)).toEqual(dealShowdown(seed));
    }
  });

  it("spreads the key over the option positions", () => {
    for (const { count, maxShare } of answerShares(dealt)) expect(maxShare).toBeLessThanOrEqual(shareLimit(count));
  });
});
