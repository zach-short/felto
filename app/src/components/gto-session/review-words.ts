import type { Grade, GradeLabel, MixLine } from "@/gto/grade";
import type { GtoAction } from "@/gto/key";

// The words of a hand's review and of the summary (board item 44), in the warm register Zach chose
// on 2026-10-16 (BD-T35, answer (d)). They are a stand-in: item 45 writes the trainer's copy
// (KEY-SPEC.md 6, R7). A verdict names the solver and never says "GTO" (BD-T14). Every number is
// read from the grade; nothing here grades.

const PAST: Readonly<Record<GtoAction, string>> = {
  fold: "folded",
  call: "called",
  open: "opened",
  "3bet": "3-bet",
  "4bet": "4-bet",
  "5bet": "went all in",
};

const PRESENT: Readonly<Record<GtoAction, string>> = {
  fold: "folds",
  call: "calls",
  open: "opens",
  "3bet": "3-bets",
  "4bet": "4-bets",
  "5bet": "goes all in",
};

const PLAY: Readonly<Record<GtoAction, string>> = {
  fold: "fold",
  call: "call",
  open: "open",
  "3bet": "3-bet",
  "4bet": "4-bet",
  "5bet": "all in",
};

export function youDid(action: GtoAction): string {
  return `You ${PAST[action]}`;
}

// "The solver folds 70% and calls 30%." The mix the solver plays, at a node it reaches with a hand
// it holds; the other kinds of grade say why there is no mix to show.
export function solverLine(grade: Grade): string {
  if (grade.kind === "off-tree") return "This spot is off the solver's map, so it is not graded.";
  if (grade.kind === "unreached") return "The solver almost never gets here, so this spot is not graded.";
  if (grade.basis === "cost") return `The solver never holds this hand here. Its best play: ${PLAY[bestOf(grade.mix)]}.`;
  const parts = grade.mix.filter((line) => (line.frequency ?? 0) > 0).map((line) => `${PRESENT[line.action]} ${percent(line.frequency ?? 0)}`);
  return `The solver ${joinWords(parts)}.`;
}

export function costLine(costBb: number): string {
  if (costBb === 0) return "Cost nothing";
  return `Cost ${bigBlinds(costBb)}`;
}

export function labelWord(label: GradeLabel | null): string | null {
  if (label === null) return null;
  return label === "good" ? "Good" : "Mistake";
}

export function resultLine(netBb: number): string {
  if (netBb > 0) return `You won ${netBb} bb.`;
  if (netBb < 0) return `You lost ${-netBb} bb.`;
  return "You broke even.";
}

export const WALK_LINE = "Everyone folded to you. Nothing to grade this time.";
export const MULTIWAY_LINE = "More than two players saw this pot, so the hand is not scored.";

export function handTitle(hand: number, hands: number): string {
  return `Hand ${hand} of ${hands}`;
}

export function mistakesLead(mistakes: number, decisions: number): string {
  const spots = `${decisions} ${decisions === 1 ? "decision" : "decisions"}`;
  if (mistakes === 0) return `No mistakes in ${spots}`;
  return `${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"} in ${spots}`;
}

export function handsLeftLine(left: number): string {
  return `${left} ${left === 1 ? "hand" : "hands"} left for today`;
}

export function emptyAllowanceLine(perDay: number): string {
  return `That's all ${perDay} hands for today. The table opens again tomorrow.`;
}

// Costs are kept to the key's four decimals; two are shown, and a cost too small for two says so
export function bigBlinds(value: number): string {
  if (value > 0 && value < 0.005) return "under 0.01 bb";
  return `${Number(value.toFixed(2))} bb`;
}

function percent(frequency: number): string {
  if (frequency < 0.005) return "under 1%";
  return `${Math.round(frequency * 100)}%`;
}

function joinWords(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function bestOf(mix: readonly MixLine[]): GtoAction {
  return mix.reduce((best, line) => ((line.ev ?? -Infinity) > (best.ev ?? -Infinity) ? line : best)).action;
}
