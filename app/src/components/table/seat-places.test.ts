import { describe, expect, it } from "vitest";

import { TABLE_SEATS } from "@/gto/table";

import { occupantAt, PLACES, placeOf, seatAt } from "./seat-places";

describe("placeOf", () => {
  it("puts the player at the bottom whatever their seat", () => {
    for (const seat of TABLE_SEATS) expect(placeOf(seat, seat)).toBe(0);
  });

  it("goes clockwise in the order the seats act before the flop", () => {
    expect(TABLE_SEATS.map((seat) => placeOf(seat, "CO"))).toEqual([4, 5, 0, 1, 2, 3]);
  });

  it("is undone by seatAt for every seat of the player", () => {
    for (const player of TABLE_SEATS) {
      expect(PLACES.map((place) => placeOf(seatAt(place, player), player))).toEqual(PLACES);
    }
  });
});

describe("occupantAt", () => {
  it("seats the cast across the table and the stand-ins beside the player", () => {
    expect(PLACES.map(occupantAt)).toEqual([
      null,
      { kind: "stand-in", number: 1 },
      { kind: "cast", role: "fish" },
      { kind: "cast", role: "shark" },
      { kind: "cast", role: "squid" },
      { kind: "stand-in", number: 2 },
    ]);
  });
});
