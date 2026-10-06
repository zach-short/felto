// GF-15: the steps of a rolling number, as plain data so a node test can check them. Each column
// is a strip of glyphs stacked top to bottom; the view shows one at a time and slides the strip
// from the `from` glyph to the `to` glyph. A blank ("") is a column the shorter number lacks.

export type RollColumn = { strip: string[]; from: number; to: number };

// The digits a number shows: a whole number, never below 0, because every number the game counts
// (XP, gems, a streak) is one
export function digitsOf(value: number): string {
  return String(Math.max(0, Math.round(value)));
}

// A column turns the way the whole number moved: up, the next digit comes from below, through 9
// to 0 when it wraps; down, it comes from above. A column that appears or goes away rolls in or
// out from a blank in one step. A column whose digit is the same stays still.
export function rollColumns(from: number, to: number): RollColumn[] {
  const before = digitsOf(from);
  const after = digitsOf(to);
  const width = Math.max(before.length, after.length);
  const up = Number(after) >= Number(before);
  const old = padBlank(before, width);
  const next = padBlank(after, width);
  return old.map((glyph, i) => column(glyph, next[i], up));
}

function padBlank(digits: string, width: number): string[] {
  return [...Array<string>(width - digits.length).fill(""), ...digits];
}

function column(old: string, next: string, up: boolean): RollColumn {
  if (old === next) return { strip: [next], from: 0, to: 0 };
  const path = old === "" || next === "" ? [old, next] : digitPath(Number(old), Number(next), up);
  const last = path.length - 1;
  return up ? { strip: path, from: 0, to: last } : { strip: [...path].reverse(), from: last, to: 0 };
}

// The digits a column passes, from the old one to the new one, one step at a time
function digitPath(old: number, next: number, up: boolean): string[] {
  const step = up ? 1 : 9;
  const steps = (up ? next - old + 10 : old - next + 10) % 10;
  return Array.from({ length: steps + 1 }, (_, i) => String((old + step * i) % 10));
}
