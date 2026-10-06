import { GAME_TEXT, type GameSize } from "@/theme/tokens";

// FeltoRank's own metrics, as shares of its size, read from app/assets/fonts/FeltoRank.ttf with
// fontTools on 2026-10-05 (1000 units to the em): hhea ascent 1011 and descent -353, and every
// digit advances 600, so a column of rolling digits never changes width
const ASCENT = 1.011;
const DESCENT = 0.353;
const DIGIT_ADVANCE = 0.6;

// The advance of each printable ASCII character, space (32) to tilde (126), in thousandths of the
// size, read from the same file the same day. The box of a word is summed from these because React
// Native measured a plain-text copy in this face narrower than it draws it (the iPhone 17 Pro
// simulator, 2026-10-05: "BOSS" came out about 70 points wide where its advances add to 78), and
// the SVG letters were cut off at the box's edge.
const ASCII_ADVANCES = [
  279, 260, 481, 600, 600, 954, 745, 256, 382, 382, 454, 600, 260, 440, 260, 331,
  600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 260, 260, 600, 600, 600, 468,
  952, 753, 695, 684, 774, 605, 570, 742, 780, 297, 372, 688, 573, 876, 753, 796,
  664, 796, 696, 641, 632, 743, 727, 1120, 685, 631, 615, 377, 331, 377, 600, 500,
  388, 557, 610, 478, 610, 549, 382, 615, 595, 268, 273, 558, 333, 889, 595, 589,
  610, 610, 412, 492, 404, 590, 534, 861, 559, 533, 480, 414, 302, 414, 600,
];
const FIRST_ASCII = 32;
// A character outside the table gets the widest advance in it, so it can add space but is never cut
const WIDEST = Math.max(...ASCII_ADVANCES);

// The width of a word in this face, from its advances. Kerning, which only narrows a pair, is left
// out, so the box is never too small
export function textWidth(text: string, fontSize: number): number {
  const units = Array.from(text).reduce((sum, char) => sum + (ASCII_ADVANCES[(char.codePointAt(0) ?? 0) - FIRST_ASCII] ?? WIDEST), 0);
  return (units / 1000) * fontSize;
}

// The width of a word of game text: the letters and the outline on both sides
export function gameWidth(text: string, size: GameSize): number {
  const { size: fontSize, outline } = GAME_TEXT[size];
  return textWidth(text, fontSize) + outline * 2;
}

export type GameLine = { fontSize: number; outline: number; depth: number; baseline: number; height: number };

// GF-16: the box one line of game text draws in. The outline reaches past the letters on every
// side and the extrusion hangs below them, so the box grows by both and the baseline moves down
// by the outline
export function gameLine(size: GameSize): GameLine {
  const { size: fontSize, outline, depth } = GAME_TEXT[size];
  return {
    fontSize,
    outline,
    depth,
    baseline: outline + ASCENT * fontSize,
    height: outline * 2 + depth + (ASCENT + DESCENT) * fontSize,
  };
}

// One digit of a rolling number in game text: its own advance and the outline on both sides
export function digitCellWidth(size: GameSize): number {
  const { size: fontSize, outline } = GAME_TEXT[size];
  return DIGIT_ADVANCE * fontSize + outline * 2;
}

// One digit of a rolling number in plain text, in the same face so every digit is as wide
export function plainDigitWidth(fontSize: number): number {
  return DIGIT_ADVANCE * fontSize;
}

// The extrusion is the outlined letters drawn again lower down. Each copy is as thick as two
// outlines, so copies no further apart than one outline join into a solid block; these are the
// drops of the copies, the last at the full depth
export function extrusionDrops(outline: number, depth: number): number[] {
  if (depth <= 0) return [];
  const copies = Math.ceil(depth / outline);
  return Array.from({ length: copies }, (_, i) => (depth * (i + 1)) / copies);
}
