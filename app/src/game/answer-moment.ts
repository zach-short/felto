import { parseCards } from "@/cards/card";
import { showdownValues } from "@/cards/showdown";
import { DIALS } from "@/config/dials";
import type { Exercise } from "@/content/schema";

// GF-24 and GF-26 (board item 62): what the feedback sheet plays for a checked answer, named as the
// celebration files are
export type AnswerMoment = "royal_flush" | "all_in_win" | "hot_streak";

// At most one moment for an answer, the rarest first. `history` is every answer of the session so
// far, right or wrong, with this one last; only a right answer is celebrated.
export function answerMoment(exercise: Exercise, history: readonly boolean[]): AnswerMoment | null {
  if (history.at(-1) !== true) return null;
  if (isRoyalFlush(exercise)) return "royal_flush";
  if (isAllInCall(exercise)) return "all_in_win";
  return isHotStreak(history) ? "hot_streak" : null;
}

// The key of a hand-name exercise, or the hand of a player who wins the showdown. A royal flush on
// the board is every player's hand, so that split counts too.
function isRoyalFlush(exercise: Exercise): boolean {
  if (exercise.kind === "hand-name") return exercise.options[exercise.answer] === "royal-flush";
  if (exercise.kind !== "showdown") return false;
  const values = showdownValues(parseCards(exercise.board), exercise.players.map((hole) => parseCards(hole)));
  return exercise.options[exercise.answer].some((player) => values[player].category === "royal-flush");
}

// content/schema.ts: a call that sees both cards to come is an all-in, and here its key is to call
function isAllInCall(exercise: Exercise): boolean {
  if (exercise.kind !== "odds" || exercise.ask !== "call") return false;
  return exercise.cardsToCome === 2 && exercise.options[exercise.answer] === "call";
}

// GF-26: only the answer that first completes a run of hotStreakRun in the session, so a session
// plays it once however long the run goes on, and a run that a rarer moment completed is not
// played a step late
function isHotStreak(history: readonly boolean[]): boolean {
  return firstRunEnd(history) === history.length - 1;
}

function firstRunEnd(history: readonly boolean[]): number {
  let run = 0;
  for (const [index, right] of history.entries()) {
    run = right ? run + 1 : 0;
    if (run === DIALS.hotStreakRun) return index;
  }
  return -1;
}
