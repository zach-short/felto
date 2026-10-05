import { describe, expect, it } from "vitest";

import { STORY_START, storyStep, type StoryEvent, type StoryState } from "@/components/story/story-step";

const SIZE = 6;
const forward: StoryEvent = { type: "forward", size: SIZE };
const back: StoryEvent = { type: "back" };

function play(events: readonly StoryEvent[], from: StoryState = STORY_START): StoryState {
  return events.reduce(storyStep, from);
}

describe("storyStep", () => {
  it("starts on the first slide, not closing", () => {
    expect(STORY_START).toEqual({ index: 0, closing: false });
  });

  it("does nothing on a back tap on the first slide, and keeps the same state", () => {
    expect(storyStep(STORY_START, back)).toBe(STORY_START);
  });

  it("moves forward one slide and back one slide", () => {
    expect(play([forward, forward])).toEqual({ index: 2, closing: false });
    expect(play([forward, forward, back])).toEqual({ index: 1, closing: false });
  });

  it("asks to close on a forward tap on the last slide, and stays on it", () => {
    const last = play(Array.from({ length: SIZE - 1 }, () => forward));
    expect(last).toEqual({ index: SIZE - 1, closing: false });
    expect(storyStep(last, forward)).toEqual({ index: SIZE - 1, closing: true });
  });

  it("closes from any slide on close, then takes no more events", () => {
    const closing = play([forward, { type: "close" }]);
    expect(closing).toEqual({ index: 1, closing: true });
    for (const event of [forward, back, { type: "close" } as const]) {
      expect(storyStep(closing, event)).toBe(closing);
    }
  });

  it("closes a one-slide story on the first forward tap", () => {
    expect(storyStep(STORY_START, { type: "forward", size: 1 })).toEqual({ index: 0, closing: true });
  });

  it("never leaves the slides, whatever the taps", () => {
    const events: StoryEvent[] = [back, forward, back, back, forward, forward, forward, back, forward, forward, forward, forward];
    let story = STORY_START;
    for (const event of events) {
      story = storyStep(story, event);
      expect(story.index).toBeGreaterThanOrEqual(0);
      expect(story.index).toBeLessThan(SIZE);
    }
    expect(story.closing).toBe(true);
  });
});
