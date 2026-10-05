import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { pathUnits } from "@/components/path/path-view-model";
import { OUTLINE } from "@/content/outline";
import { storyFor } from "@/content/stories/catalog";
import { FIXTURE_NAMES, fixtureState } from "@/game/fixtures";

const NOW = new Date(2026, 9, 5, 15, 0);

// US-4 and US-5: the unit header shows the story button exactly when the unit has a story
describe("the story button on the path", () => {
  it("shows on a unit exactly when the catalog holds its story", () => {
    const units = pathUnits(fixtureState("unit1-mid", PATH_OUTLINE, NOW));
    expect(units.map((unit) => [unit.id, unit.hasStory])).toEqual(OUTLINE.map((unit) => [unit.id, storyFor(unit.id) !== null]));
  });

  it("shows on the hands unit only in this effort (US-8)", () => {
    const units = pathUnits(fixtureState("unit1-mid", PATH_OUTLINE, NOW));
    expect(units.filter((unit) => unit.hasStory).map((unit) => unit.id)).toEqual(["hands"]);
  });

  it.each(FIXTURE_NAMES)("does not depend on progress: fixture %s", (name) => {
    const units = pathUnits(fixtureState(name, PATH_OUTLINE, NOW));
    expect(units.map((unit) => unit.hasStory)).toEqual(OUTLINE.map((unit) => storyFor(unit.id) !== null));
  });

  it("keeps the seven stops of every unit", () => {
    const units = pathUnits(fixtureState("fresh", PATH_OUTLINE, NOW));
    expect(units.map((unit) => unit.stops.length)).toEqual([7, 7, 7, 7]);
  });
});
