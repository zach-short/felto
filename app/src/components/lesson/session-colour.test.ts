import { describe, expect, it } from "vitest";

import { chosenColour, sessionUnit } from "@/components/lesson/session-colour";
import { UNITS } from "@/content/catalog";

describe("sessionUnit", () => {
  it("finds the unit of every written lesson", () => {
    for (const unit of UNITS) {
      for (const lesson of unit.lessons) expect(sessionUnit({ kind: "lesson", id: lesson.id })).toBe(unit.id);
    }
  });

  it("reads a boss's and a review's unit from their id", () => {
    expect(sessionUnit({ kind: "boss", id: "preflop" })).toBe("preflop");
    expect(sessionUnit({ kind: "review", id: "odds" })).toBe("odds");
  });

  it("gives no unit to a practice set or the placement check, whatever their id", () => {
    expect(sessionUnit({ kind: "practice", id: "practice-42" })).toBeNull();
    expect(sessionUnit({ kind: "placement", id: "hands" })).toBeNull();
  });

  it("gives no unit to an id it cannot find", () => {
    expect(sessionUnit({ kind: "lesson", id: "no-such-lesson" })).toBeNull();
    expect(sessionUnit({ kind: "boss", id: "no-such-unit" })).toBeNull();
  });
});

describe("chosenColour", () => {
  it("is the unit's colour in a session of one unit", () => {
    expect(chosenColour({ kind: "lesson", id: UNITS[0].lessons[0].id })).toBe("unitHands");
    expect(chosenColour({ kind: "lesson", id: UNITS[1].lessons[0].id })).toBe("unitTable");
    expect(chosenColour({ kind: "boss", id: "preflop" })).toBe("unitPreflop");
    expect(chosenColour({ kind: "review", id: "odds" })).toBe("unitOdds");
  });

  it("is the neutral accent in a practice set and the placement check", () => {
    expect(chosenColour({ kind: "practice", id: "practice-1" })).toBe("accent");
    expect(chosenColour({ kind: "placement", id: "placement-1" })).toBe("accent");
  });
});
