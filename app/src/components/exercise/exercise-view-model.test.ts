import { describe, expect, it } from "vitest";

import { UNITS } from "@/content/catalog";
import type { Exercise } from "@/content/schema";

import { answerLabel, choiceMarks, exerciseScene, optionLabels, showdownLabel } from "./exercise-view-model";

const ALL: Exercise[] = UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => [...lesson.exercises]));

function byKind(kind: Exercise["kind"]): Exercise[] {
  return ALL.filter((ex) => ex.kind === kind);
}

describe("exerciseScene", () => {
  it("shows a seven-card hand as two hole cards above the last five as the board", () => {
    const seven = byKind("hand-name").filter((ex) => ex.kind === "hand-name" && ex.cards.length === 7);
    expect(seven.length).toBeGreaterThan(0);
    for (const ex of seven) {
      if (ex.kind !== "hand-name") continue;
      const scene = exerciseScene(ex);
      expect(scene).toEqual({
        kind: "cards",
        groups: [
          { label: "Your hole cards", cards: ex.cards.slice(0, 2) },
          { label: "The board", cards: ex.cards.slice(2) },
        ],
      });
    }
  });

  it("shows a five-card hand as one unlabelled row", () => {
    const ex = byKind("hand-name").find((e) => e.kind === "hand-name" && e.cards.length === 5);
    expect(ex && exerciseScene(ex)).toMatchObject({ kind: "cards", groups: [{ label: null }] });
  });

  it("names each showdown player in seat order", () => {
    const ex = byKind("showdown")[0];
    const scene = exerciseScene(ex);
    expect(scene.kind).toBe("showdown");
    if (scene.kind === "showdown") expect(scene.players.map((p) => p.label)).toEqual(["Player 1", "Player 2"]);
  });

  it("gives every odds exercise the numbers its prompt needs", () => {
    for (const ex of byKind("odds")) {
      const scene = exerciseScene(ex);
      expect(scene.kind).toBe("facts");
      if (scene.kind === "facts") expect(scene.facts.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("draws every card of every exercise exactly once", () => {
    for (const ex of ALL) {
      const scene = exerciseScene(ex);
      const shown =
        scene.kind === "cards"
          ? scene.groups.flatMap((g) => g.cards)
          : scene.kind === "showdown"
            ? [...scene.board.cards, ...scene.players.flatMap((p) => p.cards)]
            : [];
      expect(new Set(shown).size).toBe(shown.length);
    }
  });
});

describe("optionLabels", () => {
  it("gives every written exercise one non-empty label per option, all different", () => {
    for (const ex of ALL) {
      const labels = optionLabels(ex);
      expect(labels).toHaveLength(ex.options.length);
      expect(labels.every((label) => label.length > 0)).toBe(true);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  it("names the right answer for the wrong-answer line", () => {
    const ex = byKind("preflop")[0];
    expect(answerLabel(ex)).toBe(ex.options[ex.answer] === "raise" ? "Raise" : "Fold");
  });
});

describe("choiceMarks", () => {
  it("marks the choice before the check, and right and wrong after it", () => {
    expect(choiceMarks(3, 1, 2, false)).toEqual(["plain", "chosen", "plain"]);
    expect(choiceMarks(3, 1, 2, true)).toEqual(["plain", "wrong", "right"]);
    expect(choiceMarks(3, 2, 2, true)).toEqual(["plain", "plain", "right"]);
  });
});

describe("showdownLabel", () => {
  it("names one winner, a full split and a partial split", () => {
    expect(showdownLabel([1], 2)).toBe("Player 2 wins");
    expect(showdownLabel([0, 1], 2)).toBe("Split pot");
    expect(showdownLabel([0, 2], 3)).toBe("Players 1 and 3 split");
  });
});
