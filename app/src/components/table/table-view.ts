import type { Pose } from "@/art/names";
import type { Card } from "@/cards/card";
import type { Seat } from "@/content/schema";
import { inPot, liveSeats, type Hand } from "@/gto/hand";
import { handResult, type HandResult } from "@/gto/result";
import { STACK } from "@/gto/table";
import { nextTurn, type Turn } from "@/gto/turn";

import { occupantAt, PLACES, seatAt, type Occupant, type Place } from "./seat-places";

// What one place at the table shows. Every number is in chips; the table formats them (amounts.ts).
export interface SeatView {
  readonly place: Place;
  readonly seat: Seat;
  readonly occupant: Occupant | null;
  readonly stack: number;
  // The chips in front of the seat while the hand runs; 0 once it is over, when they are the pot
  readonly bet: number;
  readonly folded: boolean;
  readonly toAct: boolean;
  readonly button: boolean;
  // The player's cards always; a bot's only at a showdown it is in (BD-T5)
  readonly cards: readonly Card[] | null;
  // What the seat took from the pot less what it put in, once the hand is over
  readonly net: number | null;
}

export interface TableView {
  readonly seats: readonly SeatView[];
  readonly pot: number;
  // BD-T5: the board only when two or more players are left at the end of the hand
  readonly board: readonly Card[];
  // The player's decision, or null while no decision is theirs
  readonly turn: Turn | null;
  readonly result: HandResult | null;
}

export function tableView(hand: Hand): TableView {
  const turn = nextTurn(hand);
  const result = handResult(hand);
  const chips = inPot(hand);
  const pot = Object.values(chips).reduce((sum, put) => sum + put, 0);
  const seats = PLACES.map((place) => seatView(hand, place, turn, result));
  const board = result?.showdown ? hand.deal.board : [];
  return { seats, pot, board, turn: turn?.actor === "player" ? turn : null, result };
}

function seatView(hand: Hand, place: Place, turn: Turn | null, result: HandResult | null): SeatView {
  const seat = seatAt(place, hand.deal.playerSeat);
  const put = inPot(hand)[seat];
  const folded = !liveSeats(hand).includes(seat);
  const shown = place === 0 || (result !== null && result.showdown && !folded);
  return {
    place, seat, occupant: occupantAt(place), stack: STACK - put + (result?.won[seat] ?? 0),
    bet: result === null ? put : 0, folded, toAct: turn?.seat === seat, button: seat === "BTN",
    cards: shown ? hand.deal.holes[seat] : null, net: result === null ? null : result.net[seat],
  };
}

// The cast react to the player's result (PLAN.md phase 7, BD-T31): asleep once folded, glad while
// the hand runs, and at the end cheering a player who won, sad for one who lost, smug when the
// player folded and lost nothing.
export function castPose(folded: boolean, playerNet: number | null): Pose {
  if (playerNet !== null) return playerNet > 0 ? "cheer" : playerNet < 0 ? "sad" : "smug";
  return folded ? "sleep" : "happy";
}
