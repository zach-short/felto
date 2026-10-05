import { DIALS } from "@/config/dials";
import { shuffled } from "@/game/seeded-random";

// D8: the boss is ten exercises drawn at random from the unit's fifty, and eight right passes.
export function drawBoss(unitExerciseIds: readonly string[], seed: number): string[] {
  return shuffled(unitExerciseIds, seed).slice(0, DIALS.bossDraw);
}

export function bossPasses(right: number): boolean {
  return right >= DIALS.bossPassRight;
}
