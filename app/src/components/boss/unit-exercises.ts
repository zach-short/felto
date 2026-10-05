import { UNITS } from "@/content/catalog";
import type { Exercise } from "@/content/schema";

// D8: a unit's fifty exercises, the five lessons in path order, are the pool the boss draws from
// and the review fills from. null for an id that is not a unit on the path (rule U4's error).
export function unitExercises(unitId: string): readonly Exercise[] | null {
  const unit = UNITS.find((candidate) => candidate.id === unitId);
  return unit ? unit.lessons.flatMap((lesson) => lesson.exercises) : null;
}

// Picks the exercises named by a rule's id list, in that order
export function exercisesByIds(pool: readonly Exercise[], ids: readonly string[]): Exercise[] {
  const byId = new Map(pool.map((exercise) => [exercise.id, exercise]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

// D8's draws are seeded (game/seeded-random.ts). Outside a development link the seed is the clock
// at the moment the session opens, so each boss and review is a fresh draw.
export function clockSeed(now: Date): number {
  return Math.floor(now.getTime() / 1000) >>> 0;
}
