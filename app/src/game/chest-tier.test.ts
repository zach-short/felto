import { describe, expect, it } from "vitest";

import type { ChestOdds, ChestTier } from "@/game/chest-tier";
import { CHEST_TIERS, chestDrawSeed, chestTier } from "@/game/chest-tier";

// The odds proposed to Zach for board item 50, in per cent. The dial comes in part B.
const PROPOSED: ChestOdds = { common: 55, rare: 30, mythic: 12, legendary: 3 };
const EVEN: ChestOdds = { common: 1, rare: 1, mythic: 1, legendary: 1 };
const UNITS = ["hands", "table", "preflop", "odds"];

// Players who start a millisecond apart, the closest two seeds can be (player-state.ts)
const SEEDS = Array.from({ length: 10_000 }, (_, i) => (1_790_000_000_000 + i) >>> 0);

// Per cent of the draws that land on each tier, over every seed and every unit
function shares(odds: ChestOdds): Record<ChestTier, number> {
  const counts: Record<ChestTier, number> = { common: 0, rare: 0, mythic: 0, legendary: 0 };
  for (const seed of SEEDS) for (const unit of UNITS) counts[chestTier(seed, unit, odds)] += 1;
  const perCent = (tier: ChestTier) => (counts[tier] / (SEEDS.length * UNITS.length)) * 100;
  return { common: perCent("common"), rare: perCent("rare"), mythic: perCent("mythic"), legendary: perCent("legendary") };
}

function expectNear(measured: Record<ChestTier, number>, wanted: Record<ChestTier, number>, points: number) {
  for (const tier of CHEST_TIERS) expect(Math.abs(measured[tier] - wanted[tier]), tier).toBeLessThan(points);
}

describe("the chest tier (GF-13)", () => {
  it("ranks four tiers from common to legendary", () => {
    expect(CHEST_TIERS).toEqual(["common", "rare", "mythic", "legendary"]);
  });

  it("draws the same tier from the same seed and unit, every time", () => {
    const first = SEEDS.slice(0, 1_000).map((seed) => UNITS.map((unit) => chestTier(seed, unit, PROPOSED)));
    const again = SEEDS.slice(0, 1_000).map((seed) => UNITS.map((unit) => chestTier(seed, unit, PROPOSED)));
    expect(again).toEqual(first);
  });

  it("gives each tier its share of the proposed odds over 40,000 draws, within a point and a half", () => {
    expectNear(shares(PROPOSED), { common: 55, rare: 30, mythic: 12, legendary: 3 }, 1.5);
  });

  it("follows the table it is given: even weights give a quarter each", () => {
    expectNear(shares(EVEN), { common: 25, rare: 25, mythic: 25, legendary: 25 }, 1.5);
  });

  it("never draws a tier with no weight, and draws common from a table with none at all", () => {
    const onlyGold: ChestOdds = { common: 0, rare: 0, mythic: 0, legendary: 5 };
    const noOdds: ChestOdds = { common: 0, rare: 0, mythic: 0, legendary: 0 };
    const slip: ChestOdds = { common: -10, rare: Number.NaN, mythic: 0, legendary: 1 };
    const seeds = SEEDS.slice(0, 2_000);
    expect(new Set(seeds.map((seed) => chestTier(seed, "hands", onlyGold)))).toEqual(new Set(["legendary"]));
    expect(new Set(seeds.map((seed) => chestTier(seed, "hands", noOdds)))).toEqual(new Set(["common"]));
    expect(new Set(seeds.map((seed) => chestTier(seed, "hands", slip)))).toEqual(new Set(["legendary"]));
  });

  it("draws each unit apart: two units of one player match about as often as chance says", () => {
    const same = SEEDS.filter((seed) => chestTier(seed, "hands", PROPOSED) === chestTier(seed, "table", PROPOSED));
    // 0.55^2 + 0.30^2 + 0.12^2 + 0.03^2 = 0.4078
    expect(Math.abs((same.length / SEEDS.length) * 100 - 40.78)).toBeLessThan(2);
  });

  it("gives the tier and the reveal of one chest two different seeds", () => {
    const shared = (seed: number) => chestDrawSeed(seed, "hands", "tier") === chestDrawSeed(seed, "hands", "reveal");
    expect(SEEDS.slice(0, 1_000).filter(shared)).toEqual([]);
  });
});
