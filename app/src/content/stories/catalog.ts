import { storyHands } from "./hands";
import type { Story } from "./schema";

// Every written story. US-8: only the hands unit has one in this effort; the table, preflop and
// odds stories are later items. A unit missing here has no story, so its header shows no button
// and its story route draws the not-found view (US-4). `story-catalog.test.ts` validates every
// story listed here, so a story that is not listed is not checked.
export const STORIES: readonly Story[] = [storyHands];

export function storyFor(unitId: string): Story | null {
  return STORIES.find((story) => story.unit === unitId) ?? null;
}
