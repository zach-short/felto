import { describe, expect, it } from "vitest";

import { UNITS } from "@/content/catalog";
import { DEALERS } from "@/drills/deal";
import { withDealtSlots } from "@/game/dealt-slots";
import { freshState } from "@/game/player-state";
import { recordAnswer } from "@/game/session";

const now = new Date(2026, 9, 5, 12);
const start = { ...freshState(now), missedExercises: ["hands-1-01"] };
const hands3 = UNITS[0].lessons.find((lesson) => lesson.id === "hands-3")?.exercises ?? [];
const dealtId = withDealtSlots(hands3, 7, DEALERS)[0].id;

describe("a dealt answer is never kept as missed (US-2)", () => {
  it("is a dealt slot in the first place", () => {
    expect(dealtId).not.toBe(hands3[0].id);
    expect(dealtId.startsWith("practice-")).toBe(true);
  });

  it("spends a life and leaves the missed list alone for a wrong dealt answer in a lesson or a boss", () => {
    for (const kind of ["lesson", "boss"] as const) {
      const state = recordAnswer(start, { kind, exerciseId: dealtId, right: false }, now);
      expect(state.lives).toBe(4);
      expect(state.missedExercises).toEqual(["hands-1-01"]);
    }
  });

  it("still keeps a wrong authored answer", () => {
    const state = recordAnswer(start, { kind: "lesson", exerciseId: "hands-3-03", right: false }, now);
    expect(state.lives).toBe(4);
    expect(state.missedExercises).toEqual(["hands-1-01", "hands-3-03"]);
  });

  it("changes nothing for a right dealt answer", () => {
    expect(recordAnswer(start, { kind: "lesson", exerciseId: dealtId, right: true }, now)).toEqual(start);
  });
});
