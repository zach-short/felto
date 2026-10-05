import { describe, expect, it } from "vitest";

import { arrowGap, arrowPlace, placeCard } from "@/components/kit/anchor-place";

const LAYER = { width: 390, height: 800 };
const CARD = { width: 300, height: 120 };
const RULES = { gap: 12, margin: 16, arrowInset: 24 };

describe("placeCard", () => {
  it("centres the card below a target in the middle, with the arrow on the target", () => {
    const target = { x: 165, y: 200, width: 60, height: 60 };
    expect(placeCard(target, CARD, LAYER, RULES)).toEqual({ left: 45, top: 272, side: "below", arrowX: 150 });
  });

  it("pushes the card inside the margin near an edge and keeps the arrow pointing at the target", () => {
    const target = { x: 330, y: 200, width: 40, height: 40 };
    const placed = placeCard(target, CARD, LAYER, RULES);
    expect(placed.left).toBe(LAYER.width - RULES.margin - CARD.width);
    expect(placed.left + placed.arrowX).toBe(350);
  });

  it("keeps the arrow off the card's rounded ends when the target is past them", () => {
    const target = { x: 0, y: 200, width: 10, height: 10 };
    const placed = placeCard(target, CARD, LAYER, RULES);
    expect(placed.left).toBe(RULES.margin);
    expect(placed.arrowX).toBe(RULES.arrowInset);
  });

  it("goes above a target near the bottom, where there is more room", () => {
    const target = { x: 165, y: 700, width: 60, height: 60 };
    expect(placeCard(target, CARD, LAYER, RULES)).toEqual({ left: 45, top: 568, side: "above", arrowX: 150 });
  });

  it("stays below when neither side has room but below has more", () => {
    const short = { width: 390, height: 200 };
    const target = { x: 165, y: 40, width: 60, height: 20 };
    expect(placeCard(target, CARD, short, RULES).side).toBe("below");
  });

  it("starts a card wider than the layer at the margin", () => {
    const wide = { width: 500, height: 120 };
    expect(placeCard({ x: 165, y: 200, width: 60, height: 60 }, wide, LAYER, RULES).left).toBe(RULES.margin);
  });
});

describe("arrowPlace", () => {
  const placed = { left: 45, top: 272, side: "below" as const, arrowX: 150 };

  it("centres the arrow's square on the top edge for a card below the target", () => {
    expect(arrowPlace(placed, 16, 120)).toEqual({ left: 142, top: -8 });
  });

  it("centres it on the bottom edge for a card above the target", () => {
    expect(arrowPlace({ ...placed, side: "above" }, 16, 120)).toEqual({ left: 142, top: 112 });
  });
});

describe("arrowGap", () => {
  it("is half the square's diagonal, the length of the point, and the spare", () => {
    expect(arrowGap(16, 2)).toBeCloseTo(8 * Math.SQRT2 + 2);
  });
});
