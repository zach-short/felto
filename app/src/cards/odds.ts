// Pot odds and the rule of 2 and 4, for unit 4 (`DESIGN.md` D7). One convention holds in every
// function here, so a ratio and a percentage can never disagree (`PLAN.md` phase 7, watch-for):
// `pot` is the pot before the opponent's bet, and `bet` is the amount the player must call.
export type Street = "flop" | "turn";

// Cards the player cannot see after the flop (52 less two hole cards and three on the board),
// and after the turn (one fewer).
const UNSEEN: Readonly<Record<Street, number>> = { flop: 47, turn: 46 };

function checkAmounts(pot: number, bet: number): void {
  if (!(pot > 0) || !(bet > 0)) throw new Error(`pot ${pot} and bet ${bet} must be above 0`);
}

// The share of the final pot the player puts in by calling: the equity a call needs to break
// even. A 50 bet into a pot of 100 needs 50 / (100 + 50 + 50) = 25%.
export function requiredEquity(pot: number, bet: number): number {
  checkAmounts(pot, bet);
  return bet / (pot + 2 * bet);
}

// The same price as a ratio, "the pot lays 150 to 50": what the player can win to what they risk.
export function potOddsRatio(pot: number, bet: number): { win: number; risk: number } {
  checkAmounts(pot, bet);
  return { win: pot + bet, risk: bet };
}

// The rule of 2 and 4, in whole percent: outs times 4 with two cards to come (from the flop to
// the river), outs times 2 with one.
export function ruleOfTwoAndFour(outs: number, cardsToCome: 1 | 2): number {
  return outs * (cardsToCome === 2 ? 4 : 2);
}

// The exact chance that at least one of the next `cardsToCome` cards is an out.
export function exactEquity(outs: number, street: Street, cardsToCome: 1 | 2): number {
  const unseen = UNSEEN[street];
  if (cardsToCome === 2 && street !== "flop") throw new Error("two cards come only from the flop");
  if (outs < 0 || outs > unseen) throw new Error(`${outs} outs is not possible`);
  if (cardsToCome === 1) return outs / unseen;
  return 1 - ((unseen - outs) * (unseen - 1 - outs)) / (unseen * (unseen - 1));
}

// A fraction as a whole percent, rounded half up: 0.25 is 25.
export function toPercent(fraction: number): number {
  return Math.round(fraction * 100);
}

// The required equity in whole percent, rounded half up: Math.round(100 * bet / (pot + 2 * bet)).
// It divides once, after multiplying by 100, so `toPercent(requiredEquity(...))`'s extra float
// step cannot move a rounding. A price on exactly a half percent is still decided by the
// rounding, which is why the validator refuses one.
export function requiredPercent(pot: number, bet: number): number {
  checkAmounts(pot, bet);
  return Math.round((100 * bet) / (pot + 2 * bet));
}
