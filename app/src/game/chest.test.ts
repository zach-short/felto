import { describe, expect, it } from "vitest";

import { chestState, openChest } from "@/game/chest";
import { freshState } from "@/game/player-state";

const start = freshState(new Date(2026, 9, 5, 12));

describe("the chest (D8, D6)", () => {
  it("is closed until the boss is passed", () => {
    expect(chestState(start, "u1")).toBe("closed");
    expect(openChest(start, "u1")).toBe(start);
  });

  it("gives 20 gems once per unit", () => {
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
