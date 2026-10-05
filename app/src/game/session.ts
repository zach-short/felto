import { DIALS } from "@/config/dials";
import { bossPasses } from "@/game/boss";
import { isDealtId } from "@/game/dealt-slots";
import { spendLife } from "@/game/lives";
import type { PlayerState } from "@/game/player-state";
import { withItem } from "@/game/player-state";
import { recordFinishDay } from "@/game/streak";

export type SessionKind = "lesson" | "boss" | "review" | "practice";

export type Answer = { kind: SessionKind; exerciseId: string; right: boolean };

// id is the lesson id for a lesson and the unit id for a boss or a review
export type SessionResult = {
  kind: SessionKind;
  id: string;
  size: number;
  answered: number;
  right: number;
};

// D8: a wrong answer costs a life at once in a lesson or a boss, and the life stays lost if the
// lesson is left. A review costs none, and a right answer there clears the miss. Practice
// exercises are dealt at random (D21), so they have no id to remember. US-2: nor has a dealt slot
// in a lesson or a boss, so its miss spends the life but is not kept, as the review could not
// find it in the unit's pool.
export function recordAnswer(state: PlayerState, answer: Answer, now: Date): PlayerState {
  const { kind, exerciseId, right } = answer;
  if (kind === "review" && right) {
    return { ...state, missedExercises: state.missedExercises.filter((id) => id !== exerciseId) };
  }
  if (right || (kind !== "lesson" && kind !== "boss")) return state;
  const spent = spendLife(state, now);
  if (isDealtId(exerciseId)) return spent;
  return { ...spent, missedExercises: withItem(state.missedExercises, exerciseId) };
}

// The sessions whose length the design fixes; a review is up to reviewMaxSize (D8)
const FIXED_SIZE: Record<Exclude<SessionKind, "review">, number> = {
  lesson: DIALS.exercisesPerLesson,
  boss: DIALS.bossDraw,
  practice: DIALS.practiceSetSize,
};

// The size comes from the caller, so it is checked against the dials: a practice set of 3 is
// not "a finished set of 10" (D21), and a short lesson is not a finished lesson (D8).
export function isPlayedToEnd(result: SessionResult): boolean {
  const { kind, size, answered, right } = result;
  const sizeOk =
    kind === "review" ? size >= 1 && size <= DIALS.reviewMaxSize : size === FIXED_SIZE[kind];
  return sizeOk && answered === size && right >= 0 && right <= answered;
}

// D8 and D21: only a session played to its end counts. It gives XP for each right answer and
// counts for the streak; a lesson is then finished and a boss with 8 right is passed.
export function finishSession(state: PlayerState, result: SessionResult, now: Date): PlayerState {
  if (!isPlayedToEnd(result)) return state;
  const xpEach = result.kind === "practice" ? DIALS.practiceXpPerRight : DIALS.xpPerRightAnswer;
  const counted = recordFinishDay({ ...state, xp: state.xp + result.right * xpEach }, now);
  if (result.kind === "lesson") {
    return { ...counted, finishedLessons: withItem(counted.finishedLessons, result.id) };
  }
  if (result.kind === "boss" && bossPasses(result.right)) {
    return { ...counted, passedBosses: withItem(counted.passedBosses, result.id) };
  }
  return counted;
}
