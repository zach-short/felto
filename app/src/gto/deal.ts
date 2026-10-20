import type { Card } from "@/cards/card";
import { fullDeck } from "@/cards/deck";
import type { Seat } from "@/content/schema";
import { childSeed, pickOne, randomFrom, shuffleWith } from "@/drills/random";

import { bySeat, TABLE_SEATS } from "./table";

export type Hole = readonly [Card, Card];

// One hand of the trainer, all of it from one seed (BD-T7): the same seed gives the same seat,
// the same cards and, through `botSeed`, the same bot choices, so a hand replays exactly.
export interface Deal {
  readonly seed: number;
  readonly playerSeat: Seat;
  readonly holes: Readonly<Record<Seat, Hole>>;
  // Five cards, shown only when two or more players are left after the preflop action (BD-T5).
  readonly board: readonly Card[];
  readonly botSeed: number;
}

// The player's seat is drawn too, so every seat, the blinds included, is dealt to the player
// (DESIGN.md section 2 of the trainer). One shuffle deals every card, so none comes twice.
export function dealHand(seed: number): Deal {
  const random = randomFrom(seed);
  const playerSeat = pickOne(random, TABLE_SEATS);
  const deck = shuffleWith(random, fullDeck());
  const holes = bySeat((seat): Hole => {
    const i = TABLE_SEATS.indexOf(seat);
    return [deck[2 * i], deck[2 * i + 1]];
  });
  return { seed, playerSeat, holes, board: deck.slice(12, 17), botSeed: childSeed(random) };
}
