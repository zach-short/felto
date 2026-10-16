import { DIALS } from "@/config/dials";
import { dayKey } from "@/game/day-key";
import type { GtoSessionRecord, GtoWorst, PlayerState } from "@/game/player-state";
import type { Hand } from "@/gto/hand";
import type { GtoAction } from "@/gto/key";
import { act, advance, newHand } from "@/gto/play";
import { reviewHand, type ReviewDecision } from "@/gto/review";

// The record of a finished session of the GTO trainer (PLAN.md phase 9, step 1; BD-T34): the
// decisions graded, the mistakes, the total cost in big blinds and the worst mistake with its hand.
// Every number comes from reviewHand; nothing here grades a decision of its own.

type Placed = { hand: Hand; index: number; decision: ReviewDecision };

// The cost is summed in whole ten-thousandths, the key's four decimals (KEY-SPEC.md 7.4), so ten
// costs never add up to 0.6097999999 in place of 0.6098
const COST_SCALE = 10_000;

export function sessionRecord(hands: readonly Hand[], firstSeed: number, now: Date): GtoSessionRecord {
  const graded = hands.flatMap(placedDecisions).filter((placed) => placed.decision.grade.kind === "graded");
  const mistakes = graded.filter((placed) => labelOf(placed) === "mistake");
  const cost = graded.reduce((sum, placed) => sum + Math.round(costOf(placed) * COST_SCALE), 0);
  return {
    day: dayKey(now),
    firstSeed,
    hands: hands.length,
    decisions: graded.length,
    mistakes: mistakes.length,
    costBb: cost / COST_SCALE,
    worst: worstOf(mistakes),
  };
}

// BD-T36: the latest sessions only, so the stored value has a ceiling
export function addSession(state: PlayerState, record: GtoSessionRecord): PlayerState {
  const sessions = [...state.gto.sessions, record].slice(-DIALS.gtoSessionsKept);
  return { ...state, gto: { ...state.gto, sessions } };
}

// BD-T7 and BD-T38: the hand of the worst mistake, played again from its seed and the player's
// actions. Null when the hand no longer plays that way, as it would after a new key changes what
// the bots do (board item 60); the summary then shows the numbers without the hand.
export function replayHand(seed: number, actions: readonly GtoAction[]): Hand | null {
  try {
    const hand = actions.reduce((played, action) => advance(act(played, action)), newHand(seed));
    return reviewHand(hand) === null ? null : hand;
  } catch {
    return null;
  }
}

export function playerActions(hand: Hand): GtoAction[] {
  return hand.steps.filter((step) => step.actor === "player").map((step) => step.action);
}

function placedDecisions(hand: Hand): Placed[] {
  const review = reviewHand(hand);
  if (review === null) throw new Error(`hand ${hand.deal.seed} is not finished`);
  return review.decisions.map((decision, index) => ({ hand, index, decision }));
}

// The first of the costliest, so the same session always names the same hand
function worstOf(mistakes: readonly Placed[]): GtoWorst | null {
  const worst = mistakes.reduce<Placed | null>((top, placed) => (top === null || costOf(placed) > costOf(top) ? placed : top), null);
  if (worst === null) return null;
  return { seed: worst.hand.deal.seed, actions: playerActions(worst.hand), decision: worst.index };
}

function costOf(placed: Placed): number {
  return placed.decision.grade.kind === "graded" ? placed.decision.grade.costBb : 0;
}

function labelOf(placed: Placed): string | null {
  return placed.decision.grade.kind === "graded" ? placed.decision.grade.label : null;
}
