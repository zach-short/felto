import { describe, expect, it } from "vitest";

import { digitCellWidth, extrusionDrops, gameLine, gameWidth, plainDigitWidth, textWidth } from "@/components/kit/game-text-box";
import { GAME_TEXT, type GameSize } from "@/theme/tokens";

const SIZES = Object.keys(GAME_TEXT) as GameSize[];

describe("gameLine", () => {
  it.each(SIZES)("puts the %s baseline below the outline and leaves room for the descent and the extrusion", (size) => {
    const line = gameLine(size);
    const { size: fontSize, outline, depth } = GAME_TEXT[size];
    expect(line.baseline).toBeCloseTo(outline + 1.011 * fontSize);
    expect(line.height - line.baseline).toBeCloseTo(0.353 * fontSize + outline + depth);
  });

  it("grows with the size", () => {
    expect(gameLine("small").height).toBeLessThan(gameLine("medium").height);
    expect(gameLine("medium").height).toBeLessThan(gameLine("large").height);
  });
});

describe("digitCellWidth", () => {
  it("is the digit's advance plus the outline on both sides", () => {
    expect(digitCellWidth("large")).toBeCloseTo(0.6 * GAME_TEXT.large.size + 2 * GAME_TEXT.large.outline);
  });
});

describe("textWidth", () => {
  it("adds the font's advances: BOSS is B 695, O 796 and two S of 641 thousandths", () => {
    expect(textWidth("BOSS", 28)).toBeCloseTo((2773 / 1000) * 28);
  });

  it("gives every digit the same width, so a number never changes width as it counts", () => {
    expect(textWidth("1111", 10)).toBeCloseTo(textWidth("8888", 10));
    expect(textWidth("0", 10)).toBeCloseTo(6);
  });

  it("gives a character outside the table the widest advance, so it is never cut off", () => {
    expect(textWidth("é", 10)).toBeCloseTo(textWidth("W", 10));
    expect(textWidth("", 10)).toBe(0);
  });
});

describe("gameWidth", () => {
  it("is the letters plus the outline on both sides", () => {
    expect(gameWidth("BOSS", "small")).toBeCloseTo(textWidth("BOSS", GAME_TEXT.small.size) + 2 * GAME_TEXT.small.outline);
  });
});

describe("plainDigitWidth", () => {
  it("is the digit's advance alone, with no outline", () => {
    expect(plainDigitWidth(20)).toBeCloseTo(12);
  });
});

describe("extrusionDrops", () => {
  it.each(SIZES)("ends at the full depth of %s with no gap wider than the outline", (size) => {
    const { outline, depth } = GAME_TEXT[size];
    const drops = extrusionDrops(outline, depth);
    expect(drops[drops.length - 1]).toBeCloseTo(depth);
    [0, ...drops].slice(1).forEach((drop, i) => expect(drop - [0, ...drops][i]).toBeLessThanOrEqual(outline));
  });

  it("draws one copy when the depth is within one outline, and none when there is no depth", () => {
    expect(extrusionDrops(6, 6)).toEqual([6]);
    expect(extrusionDrops(3, 7)).toEqual([7 / 3, 14 / 3, 7]);
    expect(extrusionDrops(4, 0)).toEqual([]);
  });
});
