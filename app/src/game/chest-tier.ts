import { seededRandom } from "@/game/seeded-random";

// GF-13: wood, blue, red and gold chests, in rank order
export type ChestTier = "common" | "rare" | "mythic" | "legendary";

// A tier's place in this list is how many times the reveal upgrades the chest on the way to it, so
// a common chest never upgrades and a legendary one upgrades three times (chest-reveal.ts).
export const CHEST_TIERS: readonly ChestTier[] = ["common", "rare", "mythic", "legendary"];

// The weight of each tier. A tier's share is its weight over the sum, so per cent or any other
// scale works. The table is an argument, so the rule holds no odds of its own: the odds are a dial.
export type ChestOdds = Readonly<Record<ChestTier, number>>;

export type ChestDraw = "tier" | "reveal";

// GF-13: the tier is a pure function of the player's stored seed and the unit, so it is fixed
// before the chest opens, and closing the app or opening the chest screen twice cannot change it.
export function chestTier(seed: number, unitId: string, odds: ChestOdds): ChestTier {
  const total = CHEST_TIERS.reduce((sum, tier) => sum + weightOf(odds[tier]), 0);
  const roll = seededRandom(chestDrawSeed(seed, unitId, "tier"))() * total;
  let below = 0;
  for (const tier of CHEST_TIERS) {
    below += weightOf(odds[tier]);
    if (roll < below) return tier;
  }
  return "common";
}

// FNV-1a over the unit id and the draw's name, started from the player's seed. Each unit's chest
// gets its own seed, and the tier and the reveal draw from two seeds, so neither moves the other.
export function chestDrawSeed(seed: number, unitId: string, draw: ChestDraw): number {
  const text = `${unitId}:${draw}`;
  let hash = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193) >>> 0;
  }
  return hash;
}

// A weight that is not a positive, finite number (a slip in a dial) is no chance, never a crash
function weightOf(weight: number): number {
  return weight > 0 && Number.isFinite(weight) ? weight : 0;
}
