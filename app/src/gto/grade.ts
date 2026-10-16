import { handClass, type HandClass } from "@/cards/hand-class";
import { DIALS } from "@/config/dials";

import type { Hand, Step } from "./hand";
import { gtoKey, type GtoAction, type GtoNode } from "./key";

// The grader of E1 (DESIGN.md section 6, answer 4; PLAN.md phase 6). A grader that reads the key
// wrongly fails in silence: it calls a correct mixed play a mistake, or praises an action from a
// row the key never meant (KEY-SPEC.md 10, second review, item 1). So it reads the two reach
// numbers before any frequency or EV, and a test grades rows written out by hand (grade.test.ts).

// Zach's answer (c) of board item 41 (2026-10-16, BD-T25): two labels, and the space between them
// (null) has none.
export type GradeLabel = "good" | "mistake";

const EV_SCALE = 10_000;

// One action of the node's mix. A frequency is null where the actor never holds the hand (its row
// is the uniform default), and an EV is null at a node the solver never reaches (KEY-SPEC.md 7.1).
export interface MixLine {
  readonly action: GtoAction;
  readonly frequency: number | null;
  readonly ev: number | null;
}

// What a decision earns. "off-tree": the one decision the player may take with no node (BD-T21),
// which the key cannot grade. "unreached": a node under reachFloor, where no EV loss is shown.
// "graded" by "mix" (frequency and cost) or, at a row the actor never holds, by "cost" alone.
export type Grade =
  | { readonly kind: "off-tree"; readonly chosen: GtoAction }
  | { readonly kind: "unreached"; readonly chosen: GtoAction; readonly mix: readonly MixLine[] }
  | {
      readonly kind: "graded";
      readonly chosen: GtoAction;
      readonly mix: readonly MixLine[];
      readonly basis: "mix" | "cost";
      readonly frequency: number | null;
      readonly costBb: number;
      readonly label: GradeLabel | null;
    };

// One hand's row at one node: the numbers the grader reads, and nothing else of the key.
export interface KeyRow {
  readonly actions: readonly GtoAction[];
  readonly reach: number;
  readonly handReach: number;
  readonly strategy: readonly number[];
  readonly ev: readonly number[];
}

export function handRow(node: GtoNode, held: HandClass): KeyRow {
  const i = gtoKey().hands.indexOf(held);
  if (i < 0) throw new Error(`${held} is not a hand class of the key`);
  return { actions: node.actions, reach: node.reach, handReach: node.handReach[i], strategy: node.strategy[i], ev: node.ev[i] };
}

// The reach of the node is read first, then the reach of the hand, and only then a frequency.
export function gradeRow(row: KeyRow, chosen: GtoAction): Grade {
  const i = row.actions.indexOf(chosen);
  if (i < 0) throw new Error(`${chosen} is not an action of this node (${row.actions.join(", ")})`);
  const held = row.handReach >= DIALS.gtoNeverHeldReach;
  const frequencies = row.strategy.map((frequency) => (held ? frequency : null));
  if (row.reach < DIALS.reachFloor) return { kind: "unreached", chosen, mix: mixOf(row.actions, frequencies, null) };
  const costBb = costOf(row.ev, i);
  const frequency = frequencies[i];
  const mix = mixOf(row.actions, frequencies, row.ev);
  return { kind: "graded", chosen, mix, basis: held ? "mix" : "cost", frequency, costBb, label: labelOf(frequency, costBb) };
}

// KEY-SPEC.md 7.4: EVs are written to four decimals, so the cost is rounded back to four. A raw
// difference of two such numbers can miss its value by 1e-15 either way, and a cost the key writes
// as exactly 0.0025 or 0.15 must land on the side of the dial that the rule names (the Deep review
// of board item 41 found `AKo` calling at -22.0025 against -22.0, 0.002500000000001279 unrounded).
function costOf(ev: readonly number[], i: number): number {
  return Math.round((Math.max(...ev) - ev[i]) * EV_SCALE) / EV_SCALE;
}

function mixOf(actions: readonly GtoAction[], frequencies: readonly (number | null)[], ev: readonly number[] | null): MixLine[] {
  return actions.map((action, i) => ({ action, frequency: frequencies[i], ev: ev === null ? null : ev[i] }));
}

// Good wins over mistake (BD-T25): an action the solver plays at least gtoGoodFrequency, or one
// within gtoEqualEvBb of the best EV (BD-T23), is good whatever it costs, so an action the solver
// plays at least gtoGoodFrequency is never called a mistake. A rarer one can be: E1 draws the line
// at 0.10. With no frequency (BD-T24) the cost alone decides.
export function labelOf(frequency: number | null, costBb: number): GradeLabel | null {
  if (costBb <= DIALS.gtoEqualEvBb) return "good";
  if (frequency !== null && frequency >= DIALS.gtoGoodFrequency) return "good";
  return costBb > DIALS.gtoMistakeCostBb ? "mistake" : null;
}

// A step of a played hand, graded with the hand its seat holds. A step with no node is off the tree.
export function gradeStep(hand: Hand, step: Step): Grade {
  if (step.node === null) return { kind: "off-tree", chosen: step.action };
  const node = gtoKey().nodes.get(step.node);
  if (node === undefined) throw new Error(`the grader asked for ${step.node}, which is not a node of the key`);
  return gradeRow(handRow(node, handClass(hand.deal.holes[step.seat])), step.action);
}
