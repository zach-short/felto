// The story's words outside the slides. Outside React Native, so vitest can read them.

// US-6: the last slide's one button, which never starts a lesson
export const STORY_DONE = "Back to the path";

export const STORY_CLOSE_LABEL = "Close the story";

// Rule U4, the error state: a unit with no story, reached only by a link, since the header shows
// no button for it (US-4)
export const STORY_MISSING = { title: "Story not found.", line: "This unit has no story yet." } as const;

// What a screen reader hears for the swipe up and down on a slide
export const STORY_ACTION_LABELS = { next: "Next slide", previous: "Previous slide" } as const;

// US-5: "Learn about {unit title in lower case}", so "Learn about hands" for unit 1
export function storyButtonLabel(unitTitle: string): string {
  return `Learn about ${unitTitle.toLowerCase()}`;
}

export function slidePosition(index: number, count: number): string {
  return `Slide ${index + 1} of ${count}`;
}
