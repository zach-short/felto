// A story as it is tapped through (US-6): the slide on screen, and whether the story is closing.
// Pure, so its edges are tested in node, in the style of runStep (components/lesson/lesson-run.ts).
export type StoryState = { index: number; closing: boolean };

export type StoryEvent = { type: "back" } | { type: "forward"; size: number } | { type: "close" };

export const STORY_START: StoryState = { index: 0, closing: false };

// A closing story takes no more events, so a second tap in the same frame cannot close the
// screen under it twice. Back on the first slide does nothing and keeps the same state.
export function storyStep(story: StoryState, event: StoryEvent): StoryState {
  if (story.closing) return story;
  if (event.type === "close") return { ...story, closing: true };
  if (event.type === "back") return story.index > 0 ? { ...story, index: story.index - 1 } : story;
  return forwarded(story, event.size);
}

// PLAN.md phase 2: forward on the last slide asks to close, the same as "Back to the path"
function forwarded(story: StoryState, size: number): StoryState {
  if (story.index + 1 >= size) return { ...story, closing: true };
  return { ...story, index: story.index + 1 };
}
