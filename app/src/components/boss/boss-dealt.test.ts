import { describe, expect, it } from "vitest";

import { bossAccess } from "./boss-session";
import { exercisesByIds, unitExercises } from "./unit-exercises";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import type { Exercise } from "@/content/schema";
import { drawBoss } from "@/game/boss";
import { isDealtId } from "@/game/dealt-slots";
import { fixtureState } from "@/game/fixtures";

const NOW = new Date(2026, 9, 5, 12, 0);
const READY = fixtureState("boss-ready", PATH_OUTLINE, NOW);
const UNIT = PATH_OUTLINE.units[0].id;
const POOL = unitExercises(UNIT) ?? [];

function bossExercises(seed: number): Exercise[] {
  const access = bossAccess(READY, UNIT, NOW, seed);
  if (access.kind !== "open") throw new Error(access.kind);
  return [...access.session.exercises];
}

describe("the boss deals fresh hands (US-1)", () => {
  it("keeps the draw and its kinds, keeps each concept as written and deals every other slot", () => {
    const drawn = exercisesByIds(POOL, drawBoss(POOL.map((exercise) => exercise.id), 7));
    const played = bossExercises(7);
    expect(played.map((exercise) => exercise.kind)).toEqual(drawn.map((exercise) => exercise.kind));
    drawn.forEach((exercise, i) => {
      if (exercise.kind === "concept") expect(played[i]).toBe(exercise);
      else expect(isDealtId(played[i].id)).toBe(true);
    });
  });

  it("draws at least one slot to deal for this seed, so the test above checks something", () => {
    expect(bossExercises(7).some((exercise) => isDealtId(exercise.id))).toBe(true);
  });

  it("deals the same boss for the same seed", () => {
    expect(bossExercises(7)).toEqual(bossExercises(7));
  });
});
