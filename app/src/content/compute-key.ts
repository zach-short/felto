import { parseCard, parseCards } from "@/cards/card";
import { evaluate } from "@/cards/evaluate";
import { handClass } from "@/cards/hand-class";
import { ruleOfTwoAndFour, requiredPercent } from "@/cards/odds";
import { outsTo } from "@/cards/outs";
import { showdownWinners } from "@/cards/showdown";

import type {
  CallDecision,
  CallExercise,
  Exercise,
  OddsExercise,
  OpeningChart,
  PreflopAction,
  PreflopExercise,
  ShowdownExercise,
} from "./schema";

// What `computeKey` needs besides the exercise: the opening chart, for `preflop` (phase 7).
export interface KeyContext {
  readonly chart?: OpeningChart;
}

function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((n) => b.includes(n));
}

function showdownKey(ex: ShowdownExercise): number {
  const winners = showdownWinners(parseCards(ex.board), ex.players.map((hole) => parseCards(hole)));
  return ex.options.findIndex((option) => sameSet(option, winners));
}

function preflopAction(ex: PreflopExercise, chart: OpeningChart | undefined): PreflopAction {
  if (!chart) throw new Error(`${ex.id}: a preflop key needs the opening chart`);
  const name = handClass([parseCard(ex.hole[0]), parseCard(ex.hole[1])]);
  return chart[ex.seat].includes(name) ? "raise" : "fold";
}

// Call when the rule-of-2-and-4 estimate is at least the price, compared in integers:
// estimate / 100 >= bet / (pot + 2 * bet).
function callDecision(ex: CallExercise): CallDecision {
  const estimate = ruleOfTwoAndFour(ex.outs, ex.cardsToCome);
  return estimate * (ex.pot + 2 * ex.bet) >= 100 * ex.bet ? "call" : "fold";
}

function oddsKey(ex: OddsExercise): number {
  switch (ex.ask) {
    case "pot-odds":
      return ex.options.indexOf(requiredPercent(ex.pot, ex.bet));
    case "equity":
      return ex.options.indexOf(ruleOfTwoAndFour(ex.outs, ex.cardsToCome));
    case "call":
      return ex.options.indexOf(callDecision(ex));
  }
}

// The second writing of an answer key (rule Q3, `DESIGN.md` 10.4): the index of the option the
// cards, the chart or the numbers say is right, -1 when no option says it, and null for a
// `concept` exercise, which only a reader can check.
export function computeKey(ex: Exercise, context: KeyContext = {}): number | null {
  switch (ex.kind) {
    case "concept":
      return null;
    case "hand-name":
      return ex.options.indexOf(evaluate(parseCards(ex.cards)).category);
    case "showdown":
      return showdownKey(ex);
    case "preflop":
      return ex.options.indexOf(preflopAction(ex, context.chart));
    case "outs":
      return ex.options.indexOf(outsTo(parseCards(ex.hole), parseCards(ex.board), ex.target).length);
    case "odds":
      return oddsKey(ex);
  }
}
