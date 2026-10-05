import { RANK_CHARS, SUITS, parseCard, sameCard, type Card } from "./card";

// The 52 cards in a fixed order, deuces first. Shuffling is a drill's job (`PLAN.md` phase 14,
// BD-26), with a seeded generator, so the deck itself never holds randomness.
export function fullDeck(): Card[] {
  return RANK_CHARS.flatMap((rank) => SUITS.map((suit) => parseCard(`${rank}${suit}`)));
}

export function unseenCards(known: readonly Card[]): Card[] {
  return fullDeck().filter((card) => !known.some((seen) => sameCard(seen, card)));
}
