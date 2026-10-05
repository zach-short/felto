import { describe, expect, it } from "vitest";

import { tailPlace, tailReach } from "@/components/kit/tail-place";

describe("tailPlace", () => {
  it("centres a left tail on the middle of the left border line, with a border on the point's two sides", () => {
    expect(tailPlace("left", 14, 2)).toEqual({ borderLeftWidth: 2, borderBottomWidth: 2, left: -8, top: "50%", marginTop: -7 });
  });

  it("mirrors it for a right tail", () => {
    expect(tailPlace("right", 14, 2)).toEqual({ borderTopWidth: 2, borderRightWidth: 2, right: -8, top: "50%", marginTop: -7 });
  });

  it("lays a top or bottom tail across the middle of that edge", () => {
    expect(tailPlace("top", 14, 2)).toEqual({ borderTopWidth: 2, borderLeftWidth: 2, top: -8, left: "50%", marginLeft: -7 });
    expect(tailPlace("bottom", 14, 2)).toEqual({ borderRightWidth: 2, borderBottomWidth: 2, bottom: -8, left: "50%", marginLeft: -7 });
  });

  it("borders exactly two sides, so no line crosses the tail's root", () => {
    const sides = ["left", "right", "top", "bottom"] as const;
    sides.forEach((side) => expect(Object.keys(tailPlace(side, 14, 2)).filter((key) => key.startsWith("border"))).toHaveLength(2));
  });
});

describe("tailReach", () => {
  it("is half the square's diagonal less the half of the border it sits on", () => {
    expect(tailReach(14, 2)).toBeCloseTo(7 * Math.SQRT2 - 1);
  });
});
