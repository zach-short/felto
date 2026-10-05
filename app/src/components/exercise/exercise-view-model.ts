import type { CardCode } from "@/cards/card";
import { categoryName } from "@/cards/describe";
import type { Street } from "@/cards/odds";
import type { Exercise, OddsExercise } from "@/content/schema";

// What an exercise shows above its prompt (DESIGN.md 10.4), as plain data, so a test can check
// it without a phone. Every label here is user-facing copy (D10).

export type CardGroup = { label: string | null; cards: readonly CardCode[] };

export type Fact = { label: string; value: string };

export type ChoiceMark = "plain" | "chosen" | "right" | "wrong";

export type Scene =
  | { kind: "none" }
  | { kind: "cards"; groups: CardGroup[] }
  | { kind: "showdown"; board: CardGroup; players: CardGroup[] }
  | { kind: "facts"; facts: Fact[] };

// A board is five cards. The seven-card hand-name prompts say "two hole cards and five on the
// board", but the data does not mark the split (HANDOFF.md step 17), so the last five are the board.
const BOARD_SIZE = 5;

export function exerciseScene(ex: Exercise): Scene {
  switch (ex.kind) {
    case "concept":
      return { kind: "none" };
    case "hand-name":
      return { kind: "cards", groups: handNameGroups(ex.cards) };
    case "showdown":
      return {
        kind: "showdown",
        board: { label: "The board", cards: ex.board },
        players: ex.players.map((hole, i) => ({ label: `Player ${i + 1}`, cards: hole })),
      };
    case "preflop":
      return { kind: "cards", groups: [{ label: `Your hand, seat ${ex.seat}`, cards: ex.hole }] };
    case "outs":
      return { kind: "cards", groups: [holeGroup(ex.hole), { label: "The board", cards: ex.board }] };
    case "odds":
      return { kind: "facts", facts: oddsFacts(ex) };
  }
}

function holeGroup(cards: readonly CardCode[]): CardGroup {
  return { label: "Your hole cards", cards };
}

function handNameGroups(cards: readonly CardCode[]): CardGroup[] {
  if (cards.length <= BOARD_SIZE) return [{ label: null, cards }];
  const split = cards.length - BOARD_SIZE;
  return [holeGroup(cards.slice(0, split)), { label: "The board", cards: cards.slice(split) }];
}

function oddsFacts(ex: OddsExercise): Fact[] {
  if (ex.ask === "pot-odds") return priceFacts(ex.pot, ex.bet);
  const draw = [{ label: "Outs", value: String(ex.outs) }, cardsSeenFact(ex.street, ex.cardsToCome)];
  return ex.ask === "equity" ? draw : [...priceFacts(ex.pot, ex.bet), ...draw];
}

// The cards this decision lets the player see, named by street: on the flop a call that does not
// put the player all in buys only the turn, so a bare "1 card to come" beside "On the flop" read
// as a contradiction (audit of item 19). Unit 4 teaches x2 for one card seen and x4 for two.
export function cardsSeenFact(street: Street, cardsToCome: 1 | 2): Fact {
  const value = cardsToCome === 1 ? "1 card" : "2 cards";
  if (cardsToCome === 2) return { label: "Turn and river", value };
  return { label: street === "flop" ? "The turn only" : "The river", value };
}

function priceFacts(pot: number, bet: number): Fact[] {
  return [
    { label: "Pot", value: String(pot) },
    { label: "To call", value: String(bet) },
  ];
}

// The text on each answer choice, in the order of `options`
export function optionLabels(ex: Exercise): string[] {
  switch (ex.kind) {
    case "concept":
      return [...ex.options];
    case "hand-name":
      return ex.options.map(categoryName);
    case "showdown":
      return ex.options.map((winners) => showdownLabel(winners, ex.players.length));
    case "preflop":
      return ex.options.map((action) => (action === "raise" ? "Raise" : "Fold"));
    case "outs":
      return ex.options.map((count) => (count === 1 ? "1 out" : `${count} outs`));
    case "odds":
      return oddsLabels(ex);
  }
}

function oddsLabels(ex: OddsExercise): string[] {
  if (ex.ask === "call") return ex.options.map((choice) => (choice === "call" ? "Call" : "Fold"));
  return ex.options.map((percent) => `${percent}%`);
}

// `[1]` is "Player 2 wins"; a set of every player is a split of the whole pot
export function showdownLabel(winners: readonly number[], players: number): string {
  const names = winners.map((i) => i + 1);
  if (names.length === 1) return `Player ${names[0]} wins`;
  if (names.length === players) return "Split pot";
  return `Players ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]} split`;
}

// How each choice is drawn: before the check only the chosen one is marked; after it the right
// answer shows right, and a wrong choice shows wrong beside it
// Rule U4's accessibility half of the marks: only the player's own choice is selected. After a
// wrong answer the right one is marked green, but the player did not select it (audit of item 13).
export function choiceSelected(count: number, choice: number | null): boolean[] {
  return Array.from({ length: count }, (_, i) => i === choice);
}

export function choiceMarks(
  count: number,
  choice: number | null,
  answer: number,
  checked: boolean,
): ChoiceMark[] {
  return Array.from({ length: count }, (_, i) => {
    if (!checked) return i === choice ? "chosen" : "plain";
    if (i === answer) return "right";
    return i === choice ? "wrong" : "plain";
  });
}

// The right answer in words, for the wrong-answer feedback (D10)
export function answerLabel(ex: Exercise): string {
  return optionLabels(ex)[ex.answer] ?? "";
}
