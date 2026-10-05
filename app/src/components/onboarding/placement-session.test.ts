import { describe, expect, it } from "vitest";

import { RUN_START, runStep, type RunState } from "@/components/lesson/lesson-run";
import { answerToRecord, sessionEnd } from "@/components/lesson/session-end";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import { DIALS } from "@/config/dials";
import { finishPlacement } from "@/game/placement";
import { freshState, type PlayerState } from "@/game/player-state";
import { recordAnswer } from "@/game/session";

import { drawPlacement, placementAccess } from "./placement-session";

const NOW = new Date(2026, 9, 5, 12, 0);
const start = freshState(NOW);

function openCheck(state: PlayerState, seed: number) {
  const access = placementAccess(state, seed);
  if (access.kind !== "open") throw new Error("expected an open check");
  return access.session;
}

// Plays the whole check through the reducer and the answer rule, right for the first `rightCount`
function play(state: PlayerState, rightCount: number): { state: PlayerState; run: RunState } {
  const session = openCheck(state, 3);
  let run = RUN_START;
  let after = state;
  session.exercises.forEach((exercise, i) => {
    const choice = i < rightCount ? exercise.answer : (exercise.answer + 1) % exercise.options.length;
    run = runStep(run, { type: "choose", choice });
    const answer = answerToRecord(session, exercise.id, choice === exercise.answer);
    if (answer) after = recordAnswer(after, answer, NOW);
    run = runStep(run, { type: "check", answer: exercise.answer });
    run = runStep(run, { type: "continue", size: session.exercises.length, livesLeft: Number.POSITIVE_INFINITY });
  });
  const end = sessionEnd(session, run, session.exercises.length);
  if (end.type !== "placement") throw new Error("expected a placement end");
  return { state: finishPlacement(after, end.run, PATH_OUTLINE), run };
}

describe("drawPlacement (D20)", () => {
  it("draws ten distinct exercises, five from each of units 1 and 2", () => {
    const ids = drawPlacement(42);
    expect(ids).toHaveLength(DIALS.placementSize);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => id.startsWith("hands-"))).toHaveLength(5);
    expect(ids.filter((id) => id.startsWith("table-"))).toHaveLength(5);
  });

  it("replays a seed and changes with it", () => {
    expect(drawPlacement(7)).toEqual(drawPlacement(7));
    expect(drawPlacement(7)).not.toEqual(drawPlacement(8));
  });
});

describe("placementAccess (D20)", () => {
  it("opens a fish-hosted check for a player who has not taken it", () => {
    const session = openCheck(start, 1);
    expect([session.kind, session.host, session.exercises.length]).toEqual(["placement", "fish", 10]);
  });

  it("runs once", () => {
    expect(placementAccess({ ...start, placement: "failed" }, 1).kind).toBe("taken");
    expect(placementAccess({ ...start, placement: "passed" }, 1).kind).toBe("taken");
  });
});

describe("the check through the game rules (D20)", () => {
  it("spends no heart and remembers no miss", () => {
    const { state } = play(start, 2);
    expect(state.lives).toBe(DIALS.maxLives);
    expect(state.missedExercises).toEqual([]);
  });

  it("passes at 8 right: units 1 and 2 placed, no XP, no gems, no streak", () => {
    const { state } = play(start, 8);
    expect(state.placement).toBe("passed");
    expect(state.placedUnits).toEqual(["hands", "table"]);
    expect([state.xp, state.gems, state.streak.length]).toEqual([0, 0, 0]);
  });

  it("fails at 7 right and leaves the path at unit 1", () => {
    const { state } = play(start, 7);
    expect(state.placement).toBe("failed");
    expect(state.placedUnits).toEqual([]);
    expect(state.finishedLessons).toEqual([]);
  });

  it("ends every other kind in finishSession, never in finishPlacement", () => {
    const end = sessionEnd({ kind: "lesson", id: "hands-1" }, RUN_START, 10);
    expect(end.type).toBe("session");
    expect(answerToRecord({ kind: "boss" }, "x", false)).toEqual({ kind: "boss", exerciseId: "x", right: false });
  });
});
