import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";

import type { Slide, Story } from "./schema";
import { validateStories, validateStory, wordCount } from "./validate-story";

const plain: Slide = { pose: "happy", title: "Ranks", body: "A deck has 52 cards." };

function story(slides: readonly Slide[], unit: Story["unit"] = "hands"): Story {
  return { unit, slides };
}

function slides(count: number): Slide[] {
  return Array.from({ length: count }, () => plain);
}

function words(count: number): string {
  return Array.from({ length: count }, (_, i) => `word${i}`).join(" ");
}

// A story of the fewest slides, with one slide changed
function withSlide(slide: Slide): Story {
  return story([slide, ...slides(DIALS.storySlidesPerUnit.min - 1)]);
}

describe("the story validator", () => {
  it("passes the fewest and the most slides the dial allows", () => {
    expect(validateStory(story(slides(DIALS.storySlidesPerUnit.min)))).toEqual([]);
    expect(validateStory(story(slides(DIALS.storySlidesPerUnit.max)))).toEqual([]);
  });

  it("counts the slides against the dial", () => {
    const { min, max } = DIALS.storySlidesPerUnit;
    expect(validateStory(story(slides(min - 1)))).toEqual([`hands: ${min - 1} slides, not ${min} to ${max}`]);
    expect(validateStory(story(slides(max + 1)))).toEqual([`hands: ${max + 1} slides, not ${min} to ${max}`]);
    expect(validateStory(story([]))).toEqual([`hands: 0 slides, not ${min} to ${max}`]);
  });

  it("counts the body's words against the dial, at the edge", () => {
    const most = DIALS.storyWordsPerSlide;
    expect(validateStory(withSlide({ ...plain, body: words(most) }))).toEqual([]);
    expect(validateStory(withSlide({ ...plain, body: words(most + 1) }))).toEqual([
      `hands slide 1: ${most + 1} words, more than ${most}`,
    ]);
  });

  it("counts words across spaces, line breaks and a leading space", () => {
    expect(wordCount(" Five more cards\nland face  up. ")).toBe(6);
    expect(wordCount("")).toBe(0);
  });

  it.each([
    ["an empty title", { ...plain, title: " " }, "hands slide 1: empty title or body"],
    ["an empty body", { ...plain, body: "" }, "hands slide 1: empty title or body"],
    ["a card that is not a card", { ...plain, cards: ["As", "1h"] }, 'hands slide 1: not a card code: "1h"'],
    ["a card shown twice", { ...plain, cards: ["As", "Kd", "As"] }, "hands slide 1: a card is shown twice"],
    ["an empty row of cards", { ...plain, cards: [] }, "hands slide 1: an empty row of cards"],
    ["a named hand with no cards", { ...plain, key: "flush" }, "hands slide 1: names a hand but shows no cards"],
  ] as [string, Slide, string][])("finds %s", (_, slide, problem) => {
    expect(validateStory(withSlide(slide))).toEqual([problem]);
  });

  it("passes a row of cards with the hand it names", () => {
    const flush: Slide = { ...plain, cards: ["Ah", "Jh", "8h", "5h", "2h"], key: "flush" };
    expect(validateStory(withSlide(flush))).toEqual([]);
  });

  it("finds two stories for one unit", () => {
    const one = story(slides(DIALS.storySlidesPerUnit.min));
    expect(validateStories([one, one])).toEqual(['unit "hands" has more than one story']);
    expect(validateStories([one, story(one.slides, "table")])).toEqual([]);
  });
});
