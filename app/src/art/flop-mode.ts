// The artboard of assets/rive/flop.riv, 600 by 520 (HANDOFF step 34), so the drawn height keeps the
// file's shape the way ART_BOXES does for an SVG.
const FLOP_ARTBOARD = { width: 600, height: 520 } as const;

export type FlopMode = "rive" | "static";

// The rigged Flop plays only when motion is allowed and the file loaded; otherwise the static happy
// pose stands in (GF-8 for reduced motion, board item 34 for a file that fails to load).
export function flopMode(motionAllowed: boolean, failed: boolean): FlopMode {
  return motionAllowed && !failed ? "rive" : "static";
}

export function flopHeight(width: number): number {
  return (width * FLOP_ARTBOARD.height) / FLOP_ARTBOARD.width;
}
