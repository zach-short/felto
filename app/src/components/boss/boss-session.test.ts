import { describe, expect, it } from "vitest";

import { bossAccess } from "./boss-session";
import { unitExercises } from "./unit-exercises";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import { reviewAccess } from "@/components/review/review-session";
import { DIALS } from "@/config/dials";
import { isDealtId } from "@/game/dealt-slots";
import { fixtureState } from "@/game/fixtures";
import type { PlayerState } from "@/game/player-state";
import { finishSession } from "@/game/session";

const NOW = new Date(2026, 9, 5, 12, 0);
const READY = fixtureState("boss-ready", PATH_OUTLINE, NOW);
const UNIT = PATH_OUTLINE.units[0].id;

function passed(state: PlayerState): PlayerState {
  return finishSession(state, { kind: "boss", id: UNIT, size: DIALS.bossDraw, answered: DIALS.bossDraw, right: DIALS.bossPassRight }, NOW);
}

describe("bossAccess (D8)", () => {
  // Until US-1 (2026-10-05) every id was one of the unit's fifty; a drill slot is now dealt
  // fresh, so its id is a dealt id (boss-dealt.test.ts checks which slots)
  it("opens on boss-ready with ten different exercises, each of the unit or dealt, hosted by the shark", () => {
    const access = bossAccess(READY, UNIT, NOW, 7);
    if (access.kind !== "open") throw new Error(access.kind);
    const pool = new Set((unitExercises(UNIT) ?? []).map((exercise) => exercise.id));
    const ids = access.session.exercises.map((exercise) => exercise.id);
    expect(access.session).toMatchObject({ kind: "boss", id: UNIT, host: "shark" });
    expect(new Set(ids).size).toBe(DIALS.bossDraw);
    expect(ids.every((id) => pool.has(id) || isDealtId(id))).toBe(true);
  });

  it("draws the same ten for the same seed and others for another", () => {
    const ids = (seed: number) => {
      const access = bossAccess(READY, UNIT, NOW, seed);
      return access.kind === "open" ? access.session.exercises.map((exercise) => exercise.id) : [];
    };
    expect(ids(7)).toEqual(ids(7));
    expect(ids(7)).not.toEqual(ids(8));
  });

  it("is locked before the five lessons, closed at 0 lives, and missing for an unknown unit", () => {
    expect(bossAccess(fixtureState("unit1-mid", PATH_OUTLINE, NOW), UNIT, NOW, 1).kind).toBe("locked");
    expect(bossAccess({ ...READY, lives: 0, livesClock: NOW.getTime() }, UNIT, NOW, 1).kind).toBe("no-lives");
    expect(bossAccess(READY, "nowhere", NOW, 1).kind).toBe("missing");
  });
});

describe("reviewAccess (D8)", () => {
  it("is locked until the boss is passed, then opens with the squid even at 0 lives", () => {
    expect(reviewAccess(READY, UNIT, 1).kind).toBe("locked");
    const broke = { ...passed(READY), lives: 0, livesClock: NOW.getTime() };
    const access = reviewAccess(broke, UNIT, 1);
    if (access.kind !== "open") throw new Error(access.kind);
    expect(access.session).toMatchObject({ kind: "review", id: UNIT, host: "squid" });
    expect(access.session.exercises).toHaveLength(DIALS.reviewMaxSize);
  });

  it("puts the unit's misses first", () => {
    const pool = unitExercises(UNIT) ?? [];
    const missed = [pool[40].id, pool[3].id];
    const access = reviewAccess({ ...passed(READY), missedExercises: missed }, UNIT, 1);
    if (access.kind !== "open") throw new Error(access.kind);
    expect(access.session.exercises.slice(0, 2).map((exercise) => exercise.id)).toEqual([pool[3].id, pool[40].id]);
  });
});
