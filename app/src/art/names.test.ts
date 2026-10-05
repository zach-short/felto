import { describe, expect, it } from "vitest";

import { cardArtName, mascotArtName, pathNodeArtName } from "@/art/names";
import { ART_BOXES } from "@/art/sizes";
import { SUITS, RANK_CHARS, type CardCode } from "@/cards/card";
import type { PathNode } from "@/game/path";

describe("cardArtName", () => {
  it("names a file for every one of the 52 cards", () => {
    const codes = RANK_CHARS.flatMap((rank) => SUITS.map((suit): CardCode => `${rank}${suit}`));
    const names = codes.map(cardArtName);
    expect(names.every((name) => name in ART_BOXES)).toBe(true);
    expect(new Set(names).size).toBe(52);
  });

  it("writes the ten as 10", () => {
    expect(cardArtName("Td")).toBe("card_10_diamonds");
    expect(cardArtName("As")).toBe("card_A_spades");
  });
});

describe("mascotArtName", () => {
  it("joins character and pose", () => {
    expect(mascotArtName("fish", "sleep")).toBe("fish_sleep");
  });
});

describe("pathNodeArtName", () => {
  const lesson = (status: "locked" | "current" | "complete"): PathNode => ({
    kind: "lesson", id: "hands-1", unitId: "hands", status,
  });

  it("follows the table in DESIGN.md 10.1", () => {
    expect(pathNodeArtName(lesson("locked"))).toBe("node_locked");
    expect(pathNodeArtName(lesson("current"))).toBe("node_current_base");
    expect(pathNodeArtName(lesson("complete"))).toBe("node_complete");
    expect(pathNodeArtName({ kind: "boss", id: "b", unitId: "hands", status: "current" })).toBe("node_boss");
    expect(pathNodeArtName({ kind: "boss", id: "b", unitId: "hands", status: "complete" })).toBe("node_complete");
    expect(pathNodeArtName({ kind: "review", id: "r", unitId: "hands", status: "locked" })).toBe("node_locked");
    expect(pathNodeArtName({ kind: "review", id: "r", unitId: "hands", status: "open" })).toBe("node_review");
  });
});
