import { describe, expect, it } from "vitest";

import { parseCards } from "@/cards/card";
import { evaluate } from "@/cards/evaluate";

import { STORIES, storyFor } from "./catalog";
import { validateStories } from "./validate-story";

// Rule Q3, extended to stories by US-7: a slide that names a hand is written twice, once by the
// author as `key` and once here by the evaluator. A mismatch is resolved by reading both, never
// by copying this answer into the story unread.
function keyedSlides() {
  return STORIES.flatMap((story) =>
    story.slides.flatMap((slide, i) => (slide.key ? [{ where: `${story.unit} slide ${i + 1}`, slide }] : [])),
  );
}

function computedCategory(cards: readonly string[] | undefined): string {
  try {
    return evaluate(parseCards(cards ?? [])).category;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

describe("the written stories", () => {
  it("pass the structural validator", () => {
    expect(validateStories(STORIES)).toEqual([]);
  });

  it("show the hand each keyed slide names", () => {
    const keyed = keyedSlides();
    const wrong = keyed
      .map(({ where, slide }) => ({ where, written: slide.key, computed: computedCategory(slide.cards) }))
      .filter(({ written, computed }) => written !== computed);
    expect(keyed.length).toBeGreaterThan(0);
    expect(wrong).toEqual([]);
  });

  it("finds the hands story by its unit (US-8) and no story for an unknown id", () => {
    expect(storyFor("hands")?.unit).toBe("hands");
    expect(storyFor("nowhere")).toBeNull();
    expect(storyFor("")).toBeNull();
  });
});
