// GF-17: where the stars of a sparkle layer sit and when each twinkles, as plain numbers so a node
// test can check them. The places are fixed by their index, not drawn at random, so a box sparkles
// the same way on every draw and in every screenshot.

export type StarPlace = { x: number; y: number; size: number; delayMs: number };

// The fractional parts of multiples of the golden ratio spread across 0 to 1 with no two close
// together, so stars stepped down the box this way never bunch on one side
const GOLDEN = 0.6180339887;
// Every second star is drawn smaller, so the layer reads as near and far stars
const SMALL_SHARE = 0.6;

// Each star stays inside the box, rows step down it evenly, and the start of each twinkle is
// spread over one period so the stars never twinkle together
export function twinklePlaces(count: number, box: { width: number; height: number }, largest: number, periodMs: number): StarPlace[] {
  return Array.from({ length: count }, (_, i) => {
    const size = i % 2 === 0 ? largest : largest * SMALL_SHARE;
    const across = (0.5 + i * GOLDEN) % 1;
    const down = (i + 0.5) / count;
    return {
      x: across * Math.max(0, box.width - size),
      y: down * Math.max(0, box.height - size),
      size,
      delayMs: (i / count) * periodMs,
    };
  });
}

// The directions of a burst's stars, in radians, evenly round the circle
export function burstAngles(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i * 2 * Math.PI) / count);
}
