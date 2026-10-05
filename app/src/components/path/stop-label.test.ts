import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { pathUnits, stopLabel } from "@/components/path/path-view-model";
import { fixtureState } from "@/game/fixtures";

const NOW = new Date(2026, 9, 5, 15, 0);

describe("stopLabel", () => {
  it("gives the current lesson its progress, three of five on unit1-mid", () => {
    const stops = pathUnits(fixtureState("unit1-mid", PATH_OUTLINE, NOW))[0].stops;
    expect(stopLabel(stops[3])).toBe("Kickers break ties, up next, 3 of 5 lessons done");
  });

  it("gives a new player's first lesson 0 of 5", () => {
    const first = pathUnits(fixtureState("fresh", PATH_OUTLINE, NOW))[0].stops[0];
    expect(stopLabel(first)).toBe("Ranks and suits, up next, 0 of 5 lessons done");
  });

  it("says only the state for a finished or a locked stop", () => {
    const stops = pathUnits(fixtureState("unit1-mid", PATH_OUTLINE, NOW))[0].stops;
    expect(stopLabel(stops[0])).toBe("Ranks and suits, finished");
    expect(stopLabel(stops[4])).toBe("Who wins the pot?, locked");
  });
});
