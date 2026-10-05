import type { RankValue, Suit } from "@/cards/card";
import { categoryName, describeHand } from "@/cards/describe";
import type { HandCategory, HandValue } from "@/cards/evaluate";
import type { OpenSeat } from "@/content/schema";

// The words the explanation templates are built from (`DESIGN.md` D21: explanations come from
// templates, in D10's warm register). `cards/describe.ts` keeps its rank names private, so the
// few this folder needs are written again here, with the article each one takes.

const CATEGORY_PHRASES: Readonly<Record<HandCategory, string>> = {
  "royal-flush": "a royal flush",
  "straight-flush": "a straight flush",
  "four-of-a-kind": "four of a kind",
  "full-house": "a full house",
  flush: "a flush",
  straight: "a straight",
  "three-of-a-kind": "three of a kind",
  "two-pair": "two pair",
  "one-pair": "one pair",
  "high-card": "high card",
};

const RANK_WORDS: Readonly<Record<RankValue, readonly [string, string, string]>> = {
  2: ["a", "two", "twos"],
  3: ["a", "three", "threes"],
  4: ["a", "four", "fours"],
  5: ["a", "five", "fives"],
  6: ["a", "six", "sixes"],
  7: ["a", "seven", "sevens"],
  8: ["an", "eight", "eights"],
  9: ["a", "nine", "nines"],
  10: ["a", "ten", "tens"],
  11: ["a", "jack", "jacks"],
  12: ["a", "queen", "queens"],
  13: ["a", "king", "kings"],
  14: ["an", "ace", "aces"],
};

const SUIT_PLURALS: Readonly<Record<Suit, string>> = {
  s: "spades",
  h: "hearts",
  d: "diamonds",
  c: "clubs",
};

// "the button's list": each seat named as the units name it (`units/preflop.ts`).
const SEAT_OWNERS: Readonly<Record<OpenSeat, string>> = {
  UTG: "UTG's",
  HJ: "the hijack's",
  CO: "the cutoff's",
  BTN: "the button's",
  SB: "the small blind's",
};

const SEAT_PLACES: Readonly<Record<OpenSeat, string>> = {
  UTG: "UTG",
  HJ: "the hijack",
  CO: "the cutoff",
  BTN: "the button",
  SB: "the small blind",
};

export function categoryPhrase(category: HandCategory): string {
  return CATEGORY_PHRASES[category];
}

export function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function aRank(rank: RankValue): string {
  return `${RANK_WORDS[rank][0]} ${RANK_WORDS[rank][1]}`;
}

export function rankWord(rank: RankValue): string {
  return RANK_WORDS[rank][1];
}

export function rankPlural(rank: RankValue): string {
  return RANK_WORDS[rank][2];
}

export function suitPlural(suit: Suit): string {
  return SUIT_PLURALS[suit];
}

export function seatOwner(seat: OpenSeat): string {
  return SEAT_OWNERS[seat];
}

export function seatPlace(seat: OpenSeat): string {
  return SEAT_PLACES[seat];
}

// `describeHand` with the article the category takes ("a flush, king high"). High card says
// "ace high" where `describeHand` says "ace", so a hand and the verdict about it use the same
// words (review, phase 14); `cards/describe.ts` is not this folder's to change.
export function handPhrase(value: HandValue): string {
  if (value.category === "high-card") return `high card, ${rankWord(value.ranks[0])} high`;
  const detail = describeHand(value).slice(categoryName(value.category).length);
  return `${categoryPhrase(value.category)}${detail}`;
}

// Two items need no comma: joinOr(["a ten", "a five"]) is "a ten or a five".
export function joinOr(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

export function joinAnd(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
