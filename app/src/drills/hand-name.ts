import { SUITS, type Card, type RankValue } from "@/cards/card";
import { CATEGORIES, categoryRank, evaluate, type HandCategory, type HandValue } from "@/cards/evaluate";
import type { HandNameExercise } from "@/content/schema";

import { checked, dealtId } from "./checked";
import { codes, drawCards } from "./draw";
import { placeKey } from "./options";
import {
  firstAccepted,
  pickOne,
  pickSome,
  pickWeighted,
  randomFrom,
  randomInt,
  shuffleWith,
  type Random,
} from "./random";
import { capitalized, categoryPhrase, handPhrase, rankWord } from "./words";

// A dealt `hand-name` exercise (`DESIGN.md` D21). A plain deal is a pair or worse four times in
// five, so the dealer picks the category first, by these weights, builds its core, fills the
// rest at random, and keeps the deal only when the evaluator names that category. The rare
// hands are weighted down a little so they stay a treat (judgment call, phase 14).
const WEIGHTS: readonly (readonly [HandCategory, number])[] = [
  ["high-card", 1],
  ["one-pair", 1],
  ["two-pair", 1],
  ["three-of-a-kind", 1],
  ["straight", 1],
  ["flush", 1],
  ["full-house", 1],
  ["four-of-a-kind", 0.75],
  ["straight-flush", 0.5],
  ["royal-flush", 0.25],
];

const RANKS: readonly RankValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

// The five ranks of the straight whose top card is `top`; a top of 5 is the wheel, A-2-3-4-5.
function straightRanks(top: RankValue): RankValue[] {
  return top === 5 ? [14, 2, 3, 4, 5] : RANKS.slice(top - 6, top - 1);
}

function ofRank(random: Random, rank: RankValue, count: number): Card[] {
  return pickSome(random, SUITS, count).map((suit) => ({ rank, suit }));
}

function oneSuit(random: Random, ranks: readonly RankValue[]): Card[] {
  const suit = pickOne(random, SUITS);
  return ranks.map((rank) => ({ rank, suit }));
}

const CORES: Readonly<Record<HandCategory, (random: Random) => Card[]>> = {
  "high-card": () => [],
  "one-pair": (r) => ofRank(r, pickOne(r, RANKS), 2),
  "two-pair": (r) => pickSome(r, RANKS, 2).flatMap((rank) => ofRank(r, rank, 2)),
  "three-of-a-kind": (r) => ofRank(r, pickOne(r, RANKS), 3),
  straight: (r) => straightRanks(pickOne(r, RANKS.slice(3))).map((rank) => ({ rank, suit: pickOne(r, SUITS) })),
  flush: (r) => oneSuit(r, pickSome(r, RANKS, 5)),
  "full-house": (r) => {
    const [three, two] = pickSome(r, RANKS, 2);
    return [...ofRank(r, three, 3), ...ofRank(r, two, 2)];
  },
  "four-of-a-kind": (r) => ofRank(r, pickOne(r, RANKS), 4),
  "straight-flush": (r) => oneSuit(r, straightRanks(pickOne(r, RANKS.slice(3, 12)))),
  "royal-flush": (r) => oneSuit(r, straightRanks(14)),
};

function dealOf(random: Random, category: HandCategory, count: number): Card[] | null {
  const core = CORES[category](random);
  const cards = shuffleWith(random, [...core, ...drawCards(random, core, count - core.length)]);
  return evaluate(cards).category === category ? cards : null;
}

// Wrong answers near the key in strength. A royal flush is also a straight flush, so that pair
// is never offered together: it would be a second defensible answer.
function distractors(random: Random, key: HandCategory, count: number): HandCategory[] {
  const pool = CATEGORIES.filter(
    (c) =>
      c !== key &&
      Math.abs(categoryRank(c) - categoryRank(key)) <= 4 &&
      !(key === "royal-flush" && c === "straight-flush"),
  );
  return pickSome(random, pool, count);
}

function fiveCardChoices(cards: readonly Card[]): Card[][] {
  if (cards.length === 5) return [[...cards]];
  return cards.flatMap((_, drop) => fiveCardChoices(cards.filter((__, i) => i !== drop)));
}

// The strongest wrong option that some five of the cards also make, if any: a seven-card hand
// with a flush and a straight in it gets "A flush beats a straight."
function beatenOption(cards: readonly Card[], key: HandCategory, options: readonly HandCategory[]) {
  const made = new Set(fiveCardChoices(cards).map((five) => evaluate(five).category));
  return [...options]
    .filter((o) => categoryRank(o) < categoryRank(key) && made.has(o))
    .sort((a, b) => categoryRank(b) - categoryRank(a))[0];
}

function firstSentence(value: HandValue, count: number): string {
  if (value.category === "high-card") {
    return `No pair, no straight and no flush, so this is high card, ${rankWord(value.ranks[0])} high.`;
  }
  return `${count === 5 ? "These cards make" : "Your best five cards make"} ${handPhrase(value)}.`;
}

function explanation(cards: readonly Card[], value: HandValue, options: readonly HandCategory[]): string {
  const beaten = beatenOption(cards, value.category, options);
  const second = beaten ? ` ${capitalized(categoryPhrase(value.category))} beats ${categoryPhrase(beaten)}.` : "";
  return `${firstSentence(value, cards.length)}${second}`;
}

const PROMPTS: Readonly<Record<5 | 7, string>> = {
  5: "What hand do these five cards make?",
  7: "Two hole cards and five on the board. What is the best hand you can make?",
};

// Seven cards are two hole cards and then the board, as the lesson screen draws them (the last
// five are the board, ledger step 17).
export function dealHandName(seed: number): HandNameExercise {
  const random = randomFrom(seed);
  const category = pickWeighted(random, WEIGHTS);
  const count = pickOne(random, [5, 7] as const);
  const cards = firstAccepted("hand-name deal", () => dealOf(random, category, count));
  const value = evaluate(cards);
  const { options, answer } = placeKey(random, category, distractors(random, category, randomInt(random, 2, 3)));
  return checked({
    id: dealtId("hand-name", seed),
    kind: "hand-name",
    prompt: PROMPTS[count],
    cards: codes(cards),
    options,
    answer,
    explanation: explanation(cards, value, options),
  });
}
