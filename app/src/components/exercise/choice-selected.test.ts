import { describe, expect, it } from "vitest";

import { choiceMarks, choiceSelected } from "./exercise-view-model";
import { heartsLabel } from "@/components/lesson/hearts-label";

describe("choiceSelected (audit of item 13, finding 6)", () => {
  it("selects only the player's choice, not the right answer marked after a wrong one", () => {
    const marks = choiceMarks(3, 0, 2, true);
    expect(marks).toEqual(["wrong", "plain", "right"]);
    expect(choiceSelected(3, 0)).toEqual([true, false, false]);
  });

  it("selects nothing before a choice", () => {
    expect(choiceSelected(2, null)).toEqual([false, false]);
  });
});

describe("heartsLabel (audit of item 13, finding 6)", () => {
  it("uses D10's word with the right number", () => {
    expect(heartsLabel(1)).toBe("1 heart");
    expect(heartsLabel(0)).toBe("0 hearts");
    expect(heartsLabel(5)).toBe("5 hearts");
  });
});
