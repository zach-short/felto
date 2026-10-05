import { DIALS } from "@/config/dials";
import type { Exercise, ExerciseKind } from "@/content/schema";
import { seededRandom } from "@/game/seeded-random";

// BD-S1: the dealers are passed in, one per kind, so this file deals nothing itself and a test
// can hand it any table. A kind with no dealer (concept) is never replaced.
export type Dealers = Readonly<Partial<Record<ExerciseKind, (seed: number) => Exercise>>>;

// BD-S2: the prefix dealSet already writes (drills/deal.ts:34), so a dealt lesson or boss slot
// and a practice exercise are told apart from an authored one in the same way
const DEALT_PREFIX = "practice-";

// US-2: no authored id starts with the prefix, so a dealt answer is never kept as a miss
export function isDealtId(exerciseId: string): boolean {
  return exerciseId.startsWith(DEALT_PREFIX);
}

const DEALT_LESSONS: readonly string[] = DIALS.dealtLessons;

// US-1 and US-3: only lessons that drill one skill are dealt, because a dealer's explanation is
// generic and the other lessons teach their points in a set order
export function isDealtLesson(lessonId: string): boolean {
  return DEALT_LESSONS.includes(lessonId);
}

// US-1: each exercise of a kind with a dealer is replaced in its own place by a fresh deal of that
// kind. A seed is drawn for every place, dealt or not, so the deal at a place depends only on the
// set seed and the place. The id has dealSet's shape, so any slot replays with dealExercise.
export function withDealtSlots(exercises: readonly Exercise[], seed: number, dealers: Dealers): Exercise[] {
  const random = seededRandom(seed);
  return exercises.map((exercise, i) => {
    const child = Math.floor(random() * 2 ** 32);
    const deal = dealers[exercise.kind];
    if (!deal) return exercise;
    return { ...deal(child), id: `${DEALT_PREFIX}${seed >>> 0}-${i + 1}-${exercise.kind}-${child}` };
  });
}
