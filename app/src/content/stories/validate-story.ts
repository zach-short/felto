import { hasDuplicate, parseCards } from "@/cards/card";
import { DIALS } from "@/config/dials";

import type { Slide, Story } from "./schema";

// The structural checks of docs/incomplete/unit-stories/PLAN.md phase 2. Each returns a list of
// problems, each naming the unit and the slide it is about; an empty list is a pass. Whether a
// keyed slide shows the hand it names is `story-catalog.test.ts`'s job, not this file's, as
// `computeKey` is for the lessons (`content/validate.ts`).

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function textProblems(where: string, slide: Slide): string[] {
  if (!slide.title.trim() || !slide.body.trim()) return [`${where}: empty title or body`];
  const words = wordCount(slide.body);
  return words > DIALS.storyWordsPerSlide ? [`${where}: ${words} words, more than ${DIALS.storyWordsPerSlide}`] : [];
}

function cardProblems(where: string, slide: Slide): string[] {
  if (slide.cards === undefined) return slide.key ? [`${where}: names a hand but shows no cards`] : [];
  if (slide.cards.length === 0) return [`${where}: an empty row of cards`];
  try {
    return hasDuplicate(parseCards(slide.cards)) ? [`${where}: a card is shown twice`] : [];
  } catch (error) {
    return [`${where}: ${error instanceof Error ? error.message : String(error)}`];
  }
}

export function validateStory(story: Story): string[] {
  const { min, max } = DIALS.storySlidesPerUnit;
  const count = story.slides.length;
  const problems = story.slides.flatMap((slide, i) => {
    const where = `${story.unit} slide ${i + 1}`;
    return [...textProblems(where, slide), ...cardProblems(where, slide)];
  });
  if (count < min || count > max) problems.push(`${story.unit}: ${count} slides, not ${min} to ${max}`);
  return problems;
}

// US-4: one story per unit, so the route `story/[unit]` finds at most one
export function validateStories(stories: readonly Story[]): string[] {
  const units = stories.map((story) => story.unit);
  const twice = [...new Set(units.filter((unit, i) => units.indexOf(unit) !== i))];
  return [...twice.map((unit) => `unit "${unit}" has more than one story`), ...stories.flatMap(validateStory)];
}
