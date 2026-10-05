import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { OPENING_CHART } from "@/content/catalog";
import { computeKey } from "@/content/compute-key";
import { validateExercise } from "@/content/validate";

import { dealExercise, dealSet, type DrillKind } from "./deal";

const ALL: DrillKind[] = ["hand-name", "showdown", "preflop", "outs", "odds"];

describe("dealSet (D21)", () => {
  it("deals a set of the dial's size, of open kinds only, each valid and keyed", () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const set = dealSet(["preflop", "odds"], seed);
      expect(set).toHaveLength(DIALS.practiceSetSize);
      for (const ex of set) {
        expect(["preflop", "odds"]).toContain(ex.kind);
        expect(validateExercise(ex), ex.id).toEqual([]);
        expect(computeKey(ex, { chart: OPENING_CHART }), ex.id).toBe(ex.answer);
      }
    }
  });

  it("numbers the ids within a set and replays from the seed", () => {
    const set = dealSet(ALL, 42);
    expect(new Set(set.map((ex) => ex.id)).size).toBe(set.length);
    expect(dealSet(ALL, 42)).toEqual(set);
    expect(dealSet(ALL, 43)).not.toEqual(set);
    for (const ex of set) {
      const [, , , kind, child] = /^practice-(\d+)-(\d+)-([a-z-]+)-(\d+)$/.exec(ex.id) ?? [];
      expect({ ...dealExercise(kind as DrillKind, Number(child)), id: ex.id }).toEqual(ex);
    }
  });

  it("deals every open kind over many sets", () => {
    const kinds = new Set(Array.from({ length: 50 }, (_, s) => dealSet(ALL, s)).flat().map((ex) => ex.kind));
    expect(kinds).toEqual(new Set(ALL));
  });

  it("refuses to deal when no kind is open", () => {
    expect(() => dealSet([], 1)).toThrow();
  });
});
