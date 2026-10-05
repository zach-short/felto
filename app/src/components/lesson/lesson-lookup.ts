import { PATH_OUTLINE } from "@/components/path/path-outline";
import { UNITS } from "@/content/catalog";
import type { Lesson } from "@/content/schema";
import { isOpenAtLives } from "@/game/lives";
import { pathNodes } from "@/game/path";
import type { PlayerState } from "@/game/player-state";

export type LessonAccess =
  | { kind: "open"; lesson: Lesson }
  | { kind: "missing" }
  | { kind: "locked" }
  | { kind: "no-lives" };

export function findLesson(id: string): Lesson | null {
  for (const unit of UNITS) {
    const lesson = unit.lessons.find((candidate) => candidate.id === id);
    if (lesson) return lesson;
  }
  return null;
}

// D8: a lesson opens when the one before it is finished, and closes at 0 lives. A finished
// lesson stays open to play again; the path draws it as complete. `skipLock` is for the
// development link only (lesson-screen.tsx), so any exercise can be seen without a fixture.
export function lessonAccess(state: PlayerState, id: string, now: Date, skipLock = false): LessonAccess {
  const lesson = findLesson(id);
  if (!lesson) return { kind: "missing" };
  const node = pathNodes(state, PATH_OUTLINE).find((candidate) => candidate.id === id);
  if (!skipLock && (!node || node.status === "locked")) return { kind: "locked" };
  if (!isOpenAtLives("lesson", state, now)) return { kind: "no-lives" };
  return { kind: "open", lesson };
}
