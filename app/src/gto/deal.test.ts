import { describe, expect, it } from "vitest";

import { cardCode } from "@/cards/card";

import { dealHand, type Deal } from "./deal";
import { TABLE_SEATS } from "./table";

const SEEDS = Array.from({ length: 1000 }, (_, i) => i + 1);

function codes(deal: Deal): string[] {
  return [...TABLE_SEATS.flatMap((seat) => deal.holes[seat]), ...deal.board].map(cardCode);
}

describe("dealHand", () => {
  it("deals six hands of two and a board of five, with no card twice, for 1,000 seeds", () => {
    const repeats = SEEDS.filter((seed) => new Set(codes(dealHand(seed))).size !== 17);
    expect(repeats).toEqual([]);
    expect(dealHand(1).board).toHaveLength(5);
  });

  it("deals the same seat, cards and bot seed from the same seed (BD-T7)", () => {
    expect(dealHand(42)).toEqual(dealHand(42));
    expect(codes(dealHand(42))).not.toEqual(codes(dealHand(43)));
  });

  it("seats the player in every seat, the blinds included, across the seeds", () => {
    const seats = new Set(SEEDS.map((seed) => dealHand(seed).playerSeat));
    expect([...seats].sort()).toEqual([...TABLE_SEATS].sort());
  });

  it("gives each hand a bot seed of its own, a whole 32-bit number", () => {
    const seeds = SEEDS.map((seed) => dealHand(seed).botSeed);
    expect(seeds.every((seed) => Number.isInteger(seed) && seed >= 0 && seed < 2 ** 32)).toBe(true);
    expect(new Set(seeds).size).toBeGreaterThan(990);
  });
});
