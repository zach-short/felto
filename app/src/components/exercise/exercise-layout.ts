import { DIALS } from "@/config/dials";
import { BUTTON_HEIGHT, MIN_STAT_ICON, SPACE } from "@/theme/tokens";

// D17 and GF-11: the rule that keeps the answer rows on screen once the host speaks in a bubble,
// on the smallest supported iPhone (375 by 667 points, the smallest screen that runs
// DIALS.minIosVersion) and on a phone turned on its side. Two parts, both built from sizes the app
// already has, so the rule adds no dial and no token:
// - the arrangement: a window shorter than its column is wide puts the host, its bubble and the
//   scene in the left half of the column and the answer rows in the right half, so the rows start
//   at the top of the screen; every other window stacks them in one column, as before;
// - the density: when the rows, laid out roomy, would end below the screen, their padding and the
//   gaps above them go one step down the spacing scale.
// Plain numbers in and out, so a test checks the rule in node; the screen measures where its rows
// end and passes that in.

export type Size = { width: number; height: number };
export type Insets = { top: number; bottom: number };
export type Arrangement = "stack" | "split";
export type Density = "roomy" | "compact";

// The two halves of a split column sit apart by the roomy gap between blocks
export const PANE_GAP = SPACE.lg;

// The parts of LessonFrame around the exercise. The header is as tall as the hearts icon
// (lesson-header.tsx:32) inside its padding (:42), and the close glyph beside it is about as tall.
// The button row is the face and its raised edge (primary-button.tsx:53) inside the frame's
// padding (lesson-frame.tsx:52), and the scroll view pads its content (:53).
const HEADER = MIN_STAT_ICON + SPACE.sm * 2;
const BUTTON_ROW = BUTTON_HEIGHT + DIALS.buttonEdge + SPACE.md * 2;
const SCROLL_PADDING = SPACE.md * 2;

// Each density's padding above and below a row's label (choice-list.tsx:90) and gap between the
// blocks of a stacked exercise (exercise-view.tsx:48). Roomy is what those files draw today.
export const DENSITY: Readonly<Record<Density, { rowPadding: number; blockGap: number }>> = {
  roomy: { rowPadding: SPACE.md, blockGap: SPACE.lg },
  compact: { rowPadding: SPACE.sm, blockGap: SPACE.md },
};

// A phone on its side is shorter than the column is wide, and a stacked exercise would push its
// rows below the screen; a tablet either way up, and a phone upright, are taller than that
export function exerciseArrangement(window: Size, column: number): Arrangement {
  return window.height < column ? "split" : "stack";
}

// The width the host, the bubble, the scene and the rows are each laid out in. The host keeps
// its ART_SCALE.lessonMascot share of its pane.
export function paneWidth(column: number, arrangement: Arrangement): number {
  return arrangement === "split" ? (column - PANE_GAP) / 2 : column;
}

// The height LessonFrame leaves the exercise without a scroll: the window less its safe insets
// (lesson-frame.tsx:28-29), the header, the button row and the scroll padding
export function lessonBodySpace(window: Size, insets: Insets): number {
  return window.height - insets.top - insets.bottom - HEADER - BUTTON_ROW - SCROLL_PADDING;
}

// How much higher the rows end when compact: every row loses padding above and below its label,
// and in a stack every block above the rows (the bubble, and the scene when there is one) loses
// part of its gap. The rows of a split column start at the top of their own half.
export function compactSaving(rows: number, blocksAbove: number, arrangement: Arrangement): number {
  const padding = (DENSITY.roomy.rowPadding - DENSITY.compact.rowPadding) * 2 * rows;
  if (arrangement === "split") return padding;
  return padding + (DENSITY.roomy.blockGap - DENSITY.compact.blockGap) * blocksAbove;
}

// Compact only when the rows, laid out roomy, would end below the space. `rowsBottom` is measured
// in the density on screen, and a compact measure is turned back into its roomy height first, so
// the answer is the same whichever density was measured and the layout cannot flip back and
// forth. Rows that still end below the space scroll, as any exercise could before.
export function exerciseDensity(space: number, rowsBottom: number, measuredIn: Density, saving: number): Density {
  const roomyBottom = measuredIn === "compact" ? rowsBottom + saving : rowsBottom;
  return roomyBottom > space ? "compact" : "roomy";
}
