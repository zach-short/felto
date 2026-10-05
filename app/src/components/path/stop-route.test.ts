import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "./path-outline";
import { refilledRoute, stopRoute } from "./stop-route";
import { fixtureState } from "@/game/fixtures";
import { pathNodes, type PathNode } from "@/game/path";
import type { PlayerState } from "@/game/player-state";

const NOW = new Date(2026, 9, 5, 12, 0);
const UNIT = PATH_OUTLINE.units[0].id;

function node(state: PlayerState, id: string): PathNode {
  const found = pathNodes(state, PATH_OUTLINE).find((candidate) => candidate.id === id);
  if (!found) throw new Error(id);
  return found;
}

describe("stopRoute (D8, audit of item 12)", () => {
  it("sends the current lesson at 0 lives to the out-of-lives sheet, not the lesson", () => {
    const state = fixtureState("zero-lives", PATH_OUTLINE, NOW);
    const current = PATH_OUTLINE.units[0].lessonIds[3];
    expect(node(state, current).status).toBe("current");
    expect(stopRoute(node(state, current), state, NOW)).toEqual({
      pathname: "/out-of-lives",
      params: { kind: "lesson", id: current },
    });
  });

  it("opens the current lesson and the ready boss when hearts are left", () => {
    const mid = fixtureState("unit1-mid", PATH_OUTLINE, NOW);
    const current = PATH_OUTLINE.units[0].lessonIds[3];
    expect(stopRoute(node(mid, current), mid, NOW)).toEqual({ pathname: "/lesson/[id]", params: { id: current } });
    const ready = fixtureState("boss-ready", PATH_OUTLINE, NOW);
    expect(stopRoute(node(ready, `${UNIT}:boss`), ready, NOW)).toEqual({ pathname: "/boss/[unit]", params: { unit: UNIT } });
  });

  it("sends the boss at 0 lives to the sheet, and opens an open review at 0 lives", () => {
    const ready = { ...fixtureState("boss-ready", PATH_OUTLINE, NOW), lives: 0, livesClock: NOW.getTime() };
    expect(stopRoute(node(ready, `${UNIT}:boss`), ready, NOW)).toEqual({
      pathname: "/out-of-lives",
      params: { kind: "boss", id: UNIT },
    });
    const done = { ...ready, passedBosses: [UNIT] };
    expect(stopRoute(node(done, `${UNIT}:review`), done, NOW)).toEqual({ pathname: "/review/[unit]", params: { unit: UNIT } });
  });

  it("goes nowhere from a locked stop", () => {
    const fresh = fixtureState("fresh", PATH_OUTLINE, NOW);
    expect(stopRoute(node(fresh, `${UNIT}:boss`), fresh, NOW)).toBeNull();
  });

  it("returns to the tapped stop after a refill", () => {
    expect(refilledRoute("lesson", "hands-4")).toEqual({ pathname: "/lesson/[id]", params: { id: "hands-4" } });
    expect(refilledRoute("boss", UNIT)).toEqual({ pathname: "/boss/[unit]", params: { unit: UNIT } });
    expect(refilledRoute(undefined, undefined)).toBeNull();
  });
});
