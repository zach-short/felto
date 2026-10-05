import { describe, expect, it } from "vitest";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { fixtureState } from "@/game/fixtures";
import { finishSession, recordAnswer } from "@/game/session";
import { freshState } from "@/game/player-state";

import { lessonAccess } from "./lesson-lookup";
import { RUN_START, runResult, runStep, type RunState } from "./lesson-run";

const NOW = new Date(2026, 9, 5, 12, 0);

function answer(run: RunState, choice: number, key: number): RunState {
  return runStep(runStep(run, { type: "choose", choice }), { type: "check", answer: key });
}

describe("runStep", () => {
  it("does not check before a choice is made", () => {
    expect(runStep(RUN_START, { type: "check", answer: 0 })).toBe(RUN_START);
  });

  it("counts a right and a wrong answer and moves to the next exercise", () => {
    const right = answer(RUN_START, 1, 1);
    expect(right).toMatchObject({ phase: "feedback", answered: 1, right: 1, lastRight: true });
    const next = runStep(right, { type: "continue", size: 10, livesLeft: 5 });
    expect(next).toMatchObject({ index: 1, choice: null, phase: "answering" });
    const wrong = answer(next, 0, 2);
    expect(wrong).toMatchObject({ answered: 2, right: 1, lastRight: false });
  });

  it("ignores a second continue, so one tap and one sheet dismissal move once", () => {
    const fed = answer(RUN_START, 0, 0);
    const once = runStep(fed, { type: "continue", size: 10, livesLeft: 5 });
    expect(runStep(once, { type: "continue", size: 10, livesLeft: 5 })).toBe(once);
  });

  it("stops at 0 lives before the end, and finishes on the last exercise even at 0 (D8)", () => {
    const fed = answer(RUN_START, 0, 1);
    expect(runStep(fed, { type: "continue", size: 10, livesLeft: 0 }).phase).toBe("out-of-lives");
    const last = answer({ ...RUN_START, index: 9 }, 0, 1);
    expect(runStep(last, { type: "continue", size: 10, livesLeft: 0 }).phase).toBe("finished");
  });

  it("plays a whole lesson into a result that finishSession counts, 10 XP a right answer", () => {
    let run = RUN_START;
    for (let i = 0; i < 10; i += 1) {
      run = answer(run, i % 4 === 0 ? 1 : 0, 0);
      run = runStep(run, { type: "continue", size: 10, livesLeft: 5 });
    }
    expect(run.phase).toBe("finished");
    const before = freshState(NOW);
    const after = finishSession(before, runResult(run, "hands-1", 10), NOW);
    expect(run.right).toBe(7);
    expect(after.xp - before.xp).toBe(70);
    expect(after.finishedLessons).toContain("hands-1");
  });
});

describe("lessonAccess", () => {
  it("opens the current lesson and refuses a locked, a missing and a no-lives one", () => {
    const fresh = freshState(NOW);
    expect(lessonAccess(fresh, "hands-1", NOW).kind).toBe("open");
    expect(lessonAccess(fresh, "hands-2", NOW).kind).toBe("locked");
    expect(lessonAccess(fresh, "no-such-lesson", NOW).kind).toBe("missing");
    const zero = fixtureState("zero-lives", PATH_OUTLINE, NOW);
    expect(lessonAccess(zero, "hands-4", NOW).kind).toBe("no-lives");
  });

  it("closes the lesson once a wrong answer spends the last life", () => {
    const one = { ...freshState(NOW), lives: 1 };
    const spent = recordAnswer(one, { kind: "lesson", exerciseId: "hands-1-01", right: false }, NOW);
    expect(lessonAccess(spent, "hands-1", NOW).kind).toBe("no-lives");
  });
});
