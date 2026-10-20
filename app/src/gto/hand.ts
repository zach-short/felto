import type { Seat } from "@/content/schema";

import type { Deal } from "./deal";
import type { GtoAction } from "./key";
import { BLINDS, TABLE_SEATS } from "./table";

// Who decides a step: the player, a bot, or the heads-up-only rule of KEY-SPEC.md 2.2, which
// removes every seat behind the defender with no decision (a fold).
export type Actor = "player" | "bot" | "rule";

export interface Step {
  readonly seat: Seat;
  readonly action: GtoAction;
  // The seat's chips in the pot after the step; a fold leaves them where they were.
  readonly total: number;
  // The key's node id where the step was decided, or null off the solved tree (KEY-SPEC.md 5)
  // and for a seat the rule removes. The grader reads the key at the player's steps with a node.
  readonly node: string | null;
  readonly actor: Actor;
}

// A hand is its deal and the steps so far; everything else is read from those two.
export interface Hand {
  readonly deal: Deal;
  readonly steps: readonly Step[];
}

export function startHand(deal: Deal): Hand {
  return { deal, steps: [] };
}

export function inPot(hand: Hand): Record<Seat, number> {
  const chips = { ...BLINDS };
  for (const step of hand.steps) chips[step.seat] = step.total;
  return chips;
}

export function topBet(hand: Hand): number {
  return Math.max(...Object.values(inPot(hand)));
}

export function liveSeats(hand: Hand): Seat[] {
  const out = new Set(hand.steps.filter((step) => step.action === "fold").map((step) => step.seat));
  return TABLE_SEATS.filter((seat) => !out.has(seat));
}

export function openerSeat(hand: Hand): Seat | undefined {
  return hand.steps.find((step) => step.action === "open")?.seat;
}

// The first seat that calls or 3-bets at a node is the defender (KEY-SPEC.md 2.2); -1 until one has.
export function defenderIndex(hand: Hand): number {
  return hand.steps.findIndex((step) => step.node !== null && (step.action === "call" || step.action === "3bet"));
}

// BD-T4: a pot the player calls or raises into off the solved tree is multiway and not scored.
export function wentMultiway(hand: Hand): boolean {
  return hand.steps.some((step) => step.actor === "player" && step.node === null && step.action !== "fold");
}
