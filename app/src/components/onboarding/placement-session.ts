import { exercisesByIds, unitExercises } from "@/components/boss/unit-exercises";
import type { Session } from "@/components/lesson/lesson-run";
import { DIALS } from "@/config/dials";
import { shuffled } from "@/game/seeded-random";
import type { PlayerState } from "@/game/player-state";

// D20: the check is drawn from units 1 and 2, the two it can place past
export const PLACEMENT_UNITS = ["hands", "table"] as const;

// D20: ten exercises from units 1 and 2. Half come from each unit, so a player who knows the hand
// ranks but not the table (or the other way) cannot pass on one unit alone. Seeded (BD-26), so a
// test or a development link replays a draw; the screen seeds it from the clock (BD-12).
export function drawPlacement(seed: number): string[] {
  const share = Math.ceil(DIALS.placementSize / PLACEMENT_UNITS.length);
  const ids = PLACEMENT_UNITS.flatMap((unitId, index) => {
    const pool = (unitExercises(unitId) ?? []).map((exercise) => exercise.id);
    return shuffled(pool, seed + index).slice(0, share);
  });
  return shuffled(ids, seed).slice(0, DIALS.placementSize);
}

export type PlacementAccess = { kind: "open"; session: Session<"placement"> } | { kind: "taken" };

// D20: the check runs once. A check left part way counts for nothing (game/placement.ts), so it
// stays open until one is answered to its end. The fish hosts it (DESIGN.md 10.7).
export function placementAccess(state: PlayerState, seed: number): PlacementAccess {
  if (state.placement !== "not-taken") return { kind: "taken" };
  const pool = PLACEMENT_UNITS.flatMap((unitId) => unitExercises(unitId) ?? []);
  const exercises = exercisesByIds(pool, drawPlacement(seed));
  return { kind: "open", session: { kind: "placement", id: `placement-${seed >>> 0}`, host: "fish", exercises } };
}
