import { describe, expect, it } from "vitest";

import type { CallExercise, ConceptExercise, HandNameExercise, ShowdownExercise } from "@/content/schema";
import { answerMoment } from "@/game/answer-moment";

const base = { prompt: "", explanation: "" };
const royal: HandNameExercise = {
  ...base,
  id: "t-royal",
  kind: "hand-name",
  cards: ["As", "Ks", "Qs", "Js", "Ts"],
  options: ["straight-flush", "royal-flush"],
  answer: 1,
};
const straightFlush: HandNameExercise = { ...royal, id: "t-sf", cards: ["9c", "8c", "7c", "6c", "5c"], answer: 0 };
// Player 2 holds the ace and king of hearts to the board's queen, jack and ten of hearts
const royalShowdown: ShowdownExercise = {
  ...base,
  id: "t-showdown",
  kind: "showdown",
  board: ["Qh", "Jh", "Th", "2c", "3d"],
  players: [["Ac", "Ad"], ["Ah", "Kh"]],
  options: [[0], [1], [0, 1]],
  answer: 1,
};
const allIn: CallExercise = {
  ...base,
  id: "t-all-in",
  kind: "odds",
  ask: "call",
  pot: 100,
  bet: 100,
  outs: 12,
  street: "flop",
  cardsToCome: 2,
  options: ["call", "fold"],
  answer: 0,
};
const concept: ConceptExercise = { ...base, id: "t-concept", kind: "concept", options: ["a", "b"], answer: 0 };

const rights = (count: number) => Array.from({ length: count }, () => true);

describe("the moment the feedback sheet plays (GF-24, GF-26)", () => {
  it("plays nothing for a wrong answer, even on a royal flush", () => {
    expect(answerMoment(royal, [true, false])).toBeNull();
  });

  it("plays the royal flush for a hand-name key and for a winning showdown hand", () => {
    expect(answerMoment(royal, [true])).toBe("royal_flush");
    expect(answerMoment(royalShowdown, [true])).toBe("royal_flush");
    expect(answerMoment(straightFlush, [true])).toBeNull();
    expect(answerMoment({ ...royalShowdown, players: [["Ac", "Ad"], ["2h", "2s"]], answer: 1 }, [true])).toBeNull();
  });

  it("plays the all-in win only for a call that sees both cards and whose key is to call", () => {
    expect(answerMoment(allIn, [true])).toBe("all_in_win");
    expect(answerMoment({ ...allIn, cardsToCome: 1 }, [true])).toBeNull();
    expect(answerMoment({ ...allIn, options: ["fold", "call"], answer: 0 }, [true])).toBeNull();
  });

  it("plays the hot streak on the fifth right answer in a row, and not before or after", () => {
    expect(answerMoment(concept, rights(4))).toBeNull();
    expect(answerMoment(concept, rights(5))).toBe("hot_streak");
    expect(answerMoment(concept, rights(6))).toBeNull();
    expect(answerMoment(concept, [false, ...rights(5)])).toBe("hot_streak");
  });

  it("plays the hot streak once in a session, even for a second run of five", () => {
    expect(answerMoment(concept, [...rights(5), false, ...rights(5)])).toBeNull();
  });

  it("lets a rarer moment take the fifth answer, and does not play the hot streak a step late", () => {
    expect(answerMoment(royal, rights(5))).toBe("royal_flush");
    expect(answerMoment(concept, rights(6))).toBeNull();
  });
});
