import { sessionResult, type RunState, type Session } from "@/components/lesson/lesson-run";
import type { PlacementRun } from "@/game/placement";
import type { Answer, SessionResult } from "@/game/session";

// D20: the placement check spends no heart and remembers no miss, so none of its answers goes to
// recordAnswer; every other session records each answer at once (D8).
export function answerToRecord(session: Pick<Session, "kind">, exerciseId: string, right: boolean): Answer | null {
  if (session.kind === "placement") return null;
  return { kind: session.kind, exerciseId, right };
}

export type SessionEnd = { type: "placement"; run: PlacementRun } | { type: "session"; result: SessionResult };

// D20: the check ends in finishPlacement (pass or fail, no XP, no streak); every other session
// ends in finishSession (D8, D21). Both rules check the size and the count themselves.
export function sessionEnd(session: Pick<Session, "kind" | "id">, run: RunState, size: number): SessionEnd {
  if (session.kind === "placement") {
    return { type: "placement", run: { size, answered: run.answered, right: run.right } };
  }
  return { type: "session", result: sessionResult(run, { kind: session.kind, id: session.id }, size) };
}
