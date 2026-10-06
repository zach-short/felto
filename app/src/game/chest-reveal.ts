import type { ChestTier } from "@/game/chest-tier";
import { CHEST_TIERS, chestDrawSeed } from "@/game/chest-tier";
import { shuffled } from "@/game/seeded-random";

// GF-13, Zach on 2026-10-05: "they click at least 3 times. in those three times it has the chance
// to turn into Rare->Mythic->Legendary". Read as three taps that each may upgrade, then one more
// tap that opens, so a chest shows its final colour before the lid lifts.
export const CHANCE_TAPS = 3;

// shake: the chest shakes and stays as it is; upgrade: it shakes and rises one tier with a flash;
// open: the lid lifts on the tier the chest was drawn
export type RevealStep = "shake" | "upgrade" | "open";

// One entry per tap, in tap order. shows is the tier the chest wears after that tap.
export type RevealTap = { step: RevealStep; shows: ChestTier };

// The tier is drawn before the first tap (chestTier). The plan only places its upgrades: they fall
// on chance taps picked by the seed, so a rare chest upgrades on tap 1, 2 or 3 alike.
export function revealPlan(seed: number, unitId: string, tier: ChestTier): RevealTap[] {
  const upgrades = upgradeTaps(seed, unitId, CHEST_TIERS.indexOf(tier));
  const chances = Array.from({ length: CHANCE_TAPS }, (_, tap): RevealTap => {
    const reached = upgrades.filter((upgrade) => upgrade <= tap).length;
    return { step: upgrades.includes(tap) ? "upgrade" : "shake", shows: CHEST_TIERS[reached] };
  });
  return [...chances, { step: "open", shows: tier }];
}

// The first `count` places of a seeded shuffle of the chance taps: every set of that size is as
// likely as any other
function upgradeTaps(seed: number, unitId: string, count: number): number[] {
  const taps = Array.from({ length: CHANCE_TAPS }, (_, tap) => tap);
  return shuffled(taps, chestDrawSeed(seed, unitId, "reveal")).slice(0, count);
}
