import { describe, expect, it } from "vitest";

import { CATEGORIES, categoryRank, type HandCategory } from "@/cards/evaluate";

import { storyHands } from "./hands";
import type { Slide } from "./schema";

// What is true of the hands story only (PLAN.md phase 3). `story-catalog.test.ts` already
// evaluates every keyed row; these tests pin that the words agree with the rows, and that the
// story meets its terms in the order unit 1 teaches them, which no other gate reads (the plan's
// watch-for: a term used before the lessons teach it passes every gate).

const SLIDES: readonly Slide[] = storyHands.slides;

// Longest names first, so "two pair" is not read as "pair" and "royal flush" not as "flush"
const HAND_NAMES: readonly (readonly [string, HandCategory])[] = [
  ["royal flush", "royal-flush"],
  ["straight flush", "straight-flush"],
  ["four of a kind", "four-of-a-kind"],
  ["full house", "full-house"],
  ["three of a kind", "three-of-a-kind"],
  ["two pair", "two-pair"],
  ["high card", "high-card"],
  ["flush", "flush"],
  ["straight", "straight"],
  ["pair", "one-pair"],
];
const CATEGORY_OF = new Map(HAND_NAMES);
// A plural counts too, so the title "Straights and flushes" names both hands
const HAND_PATTERN = new RegExp(`\\b(${HAND_NAMES.map(([name]) => name).join("|")})(?:e?s)?\\b`, "gi");

// The order of the lessons in content/units/hands.ts: hands-1 (deck, suits, ranks, hole cards,
// the board, the best five), hands-2 (the hands, from the bottom here) and hands-4 (kickers, then
// the pot, which hands-4 brings in with its first showdown)
const TERMS_IN_LESSON_ORDER: readonly RegExp[] = [
  /\bdeck\b/i, /\bsuits?\b/i, /\branks?\b/i, /\bhole cards?\b/i, /\bboard\b/i, /\bbest five\b/i,
  /\bhigh card\b/i, /\bkickers?\b/i, /\bpot\b/i,
];

function words(slide: Slide): string {
  return `${slide.title}. ${slide.body}`;
}

function categoryOf(name: string): HandCategory {
  const category = CATEGORY_OF.get(name.toLowerCase());
  if (category === undefined) throw new Error(`not a hand name: "${name}"`);
  return category;
}

// The hands a slide names, in reading order, title first
function handsNamed(slide: Slide): HandCategory[] {
  return [...words(slide).matchAll(HAND_PATTERN)].map((match) => categoryOf(match[1]));
}

// Each hand once, with the slide that names it first, in reading order
function firstMentions(): { category: HandCategory; slide: number }[] {
  const seen = new Set<HandCategory>();
  return SLIDES.flatMap((slide, index) =>
    handsNamed(slide).flatMap((category) => {
      if (seen.has(category)) return [];
      seen.add(category);
      return [{ category, slide: index }];
    }),
  );
}

function firstSlideWith(term: RegExp): number {
  return SLIDES.findIndex((slide) => term.test(words(slide)));
}

describe("the hands story", () => {
  it("names, in each keyed slide's words, the hand its cards make", () => {
    const unnamed = SLIDES.filter((slide) => slide.key && !handsNamed(slide).includes(slide.key));
    expect(unnamed.map((slide) => slide.title)).toEqual([]);
  });

  it("keys every card row whose slide names a hand", () => {
    const unkeyed = SLIDES.filter((slide) => slide.cards && !slide.key && handsNamed(slide).length > 0);
    expect(unkeyed.map((slide) => slide.title)).toEqual([]);
  });

  it("names all ten hands, meeting them from high card up", () => {
    expect(firstMentions().map(({ category }) => category)).toEqual(CATEGORIES);
  });

  it("shows a stronger example on each slide that brings in new hands", () => {
    const introducing = [...new Set(firstMentions().map(({ slide }) => slide))];
    const ranks = introducing.map((index) => {
      const key = SLIDES[index].key;
      return key ? categoryRank(key) : -1;
    });
    expect(ranks).not.toContain(-1);
    expect(ranks.every((rank, i) => i === 0 || rank > ranks[i - 1])).toBe(true);
  });

  it("meets its terms in the order unit 1 teaches them", () => {
    const first = TERMS_IN_LESSON_ORDER.map(firstSlideWith);
    expect(first).not.toContain(-1);
    expect(first).toEqual([...first].sort((a, b) => a - b));
  });

  it("keeps every card row to 2 to 5 cards, the widths that read best on a phone", () => {
    const rows = SLIDES.flatMap((slide) => (slide.cards ? [slide.cards.length] : []));
    expect(rows.filter((size) => size < 2 || size > 5)).toEqual([]);
  });

  it("promises no lesson on the last slide, whose one button goes back to the path (US-6)", () => {
    expect(words(SLIDES[SLIDES.length - 1])).not.toMatch(/\b(lessons?|start|begin)\b/i);
  });
});
