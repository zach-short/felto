import type { SessionAccess } from "@/components/boss/boss-session";
import { exercisesByIds, unitExercises } from "@/components/boss/unit-exercises";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import { pathNodes } from "@/game/path";
import type { PlayerState } from "@/game/player-state";
import { reviewSet } from "@/game/review";

// D8: the review opens once the unit's boss is passed and stays open at 0 lives, because it costs
// none. D9: the squid hosts it. Its exercises are the unit's misses first, filled up to ten by
// the seeded draw of game/review.ts.
export function reviewAccess(state: PlayerState, unitId: string, seed: number): SessionAccess {
  const pool = unitExercises(unitId);
  if (!pool) return { kind: "missing" };
  const node = pathNodes(state, PATH_OUTLINE).find((candidate) => candidate.id === `${unitId}:review`);
  if (!node || node.status !== "open") return { kind: "locked" };
  const ids = reviewSet(state, pool.map((exercise) => exercise.id), seed);
  return { kind: "open", session: { kind: "review", id: unitId, host: "squid", exercises: exercisesByIds(pool, ids) } };
}
