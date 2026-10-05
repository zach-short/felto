import type { Card } from "@/cards/card";
import { categoryName } from "@/cards/describe";
import type { HandCategory, HandValue } from "@/cards/evaluate";
import { showdownValues, showdownWinners } from "@/cards/showdown";
import type { ShowdownExercise } from "@/content/schema";

import { checked, dealtId } from "./checked";
import { codes, drawCards, holeCodes } from "./draw";
import { placeKey } from "./options";
import { firstAccepted, pickOne, pickWeighted, randomFrom, type Random } from "./random";
import { aRank, capitalized, categoryPhrase, handPhrase, joinAnd, rankPlural, rankWord } from "./words";

// A dealt `showdown` exercise (`DESIGN.md` D21): a full board and two or three players. A plain
// deal splits the pot about one time in twenty-five, so one deal in five is redealt until it
// splits, to teach that a tie is a real answer (judgment call, phase 14).
const SPLIT_SHARE = 0.2;

interface Table {
  readonly board: Card[];
  readonly holes: Card[][];
}

function dealTable(random: Random, players: number): Table {
  const cards = drawCards(random, [], 5 + 2 * players);
  const holes = Array.from({ length: players }, (_, i) => cards.slice(5 + 2 * i, 7 + 2 * i));
  return { board: cards.slice(0, 5), holes };
}

const SINGLES: Readonly<Record<2 | 3, number[][]>> = { 2: [[0], [1]], 3: [[0], [1], [2]] };
const SPLITS: Readonly<Record<2 | 3, number[][]>> = { 2: [[0, 1]], 3: [[0, 1], [0, 2], [1, 2], [0, 1, 2]] };

function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((n) => b.includes(n));
}

// Every single winner is always offered, so the player picks a seat; one tie fills the fourth
// place at three players. Options are distinct as sets, which the validator also checks.
function distractors(random: Random, key: number[], players: 2 | 3): number[][] {
  const others = (sets: number[][]) => sets.filter((set) => !sameSet(set, key));
  const singles = others(SINGLES[players]);
  if (players === 2) return [...singles, ...others(SPLITS[2])];
  return key.length > 1 ? singles : [...singles, pickOne(random, SPLITS[3])];
}

function seatName(index: number): string {
  return `player ${index + 1}`;
}

interface MadeHand {
  readonly words: string;
  readonly plural: boolean;
}

// The made part of a hand, the ranks its hand phrase names: "tens", "kings and fives",
// "a nine-high straight" without its article. `plural` picks "beat" or "beats".
function madeHand(value: HandValue): MadeHand {
  const [a, b] = value.ranks;
  switch (value.category) {
    case "one-pair":
      return { words: rankPlural(a), plural: true };
    case "two-pair":
      return { words: `${rankPlural(a)} and ${rankPlural(b)}`, plural: true };
    case "three-of-a-kind":
      return { words: `three ${rankPlural(a)}`, plural: true };
    case "four-of-a-kind":
      return { words: `four ${rankPlural(a)}`, plural: true };
    case "full-house":
      return { words: `${rankPlural(a)} full of ${rankPlural(b)}`, plural: false };
    case "high-card":
      return { words: `${rankWord(a)} high`, plural: false };
    default:
      return { words: `${rankWord(a)}-high ${categoryName(value.category).toLowerCase()}`, plural: false };
  }
}

// "Kickers" are the cards beside a pair, trips or quads. A flush or high card has no made part
// beyond its top card, so its tie is read card by card from the top instead (review, phase 14).
const KICKER_CATEGORIES: readonly HandCategory[] = ["one-pair", "two-pair", "three-of-a-kind", "four-of-a-kind"];

// Why the winning hand beats the strongest losing one, in words that hold for every deal: a
// higher category, a higher made hand inside one category, or the first card that differs.
function verdict(winner: number, w: HandValue, loser: number, l: HandValue): string {
  if (w.category !== l.category) {
    return `${capitalized(categoryPhrase(w.category))} beats ${categoryPhrase(l.category)}.`;
  }
  if (handPhrase(w) !== handPhrase(l)) {
    const [mw, ml] = [madeHand(w), madeHand(l)];
    return `${capitalized(seatName(winner))}'s ${mw.words} ${mw.plural ? "beat" : "beats"} ${seatName(loser)}'s ${ml.words}.`;
  }
  const i = w.ranks.findIndex((rank, k) => rank !== l.ranks[k]);
  const tie = KICKER_CATEGORIES.includes(w.category) ? ", so the kickers decide it" : ". Compare the cards from the top";
  const both = `${capitalized(seatName(winner))} and ${seatName(loser)} both have ${handPhrase(w)}`;
  return `${both}${tie}: ${aRank(w.ranks[i])} beats ${aRank(l.ranks[i])}.`;
}

function handsLine(values: readonly HandValue[]): string {
  return values.map((v, i) => `${capitalized(seatName(i))}: ${handPhrase(v)}.`).join(" ");
}

function splitLine(winners: readonly number[], value: HandValue): string {
  const names = joinAnd(winners.map(seatName));
  return `${capitalized(names)} each have ${handPhrase(value)}, with the same five ranks, so they split the pot.`;
}

function explanation(values: readonly HandValue[], winners: readonly number[]): string {
  const losers = values.map((_, i) => i).filter((i) => !winners.includes(i));
  const best = winners[0];
  const strongest = losers.sort((a, b) => values[b].score - values[a].score)[0];
  // When every player splits, the split line already names the one hand they all have.
  const parts = strongest === undefined ? [] : [handsLine(values)];
  if (winners.length > 1) parts.push(splitLine(winners, values[best]));
  if (strongest !== undefined) parts.push(verdict(best, values[best], strongest, values[strongest]));
  return parts.join(" ");
}

function wantedTable(random: Random, players: 2 | 3, wantSplit: boolean): Table | null {
  const table = dealTable(random, players);
  const split = showdownWinners(table.board, table.holes).length > 1;
  return !wantSplit || split ? table : null;
}

export function dealShowdown(seed: number): ShowdownExercise {
  const random = randomFrom(seed);
  const players = pickWeighted(random, [[2, 0.7], [3, 0.3]] as const);
  const wantSplit = random() < SPLIT_SHARE;
  const table = firstAccepted("showdown deal", () => wantedTable(random, players, wantSplit));
  const values = showdownValues(table.board, table.holes);
  const key = showdownWinners(table.board, table.holes);
  const { options, answer } = placeKey(random, key, distractors(random, key, players));
  return checked({
    id: dealtId("showdown", seed),
    kind: "showdown",
    prompt: "Who wins the pot?",
    board: codes(table.board),
    players: table.holes.map(holeCodes),
    options,
    answer,
    explanation: explanation(values, key),
  });
}
