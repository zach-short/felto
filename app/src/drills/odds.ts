import { exactEquity, requiredPercent, ruleOfTwoAndFour, type Street } from "@/cards/odds";
import type { CallDecision, CallExercise, EquityExercise, OddsExercise, PotOddsExercise } from "@/content/schema";

import { checked, dealtId } from "./checked";
import { placeKey } from "./options";
import { firstAccepted, pickOne, pickSome, randomFrom, randomInt, type Random } from "./random";

// A dealt `odds` exercise (`DESIGN.md` D21) with one of the three asks of unit 4. Every number
// is kept clear of a second reading: a price never falls on an exact half percent (the rounding
// would decide the key), no wrong option sits within 1.5 points of the exact value a careful
// player might work out instead, and a call is dealt only when the rule of 2 and 4 and the
// exact chance both sit at least 3 points from the price, on the same side.

type Ask = OddsExercise["ask"];

interface Mode {
  readonly street: Street;
  readonly cardsToCome: 1 | 2;
}

const MODES: readonly Mode[] = [
  { street: "turn", cardsToCome: 1 },
  { street: "flop", cardsToCome: 1 },
  { street: "flop", cardsToCome: 2 },
];

const BET_SHARES = [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1, 3 / 2, 2];
const EQUITY_OUTS = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];
const CALL_OUTS = [4, 8, 9, 12, 15];
const MARGIN = 3;

interface Price {
  readonly pot: number;
  readonly bet: number;
}

// 100 * bet / (pot + 2 * bet) ends in exactly .5 (the validator's own test, `content/validate.ts`).
function onHalfPercent({ pot, bet }: Price): boolean {
  const twice = 200 * bet;
  const share = pot + 2 * bet;
  return twice % share === 0 && (twice / share) % 2 === 1;
}

function exactPrice({ pot, bet }: Price): number {
  return (100 * bet) / (pot + 2 * bet);
}

// A pot in tens and a bet from a quarter of the pot to twice the pot, in fives.
function dealPrice(random: Random): Price | null {
  const pot = 10 * randomInt(random, 2, 20);
  const bet = 5 * Math.round((pot * pickOne(random, BET_SHARES)) / 5);
  return bet > 0 && !onHalfPercent({ pot, bet }) ? { pot, bet } : null;
}

function farFrom(exact: number, gap: number) {
  return (n: number) => Number.isInteger(n) && n >= 1 && n <= 99 && Math.abs(n - exact) >= gap;
}

function wrongOptions(random: Random, candidates: readonly number[], keep: (n: number) => boolean, key: number) {
  return pickSome(random, [...new Set(candidates)].filter((n) => n !== key && keep(n)), 2);
}

function priceWords({ pot, bet }: Price, percent: number): string {
  const total = pot + 2 * bet;
  return (100 * bet) % total === 0 ? `${bet} of a final ${total} = ${percent}%` : `${bet} of a final ${total}, about ${percent}%`;
}

function dealPotOdds(random: Random, id: string): PotOddsExercise {
  const price = firstAccepted("pot-odds price", () => dealPrice(random));
  const key = requiredPercent(price.pot, price.bet);
  const { pot, bet } = price;
  const candidates = [Math.round((100 * bet) / (pot + bet)), Math.round((100 * bet) / pot), 20, 25, 33, 40, 50, key + 10, key - 10];
  const { options, answer } = placeKey(random, key, wrongOptions(random, candidates, farFrom(exactPrice(price), MARGIN), key));
  const total = pot + 2 * bet;
  return {
    id, kind: "odds", ask: "pot-odds", pot, bet, options, answer,
    prompt: `The pot is ${pot}. Your opponent bets ${bet}. What share of the final pot is your call, in percent?`,
    explanation: `The final pot is ${pot} + ${bet} + ${bet} = ${total}. Your ${bet} is ${(100 * bet) % total === 0 ? "" : "about "}${key}% of it.`,
  };
}

const EQUITY_PROMPTS: Readonly<Record<string, (outs: number) => string>> = {
  "turn-1": (o) => `You have ${o} outs on the turn. By the rule of 2 and 4, what is your chance to hit on the river, in percent?`,
  "flop-1": (o) => `You have ${o} outs on the flop. By the rule of 2 and 4, what is your chance to hit on the turn alone, in percent?`,
  "flop-2": (o) =>
    `You have ${o} outs on the flop, and you will see both the turn and the river. By the rule of 2 and 4, what is your chance to hit by the river, in percent?`,
};

function multiplierWords(mode: Mode, outs: number, chance: number): string {
  const rule = `${outs} × ${mode.cardsToCome * 2} = ${chance}%`;
  if (mode.cardsToCome === 2) return `Two cards to come, so multiply by 4: ${rule}.`;
  return mode.street === "turn" ? `One card to come, so multiply by 2: ${rule}.` : `Only the turn counts here, one card, so multiply by 2: ${rule}.`;
}

function dealEquity(random: Random, id: string): EquityExercise {
  const mode = pickOne(random, MODES);
  const outs = pickOne(random, EQUITY_OUTS);
  const key = ruleOfTwoAndFour(outs, mode.cardsToCome);
  const exact = 100 * exactEquity(outs, mode.street, mode.cardsToCome);
  const other = outs * (mode.cardsToCome === 2 ? 2 : 4);
  // 1.5 points also keeps out the exact chance rounded, which the validator refuses.
  const keep = farFrom(exact, 1.5);
  const { options, answer } = placeKey(random, key, wrongOptions(random, [other, outs, outs * 3, key + 10, key - 6], keep, key));
  return {
    id, kind: "odds", ask: "equity", outs, ...mode, options, answer,
    prompt: EQUITY_PROMPTS[`${mode.street}-${mode.cardsToCome}`](outs),
    explanation: multiplierWords(mode, outs, key),
  };
}

const CALL_PROMPTS: Readonly<Record<string, (p: Price, outs: number) => string>> = {
  "turn-1": ({ pot, bet }, o) =>
    `The pot is ${pot}, and your opponent bets ${bet}. You have ${o} outs, and only the river is left to come. Call or fold?`,
  "flop-1": ({ pot, bet }, o) =>
    `On the flop, the pot is ${pot} and your opponent bets ${bet}. You have ${o} outs, and calling does not put you all in. Call or fold?`,
  "flop-2": ({ pot, bet }, o) =>
    `On the flop, the pot is ${pot} and your opponent bets ${bet}. Calling puts you all in, so you will see the turn and the river. You have ${o} outs. Call or fold?`,
};

const CALL_CHANCE: Readonly<Record<string, string>> = {
  "turn-1": "One card to come, so use 2",
  "flop-1": "This call buys only the turn card, so use 2",
  "flop-2": "You will see the turn and the river, so use 4",
};

interface CallSpot {
  readonly mode: Mode;
  readonly outs: number;
  readonly price: Price;
}

// The rule's call (compared in whole numbers, as `computeKey` does) is the wanted one, and both
// the rule and the exact chance stand clear of the price on the same side.
function clearCall(spot: CallSpot, wanted: CallDecision): boolean {
  const { mode, outs, price } = spot;
  const estimate = ruleOfTwoAndFour(outs, mode.cardsToCome);
  const exact = 100 * exactEquity(outs, mode.street, mode.cardsToCome);
  const byRule: CallDecision = estimate * (price.pot + 2 * price.bet) >= 100 * price.bet ? "call" : "fold";
  const target = exactPrice(price);
  const sameSide = estimate > target === exact > target;
  return byRule === wanted && sameSide && Math.abs(estimate - target) >= MARGIN && Math.abs(exact - target) >= MARGIN;
}

function dealCallSpot(random: Random, wanted: CallDecision): CallSpot | null {
  const price = dealPrice(random);
  const spot = price && { mode: pickOne(random, MODES), outs: pickOne(random, CALL_OUTS), price };
  return spot && clearCall(spot, wanted) ? spot : null;
}

function callWords({ mode, outs, price }: CallSpot, decision: CallDecision): string {
  const modeKey = `${mode.street}-${mode.cardsToCome}`;
  const chance = ruleOfTwoAndFour(outs, mode.cardsToCome);
  const percent = requiredPercent(price.pot, price.bet);
  const compare = decision === "call" ? "more" : "less";
  return (
    `${CALL_CHANCE[modeKey]}: ${outs} × ${mode.cardsToCome * 2} = ${chance}%. The price: ${priceWords(price, percent)}. ` +
    `${chance} is ${compare} than ${percent}, so ${decision}.`
  );
}

function dealCall(random: Random, id: string): CallExercise {
  const wanted: CallDecision = random() < 0.5 ? "call" : "fold";
  const spot = firstAccepted("call spot", () => dealCallSpot(random, wanted));
  const { options, answer } = placeKey<CallDecision>(random, wanted, [wanted === "call" ? "fold" : "call"]);
  return {
    id, kind: "odds", ask: "call", pot: spot.price.pot, bet: spot.price.bet, outs: spot.outs, ...spot.mode, options, answer,
    prompt: CALL_PROMPTS[`${spot.mode.street}-${spot.mode.cardsToCome}`](spot.price, spot.outs),
    explanation: callWords(spot, wanted),
  };
}

const ASKS: Readonly<Record<Ask, (random: Random, id: string) => OddsExercise>> = {
  "pot-odds": dealPotOdds,
  equity: dealEquity,
  call: dealCall,
};

export function dealOdds(seed: number): OddsExercise {
  const random = randomFrom(seed);
  const ask = pickOne(random, ["pot-odds", "equity", "call"] as const);
  return checked(ASKS[ask](random, dealtId("odds", seed)));
}
