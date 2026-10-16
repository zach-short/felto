import { botAction } from "./bots";
import { dealHand } from "./deal";
import { startHand, type Hand } from "./hand";
import type { GtoAction } from "./key";
import { nextTurn } from "./turn";

// Takes one legal action for whoever is to act, and throws on anything else: an action the turn
// does not offer, or any action once the hand is over. Every chip moved is the option's total.
export function act(hand: Hand, action: GtoAction): Hand {
  const turn = nextTurn(hand);
  if (turn === null) throw new Error(`the hand is over: no seat can ${action}`);
  const option = turn.options.find((offered) => offered.action === action);
  if (option === undefined) throw new Error(`${turn.seat} cannot ${action} at ${turn.node ?? "a point off the tree"}`);
  const step = { seat: turn.seat, action, total: option.total, node: turn.node, actor: turn.actor };
  return { ...hand, steps: [...hand.steps, step] };
}

// One step taken for a bot or by the heads-up rule; null when the player is to act or the hand is over.
export function autoStep(hand: Hand): Hand | null {
  const turn = nextTurn(hand);
  if (turn === null || turn.actor === "player") return null;
  return act(hand, turn.actor === "rule" ? "fold" : botAction(hand, turn));
}

// Every automatic step up to the player's turn or the end of the hand.
export function advance(hand: Hand): Hand {
  let current = hand;
  for (let next = autoStep(current); next !== null; next = autoStep(current)) current = next;
  return current;
}

// A new hand from its seed, played up to the player's first decision.
export function newHand(seed: number): Hand {
  return advance(startHand(dealHand(seed)));
}
