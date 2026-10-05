import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { OPENING_CHART, UNITS } from "@/content/catalog";
import { computeKey } from "@/content/compute-key";
import type { Exercise, Lesson } from "@/content/schema";
import { DEALERS, dealSet } from "@/drills/deal";
import { type Dealers, isDealtId, isDealtLesson, withDealtSlots } from "@/game/dealt-slots";

const LESSONS: readonly Lesson[] = UNITS.flatMap((unit) => unit.lessons);

function lesson(id: string): readonly Exercise[] {
  const found = LESSONS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`no lesson ${id}`);
  return found.exercises;
}

const HANDS_3 = lesson("hands-3");
const HANDS_5 = lesson("hands-5");
const withoutId = (exercise: Exercise) => ({ ...exercise, id: "" });

describe("withDealtSlots (US-1)", () => {
  it("keeps the length and the order of kinds", () => {
    for (const authored of [HANDS_3, HANDS_5]) {
      const dealt = withDealtSlots(authored, 7, DEALERS);
      expect(dealt.map((exercise) => exercise.kind)).toEqual(authored.map((exercise) => exercise.kind));
    }
  });

  it("leaves each concept exercise as written, in its place", () => {
    const dealt = withDealtSlots(HANDS_3, 7, DEALERS);
    HANDS_3.forEach((exercise, i) => {
      if (exercise.kind === "concept") expect(dealt[i]).toBe(exercise);
    });
  });

  it("replaces every drill slot with a dealt exercise, and no two slots share an id", () => {
    const dealt = withDealtSlots(HANDS_3, 7, DEALERS);
    const drills = dealt.filter((exercise) => exercise.kind !== "concept");
    expect(drills).toHaveLength(8);
    expect(drills.every((exercise) => isDealtId(exercise.id))).toBe(true);
    expect(new Set(dealt.map((exercise) => exercise.id)).size).toBe(dealt.length);
  });

  it("never deals one hand into two slots of the same list", () => {
    const drills = withDealtSlots(HANDS_3, 7, DEALERS).filter((exercise) => isDealtId(exercise.id));
    expect(new Set(drills.map((exercise) => JSON.stringify(withoutId(exercise)))).size).toBe(drills.length);
  });

  it("deals other hands in every drill slot of hands-3 for another seed", () => {
    const [first, second] = [withDealtSlots(HANDS_3, 1, DEALERS), withDealtSlots(HANDS_3, 2, DEALERS)];
    first.forEach((exercise, i) => {
      if (exercise.kind !== "concept") expect(withoutId(exercise)).not.toEqual(withoutId(second[i]));
    });
  });

  it("deals the same list again for the same seed", () => {
    expect(withDealtSlots(HANDS_3, 1_759_680_000, DEALERS)).toEqual(withDealtSlots(HANDS_3, 1_759_680_000, DEALERS));
  });

  it("replaces only the kinds the table has a dealer for", () => {
    const dealers: Dealers = { showdown: DEALERS.showdown };
    const dealt = withDealtSlots(HANDS_5, 7, dealers);
    HANDS_5.forEach((exercise, i) => {
      expect(isDealtId(dealt[i].id)).toBe(exercise.kind === "showdown");
    });
  });

  it("seeds a place from the set seed and the place alone, dealt or not", () => {
    const seen: number[] = [];
    const record: Dealers = {
      "hand-name": (seed) => {
        seen.push(seed);
        return HANDS_3[0];
      },
    };
    withDealtSlots([HANDS_3[2], HANDS_3[0], HANDS_3[1]], 7, record);
    withDealtSlots([HANDS_3[0], HANDS_3[0], HANDS_3[1]], 7, record);
    expect(seen.slice(0, 2)).toEqual(seen.slice(3, 5));
  });

  it("gives every dealt slot of hands-3 and hands-5 the key the cards say (rule Q3)", () => {
    const wrong = Array.from({ length: 100 }, (_, seed) => [
      ...withDealtSlots(HANDS_3, seed, DEALERS),
      ...withDealtSlots(HANDS_5, seed, DEALERS),
    ])
      .flat()
      .filter((exercise) => isDealtId(exercise.id) && computeKey(exercise, { chart: OPENING_CHART }) !== exercise.answer);
    expect(wrong.map((exercise) => exercise.id)).toEqual([]);
  });
});

describe("isDealtLesson (US-1, US-3)", () => {
  it("names hands-3 and hands-5 and leaves the other hands lessons authored", () => {
    expect(["hands-1", "hands-2", "hands-3", "hands-4", "hands-5"].filter(isDealtLesson)).toEqual(["hands-3", "hands-5"]);
  });

  it("names only lessons that exist", () => {
    const ids = new Set(LESSONS.map((candidate) => candidate.id));
    expect(DIALS.dealtLessons.filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe("isDealtId (US-2, BD-S2)", () => {
  it("is false for every authored exercise and true for every practice exercise", () => {
    const authored = LESSONS.flatMap((candidate) => candidate.exercises).filter((exercise) => isDealtId(exercise.id));
    expect(authored.map((exercise) => exercise.id)).toEqual([]);
    expect(dealSet(["hand-name", "showdown"], 7).every((exercise) => isDealtId(exercise.id))).toBe(true);
  });
});
