import { SUITS, type Card, type RankValue, type Suit } from "@/cards/card";
import { unseenCards } from "@/cards/deck";
import { evaluate } from "@/cards/evaluate";
import { makesTarget, outsTo } from "@/cards/outs";
import type { OutsExercise } from "@/content/schema";

import { checked, dealtId } from "./checked";
import { codes, drawCards, holeCodes } from "./draw";
import { placeKey } from "./options";
import { firstAccepted, pickOne, pickSome, pickWeighted, randomFrom, shuffleWith, type Random } from "./random";
import { aRank, capitalized, categoryPhrase, joinOr, rankPlural, suitPlural } from "./words";

// A dealt `outs` exercise (`DESIGN.md` D21, BD-26). The counter (`cards/outs.ts`) counts every
// unseen card that gives the target or better on the next card, so a spot is kept only when
// that count has one reading:
// - the target is a flush, a straight or three of a kind, never one pair or two pair (the
//   validator refuses those: board pairings would count as outs);
// - the board is not paired and holds at most two cards of a suit, so no out is a card that
//   helps every player through the board alone;
// - every out makes the target itself, not only a stronger hand of another kind (a straight
//   draw that is also a flush draw would count the flush cards as outs "to a straight");
// - on the turn, no out makes the target from the board and that card alone;
// - the target is not made yet, and at least one out exists.
export type OutsTarget = "flush" | "straight" | "three-of-a-kind";

const TARGETS: readonly (readonly [OutsTarget, number])[] = [
  ["flush", 0.35],
  ["straight", 0.45],
  ["three-of-a-kind", 0.2],
];

const RANKS: readonly RankValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

interface Spot {
  readonly hole: Card[];
  readonly board: Card[];
}

function straightWindow(top: RankValue): RankValue[] {
  return top === 5 ? [14, 2, 3, 4, 5] : RANKS.slice(top - 6, top - 1);
}

function inSuits(random: Random, ranks: readonly RankValue[]): Card[] {
  return ranks.map((rank) => ({ rank, suit: pickOne(random, SUITS) }));
}

function withExtra(random: Random, hole: Card[], board: Card[], boardSize: number): Spot {
  const extra = drawCards(random, [...hole, ...board], boardSize - board.length);
  return { hole: shuffleWith(random, hole), board: shuffleWith(random, [...board, ...extra]) };
}

// Both hole cards in the suit, so no flush out plays from the board alone (a three-flush
// board is refused anyway by `cleanBoard`).
function flushSpot(random: Random, boardSize: number): Spot | null {
  const suit = pickOne(random, SUITS);
  const [a, b, c, d] = pickSome(random, RANKS, 4).map((rank) => ({ rank, suit }));
  const offSuit = unseenCards([]).filter((card) => card.suit !== suit);
  const extra = pickSome(random, offSuit, boardSize - 2);
  return { hole: [a, b], board: shuffleWith(random, [c, d, ...extra]) };
}

// Four of five ranks in a row, two of them in the hand: open-ended or a gutshot, as the counter
// finds; the rest of the board may add more.
function straightSpot(random: Random, boardSize: number): Spot | null {
  const four = pickSome(random, straightWindow(pickOne(random, RANKS.slice(3))), 4);
  const cards = inSuits(random, four);
  return withExtra(random, cards.slice(0, 2), cards.slice(2), boardSize);
}

// One pair, with a hole card in it: a pocket pair, or a hole card the board pairs.
function tripsSpot(random: Random, boardSize: number): Spot | null {
  const [rank, other] = pickSome(random, RANKS, 2);
  const [s1, s2, s3] = pickSome(random, SUITS, 3);
  const spot =
    random() < 0.5
      ? withExtra(random, [{ rank, suit: s1 }, { rank, suit: s2 }], [], boardSize)
      : withExtra(random, [{ rank, suit: s1 }, { rank: other, suit: pickOne(random, SUITS) }], [{ rank, suit: s3 }], boardSize);
  return evaluate([...spot.hole, ...spot.board]).category === "one-pair" ? spot : null;
}

const SPOTS: Readonly<Record<OutsTarget, (random: Random, boardSize: number) => Spot | null>> = {
  flush: flushSpot,
  straight: straightSpot,
  "three-of-a-kind": tripsSpot,
};

function countBy<K>(items: readonly K[]): Map<K, number> {
  const counts = new Map<K, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return counts;
}

function hasStraight(cards: readonly Card[]): boolean {
  const ranks = new Set(cards.map((card) => card.rank));
  return RANKS.slice(3).some((top) => straightWindow(top).every((rank) => ranks.has(rank)));
}

// Whether the cards hold the target's own shape, whatever else they make.
export function holdsShape(cards: readonly Card[], target: OutsTarget): boolean {
  if (target === "flush") return Math.max(...countBy(cards.map((c) => c.suit)).values()) >= 5;
  if (target === "straight") return hasStraight(cards);
  return Math.max(...countBy(cards.map((c) => c.rank)).values()) >= 3;
}

function cleanBoard(board: readonly Card[]): boolean {
  const ranks = countBy(board.map((card) => card.rank));
  const suits = countBy(board.map((card) => card.suit));
  return Math.max(...ranks.values()) === 1 && Math.max(...suits.values()) <= 2;
}

// The outs of a spot that meets every condition above, or null.
function cleanOuts(spot: Spot, target: OutsTarget): Card[] | null {
  const known = [...spot.hole, ...spot.board];
  if (!cleanBoard(spot.board) || makesTarget(known, target)) return null;
  const outs = outsTo(spot.hole, spot.board, target);
  const clean =
    outs.length > 0 &&
    outs.every((card) => holdsShape([...known, card], target)) &&
    (spot.board.length === 3 || outs.every((card) => !makesTarget([...spot.board, card], target)));
  return clean ? outs : null;
}

function flushWords(spot: Spot, outs: readonly Card[]): string {
  const suit: Suit = outs[0].suit;
  const inHand = spot.hole.filter((card) => card.suit === suit).length;
  const onBoard = spot.board.filter((card) => card.suit === suit).length;
  return (
    `You have ${inHand + onBoard} ${suitPlural(suit)}: ${inHand} in your hand and ${onBoard} on the board. ` +
    `Each of the ${outs.length} ${suitPlural(suit)} you cannot see makes your flush: ${outs.length} outs.`
  );
}

function straightWords(outs: readonly Card[]): string {
  const counts = [...countBy(outs.map((card) => card.rank))].sort(([a], [b]) => b - a);
  const which = joinOr(counts.map(([rank]) => aRank(rank)));
  if (counts.length === 1) return `Only ${which} makes your straight. There are ${outs.length} of them: ${outs.length} outs.`;
  const even = counts.every(([, n]) => n === counts[0][1]);
  const tally = even ? `There are ${counts[0][1]} of each` : `That is ${outs.length} cards`;
  return `${capitalized(which)} makes your straight. ${tally}: ${outs.length} outs.`;
}

function tripsWords(outs: readonly Card[]): string {
  const rank = outs[0].rank;
  return `The ${outs.length} ${rankPlural(rank)} you cannot see each give you three of a kind: ${outs.length} outs.`;
}

// Three of a kind is explained by one rank only; a spot whose outs span two ranks is dealt again.
function explanation(spot: Spot, target: OutsTarget, outs: readonly Card[]): string | null {
  if (target === "flush") return new Set(outs.map((c) => c.suit)).size === 1 ? flushWords(spot, outs) : null;
  if (target === "straight") return straightWords(outs);
  return new Set(outs.map((c) => c.rank)).size === 1 ? tripsWords(outs) : null;
}

interface Found {
  readonly spot: Spot;
  readonly outs: Card[];
  readonly words: string;
}

function findSpot(random: Random, target: OutsTarget, boardSize: number): Found | null {
  const spot = SPOTS[target](random, boardSize);
  const outs = spot && cleanOuts(spot, target);
  const words = spot && outs && explanation(spot, target, outs);
  return spot && outs && words ? { spot, outs, words } : null;
}

const DISTRACTORS = [2, 3, 4, 6, 8, 9, 12, 13, 15];

export function dealOuts(seed: number): OutsExercise {
  const random = randomFrom(seed);
  const target = pickWeighted(random, TARGETS);
  const street = pickOne(random, ["flop", "turn"] as const);
  const { spot, outs, words } = firstAccepted("outs spot", () => findSpot(random, target, street === "flop" ? 3 : 4));
  const wrong = pickSome(random, DISTRACTORS.filter((n) => n !== outs.length), 2);
  const { options, answer } = placeKey(random, outs.length, wrong);
  return checked({
    id: dealtId("outs", seed),
    kind: "outs",
    prompt: `On the ${street}, how many outs do you have to ${categoryPhrase(target)}, with one card to come?`,
    hole: holeCodes(spot.hole),
    board: codes(spot.board),
    target,
    options,
    answer,
    explanation: words,
  });
}
