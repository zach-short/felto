// GF-11: the steps of a bubble's typing, as plain data so a node test can check them. A line marks
// its key words with asterisks ("to gain *opposition*."), which the bubble draws in its key colour
// (photo IMG_2865); the asterisks themselves are never drawn.

export type LinePart = { text: string; key: boolean };
export type TypedPart = LinePart & { shown: boolean };

// The parts of a line: every second run between asterisks is a key word. Empty runs are dropped
export function parseLine(line: string): LinePart[] {
  return line
    .split("*")
    .map((text, i) => ({ text, key: i % 2 === 1 }))
    .filter((part) => part.text !== "");
}

// The line as a screen reader reads it: whole, with no marks
export function plainLine(parts: LinePart[]): string {
  return parts.map((part) => part.text).join("");
}

// Characters are counted by code point, so an accented letter or an emoji types as one
export function lineLength(parts: LinePart[]): number {
  return parts.reduce((sum, part) => sum + Array.from(part.text).length, 0);
}

// How many characters show after a time: one more each `msPerChar`, never more than the line
export function typedCount(elapsedMs: number, msPerChar: number, total: number): number {
  if (msPerChar <= 0) return total;
  return Math.min(total, Math.max(0, Math.floor(elapsedMs / msPerChar)));
}

// The line split where the typing has reached. The untyped rest is still laid out, only not
// shown, so the bubble is its full size from the first character and the words never jump to a
// new line as they type
export function typedParts(parts: LinePart[], count: number): TypedPart[] {
  let left = count;
  return parts.flatMap((part) => {
    const chars = Array.from(part.text);
    const shown = Math.min(chars.length, Math.max(0, left));
    left -= chars.length;
    const pieces: TypedPart[] = [];
    if (shown > 0) pieces.push({ ...part, text: chars.slice(0, shown).join(""), shown: true });
    if (shown < chars.length) pieces.push({ ...part, text: chars.slice(shown).join(""), shown: false });
    return pieces;
  });
}
