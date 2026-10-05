import { describe, expect, it, vi } from "vitest";

import { RUN_START, runStep, type RunEvent, type RunState } from "./lesson-run";
import { performCheck, performContinue, runCounted, sheetDismissAction } from "./session-steps";
import { UNITS } from "@/content/catalog";

const EXERCISE = UNITS[0].lessons[0].exercises[0];
const boom = () => {
  throw new Error("audio failed");
};

// Plays the reducer the hook would, so a test sees the state a second press would find
function harness(start: RunState) {
  let run = start;
  const dispatch = (event: RunEvent) => {
    run = runStep(run, event);
  };
  return { dispatch, current: () => run };
}

describe("performCheck (audit of item 13, B1)", () => {
  it("moves the run to its feedback even when the sound throws, so Check cannot spend twice", () => {
    const h = harness({ ...RUN_START, choice: (EXERCISE.answer + 1) % EXERCISE.options.length });
    const record = vi.fn();
    const effects = { dispatch: h.dispatch, record, showWords: vi.fn(), playRight: boom, playWrong: boom };
    const guard = { current: -1 };
    expect(() => performCheck(h.current(), EXERCISE, guard, effects)).not.toThrow();
    expect(h.current().phase).toBe("feedback");
    performCheck(h.current(), EXERCISE, guard, effects);
    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(false);
  });

  it("does nothing without a choice", () => {
    const h = harness(RUN_START);
    const record = vi.fn();
    performCheck(h.current(), EXERCISE, { current: -1 }, { dispatch: h.dispatch, record, showWords: vi.fn(), playRight: vi.fn(), playWrong: vi.fn() });
    expect(record).not.toHaveBeenCalled();
  });
});

describe("performContinue (audit of item 13, B1)", () => {
  const lastFeedback: RunState = { ...RUN_START, index: 9, answered: 10, right: 8, phase: "feedback", choice: 0 };

  it("finishes the run even when the finish sound throws, and counts it once", () => {
    const h = harness(lastFeedback);
    const finish = vi.fn();
    const guard = { current: -1 };
    const effects = { dispatch: h.dispatch, livesLeft: () => 5, finish, playFinish: boom };
    expect(() => performContinue(h.current(), 10, guard, effects)).not.toThrow();
    expect(h.current().phase).toBe("finished");
    performContinue(lastFeedback, 10, guard, effects);
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("moves to the next exercise without finishing before the last", () => {
    const h = harness({ ...RUN_START, answered: 1, phase: "feedback", choice: 0 });
    const finish = vi.fn();
    performContinue(h.current(), 10, { current: -1 }, { dispatch: h.dispatch, livesLeft: () => 5, finish, playFinish: vi.fn() });
    expect(h.current()).toMatchObject({ index: 1, phase: "answering" });
    expect(finish).not.toHaveBeenCalled();
  });

  it("lets a review go on at zero lives when the hook passes no limit", () => {
    const h = harness({ ...RUN_START, answered: 1, phase: "feedback", choice: 0 });
    performContinue(h.current(), 10, { current: -1 }, {
      dispatch: h.dispatch,
      livesLeft: () => Number.POSITIVE_INFINITY,
      finish: vi.fn(),
      playFinish: vi.fn(),
    });
    expect(h.current().phase).toBe("answering");
  });
});

describe("runCounted (audit of item 13, finding 7)", () => {
  it("counts a run answered from the start and not one opened part way by the development link", () => {
    expect(runCounted({ ...RUN_START, index: 9, answered: 10, phase: "finished" }, 10)).toBe(true);
    expect(runCounted({ ...RUN_START, index: 9, answered: 5, phase: "finished" }, 10)).toBe(false);
  });
});

describe("sheetDismissAction (audit of item 13, finding 2)", () => {
  it("asks to leave when Android's back button closes the feedback sheet, and moves on after an iOS swipe", () => {
    expect(sheetDismissAction("android")).toBe("ask-to-leave");
    expect(sheetDismissAction("ios")).toBe("continue");
  });
});
