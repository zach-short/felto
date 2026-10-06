// The maths of a speech bubble's tail (photo IMG_2865) and a popover's arrow, as plain numbers so a
// node test can check them. Both are a square turned 45 degrees and laid across the card's edge, so
// half of it pokes out as a point and the other half covers the card's own border there. A bubble's
// tail draws a border on the two sides of the point only, so the outline runs from the bubble out
// round the point and back with no line across its root.

export type TailSide = "left" | "right" | "top" | "bottom";

type Borders = { borderLeftWidth?: number; borderRightWidth?: number; borderTopWidth?: number; borderBottomWidth?: number };

export type TailPlace = Borders & {
  left?: number | `${number}%`;
  right?: number;
  top?: number | `${number}%`;
  bottom?: number;
  marginLeft?: number;
  marginTop?: number;
};

// Turned clockwise by 45 degrees, the square's bottom-left corner points left, its top-right right,
// its top-left up and its bottom-right down; the two sides that meet at that corner carry the border
const POINT_SIDES: Record<TailSide, (keyof Borders)[]> = {
  left: ["borderLeftWidth", "borderBottomWidth"],
  right: ["borderTopWidth", "borderRightWidth"],
  top: ["borderTopWidth", "borderLeftWidth"],
  bottom: ["borderRightWidth", "borderBottomWidth"],
};

// Where the square sits, absolutely, in a card with a border of `border` points: centred on the
// middle of the border line of `side`, and halfway along that side. `size` is the square's side.
export function tailPlace(side: TailSide, size: number, border: number): TailPlace {
  const across = -(size + border) / 2;
  const along = -size / 2;
  const borders = Object.fromEntries(POINT_SIDES[side].map((name) => [name, border])) as Borders;
  if (side === "left") return { ...borders, left: across, top: "50%", marginTop: along };
  if (side === "right") return { ...borders, right: across, top: "50%", marginTop: along };
  if (side === "top") return { ...borders, top: across, left: "50%", marginLeft: along };
  return { ...borders, bottom: across, left: "50%", marginLeft: along };
}

// How far the point reaches past the card's outer edge: half the square's diagonal, less the half
// of the border it sits on
export function tailReach(size: number, border: number): number {
  return (size * Math.SQRT2) / 2 - border / 2;
}
