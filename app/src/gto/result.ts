import { showdownWinners } from "@/cards/showdown";
import { DIALS } from "@/config/dials";
import type { Seat } from "@/content/schema";

import type { Deal } from "./deal";
import { inPot, liveSeats, wentMultiway, type Hand } from "./hand";
import { bySeat, POSTFLOP_ORDER } from "./table";
import { nextTurn } from "./turn";

// BD-T5: the engine knows one way to play after the flop, the runout with no betting. The day the
// dial gtoPostflopMode takes another value, this line stops the typecheck where that work begins.
const POSTFLOP: "runout" = DIALS.gtoPostflopMode;

export interface HandResult {
  readonly postflop: typeof POSTFLOP;
  // The seats still in at the end; two or more run the board out to a showdown.
  readonly live: readonly Seat[];
  readonly showdown: boolean;
  readonly winners: readonly Seat[];
  readonly pot: number;
  // Chips each seat takes from the pot, and that less what it put in; the nets sum to 0.
  readonly won: Readonly<Record<Seat, number>>;
  readonly net: Readonly<Record<Seat, number>>;
  // BD-T4: the player called or raised off the solved tree, so the hand is "multiway, not scored".
  readonly multiway: boolean;
}

// Null while a turn is still pending.
export function handResult(hand: Hand): HandResult | null {
  if (nextTurn(hand) !== null) return null;
  const [live, chips] = [liveSeats(hand), inPot(hand)];
  const showdown = live.length > 1;
  const winners = showdown ? showdownSeats(hand.deal, live) : live;
  const pot = Object.values(chips).reduce((sum, put) => sum + put, 0);
  const won = shares(pot, winners);
  const net = bySeat((seat) => won[seat] - chips[seat]);
  return { postflop: POSTFLOP, live, showdown, winners, pot, won, net, multiway: wentMultiway(hand) };
}

function showdownSeats(deal: Deal, live: readonly Seat[]): Seat[] {
  return showdownWinners(deal.board, live.map((seat) => deal.holes[seat])).map((i) => live[i]);
}

// A split pot's odd chips go one each to the winners first in the order after the flop, the first
// seat left of the button, as at a real table.
function shares(pot: number, winners: readonly Seat[]): Record<Seat, number> {
  const ordered = POSTFLOP_ORDER.filter((seat) => winners.includes(seat));
  const share = Math.floor(pot / ordered.length);
  const odd = pot - share * ordered.length;
  return bySeat((seat) => {
    const place = ordered.indexOf(seat);
    return place < 0 ? 0 : share + (place < odd ? 1 : 0);
  });
}
