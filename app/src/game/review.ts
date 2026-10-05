import { DIALS } from "@/config/dials";
import type { PlayerState } from "@/game/player-state";
import { shuffled } from "@/game/seeded-random";

// D8: up to ten exercises the player missed in this unit and has not since answered right in a
// review, in the unit's order, filled up to ten from the rest of the unit by a seeded draw.
export function reviewSet(
  state: PlayerState,
  unitExerciseIds: readonly string[],
  seed: number,
): string[] {
  const missed = unitExerciseIds.filter((id) => state.missedExercises.includes(id));
  const misses = missed.slice(0, DIALS.reviewMaxSize);
  const rest = unitExerciseIds.filter((id) => !misses.includes(id));
  const fill = shuffled(rest, seed).slice(0, DIALS.reviewMaxSize - misses.length);
  return [...misses, ...fill];
}
