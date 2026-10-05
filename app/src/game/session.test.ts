import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";
import type { SessionResult } from "@/game/session";
import { finishSession, recordAnswer } from "@/game/session";

const now = new Date(2026, 9, 5, 12);
const start = freshState(now);
const played = (kind: SessionResult["kind"], id: string, answered: number, right: number) => ({
  kind,
  id,
  size: 10,
  answered,
  right,
});

describe("answers (D8)", () => {
  it("spends a life and records the miss for a wrong answer in a lesson", () => {
    const state = recordAnswer(start, { kind: "lesson", exerciseId: "e1", right: false }, now);
    expect(state.lives).toBe(4);
    expect(state.missedExercises).toEqual(["e1"]);
  });

  it("costs no life for a wrong answer in a review or in practice", () => {
    for (const kind of ["review", "practice"] as const) {
      expect(recordAnswer(start, { kind, exerciseId: "e1", right: false }, now).lives).toBe(5);
    }
  });

  it("clears a miss answered right in a review, and only there", () => {
    const missed = { ...start, missedExercises: ["e1", "e2"] };
    const inLesson = recordAnswer(missed, { kind: "lesson", exerciseId: "e1", right: true }, now);
    expect(inLesson.missedExercises).toEqual(["e1", "e2"]);
    const inReview = recordAnswer(missed, { kind: "review", exerciseId: "e1", right: true }, now);
    expect(inReview.missedExercises).toEqual(["e2"]);
  });
});

describe("finishing a session (D8, D21)", () => {
  it("gives 10 XP for each right answer, finishes the lesson and counts for the streak", () => {
    const state = finishSession(start, played("lesson", "u1-l1", 10, 7), now);
    expect(state.xp).toBe(70);
    expect(state.finishedLessons).toEqual(["u1-l1"]);
    expect(state.streak).toEqual({ length: 1, lastDay: "2026-10-05" });
  });

  it("gives nothing for a lesson left before its end", () => {
    expect(finishSession(start, played("lesson", "u1-l1", 9, 9), now)).toBe(start);
  });

  it("does not count a practice set left early", () => {
    expect(finishSession(start, played("practice", "practice", 6, 6), now)).toBe(start);
  });

  it("gives 5 XP for each right answer in a finished practice set, and counts it for the streak", () => {
    const state = finishSession(start, played("practice", "practice", 10, 9), now);
    expect(state.xp).toBe(45);
    expect(state.streak.length).toBe(1);
  });

  it("passes the boss at 8 right and not at 7", () => {
    expect(finishSession(start, played("boss", "u1", 10, 8), now).passedBosses).toEqual(["u1"]);
    expect(finishSession(start, played("boss", "u1", 10, 7), now).passedBosses).toEqual([]);
  });

  it("does not count a finished practice set of 3, for the streak or for XP", () => {
    const short = { kind: "practice" as const, id: "practice", size: 3, answered: 3, right: 3 };
    expect(finishSession(start, short, now)).toBe(start);
  });

  it("does not finish a lesson or pass a boss whose size is not the dial's", () => {
    expect(finishSession(start, { ...played("lesson", "u1-l1", 5, 5), size: 5 }, now)).toBe(start);
    expect(finishSession(start, { ...played("boss", "u1", 12, 12), size: 12 }, now)).toBe(start);
  });

  it("refuses a review longer than ten and a right count above the answers", () => {
    expect(finishSession(start, { ...played("review", "u1", 11, 11), size: 11 }, now)).toBe(start);
    expect(finishSession(start, played("lesson", "u1-l1", 10, 11), now)).toBe(start);
  });

  it("counts a review for the streak", () => {
    const state = finishSession(start, { ...played("review", "u1", 4, 4), size: 4 }, now);
    expect(state.streak.length).toBe(1);
    expect(state.xp).toBe(40);
  });
});
