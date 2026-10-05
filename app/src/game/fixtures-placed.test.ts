import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { DIALS } from "@/config/dials";
import { openKinds } from "@/drills/open-kinds";
import { chestState } from "@/game/chest";
import { fixtureState } from "@/game/fixtures";
import { pathNodes, unitDone } from "@/game/path";

// The two fixtures phase 16 added (BD-13), on the real outline, so their ids are the content's
const now = new Date(2026, 9, 5, 12);
const currents = (name: "placed" | "all-done") =>
  pathNodes(fixtureState(name, PATH_OUTLINE, now), PATH_OUTLINE)
    .filter((node) => node.status === "current")
    .map((node) => node.id);

describe("the placed fixture (D20)", () => {
  const state = fixtureState("placed", PATH_OUTLINE, now);

  it("is a passed check: units 1 and 2 placed, onboarded, no gems and no XP", () => {
    expect(state.placement).toBe("passed");
    expect(state.onboarded).toBe(true);
    expect(state.placedUnits).toEqual(["hands", "table"]);
    expect([state.gems, state.xp, state.streak.length]).toEqual([0, 0, 0]);
  });

  it("puts the player at unit 3's first lesson, with both placed chests closed", () => {
    expect(currents("placed")).toEqual(["preflop-1"]);
    expect([chestState(state, "hands"), chestState(state, "table")]).toEqual(["closed", "closed"]);
  });

  it("opens the unit 1 practice kinds only", () => {
    expect(openKinds(state)).toEqual(["hand-name", "showdown"]);
  });
});

describe("the all-done fixture (D21)", () => {
  const state = fixtureState("all-done", PATH_OUTLINE, now);

  it("has every unit done and every chest opened", () => {
    expect(PATH_OUTLINE.units.every((unit) => unitDone(state, unit.id))).toBe(true);
    expect(PATH_OUTLINE.units.every((unit) => chestState(state, unit.id) === "opened")).toBe(true);
    expect(state.gems).toBe(PATH_OUTLINE.units.length * DIALS.chestGems);
  });

  it("has no current stop, and every review open", () => {
    expect(currents("all-done")).toEqual([]);
    const reviews = pathNodes(state, PATH_OUTLINE).filter((node) => node.kind === "review");
    expect(reviews.every((node) => node.status === "open")).toBe(true);
  });

  it("opens every Practice kind", () => {
    expect(openKinds(state)).toEqual(["hand-name", "showdown", "preflop", "outs", "odds"]);
  });
});
