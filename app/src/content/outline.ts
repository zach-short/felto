import type { UnitId } from "./schema";

// The four units of `DESIGN.md` D7, with their lesson titles in the warm register of D10, so the
// path (`PLAN.md` phase 8) can draw every node before the exercises exist. A unit's lesson file
// in `units/` uses these ids and titles; `validate.ts` checks that they match.
export interface LessonOutline {
  readonly id: string;
  readonly title: string;
}

export interface UnitOutline {
  readonly id: UnitId;
  readonly title: string;
  readonly lessons: readonly LessonOutline[];
}

export const OUTLINE = [
  {
    id: "hands",
    title: "Hands",
    lessons: [
      { id: "hands-1", title: "Ranks and suits" },
      { id: "hands-2", title: "The ten hands" },
      { id: "hands-3", title: "Name that hand" },
      { id: "hands-4", title: "Kickers break ties" },
      { id: "hands-5", title: "Who wins the pot?" },
    ],
  },
  {
    id: "table",
    title: "The table",
    lessons: [
      { id: "table-1", title: "Blinds and the button" },
      { id: "table-2", title: "Six seats" },
      { id: "table-3", title: "Four rounds of betting" },
      { id: "table-4", title: "Fold, check or call" },
      { id: "table-5", title: "Bet and raise" },
    ],
  },
  {
    id: "preflop",
    title: "Preflop",
    lessons: [
      { id: "preflop-1", title: "Hands in shorthand" },
      { id: "preflop-2", title: "Why your seat matters" },
      { id: "preflop-3", title: "Opening up front" },
      { id: "preflop-4", title: "Opening late" },
      { id: "preflop-5", title: "Opening from the small blind" },
    ],
  },
  {
    id: "odds",
    title: "Outs and odds",
    lessons: [
      { id: "odds-1", title: "Counting outs" },
      { id: "odds-2", title: "Draws to know" },
      { id: "odds-3", title: "Pot odds" },
      { id: "odds-4", title: "The rule of 2 and 4" },
      { id: "odds-5", title: "Call or fold?" },
    ],
  },
] as const satisfies readonly UnitOutline[];

export function unitOutline(id: UnitId): UnitOutline {
  const found = OUTLINE.find((unit) => unit.id === id);
  if (!found) throw new Error(`no unit "${id}" in the outline`);
  return found;
}
