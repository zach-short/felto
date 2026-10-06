import { describe, expect, it } from "vitest";

import type { RevealTap } from "@/game/chest-reveal";
import { CHANCE_TAPS, revealPlan } from "@/game/chest-reveal";
import type { ChestTier } from "@/game/chest-tier";
import { CHEST_TIERS } from "@/game/chest-tier";

// Players who start a millisecond apart, the closest two seeds can be (player-state.ts)
const SEEDS = Array.from({ length: 9_000 }, (_, i) => (1_790_000_000_000 + i) >>> 0);
const UNITS = ["hands", "table", "preflop", "odds"];

// Every plan for 1,000 seeds, the four units and the four tiers, with what drew it
const PLANS = SEEDS.slice(0, 1_000).flatMap((seed) =>
  UNITS.flatMap((unit) => CHEST_TIERS.map((tier) => ({ seed, unit, tier, plan: revealPlan(seed, unit, tier) }))),
);

function upgradeTaps(plan: readonly RevealTap[]): number[] {
  return plan.flatMap((tap, index) => (tap.step === "upgrade" ? [index + 1] : []));
}

// The tier a chest wears after each tap, counted from the upgrades so far
function shownByCount(plan: readonly RevealTap[]): ChestTier[] {
  return plan.map((_, index) => CHEST_TIERS[upgradeTaps(plan.slice(0, index + 1)).length]);
}

// Per cent of the plans in which each chance tap (1 to CHANCE_TAPS) upgrades the chest
function upgradeShareByTap(tier: ChestTier): number[] {
  const counts = Array.from({ length: CHANCE_TAPS }, () => 0);
  for (const seed of SEEDS) for (const tap of upgradeTaps(revealPlan(seed, "hands", tier))) counts[tap - 1] += 1;
  return counts.map((count) => (count / SEEDS.length) * 100);
}

describe("the chest reveal (GF-13)", () => {
  it("gives the same plan from the same seed, unit and tier, every time", () => {
    const again = PLANS.map(({ seed, unit, tier }) => revealPlan(seed, unit, tier));
    expect(JSON.stringify(again)).toBe(JSON.stringify(PLANS.map(({ plan }) => plan)));
  });

  it("has at least three chance taps and then one tap that opens", () => {
    expect(CHANCE_TAPS).toBeGreaterThanOrEqual(3);
    const opensLast = (plan: readonly RevealTap[]) =>
      plan.length === CHANCE_TAPS + 1 && plan.findIndex((tap) => tap.step === "open") === CHANCE_TAPS;
    expect(PLANS.filter(({ plan }) => !opensLast(plan))).toEqual([]);
  });

  it("upgrades exactly as many times as the tier is above common", () => {
    const wrong = PLANS.filter(({ tier, plan }) => upgradeTaps(plan).length !== CHEST_TIERS.indexOf(tier));
    expect(wrong).toEqual([]);
  });

  it("never upgrades a common chest and upgrades a legendary one on each of the three taps", () => {
    const common = new Set(PLANS.filter(({ tier }) => tier === "common").map(({ plan }) => upgradeTaps(plan).join()));
    const legendary = new Set(PLANS.filter(({ tier }) => tier === "legendary").map(({ plan }) => upgradeTaps(plan).join()));
    expect([...common]).toEqual([""]);
    expect([...legendary]).toEqual(["1,2,3"]);
  });

  it("shows one tier higher after each upgrade and opens on the tier drawn", () => {
    const wrong = PLANS.filter(({ tier, plan }) => {
      const shows = plan.map((tap) => tap.shows);
      return shows.join() !== shownByCount(plan).join() || shows[CHANCE_TAPS - 1] !== tier || shows[CHANCE_TAPS] !== tier;
    });
    expect(wrong).toEqual([]);
  });

  it("spreads a rare chest's one upgrade over the three taps, about a third each", () => {
    for (const share of upgradeShareByTap("rare")) expect(Math.abs(share - 100 / 3)).toBeLessThan(2);
  });

  it("spreads a mythic chest's two upgrades over the three taps, about two thirds each", () => {
    for (const share of upgradeShareByTap("mythic")) expect(Math.abs(share - 200 / 3)).toBeLessThan(2);
  });
});
