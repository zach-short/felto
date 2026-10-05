import type { CastRole } from "@/content/cast";
import type { Exercise } from "@/content/schema";
import type { SessionKind, SessionResult } from "@/game/session";

// D8, D9, D20 and D21: a lesson, a boss, a review, a practice set and the placement check are runs
// of the same loop over different exercises, each hosted by its own character. `id` is the lesson
// id, or the unit id for a boss or a review, as finishSession expects it; a practice set and the
// placement check have no place on the path, so their id only names the draw. The placement check
// is not a SessionKind of the game rules: it ends in finishPlacement, never in finishSession.
export type RunKind = SessionKind | "placement";

export type Session<Kind extends RunKind = RunKind> = {
  kind: Kind;
  id: string;
  host: CastRole;
  exercises: readonly Exercise[];
};

// D8, D20 and D21: a wrong answer spends a heart in a lesson or a boss; a review, a practice set
// and the placement check cost none, so they run on at 0 hearts
export function costsLives(session: Pick<Session, "kind">): boolean {
  return session.kind === "lesson" || session.kind === "boss";
}

// D21 and D20: a practice set and the placement check have nothing to do with hearts, so the
// header hides the count. A review costs none but shows them, since it is open at 0 (D8).
export function showsHearts(session: Pick<Session, "kind">): boolean {
  return session.kind !== "practice" && session.kind !== "placement";
}

// One lesson as it is played: the exercise on screen, the choice, and whether the feedback, the
// finish or the out-of-lives stop is showing. Pure, so the order of the loop is tested in node.
export type RunPhase = "answering" | "feedback" | "finished" | "out-of-lives";

export type RunState = {
  index: number;
  choice: number | null;
  phase: RunPhase;
  answered: number;
  right: number;
  lastRight: boolean;
};

export type RunEvent =
  | { type: "choose"; choice: number }
  | { type: "check"; answer: number }
  | { type: "continue"; size: number; livesLeft: number };

export const RUN_START: RunState = {
  index: 0,
  choice: null,
  phase: "answering",
  answered: 0,
  right: 0,
  lastRight: false,
};

export function runStep(run: RunState, event: RunEvent): RunState {
  if (event.type === "choose") return run.phase === "answering" ? { ...run, choice: event.choice } : run;
  if (event.type === "check") return checked(run, event.answer);
  return continued(run, event.size, event.livesLeft);
}

function checked(run: RunState, answer: number): RunState {
  if (run.phase !== "answering" || run.choice === null) return run;
  const lastRight = run.choice === answer;
  const right = run.right + (lastRight ? 1 : 0);
  return { ...run, phase: "feedback", answered: run.answered + 1, right, lastRight };
}

// D8: the last exercise finishes the lesson even when it spent the last life; before that, a
// player with no lives left stops, and the lesson does not count.
function continued(run: RunState, size: number, livesLeft: number): RunState {
  if (run.phase !== "feedback") return run;
  if (run.index + 1 >= size) return { ...run, phase: "finished" };
  if (livesLeft <= 0) return { ...run, phase: "out-of-lives" };
  return { ...run, index: run.index + 1, choice: null, phase: "answering" };
}

// The result handed to finishSession, which checks the size against the dials itself
export function runResult(run: RunState, lessonId: string, size: number): SessionResult {
  return sessionResult(run, { kind: "lesson", id: lessonId }, size);
}

export function sessionResult(run: RunState, session: { kind: SessionKind; id: string }, size: number): SessionResult {
  return { kind: session.kind, id: session.id, size, answered: run.answered, right: run.right };
}
