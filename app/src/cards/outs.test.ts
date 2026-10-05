import { describe, expect, it } from "vitest";

import { cardCode, parseCards } from "./card";
import { makesTarget, outsTo } from "./outs";

const cards = (codes: string) => parseCards(codes.split(" "));
const outs = (hole: string, board: string, target: Parameters<typeof outsTo>[2]) =>
  outsTo(cards(hole), cards(board), target).map(cardCode);

describe("outs to a named target", () => {
  it("counts 9 outs for a flop flush draw", () => {
    const found = outs("Ah Kh", "7h 2h 9c", "flush");
    expect(found).toHaveLength(9);
    expect(found.every((code) => code.endsWith("h"))).toBe(true);
  });

  it("counts 8 outs for an open-ended straight draw", () => {
    expect(outs("9s 8d", "7c 6h 2s", "straight").sort()).toEqual(
      ["5c", "5d", "5h", "5s", "Tc", "Td", "Th", "Ts"].sort(),
    );
  });

  it("counts 4 outs for a gutshot", () => {
    expect(outs("9s 8d", "6c 5h Ks", "straight").sort()).toEqual(["7c", "7d", "7h", "7s"]);
  });

  it("counts 15 outs for a straight flush draw to a straight", () => {
    expect(outs("9h 8h", "7h 6c 2h", "straight")).toHaveLength(15);
  });

  it("counts on the turn from 46 unseen cards", () => {
    expect(outs("Ah Kh", "7h 2h 9c Qd", "flush")).toHaveLength(9);
  });

  it("counts 4 outs for an ace-high wheel draw, A-2-3-4 needing a five", () => {
    expect(outs("As 2d", "3c 4h Kd", "straight").sort()).toEqual(["5c", "5d", "5h", "5s"]);
  });

  it("counts 2 outs to three of a kind for a pocket pair", () => {
    expect(outs("7s 7d", "Kc 9h 2s", "three-of-a-kind").sort()).toEqual(["7c", "7h"]);
  });

  it("knows when the target is already made", () => {
    expect(makesTarget(cards("Ah Kh 7h 2h 9h"), "flush")).toBe(true);
    expect(makesTarget(cards("Ah Kh 7h 2h 9c"), "flush")).toBe(false);
  });

  it("refuses a board that is not a flop or a turn, and a card dealt twice", () => {
    expect(() => outs("Ah Kh", "7h 2h", "flush")).toThrow();
    expect(() => outs("Ah Kh", "7h 2h 9c Qd 3s", "flush")).toThrow();
    expect(() => outs("Ah Kh", "Ah 2h 9c", "flush")).toThrow();
  });
});
