import { handClass, type HandClass } from "@/cards/hand-class";
import { DIALS } from "@/config/dials";
import { OPENING_CHART } from "@/content/catalog";
import { pickWeighted, randomFrom, type Random } from "@/drills/random";

import type { Hand } from "./hand";
import { gtoKey, type GtoAction } from "./key";
import type { Turn } from "./turn";

// The dial gtoBotMixMode (PLAN.md section 3): "sample" draws an action at its frequency in the
// bot's row, "top" plays the most frequent one.
export type BotMixMode = "sample" | "top";

// A bot at a node of the key plays its row for its hand class (BD-T8). Zach's answers (b) and (d)
// of board item 40 (2026-10-15, BD-T22): it does so at every node, the one under reachFloor and the
// 5-bet nodes and flats the second review of KEY-SPEC.md 10 names included. Off the tree it answers
// by the rule of BD-T21.
export function botAction(hand: Hand, turn: Turn, mode: BotMixMode = DIALS.gtoBotMixMode): GtoAction {
  const held = handClass(hand.deal.holes[turn.seat]);
  if (turn.node === null) return chartAnswer(held);
  const row = keyRow(turn.node, held);
  const actions = turn.options.map((option) => option.action);
  return mode === "top" ? topAction(actions, row) : sampleAction(actions, row, botRandom(hand));
}

export function keyRow(id: string, held: HandClass): readonly number[] {
  const key = gtoKey();
  const node = key.nodes.get(id);
  if (node === undefined) throw new Error(`a bot looked for ${id}, which is not a node of the key`);
  return node.strategy[key.hands.indexOf(held)];
}

// Actions at 0 are left out before the draw, so a rounding gap in the row can never reach one.
export function sampleAction(actions: readonly GtoAction[], row: readonly number[], random: Random): GtoAction {
  const weighted = actions.map((action, i) => [action, row[i]] as const).filter(([, frequency]) => frequency > 0);
  return pickWeighted(random, weighted);
}

// A tie goes to the action listed first in the node.
export function topAction(actions: readonly GtoAction[], row: readonly number[]): GtoAction {
  const best = row.reduce((top, frequency, i) => (frequency > row[top] ? i : top), 0);
  return actions[best];
}

// BD-T21 (Zach's answer (a)): a bot facing the player's call or raise off the tree calls with a
// hand on the unit 3 chart's UTG list, the tightest seat's 25 classes, at any seat, and folds the rest.
export function chartAnswer(held: HandClass): GtoAction {
  return OPENING_CHART.UTG.includes(held) ? "call" : "fold";
}

// Each decision draws from its own generator, seeded by the hand's bot seed and the step number,
// so a replay of the same steps makes the same choices (BD-T7) and the state holds no generator.
function botRandom(hand: Hand): Random {
  return randomFrom((hand.deal.botSeed + Math.imul(hand.steps.length + 1, 0x9e3779b9)) >>> 0);
}
