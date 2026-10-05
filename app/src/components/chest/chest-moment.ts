import { PATH_OUTLINE } from "@/components/path/path-outline";
import { chestState } from "@/game/chest";
import type { PlayerState } from "@/game/player-state";

// "just-opened" is the moment after the tap; "opened" is a chest emptied on an earlier visit
export type ChestMoment = "missing" | "closed" | "ready" | "just-opened" | "opened";

// What the chest modal shows for a unit. `openedHere` is true once this visit's tap has opened
// it, so the reveal shows "+20 gems" and a later visit shows the empty chest (D8: once per unit).
export function chestMoment(state: PlayerState, unitId: string, openedHere: boolean): ChestMoment {
  if (!PATH_OUTLINE.units.some((unit) => unit.id === unitId)) return "missing";
  const chest = chestState(state, unitId);
  if (chest === "opened") return openedHere ? "just-opened" : "opened";
  return chest;
}
