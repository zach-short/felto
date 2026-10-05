import { OUTLINE } from "@/content/outline";
import type { PathOutline } from "@/game/path";

// The rules take a PathOutline and not the content schema (HANDOFF.md step 15), so the content's
// outline is mapped to it once, here, for every screen and the fixture route.
export const PATH_OUTLINE: PathOutline = {
  units: OUTLINE.map((unit) => ({ id: unit.id, lessonIds: unit.lessons.map((lesson) => lesson.id) })),
};
