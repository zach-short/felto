import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";

import { gtoKey } from "./key";
import { BLINDS, bySeat, POSTFLOP_ORDER, STACK, TABLE_SEATS, toBigBlinds, toChips } from "./table";

// KEY-SPEC.md 2.3 written out: every total a raise can reach, in big blinds.
const SIZES = [2.5, 3, 7.5, 9, 10, 20, 22, 23, 100];

describe("the table", () => {
  it("seats six in the preflop order of KEY-SPEC.md 2.1, as many as the dial and the key say", () => {
    expect(TABLE_SEATS).toEqual(["UTG", "HJ", "CO", "BTN", "SB", "BB"]);
    expect(TABLE_SEATS).toHaveLength(DIALS.tableSeats);
    expect(gtoKey().seats).toEqual(TABLE_SEATS);
  });

  it("orders the same six after the flop from the small blind round to the button", () => {
    expect([...POSTFLOP_ORDER].sort()).toEqual([...TABLE_SEATS].sort());
    expect(POSTFLOP_ORDER).toEqual(["SB", "BB", "UTG", "HJ", "CO", "BTN"]);
  });

  it("gives every stack the key's 100 big blinds and posts blinds of 0.5 and 1", () => {
    expect(toBigBlinds(STACK)).toBe(gtoKey().stackBb);
    expect(bySeat((seat) => toBigBlinds(BLINDS[seat]))).toEqual({ UTG: 0, HJ: 0, CO: 0, BTN: 0, SB: 0.5, BB: 1 });
  });

  it("counts every size of KEY-SPEC.md 2.3 as a whole number of chips", () => {
    expect(SIZES.map(toChips).every(Number.isInteger)).toBe(true);
    expect(SIZES.map((size) => toBigBlinds(toChips(size)))).toEqual(SIZES);
  });
});
