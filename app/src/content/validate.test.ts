import { describe, expect, it } from "vitest";

import { OUTLINE } from "./outline";
import type { Exercise, Lesson, Unit } from "./schema";
import { validateExercise, validateUnits } from "./validate";

const base = { prompt: "Which is right?", explanation: "Because.", answer: 0 };

function concept(id: string): Exercise {
  return { ...base, id, kind: "concept", options: ["yes", "no"] };
}

// A unit that passes: the outline's ids and titles, and ten concept exercises in each lesson.
function goodUnit(): Unit {
  const outline = OUTLINE[0];
  const lessons: Lesson[] = outline.lessons.map((lesson) => ({
    ...lesson,
    exercises: Array.from({ length: 10 }, (_, i) => concept(`${lesson.id}-${i + 1}`)),
  }));
  return { id: outline.id, title: outline.title, lessons };
}

function withExercise(unit: Unit, ex: Exercise): Unit {
  const [first, ...rest] = unit.lessons;
  return { ...unit, lessons: [{ ...first, exercises: [ex, ...first.exercises.slice(1)] }, ...rest] };
}

describe("the structural validator", () => {
  it("passes a whole, well-formed unit", () => {
    expect(validateUnits([goodUnit()])).toEqual([]);
  });

  it("counts ten exercises per lesson and five lessons per unit", () => {
    const unit = goodUnit();
    const short = { ...unit, lessons: unit.lessons.slice(0, 4) };
    const thin = { ...unit, lessons: [{ ...unit.lessons[0], exercises: unit.lessons[0].exercises.slice(1) }, ...unit.lessons.slice(1)] };
    expect(validateUnits([short])).toContain("hands: 4 lessons, not 5");
    expect(validateUnits([thin])).toContain("hands-1: 9 exercises, not 10");
  });

  it("finds an id used twice, in one unit or across two", () => {
    const unit = goodUnit();
    expect(validateUnits([withExercise(unit, concept("hands-1-2"))])).toContain('id "hands-1-2" is used more than once');
    expect(validateUnits([unit, unit])).toContain('id "hands" is used more than once');
  });

  it("finds a lesson or unit that does not match the outline", () => {
    const unit = goodUnit();
    const renamed = { ...unit, lessons: [{ ...unit.lessons[0], title: "Something else" }, ...unit.lessons.slice(1)] };
    expect(validateUnits([renamed]).join()).toContain("not as the outline has it");
    expect(validateUnits([{ ...unit, title: "Cards" }])).toContain("hands: not titled as the outline has it");
  });

  it.each([
    ["one option", { ...base, id: "x", kind: "concept", options: ["yes"] }, "x: has 1 options, not two to four"],
    ["five options", { ...base, id: "x", kind: "concept", options: ["a", "b", "c", "d", "e"] }, "x: has 5 options, not two to four"],
    ["the same option twice", { ...base, id: "x", kind: "concept", options: ["a", "a"] }, "x: two options are the same"],
    ["a key past the options", { ...base, id: "x", kind: "concept", options: ["a", "b"], answer: 2 }, "x: answer 2 is not an option index"],
    ["an empty explanation", { ...base, id: "x", kind: "concept", options: ["a", "b"], explanation: " " }, "x: empty prompt or explanation"],
  ] satisfies [string, Exercise, string][])("finds %s", (_, ex, problem) => {
    expect(validateExercise(ex)).toContain(problem);
  });

  it("finds a card dealt twice in one spot, and a code that is not a card", () => {
    const twice: Exercise = {
      ...base, id: "x", kind: "showdown", board: ["As", "Kd", "7c", "4h", "2s"],
      players: [["Qs", "Qd"], ["As", "3c"]], options: [[0], [1]],
    };
    expect(validateExercise(twice)).toContain("x: a card is dealt twice");
    const odd = { ...base, id: "y", kind: "hand-name", cards: ["As", "Kd", "Qc", "Jh", "1s"], options: ["straight", "flush"] };
    expect(validateExercise(odd as Exercise)).toContain('y: not a card code: "1s"');
  });

  it("checks the size of each kind's spot", () => {
    const four: Exercise = { ...base, id: "x", kind: "hand-name", cards: ["As", "Kd", "Qc", "Jh"], options: ["straight", "flush"] };
    const flop: Exercise = {
      ...base, id: "y", kind: "showdown", board: ["As", "Kd", "7c"],
      players: [["Qs", "Qd"], ["Ac", "3c"]], options: [[0], [1]],
    };
    expect(validateExercise(four)).toContain("x: 4 cards, not 5 to 7");
    expect(validateExercise(flop)).toContain("y: 3 board cards, not 5 to 5");
  });

  it("finds a showdown option that names a player not at the table", () => {
    const ex: Exercise = {
      ...base, id: "x", kind: "showdown", board: ["As", "Kd", "7c", "4h", "2s"],
      players: [["Qs", "Qd"], ["Ac", "3c"]], options: [[0], [2]],
    };
    expect(validateExercise(ex).join()).toContain("a player not at the table");
  });

  it("counts two showdown options that name the same players in another order as the same", () => {
    const ex: Exercise = {
      ...base, id: "x", kind: "showdown", board: ["Ts", "Jd", "Qc", "Kh", "As"],
      players: [["2h", "3d"], ["4c", "5s"]], options: [[0, 1], [1, 0]],
    };
    expect(validateExercise(ex)).toContain("x: two options are the same");
  });

  it.each(["one-pair", "two-pair"] as const)("refuses outs to %s, which count cards that pair the board", (target) => {
    // Ah Kd on 7c 2s 9h has 15 outs to one pair by the counter, not the textbook 6.
    const ex: Exercise = {
      ...base, id: "x", kind: "outs", hole: ["Ah", "Kd"], board: ["7c", "2s", "9h"], target, options: [6, 15],
    };
    expect(validateExercise(ex)).toContain(
      `x: outs to ${target} would count cards that pair the board, which help every player`,
    );
  });

  it("refuses an equity option equal to the exact chance beside the rule's value", () => {
    const ex: Exercise = {
      ...base, id: "x", kind: "odds", ask: "equity", outs: 9, street: "flop", cardsToCome: 2, options: [35, 36], answer: 1,
    };
    expect(validateExercise(ex)).toEqual([
      "x: option 35 is the exact chance, a second right answer beside the rule's 36",
    ]);
  });

  it("finds an outs spot that already makes its target", () => {
    const ex: Exercise = {
      ...base, id: "x", kind: "outs", hole: ["Ah", "Kh"], board: ["7h", "2h", "9h"], target: "flush", options: [0, 9],
    };
    expect(validateExercise(ex)).toEqual(["x: already makes flush"]);
  });

  it("finds odds a rounding or a rule of thumb would decide", () => {
    const odds = { ...base, kind: "odds" as const };
    const half: Exercise = { ...odds, id: "x", ask: "pot-odds", pot: 6, bet: 1, options: [12, 13] };
    const turnTwo: Exercise = { ...odds, id: "y", ask: "equity", outs: 9, street: "turn", cardsToCome: 2, options: [18, 36] };
    // 9 outs twice to come: the rule says 36%, the exact chance is 34.97%, and the price is 35.47%.
    const close: Exercise = {
      ...odds, id: "z", ask: "call", pot: 100, bet: 122, outs: 9, street: "flop", cardsToCome: 2, options: ["call", "fold"],
    };
    expect(validateExercise(half)).toEqual(["x: the price falls on a half percent"]);
    expect(validateExercise(turnTwo)).toEqual(["y: two cards come only from the flop"]);
    expect(validateExercise(close)).toEqual(["z: the rule of 2 and 4 and the exact chance disagree"]);
  });

  it("passes a clean odds exercise of each kind", () => {
    const odds = { ...base, kind: "odds" as const };
    expect(validateExercise({ ...odds, id: "a", ask: "pot-odds", pot: 100, bet: 50, options: [25, 33] })).toEqual([]);
    expect(validateExercise({ ...odds, id: "b", ask: "equity", outs: 8, street: "flop", cardsToCome: 2, options: [16, 32] })).toEqual([]);
    expect(
      validateExercise({ ...odds, id: "c", ask: "call", pot: 100, bet: 50, outs: 9, street: "turn", cardsToCome: 1, options: ["call", "fold"] }),
    ).toEqual([]);
  });
});
