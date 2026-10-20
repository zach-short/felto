import { describe, expect, it } from "vitest";

import type { Grade, MixLine } from "@/gto/grade";

import {
  bigBlinds,
  costLine,
  emptyAllowanceLine,
  handsLeftLine,
  labelWord,
  mistakesLead,
  resultLine,
  solverLine,
  youDid,
} from "./review-words";

function graded(mix: readonly MixLine[], basis: "mix" | "cost"): Grade {
  return { kind: "graded", chosen: "call", mix, basis, frequency: null, costBb: 0, label: null };
}

describe("the words of a hand's review (board item 44)", () => {
  it("says what the player did", () => {
    expect(youDid("fold")).toBe("You folded");
    expect(youDid("3bet")).toBe("You 3-bet");
    expect(youDid("5bet")).toBe("You went all in");
  });

  it("names the solver's mix, leaving out what it never plays", () => {
    const mix = [
      { action: "fold" as const, frequency: 0.7, ev: 0 },
      { action: "call" as const, frequency: 0.3, ev: 0 },
      { action: "3bet" as const, frequency: 0, ev: -1.2 },
    ];
    expect(solverLine(graded(mix, "mix"))).toBe("The solver folds 70% and calls 30%.");
  });

  it("joins three parts with commas, and says when a part is under one percent", () => {
    const mix = [
      { action: "fold" as const, frequency: 0.5, ev: 0 },
      { action: "call" as const, frequency: 0.4996, ev: 0 },
      { action: "4bet" as const, frequency: 0.0004, ev: -0.4552 },
    ];
    expect(solverLine(graded(mix, "mix"))).toBe("The solver folds 50%, calls 50% and 4-bets under 1%.");
  });

  it("gives the best play by EV where the solver never holds the hand (BD-T24)", () => {
    const mix = [
      { action: "fold" as const, frequency: null, ev: 0 },
      { action: "call" as const, frequency: null, ev: -1.5546 },
      { action: "4bet" as const, frequency: null, ev: -7.4382 },
    ];
    expect(solverLine(graded(mix, "cost"))).toBe("The solver never holds this hand here. Its best play: fold.");
  });

  it("says why a spot off the tree or under the floor is not graded", () => {
    expect(solverLine({ kind: "off-tree", chosen: "call" })).toContain("off the solver's map");
    expect(solverLine({ kind: "unreached", chosen: "call", mix: [] })).toContain("almost never gets here");
  });

  it("never says GTO (BD-T14)", () => {
    const lines = [solverLine({ kind: "off-tree", chosen: "call" }), solverLine({ kind: "unreached", chosen: "fold", mix: [] })];
    expect(lines.some((line) => line.includes("GTO"))).toBe(false);
  });

  it("writes the cost, the label and the result", () => {
    expect(costLine(0)).toBe("Cost nothing");
    expect(costLine(0.4552)).toBe("Cost 0.46 bb");
    expect(costLine(0.0009)).toBe("Cost under 0.01 bb");
    expect(bigBlinds(1.4)).toBe("1.4 bb");
    expect(labelWord("good")).toBe("Good");
    expect(labelWord("mistake")).toBe("Mistake");
    expect(labelWord(null)).toBeNull();
    expect(resultLine(3)).toBe("You won 3 bb.");
    expect(resultLine(-2.5)).toBe("You lost 2.5 bb.");
    expect(resultLine(0)).toBe("You broke even.");
  });
});

describe("the words of the summary and the start button (board item 44)", () => {
  it("leads with the count of mistakes (BD-T34)", () => {
    expect(mistakesLead(2, 18)).toBe("2 mistakes in 18 decisions");
    expect(mistakesLead(1, 1)).toBe("1 mistake in 1 decision");
    expect(mistakesLead(0, 9)).toBe("No mistakes in 9 decisions");
  });

  it("counts the hands left, and says when there are none", () => {
    expect(handsLeftLine(7)).toBe("7 hands left for today");
    expect(handsLeftLine(1)).toBe("1 hand left for today");
    expect(emptyAllowanceLine(10)).toBe("That's all 10 hands for today. The table opens again tomorrow.");
  });
});
