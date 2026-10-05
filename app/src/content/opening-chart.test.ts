import { describe, expect, it } from "vitest";

import { allHandClasses, comboCount, type HandClass } from "@/cards/hand-class";

import { OPENING_CHART } from "./opening-chart";
import { OPEN_SEATS, type OpenSeat } from "./schema";

const chart: Readonly<Record<OpenSeat, readonly HandClass[]>> = OPENING_CHART;
const valid = new Set<string>(allHandClasses());

function missing(from: OpenSeat, inSeat: OpenSeat): HandClass[] {
  return chart[from].filter((hand) => !chart[inSeat].includes(hand));
}

function combos(seat: OpenSeat): number {
  return chart[seat].reduce((sum, hand) => sum + comboCount(hand), 0);
}

describe("the opening chart", () => {
  // A hand written low card first ("TAs") would type-check and never match `handClass`, so it
  // would fold silently.
  it.each(OPEN_SEATS)("names only real hand classes, each once, at %s", (seat) => {
    expect(chart[seat].filter((hand) => !valid.has(hand))).toEqual([]);
    expect(new Set(chart[seat]).size).toBe(chart[seat].length);
  });

  // `PLAN.md` phase 7: each later seat from UTG to BTN opens every hand of the seat before it.
  it.each([
    ["UTG", "HJ"],
    ["HJ", "CO"],
    ["CO", "BTN"],
  ] as const)("opens every %s hand from %s", (earlier, later) => {
    expect(missing(earlier, later)).toEqual([]);
  });

  // The small blind sits between the cutoff and the button (`opening-chart.ts`).
  it("opens every cutoff hand from the small blind, and no hand the button folds", () => {
    expect(missing("CO", "SB")).toEqual([]);
    expect(missing("SB", "BTN")).toEqual([]);
  });

  // Pins the size of each range, so an edit to the chart is seen in review.
  it("opens the counted share of the 1,326 starting hands from each seat", () => {
    expect(OPEN_SEATS.map((seat) => [seat, combos(seat)])).toEqual([
      ["UTG", 152],
      ["HJ", 206],
      ["CO", 326],
      ["BTN", 454],
      ["SB", 382],
    ]);
  });
});
