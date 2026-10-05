import { SUITS, parseCard, type Card, type RankChar } from "@/cards/card";
import { allHandClasses, type HandClass } from "@/cards/hand-class";
import { OPENING_CHART } from "@/content/catalog";
import { OPEN_SEATS, type OpenSeat, type PreflopAction, type PreflopExercise } from "@/content/schema";

import { checked, dealtId } from "./checked";
import { holeCodes } from "./draw";
import { placeKey } from "./options";
import { pickOne, pickSome, randomFrom, type Random } from "./random";
import { joinAnd, seatOwner, seatPlace } from "./words";

// A dealt `preflop` exercise (`DESIGN.md` D21): a seat, two hole cards, everyone before has
// folded. The key is the opening chart's, the one unit 3 teaches. A plain deal folds nine times
// in ten from UTG, so the dealer picks raise or fold first, each half the time, and half the
// folds are hands some other seat opens, so the seat is what decides (judgment call, phase 14).

const PROMPTS: Readonly<Record<OpenSeat, string>> = {
  UTG: "You are UTG, the first to act. Raise or fold?",
  HJ: "Everyone folds to you in the hijack (HJ). Raise or fold?",
  CO: "Everyone folds to you in the cutoff. Raise or fold?",
  BTN: "Everyone folds to you on the button. Raise or fold?",
  SB: "Everyone folds to you in the small blind. Raise or fold?",
};

function opensFrom(name: HandClass): OpenSeat[] {
  return OPEN_SEATS.filter((seat) => OPENING_CHART[seat].includes(name));
}

function foldPool(random: Random, seat: OpenSeat): HandClass[] {
  const folds = allHandClasses().filter((name) => !OPENING_CHART[seat].includes(name));
  const elsewhere = folds.filter((name) => opensFrom(name).length > 0);
  return elsewhere.length > 0 && random() < 0.5 ? elsewhere : folds;
}

function card(rank: RankChar, suit: Card["suit"]): Card {
  return parseCard(`${rank}${suit}`);
}

// Two hole cards of the class, in random suits that keep it what it is: a pair in two suits,
// suited in one, offsuit in two.
function holeOf(random: Random, name: HandClass): [Card, Card] {
  const [high, low] = [name.charAt(0) as RankChar, name.charAt(1) as RankChar];
  if (name.endsWith("s")) {
    const suit = pickOne(random, SUITS);
    return [card(high, suit), card(low, suit)];
  }
  const [a, b] = pickSome(random, SUITS, 2);
  return pickOne(random, [[card(high, a), card(low, b)], [card(low, b), card(high, a)]] as const);
}

function explanation(name: HandClass, seat: OpenSeat, action: PreflopAction): string {
  if (action === "raise") return `${name} is on ${seatOwner(seat)} opening list, so raise.`;
  const seats = opensFrom(name);
  const where = seats.length ? ` The chart opens it from ${joinAnd(seats.map(seatPlace))}.` : " No seat on the chart opens it.";
  return `${name} is not on ${seatOwner(seat)} list, so fold.${where}`;
}

export function dealPreflop(seed: number): PreflopExercise {
  const random = randomFrom(seed);
  const seat = pickOne(random, OPEN_SEATS);
  const action: PreflopAction = random() < 0.5 ? "raise" : "fold";
  const name = pickOne(random, action === "raise" ? OPENING_CHART[seat] : foldPool(random, seat));
  const { options, answer } = placeKey<PreflopAction>(random, action, [action === "raise" ? "fold" : "raise"]);
  return checked({
    id: dealtId("preflop", seed),
    kind: "preflop",
    prompt: PROMPTS[seat],
    seat,
    hole: holeCodes(holeOf(random, name)),
    options,
    answer,
    explanation: explanation(name, seat, action),
  });
}
