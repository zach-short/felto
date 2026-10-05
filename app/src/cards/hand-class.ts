import { RANK_CHARS, rankChar, type Card, type RankChar } from "./card";

// The 169-hand notation of a preflop chart (`PLAN.md` phase 7): `77` for a pair, `AKs` for two
// suited cards, `T9o` for two of different suits, the higher rank always first.
export type HandClass = `${RankChar}${RankChar}` | `${RankChar}${RankChar}${"s" | "o"}`;

export function handClass([a, b]: readonly [Card, Card]): HandClass {
  if (a.rank === b.rank && a.suit === b.suit) throw new Error("two hole cards cannot be one card");
  const [high, low] = a.rank >= b.rank ? [a, b] : [b, a];
  const ranks = `${rankChar(high.rank)}${rankChar(low.rank)}` as const;
  if (a.rank === b.rank) return ranks;
  return `${ranks}${a.suit === b.suit ? "s" : "o"}`;
}

// All 169 classes: 13 pairs, 78 suited and 78 offsuit.
export function allHandClasses(): HandClass[] {
  const high = [...RANK_CHARS].reverse();
  return high.flatMap((first, i) => [
    `${first}${first}` as const,
    ...high.slice(i + 1).flatMap((second) => [`${first}${second}s` as const, `${first}${second}o` as const]),
  ]);
}

// How many two-card combinations a class holds: 6 for a pair, 4 suited, 12 offsuit.
export function comboCount(handClassCode: HandClass): number {
  if (handClassCode.length === 2) return 6;
  return handClassCode.endsWith("s") ? 4 : 12;
}
