import { describe, expect, it } from "vitest";

import { CAST } from "./cast";

describe("the cast", () => {
  // D18: the names are poker words, and each role has its own.
  it("names each of the three roles once, with the names of D18", () => {
    expect(CAST).toEqual({ fish: "Flop", squid: "Kicker", shark: "Ace" });
    expect(new Set(Object.values(CAST)).size).toBe(3);
  });
});
