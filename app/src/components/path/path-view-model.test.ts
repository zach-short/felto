import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { greetingMood, pathUnits } from "@/components/path/path-view-model";
import { statValues } from "@/components/stat-values";
import { OUTLINE } from "@/content/outline";
import { fixtureState } from "@/game/fixtures";

const NOW = new Date(2026, 9, 5, 15, 0);

function statuses(name: "fresh" | "unit1-mid" | "boss-ready", unitIndex: number): string[] {
  const units = pathUnits(fixtureState(name, PATH_OUTLINE, NOW));
  return units[unitIndex].stops.map((stop) => `${stop.node.kind}:${stop.node.status}`);
}

describe("PATH_OUTLINE", () => {
  it("holds every unit and lesson of the content outline, in order", () => {
    expect(PATH_OUTLINE.units.map((unit) => unit.id)).toEqual(OUTLINE.map((unit) => unit.id));
    expect(PATH_OUTLINE.units[0].lessonIds).toEqual(["hands-1", "hands-2", "hands-3", "hands-4", "hands-5"]);
  });
});

// PLAN.md phase 8, done-when: the unit1-mid fixture shows lessons 1 to 3 complete, lesson 4
// current with its arc at three fifths, lesson 5 and the boss locked, and the bar 4, XP, 2, 20.
describe("pathUnits on unit1-mid", () => {
  it("draws unit 1 as the phase's done-when says", () => {
    expect(statuses("unit1-mid", 0)).toEqual([
      "lesson:complete", "lesson:complete", "lesson:complete", "lesson:current", "lesson:locked",
      "boss:locked", "review:locked",
    ]);
    const current = pathUnits(fixtureState("unit1-mid", PATH_OUTLINE, NOW))[0].stops[3];
    expect(current.progress).toBeCloseTo(3 / 5);
    expect(current.title).toBe("Kickers break ties");
  });

  it("locks every later unit and leaves the chest closed", () => {
    const units = pathUnits(fixtureState("unit1-mid", PATH_OUTLINE, NOW));
    expect(units.slice(1).every((unit) => unit.stops.every((stop) => stop.node.status === "locked"))).toBe(true);
    expect(units[0].chest).toBe("closed");
  });

  it("gives the stat bar 4, 240, 2 and 20, with no freeze held", () => {
    const stats = statValues(fixtureState("unit1-mid", PATH_OUTLINE, NOW), NOW);
    expect(stats).toEqual({ streak: 4, xp: 240, lives: 2, gems: 20, freezes: 0 });
  });
});

describe("pathUnits on fresh and boss-ready", () => {
  it("opens only the first lesson for a new player, with no arc", () => {
    const first = pathUnits(fixtureState("fresh", PATH_OUTLINE, NOW))[0].stops[0];
    expect(statuses("fresh", 0)[0]).toBe("lesson:current");
    expect(statuses("fresh", 0).slice(1).every((s) => s.endsWith(":locked"))).toBe(true);
    expect(first.progress).toBe(0);
  });

  it("opens the boss when the five lessons are finished", () => {
    expect(statuses("boss-ready", 0).slice(5)).toEqual(["boss:current", "review:locked"]);
  });
});

describe("greetingMood", () => {
  it("welcomes a new player, naps on a day with no finish, cheers after one", () => {
    expect(greetingMood(fixtureState("fresh", PATH_OUTLINE, NOW), NOW)).toBe("new-player");
    const mid = fixtureState("unit1-mid", PATH_OUTLINE, NOW);
    expect(greetingMood(mid, NOW)).toBe("not-today");
    const today = { ...mid, streak: { length: 5, lastDay: "2026-10-05" } };
    expect(greetingMood(today, NOW)).toBe("done-today");
  });
});
