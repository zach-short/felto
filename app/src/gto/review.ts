import type { Card } from "@/cards/card";
import type { Seat } from "@/content/schema";

import { gradeStep, type Grade } from "./grade";
import type { Hand } from "./hand";
import { handResult, type HandResult } from "./result";
import { toBigBlinds } from "./table";

// The review of one finished hand (PLAN.md phase 6, step 2), as plain data: a view of it is item
// 42's, and its words are item 45's (KEY-SPEC.md 6, R7). Every amount is in big blinds.

export interface ReviewDecision {
  readonly seat: Seat;
  readonly node: string | null;
  readonly grade: Grade;
}

// BD-T5: nothing after the flop is scored. The board is shown only when two or more players are
// left to run it out; a pot taken before the flop has no board.
export interface Runout {
  readonly postflop: HandResult["postflop"];
  readonly board: readonly Card[];
  readonly winners: readonly Seat[];
  readonly potBb: number;
  readonly playerNetBb: number;
}

export interface Review {
  // BD-T4: false when the player called or raised off the tree, so the hand is "multiway, not
  // scored". The player behind the defender acts first off the tree, so that hand's one
  // decision is the ungraded one.
  readonly scored: boolean;
  readonly decisions: readonly ReviewDecision[];
  readonly runout: Runout;
}

// Null while a turn is still pending, as handResult is.
export function reviewHand(hand: Hand): Review | null {
  const result = handResult(hand);
  if (result === null) return null;
  const decisions = hand.steps
    .filter((step) => step.actor === "player")
    .map((step) => ({ seat: step.seat, node: step.node, grade: gradeStep(hand, step) }));
  return { scored: !result.multiway, decisions, runout: runoutOf(hand, result) };
}

function runoutOf(hand: Hand, result: HandResult): Runout {
  return {
    postflop: result.postflop,
    board: result.showdown ? hand.deal.board : [],
    winners: result.winners,
    potBb: toBigBlinds(result.pot),
    playerNetBb: toBigBlinds(result.net[hand.deal.playerSeat]),
  };
}
