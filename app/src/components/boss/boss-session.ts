import { exercisesByIds, unitExercises } from "@/components/boss/unit-exercises";
import type { Session } from "@/components/lesson/lesson-run";
import { drawBoss } from "@/game/boss";
import { isOpenAtLives } from "@/game/lives";
import { pathNodes } from "@/game/path";
import type { PlayerState } from "@/game/player-state";
import { PATH_OUTLINE } from "@/components/path/path-outline";

export type SessionAccess =
  | { kind: "open"; session: Session }
  | { kind: "missing" }
  | { kind: "locked" }
  | { kind: "no-lives" };

// D8: the boss opens when the unit's five lessons are finished and closes at 0 lives. A passed
// boss stays open to play again, as a finished lesson does; its chest is still given only once.
// D9: the shark hosts it. The ten exercises are drawn with the seed (game/boss.ts).
export function bossAccess(state: PlayerState, unitId: string, now: Date, seed: number): SessionAccess {
  const pool = unitExercises(unitId);
  if (!pool) return { kind: "missing" };
  const node = pathNodes(state, PATH_OUTLINE).find((candidate) => candidate.id === `${unitId}:boss`);
  if (!node || node.status === "locked") return { kind: "locked" };
  if (!isOpenAtLives("boss", state, now)) return { kind: "no-lives" };
  const ids = drawBoss(pool.map((exercise) => exercise.id), seed);
  return { kind: "open", session: { kind: "boss", id: unitId, host: "shark", exercises: exercisesByIds(pool, ids) } };
}
