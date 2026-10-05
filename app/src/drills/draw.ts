import { cardCode, type Card, type CardCode } from "@/cards/card";
import { unseenCards } from "@/cards/deck";

import { pickSome, type Random } from "./random";

// `count` cards from the deck, none of them in `known`, in a seeded order.
export function drawCards(random: Random, known: readonly Card[], count: number): Card[] {
  return pickSome(random, unseenCards(known), count);
}

export function codes(cards: readonly Card[]): CardCode[] {
  return cards.map(cardCode);
}

export function holeCodes(cards: readonly Card[]): [CardCode, CardCode] {
  if (cards.length !== 2) throw new Error(`hole cards are two cards, not ${cards.length}`);
  return [cardCode(cards[0]), cardCode(cards[1])];
}
