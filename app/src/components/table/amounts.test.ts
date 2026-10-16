import { describe, expect, it } from "vitest";

import { STACK } from "@/gto/table";

import { actionLabel, formatBb, formatNet } from "./amounts";

describe("formatBb", () => {
  it("writes tenths of a big blind as big blinds", () => {
    expect([5, 10, 25, 75, 220, STACK].map(formatBb)).toEqual(["0.5", "1", "2.5", "7.5", "22", "100"]);
  });
});

describe("formatNet", () => {
  it("signs a win and leaves a loss and an even hand as they are", () => {
    expect([75, -25, 0].map(formatNet)).toEqual(["+7.5", "-2.5", "0"]);
  });
});

describe("actionLabel", () => {
  it("names each raise with the seat's total after it", () => {
    expect(actionLabel({ action: "open", total: 25 }, 0)).toBe("Open 2.5");
    expect(actionLabel({ action: "3bet", total: 100 }, 10)).toBe("3-bet 10");
    expect(actionLabel({ action: "4bet", total: 220 }, 25)).toBe("4-bet 22");
    expect(actionLabel({ action: "5bet", total: STACK }, 220)).toBe("All in 100");
  });

  it("names a call with the chips it adds", () => {
    expect(actionLabel({ action: "call", total: 25 }, 10)).toBe("Call 1.5");
    expect(actionLabel({ action: "call", total: 75 }, 0)).toBe("Call 7.5");
  });

  it("names a fold with no amount", () => {
    expect(actionLabel({ action: "fold", total: 5 }, 5)).toBe("Fold");
  });
});
