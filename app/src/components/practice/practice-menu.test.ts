import { describe, expect, it } from "vitest";

import { RUN_START, runStep, sessionResult, type RunState } from "@/components/lesson/lesson-run";
import { DIALS } from "@/config/dials";
import { validateExercise } from "@/content/validate";
import { recordAnswer, finishSession } from "@/game/session";
import { currentStreak } from "@/game/streak";
import { freshState, type PlayerState } from "@/game/player-state";

import { PRACTICE_HOST, practiceAccess, practiceIntro, practiceRows } from "./practice-menu";

const NOW = new Date(2026, 9, 5, 12, 0);

function withDone(passed: string[], lives: number = DIALS.maxLives): PlayerState {
  return { ...freshState(NOW), passedBosses: passed, lives };
}

function openSession(state: PlayerState, seed: number) {
  const access = practiceAccess(state, seed);
  if (access.kind !== "open") throw new Error("expected an open set");
  return access.session;
}

// Plays a whole set through the reducer, right for the first `rightCount` answers
function playedTo(size: number, rightCount: number): RunState {
  let run = RUN_START;
  for (let i = 0; i < size; i += 1) {
    const answer = 0;
    run = runStep(run, { type: "choose", choice: i < rightCount ? answer : 1 });
    run = runStep(run, { type: "check", answer });
    run = runStep(run, { type: "continue", size, livesLeft: Number.POSITIVE_INFINITY });
  }
  return run;
}

describe("practiceRows (D21)", () => {
  it("lists all five kinds, each locked with the unit that opens it, for a new player", () => {
    const rows = practiceRows(freshState(NOW));
    expect(rows.map((row) => [row.kind, row.open])).toEqual([
      ["hand-name", false], ["showdown", false], ["preflop", false], ["outs", false], ["odds", false],
    ]);
    expect(rows[0].line).toBe("Finish unit 1, Hands, to open this.");
    expect(rows[2].line).toBe("Finish unit 3, Preflop, to open this.");
    expect(rows[4].line).toBe("Finish unit 4, Outs and odds, to open this.");
  });

  it("opens exactly the kinds openKinds opens, and never one before its unit is done", () => {
    const open = (passed: string[]) => practiceRows(withDone(passed)).filter((row) => row.open).map((row) => row.kind);
    expect(open(["hands"])).toEqual(["hand-name", "showdown"]);
    expect(open(["hands", "table"])).toEqual(["hand-name", "showdown"]);
    expect(open(["hands", "table", "preflop"])).toEqual(["hand-name", "showdown", "preflop"]);
    expect(open(["hands", "table", "preflop", "odds"])).toEqual(["hand-name", "showdown", "preflop", "outs", "odds"]);
  });

  it("greets a player with nothing open by naming unit 1, and an open player with the dials", () => {
    expect(practiceIntro(freshState(NOW))).toContain("Finish unit 1");
    expect(practiceIntro(withDone(["hands"]))).toContain(`${DIALS.practiceXpPerRight} XP`);
  });
});

describe("practiceAccess (D21)", () => {
  it("hosts a set and its closed screen with the squid (audit of item 19)", () => {
    expect(PRACTICE_HOST).toBe("squid");
    expect(openSession(withDone(["hands"]), 1).host).toBe(PRACTICE_HOST);
  });

  it("is locked while no kind is open", () => {
    expect(practiceAccess(freshState(NOW), 1).kind).toBe("locked");
  });

  it("deals a set of the dial's size, hosted by the squid, of open kinds only, all valid", () => {
    const session = openSession(withDone(["hands"]), 42);
    expect(session).toMatchObject({ kind: "practice", host: "squid" });
    expect(session.exercises).toHaveLength(DIALS.practiceSetSize);
    for (const exercise of session.exercises) {
      expect(["hand-name", "showdown"]).toContain(exercise.kind);
      expect(validateExercise(exercise)).toEqual([]);
    }
  });

  it("stays open at 0 hearts", () => {
    expect(practiceAccess(withDone(["hands"], 0), 7).kind).toBe("open");
  });

  it("deals the same set from the same seed and another from another seed", () => {
    const ids = (seed: number) => openSession(withDone(["hands", "table", "preflop", "odds"]), seed).exercises.map((e) => e.id);
    expect(ids(9)).toEqual(ids(9));
    expect(ids(9)).not.toEqual(ids(10));
  });

  it("deals only the development link's kind when one is named", () => {
    const access = practiceAccess(freshState(NOW), 3, "odds");
    expect(access.kind === "open" && access.session.exercises.every((e) => e.kind === "odds")).toBe(true);
  });
});

describe("a practice set through the game rules (D21)", () => {
  const state = withDone(["hands"], 0);

  it("spends no heart on a wrong answer", () => {
    const after = recordAnswer(state, { kind: "practice", exerciseId: "practice-1-1-showdown-2", right: false }, NOW);
    expect(after.lives).toBe(0);
    expect(after.missedExercises).toEqual([]);
  });

  it("gives 5 XP for each right answer of a finished set and counts the day for the streak", () => {
    const session = openSession(state, 5);
    const run = playedTo(session.exercises.length, 7);
    const after = finishSession(state, sessionResult(run, session, session.exercises.length), NOW);
    expect(after.xp).toBe(state.xp + 7 * DIALS.practiceXpPerRight);
    expect(currentStreak(after, NOW)).toBe(1);
  });

  it("counts the day even with 0 right, so the finish's +0 XP and streak tile are both true", () => {
    const session = openSession(state, 5);
    const after = finishSession(state, sessionResult(playedTo(session.exercises.length, 0), session, session.exercises.length), NOW);
    expect(after.xp).toBe(state.xp);
    expect(currentStreak(after, NOW)).toBe(1);
  });

  it("gives nothing for a set left early", () => {
    const session = openSession(state, 5);
    const run = { ...playedTo(4, 4), phase: "feedback" as const };
    const after = finishSession(state, sessionResult(run, session, session.exercises.length), NOW);
    expect(after).toEqual(state);
  });
});
