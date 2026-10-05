import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";

import { OUTLINE, unitOutline } from "./outline";

describe("the outline of the four units", () => {
  it("holds the units of D7 in path order", () => {
    expect(OUTLINE.map((unit) => unit.title)).toEqual(["Hands", "The table", "Preflop", "Outs and odds"]);
  });

  it("gives every unit the dial's number of lessons, each with a title", () => {
    for (const unit of OUTLINE) {
      expect(unit.lessons).toHaveLength(DIALS.lessonsPerUnit);
      for (const lesson of unit.lessons) expect(lesson.title.trim()).not.toBe("");
    }
  });

  it("uses every id once", () => {
    const ids = OUTLINE.flatMap((unit) => [unit.id, ...unit.lessons.map((lesson) => lesson.id)]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("finds a unit by its id", () => {
    expect(unitOutline("odds").title).toBe("Outs and odds");
  });
});
