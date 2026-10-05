import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { chestPrize, chestTierOf, openChest } from "@/game/chest";
import { revealPlan } from "@/game/chest-reveal";
import type { ChestTier } from "@/game/chest-tier";
import { CHEST_TIERS, chestTier } from "@/game/chest-tier";
import { freshState } from "@/game/player-state";

const now = new Date(2026, 9, 5, 12);

// A player whose boss of "hands" is passed and whose seed draws the given tier for that chest
function readyWith(tier: ChestTier) {
  const seed = Array.from({ length: 1_000 }, (_, n) => n).find((n) => chestTier(n, "hands", DIALS.chestOdds) === tier);
  return { ...freshState(now), chestSeed: seed ?? -1, gems: 7, passedBosses: ["hands"] };
}

describe("the chest's prize (GF-13, board item 50)", () => {
  it("pays the gems of the tier the seed draws, for each of the four tiers", () => {
    const paid = CHEST_TIERS.map((tier) => openChest(readyWith(tier), "hands").gems - 7);
    expect(paid).toEqual(CHEST_TIERS.map((tier) => DIALS.chestGems[tier]));
  });

  it("pays once: a second open of the same chest gives nothing more", () => {
    const opened = openChest(readyWith("legendary"), "hands");
    expect(openChest(opened, "hands").gems).toBe(opened.gems);
  });

  it("names the tier and the prize the same before and after the chest opens", () => {
    const ready = readyWith("mythic");
    const opened = openChest(ready, "hands");
    expect([chestTierOf(ready, "hands"), chestPrize(ready, "hands")]).toEqual(["mythic", DIALS.chestGems.mythic]);
    expect([chestTierOf(opened, "hands"), chestPrize(opened, "hands")]).toEqual(["mythic", DIALS.chestGems.mythic]);
  });

  it("reveals the tier it pays: the plan's open tap shows the chest's tier", () => {
    const ready = readyWith("rare");
    expect(revealPlan(ready.chestSeed, "hands", chestTierOf(ready, "hands")).at(-1)?.shows).toBe("rare");
  });

  it("reads the odds as per cent, gives every tier a chance, and pays more for a higher tier", () => {
    const odds = CHEST_TIERS.map((tier) => DIALS.chestOdds[tier]);
    const gems = CHEST_TIERS.map((tier) => DIALS.chestGems[tier]);
    expect(odds.reduce((sum, share) => sum + share, 0)).toBe(100);
    expect(odds.every((share) => share > 0)).toBe(true);
    expect(gems.every((gem, index) => index === 0 || gem > gems[index - 1])).toBe(true);
  });
});
