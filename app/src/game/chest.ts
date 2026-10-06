import { DIALS } from "@/config/dials";
import type { ChestTier } from "@/game/chest-tier";
import { chestTier } from "@/game/chest-tier";
import type { PlayerState } from "@/game/player-state";
import { withItem } from "@/game/player-state";

export type ChestState = "closed" | "ready" | "opened";

// D8 and D6, amended by GF-13: a boss passed by playing it readies a chest, once per unit, and the
// chest pays the gems of its tier. A unit the placement check skipped (D20) gives no chest until
// its boss is played and passed.
export function chestState(state: PlayerState, unitId: string): ChestState {
  if (state.openedChests.includes(unitId)) return "opened";
  return state.passedBosses.includes(unitId) ? "ready" : "closed";
}

// GF-13: the tier of a unit's chest under the odds dial, the same on every call for this player
export function chestTierOf(state: PlayerState, unitId: string): ChestTier {
  return chestTier(state.chestSeed, unitId, DIALS.chestOdds);
}

export function chestPrize(state: PlayerState, unitId: string): number {
  return DIALS.chestGems[chestTierOf(state, unitId)];
}

export function openChest(state: PlayerState, unitId: string): PlayerState {
  if (chestState(state, unitId) !== "ready") return state;
  const openedChests = withItem(state.openedChests, unitId);
  return { ...state, gems: state.gems + chestPrize(state, unitId), openedChests };
}
