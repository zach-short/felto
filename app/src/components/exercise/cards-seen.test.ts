import { describe, expect, it } from "vitest";

import { UNITS } from "@/content/catalog";
import type { Exercise } from "@/content/schema";
import { dealExercise } from "@/drills/deal";

import { cardsSeenFact, exerciseScene } from "./exercise-view-model";

const WRITTEN: Exercise[] = UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => [...lesson.exercises]));
const DEALT: Exercise[] = Array.from({ length: 2000 }, (_, seed) => dealExercise("odds", seed));

// The last fact of an equity or call exercise is the cards it lets the player see
function seenTile(ex: Exercise) {
  const scene = exerciseScene(ex);
  return scene.kind === "facts" ? scene.facts[scene.facts.length - 1] : null;
}

describe("cardsSeenFact (audit of item 19)", () => {
  it("names the street a decision buys and counts cards in the singular or plural", () => {
    expect(cardsSeenFact("flop", 1)).toEqual({ label: "The turn only", value: "1 card" });
    expect(cardsSeenFact("flop", 2)).toEqual({ label: "Turn and river", value: "2 cards" });
    expect(cardsSeenFact("turn", 1)).toEqual({ label: "The river", value: "1 card" });
  });

  it("agrees with the prompt's street for every written and dealt exercise", () => {
    for (const ex of [...WRITTEN, ...DEALT]) {
      if (ex.kind !== "odds" || ex.ask === "pot-odds") continue;
      const tile = seenTile(ex);
      expect(tile).toEqual(cardsSeenFact(ex.street, ex.cardsToCome));
      expect(tile?.value).not.toMatch(/^1 cards/);
      if (/flop/i.test(ex.prompt)) expect(tile?.label).not.toBe("The river");
      if (/only the river/i.test(ex.prompt)) expect(tile?.label).toBe("The river");
    }
  });
});
