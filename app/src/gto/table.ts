import { DIALS } from "@/config/dials";
import { OPEN_SEATS, type Seat } from "@/content/schema";

// The table of the GTO trainer (KEY-SPEC.md 2.1 in docs/incomplete/gto-trainer/): six seats in the
// order they act before the flop, and the order after it, in which the later seat is in position.
export const TABLE_SEATS: readonly Seat[] = [...OPEN_SEATS, "BB"];
export const POSTFLOP_ORDER: readonly Seat[] = ["SB", "BB", "UTG", "HJ", "CO", "BTN"];

// Chips are counted in tenths of a big blind, so both blinds and every size of KEY-SPEC.md 2.3 are
// whole numbers and a hand conserves chips exactly; the odd chips of a split pot are tenths.
export const CHIPS_PER_BB = 10;
export const STACK = DIALS.stackBigBlinds * CHIPS_PER_BB;
// KEY-SPEC.md 2.1: the small blind posts 0.5 and the big blind 1, with no ante and no straddle.
export const BLINDS: Readonly<Record<Seat, number>> = { UTG: 0, HJ: 0, CO: 0, BTN: 0, SB: 5, BB: 10 };

export function toChips(bigBlinds: number): number {
  return Math.round(bigBlinds * CHIPS_PER_BB);
}

export function toBigBlinds(chips: number): number {
  return chips / CHIPS_PER_BB;
}

export function bySeat<T>(value: (seat: Seat) => T): Record<Seat, T> {
  return { UTG: value("UTG"), HJ: value("HJ"), CO: value("CO"), BTN: value("BTN"), SB: value("SB"), BB: value("BB") };
}
