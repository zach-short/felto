import type { RankValue } from "./card";
import type { HandCategory, HandValue } from "./evaluate";

const CATEGORY_NAMES: Readonly<Record<HandCategory, string>> = {
  "royal-flush": "Royal flush",
  "straight-flush": "Straight flush",
  "four-of-a-kind": "Four of a kind",
  "full-house": "Full house",
  flush: "Flush",
  straight: "Straight",
  "three-of-a-kind": "Three of a kind",
  "two-pair": "Two pair",
  "one-pair": "One pair",
  "high-card": "High card",
};

const RANK_NAMES: Readonly<Record<RankValue, readonly [string, string]>> = {
  2: ["two", "twos"],
  3: ["three", "threes"],
  4: ["four", "fours"],
  5: ["five", "fives"],
  6: ["six", "sixes"],
  7: ["seven", "sevens"],
  8: ["eight", "eights"],
  9: ["nine", "nines"],
  10: ["ten", "tens"],
  11: ["jack", "jacks"],
  12: ["queen", "queens"],
  13: ["king", "kings"],
  14: ["ace", "aces"],
};

export function categoryName(category: HandCategory): string {
  return CATEGORY_NAMES[category];
}

function one(rank: RankValue): string {
  return RANK_NAMES[rank][0];
}

function many(rank: RankValue): string {
  return RANK_NAMES[rank][1];
}

// "two pair, kings and fives": the category, then the ranks that make it, in words.
export function describeHand(value: HandValue): string {
  return `${categoryName(value.category).toLowerCase()}${detail(value.category, value.ranks)}`;
}

function detail(category: HandCategory, [first, second]: readonly RankValue[]): string {
  switch (category) {
    case "royal-flush":
      return "";
    case "full-house":
      return `, ${many(first)} full of ${many(second)}`;
    case "two-pair":
      return `, ${many(first)} and ${many(second)}`;
    case "four-of-a-kind":
    case "three-of-a-kind":
    case "one-pair":
      return `, ${many(first)}`;
    case "high-card":
      return `, ${one(first)}`;
    default:
      return `, ${one(first)} high`;
  }
}
