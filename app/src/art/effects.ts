// GF-15 (board item 49): the Lottie effects that tools/build_lottie.py writes into assets/lottie/,
// one file each, named as the files are
export type EffectName = "burst" | "confetti" | "sparkle_shower" | "gem_fly_up" | "chip_fly_up" | "flame_flicker";

// Whether each effect loops when its caller does not say: the flame flickers for as long as it is
// drawn, and every other effect plays once
export const EFFECT_LOOPS: Record<EffectName, boolean> = {
  burst: false,
  confetti: false,
  sparkle_shower: false,
  gem_fly_up: false,
  chip_fly_up: false,
  flame_flicker: true,
};

export const EFFECT_NAMES = Object.keys(EFFECT_LOOPS) as EffectName[];

export type EffectMode = "play" | "still" | "none";

// GF-8: under reduced motion a one-shot effect draws nothing, and a loop stands still on its first
// frame, so a flame still shows where it stands. A file that fails to load draws nothing either way.
export function effectMode(loop: boolean, motionAllowed: boolean, failed: boolean): EffectMode {
  if (failed) return "none";
  if (motionAllowed) return "play";
  return loop ? "still" : "none";
}

// The drawn height keeps the file's own shape, as ART_BOXES does for an SVG
export function effectHeight(width: number, box: { w: number; h: number }): number {
  return (width * box.h) / box.w;
}
