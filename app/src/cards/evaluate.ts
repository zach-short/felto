import { hasDuplicate, type Card, type RankValue } from "./card";

// The ten categories of `DESIGN.md` D7, lowest first, so a category's index is its strength.
// A royal flush is the ace-high straight flush; it is named apart because unit 1 teaches it apart.
export type HandCategory =
  | "high-card"
  | "one-pair"
  | "two-pair"
  | "three-of-a-kind"
  | "straight"
  | "flush"
  | "full-house"
  | "four-of-a-kind"
  | "straight-flush"
  | "royal-flush";

export const CATEGORIES: readonly HandCategory[] = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind", "straight",
  "flush", "full-house", "four-of-a-kind", "straight-flush", "royal-flush",
];

export interface HandValue {
  readonly category: HandCategory;
  // The ranks that break a tie inside the category, most important first: the group ranks for
  // pairs, trips, quads and full houses (trips before the pair), all five for a flush or high
  // card, and only the top card for a straight (5 for the wheel).
  readonly ranks: readonly RankValue[];
  // One number that orders every hand: a higher score wins, an equal score splits.
  readonly score: number;
  readonly cards: readonly Card[];
}

interface RankGroup {
  readonly rank: RankValue;
  readonly count: number;
}

export function categoryRank(category: HandCategory): number {
  return CATEGORIES.indexOf(category);
}

// Base 15 holds every rank (2 to 14) in one digit, so the category digit outranks every
// tie-break digit and two scores compare as the hands do.
function scoreOf(category: HandCategory, ranks: readonly RankValue[]): number {
  let score = categoryRank(category);
  for (let i = 0; i < 5; i += 1) score = score * 15 + (ranks[i] ?? 0);
  return score;
}

function rankGroups(cards: readonly Card[]): RankGroup[] {
  const counts = new Map<RankValue, number>();
  for (const card of cards) counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  return [...counts]
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
}

// The top card of a five-card straight, or 0. The ace plays low only in the wheel, A-2-3-4-5,
// whose top card is the 5.
function straightHigh(groups: readonly RankGroup[]): RankValue | 0 {
  if (groups.length !== 5) return 0;
  const top = groups[0].rank;
  if (top - groups[4].rank === 4) return top;
  const isWheel = top === 14 && groups[1].rank === 5 && groups[4].rank === 2;
  return isWheel ? 5 : 0;
}

function classify(groups: readonly RankGroup[], flush: boolean, high: RankValue | 0): HandCategory {
  if (flush && high) return high === 14 ? "royal-flush" : "straight-flush";
  if (groups[0].count === 4) return "four-of-a-kind";
  if (groups[0].count === 3 && groups[1].count === 2) return "full-house";
  if (flush) return "flush";
  if (high) return "straight";
  if (groups[0].count === 3) return "three-of-a-kind";
  if (groups[0].count === 2 && groups[1].count === 2) return "two-pair";
  if (groups[0].count === 2) return "one-pair";
  return "high-card";
}

function evaluateFive(cards: readonly Card[]): HandValue {
  const groups = rankGroups(cards);
  const flush = cards.every((card) => card.suit === cards[0].suit);
  const high = straightHigh(groups);
  const category = classify(groups, flush, high);
  const ranks: RankValue[] = high ? [high] : groups.map((group) => group.rank);
  return { category, ranks, score: scoreOf(category, ranks), cards };
}

function fiveCardSubsets(cards: readonly Card[]): Card[][] {
  const subsets: Card[][] = [];
  const pick = (start: number, chosen: Card[]): void => {
    if (chosen.length === 5) {
      subsets.push(chosen);
      return;
    }
    for (let i = start; i <= cards.length - (5 - chosen.length); i += 1) {
      pick(i + 1, [...chosen, cards[i]]);
    }
  };
  pick(0, []);
  return subsets;
}

// The best five of five to seven cards. It tries every five-card subset (at most 21) and keeps
// the highest score, so no shortcut can keep a pair over a better straight (`PLAN.md` phase 5).
export function evaluate(cards: readonly Card[]): HandValue {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error(`a hand is five to seven cards, not ${cards.length}`);
  }
  if (hasDuplicate(cards)) throw new Error("a hand holds the same card twice");
  return fiveCardSubsets(cards)
    .map(evaluateFive)
    .reduce((best, value) => (value.score > best.score ? value : best));
}

// Negative when a loses, 0 for a split, positive when a wins.
export function compareHands(a: HandValue, b: HandValue): number {
  return Math.sign(a.score - b.score);
}
