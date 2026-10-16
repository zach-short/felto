import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { stateMoments } from "@/game/celebration-moments";
import { fixtureState } from "@/game/fixtures";
import { finishSession } from "@/game/session";

// The test script sets TZ=America/New_York (BD-12), so this is a New York time.
const NOW = new Date(2026, 9, 15, 12);

describe("the streak-eve fixture (board item 62)", () => {
  it("celebrates nothing when it loads, because it is another player", () => {
    const live = fixtureState("unit1-mid", PATH_OUTLINE, new Date(2026, 9, 15, 9));
    expect(stateMoments(live, fixtureState("streak-eve", PATH_OUTLINE, NOW), NOW)).toEqual([]);
  });

  it("plays the 7-day streak and 1,000 XP after its next lesson with six right", () => {
    const eve = fixtureState("streak-eve", PATH_OUTLINE, NOW);
    const after = finishSession(eve, { kind: "lesson", id: "hands-4", size: 10, answered: 10, right: 6 }, NOW);
    expect(stateMoments(eve, after, NOW)).toEqual([
      { name: "streak_milestone", count: 7 },
      { name: "xp_milestone", count: 1000 },
    ]);
  });
});
