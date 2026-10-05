import type { DrillKind } from "@/drills/deal";
import { OPENED_BY } from "@/drills/open-kinds";

// Development only, like the boss's `seed` and `play`: felto://practice-set?deal=<kind> deals a set
// of that one kind, open or not, because no BD-13 fixture opens units 3 and 4, and a screenshot of
// each dealt kind needs one. A release build ignores it.
export function devDeal(value: string | undefined): DrillKind | null {
  if (!__DEV__ || value === undefined) return null;
  return isDrillKind(value) ? value : null;
}

function isDrillKind(value: string): value is DrillKind {
  return Object.prototype.hasOwnProperty.call(OPENED_BY, value);
}
