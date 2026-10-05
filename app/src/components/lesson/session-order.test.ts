import { describe, expect, it, vi } from "vitest";

import { costsLives, RUN_START, runStep, type RunEvent, type RunState } from "./lesson-run";
import { performCheck, performContinue } from "./session-steps";
import { UNITS } from "@/content/catalog";

const EXERCISE = UNITS[0].lessons[0].exercises[0];
const WRONG = (EXERCISE.answer + 1) % EXERCISE.options.length;
const boom = () => {
  throw new Error("record failed");
};

// Plays the reducer the hook would, so a test sees the state a later press would find
function harness(start: RunState) {
  let run = start;
  const dispatch = (event: RunEvent) => {
    run = runStep(run, event);
  };
  return { dispatch, current: () => run };
}

describe("performCheck, two presses inside one render (audit of item 14, finding a)", () => {
  it("records a wrong answer once, so it spends one heart, when both presses read the same run", () => {
    const h = harness({ ...RUN_START, choice: WRONG });
    const sameRender = h.current();
    const record = vi.fn();
    const guard = { current: -1 };
    const effects = { dispatch: h.dispatch, record, showWords: vi.fn(), playRight: vi.fn(), playWrong: vi.fn() };
    performCheck(sameRender, EXERCISE, guard, effects);
    performCheck(sameRender, EXERCISE, guard, effects);
    expect(record).toHaveBeenCalledTimes(1);
  });

  it("checks the next exercise again once the run has moved on", () => {
    const h = harness({ ...RUN_START, choice: WRONG });
    const record = vi.fn();
    const guard = { current: -1 };
    const effects = { dispatch: h.dispatch, record, showWords: vi.fn(), playRight: vi.fn(), playWrong: vi.fn() };
    performCheck(h.current(), EXERCISE, guard, effects);
    performContinue(h.current(), 10, { current: -1 }, { dispatch: h.dispatch, livesLeft: () => 5, finish: vi.fn(), playFinish: vi.fn() });
    h.dispatch({ type: "choose", choice: EXERCISE.answer });
    performCheck(h.current(), EXERCISE, guard, effects);
    expect(record).toHaveBeenCalledTimes(2);
  });
});

describe("the run's state moves before any effect (audit of item 14, finding b)", () => {
  it("dispatches before it records, shows the words or plays the sound", () => {
    const calls: string[] = [];
    const note = (name: string) => () => {
      calls.push(name);
    };
    performCheck({ ...RUN_START, choice: WRONG }, EXERCISE, { current: -1 }, {
      dispatch: note("dispatch"),
      record: note("record"),
      showWords: note("showWords"),
      playRight: note("playRight"),
      playWrong: note("playWrong"),
    });
    expect(calls).toEqual(["dispatch", "record", "showWords", "playWrong"]);
  });

  it("leaves the answer closed when recording it throws, so another press cannot spend again", () => {
    const h = harness({ ...RUN_START, choice: WRONG });
    const effects = { dispatch: h.dispatch, record: boom, showWords: vi.fn(), playRight: vi.fn(), playWrong: vi.fn() };
    expect(() => performCheck(h.current(), EXERCISE, { current: -1 }, effects)).toThrow("record failed");
    expect(h.current().phase).toBe("feedback");
  });

  it("moves the run on before it finishes the session or plays the finish sound", () => {
    const calls: string[] = [];
    const lastFeedback: RunState = { ...RUN_START, index: 9, answered: 10, right: 8, phase: "feedback", choice: 0 };
    performContinue(lastFeedback, 10, { current: -1 }, {
      dispatch: () => calls.push("dispatch"),
      livesLeft: () => 5,
      finish: () => calls.push("finish"),
      playFinish: () => calls.push("playFinish"),
    });
    expect(calls).toEqual(["dispatch", "finish", "playFinish"]);
  });
});

describe("costsLives (D8, D21)", () => {
  it("spends hearts in a lesson and a boss only", () => {
    expect(costsLives({ kind: "lesson" })).toBe(true);
    expect(costsLives({ kind: "boss" })).toBe(true);
    expect(costsLives({ kind: "review" })).toBe(false);
    expect(costsLives({ kind: "practice" })).toBe(false);
  });
});
