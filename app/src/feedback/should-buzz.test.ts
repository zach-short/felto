import { describe, expect, it } from "vitest";

import { freshState } from "@/game/player-state";

import { shouldBuzz } from "./should-buzz";

describe("shouldBuzz (GF-3, BD-G6)", () => {
  it("buzzes while the Haptics switch is on", () => {
    expect(shouldBuzz(true)).toBe(true);
  });

  it("never buzzes while the switch is off", () => {
    expect(shouldBuzz(false)).toBe(false);
  });

  it("buzzes for a new player, whose switch starts on", () => {
    expect(shouldBuzz(freshState(new Date(2026, 9, 5, 12)).settings.haptics)).toBe(true);
  });
});
