import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { CHOICE_BORDER, LINE_HEIGHT, SPACE } from "@/theme/tokens";

import {
  compactSaving,
  DENSITY,
  exerciseArrangement,
  exerciseDensity,
  lessonBodySpace,
  paneWidth,
  type Density,
  type Size,
} from "./exercise-layout";

// The column of useColumnWidth (theme/use-column-width.ts:7-9), a hook, so it cannot run here
function column(window: Size): number {
  return Math.min(window.width - SPACE.md * 2, DIALS.columnMaxWidth);
}

// Window sizes in points. The safe insets below are each device's, as near as a fixture needs.
const SE_UPRIGHT = { width: 375, height: 667 };
const SE_ON_SIDE = { width: 667, height: 375 };
const PRO_UPRIGHT = { width: 402, height: 874 };
const PRO_ON_SIDE = { width: 874, height: 402 };
const SMALL_ANDROID_UPRIGHT = { width: 360, height: 640 };
const SMALL_ANDROID_ON_SIDE = { width: 640, height: 360 };
const IPAD_UPRIGHT = { width: 820, height: 1180 };
const IPAD_ON_SIDE = { width: 1180, height: 820 };
const ANDROID_TABLET_ON_SIDE = { width: 1280, height: 800 };

// One answer row with a one-line label, as choice-list.tsx draws it, and a list of them
function rowsHeight(rows: number, density: Density): number {
  const row = DENSITY[density].rowPadding * 2 + LINE_HEIGHT.body + CHOICE_BORDER * 2 + DIALS.choiceEdge;
  return rows * row + (rows - 1) * SPACE.sm;
}

describe("the arrangement", () => {
  it("stacks the exercise on a phone held upright and on a tablet either way up", () => {
    const windows = [SE_UPRIGHT, PRO_UPRIGHT, SMALL_ANDROID_UPRIGHT, IPAD_UPRIGHT, IPAD_ON_SIDE, ANDROID_TABLET_ON_SIDE];
    expect(windows.map((w) => exerciseArrangement(w, column(w)))).toEqual(windows.map(() => "stack"));
  });

  it("splits the column on a phone turned on its side", () => {
    const windows = [SE_ON_SIDE, PRO_ON_SIDE, SMALL_ANDROID_ON_SIDE];
    expect(windows.map((w) => exerciseArrangement(w, column(w)))).toEqual(windows.map(() => "split"));
  });

  it("gives a stack the whole column and a split two halves with a gap between them", () => {
    expect(paneWidth(343, "stack")).toBe(343);
    expect(paneWidth(635, "split") * 2 + SPACE.lg).toBe(635);
  });
});

describe("the space for the exercise", () => {
  it("is the window less the insets, the header, the button row and the scroll padding", () => {
    expect(lessonBodySpace(SE_UPRIGHT, { top: 20, bottom: 0 })).toBe(487);
    expect(lessonBodySpace(SE_ON_SIDE, { top: 0, bottom: 0 })).toBe(215);
    expect(lessonBodySpace(PRO_ON_SIDE, { top: 0, bottom: 21 })).toBe(221);
  });
});

describe("the density", () => {
  it("saves each row's padding step, and in a stack each gap step above the rows", () => {
    expect(compactSaving(3, 2, "stack")).toBe(64);
    expect(compactSaving(3, 2, "split")).toBe(48);
    expect(compactSaving(2, 1, "stack")).toBe(40);
  });

  it("stays roomy when the rows end on screen, and goes compact when they would not", () => {
    expect(exerciseDensity(487, 487, "roomy", 64)).toBe("roomy");
    expect(exerciseDensity(487, 488, "roomy", 64)).toBe("compact");
    expect(exerciseDensity(487, 430, "compact", 64)).toBe("compact");
    expect(exerciseDensity(487, 420, "compact", 64)).toBe("roomy");
  });

  it("gives the same answer whichever density the rows were measured in", () => {
    const bottoms = Array.from({ length: 200 }, (_, i) => 380 + i);
    const flips = bottoms.filter((b) => exerciseDensity(487, b, "roomy", 64) !== exerciseDensity(487, b - 64, "compact", 64));
    expect(flips).toEqual([]);
  });

  it("keeps three one-line rows roomy beside the bubble on an SE on its side, and fits four once compact", () => {
    const space = lessonBodySpace(SE_ON_SIDE, { top: 0, bottom: 0 });
    expect(exerciseDensity(space, rowsHeight(3, "roomy"), "roomy", compactSaving(3, 0, "split"))).toBe("roomy");
    expect(exerciseDensity(space, rowsHeight(4, "roomy"), "roomy", compactSaving(4, 0, "split"))).toBe("compact");
    expect(rowsHeight(4, "compact")).toBeLessThanOrEqual(space);
  });
});
