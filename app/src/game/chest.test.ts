import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { chestState, openChest } from "@/game/chest";
import { chestTier } from "@/game/chest-tier";
import { freshState } from "@/game/player-state";

// Since GF-13 a chest pays the gems of its tier, so the start takes the first seed that draws a
// common chest for u1: the cases below keep the 20 gems that D8 gave every chest
const commonSeed = Array.from({ length: 100 }, (_, seed) => seed).find(
  (seed) => chestTier(seed, "u1", DIALS.chestOdds) === "common",
);
const start = { ...freshState(new Date(2026, 9, 5, 12)), chestSeed: commonSeed ?? 0 };

describe("the chest (D8, D6)", () => {
  it("is closed until the boss is passed", () => {
    expect(chestState(start, "u1")).toBe("closed");
    expect(openChest(start, "u1")).toBe(start);
  });

  it("gives a common chest's 20 gems once per unit", () => {
    expect(commonSeed).toBeDefined();
    const passed = { ...start, passedBosses: ["u1"] };
    expect(chestState(passed, "u1")).toBe("ready");
    const opened = openChest(passed, "u1");
    expect(opened.gems).toBe(20);
    expect(chestState(opened, "u1")).toBe("opened");
    expect(openChest(opened, "u1").gems).toBe(20);
  });

  it("gives no chest for a unit the placement check skipped until its boss is played", () => {
    const placed = { ...start, placedUnits: ["u1"] };
    expect(chestState(placed, "u1")).toBe("closed");
    expect(chestState({ ...placed, passedBosses: ["u1"] }, "u1")).toBe("ready");
  });
});
