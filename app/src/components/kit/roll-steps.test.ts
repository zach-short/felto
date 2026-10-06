import { describe, expect, it } from "vitest";

import { digitsOf, rollColumns, type RollColumn } from "@/components/kit/roll-steps";
import { seededRandom } from "@/game/seeded-random";

const shownAt = (columns: RollColumn[], end: "from" | "to") => columns.map((c) => c.strip[c[end]]).join("");

describe("digitsOf", () => {
  it("shows a whole number, never below 0", () => {
    expect(digitsOf(1450)).toBe("1450");
    expect(digitsOf(19.6)).toBe("20");
    expect(digitsOf(-5)).toBe("0");
  });
});

describe("rollColumns", () => {
  it("rolls each digit up through the digits between, wrapping through 9 to 0", () => {
    expect(rollColumns(98, 102)).toEqual([
      { strip: ["", "1"], from: 0, to: 1 },
      { strip: ["9", "0"], from: 0, to: 1 },
      { strip: ["8", "9", "0", "1", "2"], from: 0, to: 4 },
    ]);
  });

  it("rolls down with the strip upside down, so the new digit comes from above", () => {
    expect(rollColumns(102, 98)).toEqual([
      { strip: ["", "1"], from: 1, to: 0 },
      { strip: ["9", "0"], from: 1, to: 0 },
      { strip: ["8", "9", "0", "1", "2"], from: 4, to: 0 },
    ]);
  });

  it("keeps a column still when its digit does not change", () => {
    expect(rollColumns(105, 115)[2]).toEqual({ strip: ["5"], from: 0, to: 0 });
    expect(rollColumns(7, 7)).toEqual([{ strip: ["7"], from: 0, to: 0 }]);
  });

  // The final value must be right however the roll is drawn: the view ends on each column's `to`
  // glyph, so those glyphs must read the new number and the `from` glyphs the old one
  it("starts on the old number and ends on the new one, for many pairs, up and down", () => {
    const random = seededRandom(46);
    for (let i = 0; i < 500; i++) {
      const from = Math.floor(random() * 20000);
      const to = Math.floor(random() * 20000);
      const columns = rollColumns(from, to);
      expect(shownAt(columns, "to")).toBe(String(to));
      expect(shownAt(columns, "from")).toBe(String(from));
    }
  });

  it("moves every column the same way, one digit a step", () => {
    const random = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const from = Math.floor(random() * 5000);
      const to = Math.floor(random() * 5000);
      for (const { strip, from: start, to: end } of rollColumns(from, to)) {
        if (start !== end) expect(end > start).toBe(to > from);
        const digits = strip.filter((glyph) => glyph !== "").map(Number);
        digits.slice(1).forEach((digit, j) => expect((digit - digits[j] + 10) % 10).toBe(1));
      }
    }
  });
});
