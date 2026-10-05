import { describe, expect, it } from "vitest";

import { freshState, type PlayerState } from "@/game/player-state";

import { openKinds } from "./open-kinds";

const NOW = new Date(2026, 9, 5, 12, 0);

function withDone(passed: string[], placed: string[] = []): PlayerState {
  return { ...freshState(NOW), passedBosses: passed, placedUnits: placed };
}

describe("openKinds (D21)", () => {
  it("opens nothing before unit 1 is done", () => {
    expect(openKinds(freshState(NOW))).toEqual([]);
    expect(openKinds({ ...freshState(NOW), finishedLessons: ["hands-1", "hands-2", "hands-3", "hands-4", "hands-5"] })).toEqual([]);
  });

  it("opens hand-name and showdown after unit 1, by the boss or by placement", () => {
    expect(openKinds(withDone(["hands"]))).toEqual(["hand-name", "showdown"]);
    expect(openKinds(withDone([], ["hands", "table"]))).toEqual(["hand-name", "showdown"]);
  });

  it("opens nothing more for unit 2, preflop after unit 3, and outs and odds after unit 4", () => {
    expect(openKinds(withDone(["hands", "table"]))).toEqual(["hand-name", "showdown"]);
    expect(openKinds(withDone(["hands", "table", "preflop"]))).toEqual(["hand-name", "showdown", "preflop"]);
    expect(openKinds(withDone(["hands", "table", "preflop", "odds"]))).toEqual([
      "hand-name", "showdown", "preflop", "outs", "odds",
    ]);
  });
});
