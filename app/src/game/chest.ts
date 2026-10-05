import { DIALS } from "@/config/dials";
import type { PlayerState } from "@/game/player-state";
import { withItem } from "@/game/player-state";

export type ChestState = "closed" | "ready" | "opened";

// D8 and D6: a boss passed by playing it readies a fixed chest of 20 gems, once per unit. A unit
// the placement check skipped (D20) gives no chest until its boss is played and passed.
export function chestState(state: PlayerState, unitId: string): ChestState {
  if (state.openedChests.includes(unitId)) return "opened";
  return state.passedBosses.includes(unitId) ? "ready" : "closed";
}

export function openChest(state: PlayerState, unitId: string): PlayerState {
  if (chestState(state, unitId) !== "ready") return state;
  const openedChests = withItem(state.openedChests, unitId);
  return { ...state, gems: state.gems + DIALS.chestGems, openedChests };
}
