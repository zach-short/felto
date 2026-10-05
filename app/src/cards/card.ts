// A card is a rank and a suit, written in two characters: `As` is the ace of spades, `Td` the
// ten of diamonds. The ten is `T`, so every card code is exactly two characters long.
export type Suit = "s" | "h" | "d" | "c";
export type RankChar = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "T" | "J" | "Q" | "K" | "A";
export type CardCode = `${RankChar}${Suit}`;

// The ace is 14 when it plays high. Only a straight reads it low (the wheel, A-2-3-4-5), and the
// evaluator handles that case by itself, so no card ever carries a rank of 1.
export type RankValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  readonly rank: RankValue;
  readonly suit: Suit;
}

export const SUITS: readonly Suit[] = ["s", "h", "d", "c"];
export const RANK_CHARS: readonly RankChar[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A",
];

export function rankChar(rank: RankValue): RankChar {
  return RANK_CHARS[rank - 2];
}

export function parseCard(code: string): Card {
  const rankIndex = RANK_CHARS.indexOf(code.charAt(0) as RankChar);
  const suit = code.charAt(1) as Suit;
  if (code.length !== 2 || rankIndex < 0 || !SUITS.includes(suit)) {
    throw new Error(`not a card code: "${code}"`);
  }
  return { rank: (rankIndex + 2) as RankValue, suit };
}

export function parseCards(codes: readonly string[]): Card[] {
  return codes.map(parseCard);
}

export function cardCode(card: Card): CardCode {
  return `${rankChar(card.rank)}${card.suit}`;
}

export function sameCard(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function hasDuplicate(cards: readonly Card[]): boolean {
  return new Set(cards.map(cardCode)).size !== cards.length;
}
