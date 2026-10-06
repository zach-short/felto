// The maths of a popover anchored to a target (photo IMG_2864), as plain numbers so a node test can
// check them. Every value is in points, in the coordinates of the layer the popover is drawn in.

export type Rect = { x: number; y: number; width: number; height: number };
export type Size = { width: number; height: number };
export type Side = "below" | "above";

export type Placement = {
  left: number;
  top: number;
  side: Side;
  // The arrow's middle, from the card's left edge
  arrowX: number;
};

export type PlaceRules = {
  // The space between the target and the card, which the arrow fills
  gap: number;
  // The least space between the card and the layer's edge
  margin: number;
  // The arrow keeps this far from the card's ends, so it never sits on a rounded corner
  arrowInset: number;
};

// The card goes below the target unless it would leave the layer there and there is more room
// above. It is centred on the target, then pushed back inside the margins; the arrow stays on the
// target even when the card is pushed, but never closer to the card's ends than the inset.
export function placeCard(target: Rect, card: Size, layer: Size, rules: PlaceRules): Placement {
  const side = chooseSide(target, card, layer, rules);
  const top = side === "below" ? target.y + target.height + rules.gap : target.y - rules.gap - card.height;
  const centre = target.x + target.width / 2;
  const left = clamp(centre - card.width / 2, rules.margin, layer.width - rules.margin - card.width);
  const arrowX = clamp(centre - left, rules.arrowInset, card.width - rules.arrowInset);
  return { left, top, side, arrowX };
}

function chooseSide(target: Rect, card: Size, layer: Size, rules: PlaceRules): Side {
  const below = layer.height - rules.margin - (target.y + target.height + rules.gap);
  const above = target.y - rules.gap - rules.margin;
  return below < card.height && above > below ? "above" : "below";
}

// The arrow is a square of side `size` turned 45 degrees, centred on the card's edge that faces the
// target at the arrow's middle: the top edge for a card below, the bottom edge for a card above
export function arrowPlace(placement: Placement, size: number, cardHeight: number): { left: number; top: number } {
  const top = placement.side === "below" ? -size / 2 : cardHeight - size / 2;
  return { left: placement.arrowX - size / 2, top };
}

// The gap that lets the arrow's point stop just short of the target: half the square's diagonal
// and a hair more
export function arrowGap(size: number, spare: number): number {
  return (size * Math.SQRT2) / 2 + spare;
}

// A value kept between two ends; when the ends cross (a card wider than the layer), the low end wins
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(value, high));
}
