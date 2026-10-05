import { describe, expect, it } from "vitest";

import { computeKey } from "./compute-key";
import type { Exercise, OpeningChart } from "./schema";

const base = { prompt: "Which is right?", explanation: "Because.", answer: 0 };

// A chart for this test only; phase 7 writes the real one.
const CHART: OpeningChart = {
  UTG: ["AA", "AKs"],
  HJ: ["AA", "AKs", "KK"],
  CO: ["AA", "AKs", "KK", "T9s"],
  BTN: ["AA", "AKs", "KK", "T9s", "72o"],
  SB: ["AA"],
};

describe("computeKey, the second writing of each key", () => {
  it("names the hand the cards make", () => {
    const ex: Exercise = {
      ...base, id: "t-hand", kind: "hand-name",
      cards: ["5s", "6d", "7c", "8h", "9s", "2c", "2d"],
      options: ["one-pair", "straight", "two-pair"],
    };
    expect(computeKey(ex)).toBe(1);
  });

  it("finds the winners of a showdown, a split included", () => {
    const ex: Exercise = {
      ...base, id: "t-show", kind: "showdown",
      board: ["Ts", "Jd", "Qc", "Kh", "As"],
      players: [["2h", "3d"], ["4c", "5s"]],
      options: [[0], [1], [1, 0]],
    };
    expect(computeKey(ex)).toBe(2);
  });

  it("raises a hand the chart opens from that seat, and folds one it does not", () => {
    const at = (seat: "UTG" | "BTN", hole: ["7c", "2d"] | ["As", "Ks"]): Exercise => ({
      ...base, id: `t-pre-${seat}`, kind: "preflop", seat, hole, options: ["fold", "raise"],
    });
    expect(computeKey(at("UTG", ["As", "Ks"]), { chart: CHART })).toBe(1);
    expect(computeKey(at("UTG", ["7c", "2d"]), { chart: CHART })).toBe(0);
    expect(computeKey(at("BTN", ["7c", "2d"]), { chart: CHART })).toBe(1);
    expect(() => computeKey(at("UTG", ["As", "Ks"]))).toThrow();
  });

  it("counts the outs to the target", () => {
    const ex: Exercise = {
      ...base, id: "t-outs", kind: "outs",
      hole: ["Ah", "Kh"], board: ["7h", "2h", "9c"], target: "flush", options: [4, 8, 9],
    };
    expect(computeKey(ex)).toBe(2);
  });

  it("works out the price, the rule of 2 and 4, and the call", () => {
    const odds = { ...base, kind: "odds" as const };
    expect(computeKey({ ...odds, id: "t-po", ask: "pot-odds", pot: 100, bet: 50, options: [20, 25, 33] })).toBe(1);
    expect(computeKey({ ...odds, id: "t-eq", ask: "equity", outs: 9, street: "flop", cardsToCome: 2, options: [18, 36] })).toBe(1);
    const call = { ...odds, ask: "call" as const, outs: 9, street: "turn" as const, cardsToCome: 1 as const };
    expect(computeKey({ ...call, id: "t-fold", pot: 100, bet: 50, options: ["call", "fold"] })).toBe(1);
    expect(computeKey({ ...call, id: "t-call", pot: 100, bet: 10, options: ["call", "fold"] })).toBe(0);
  });

  it("calls when the estimate equals the price exactly", () => {
    // 4 outs with one card to come is 8%; a bet of 2 into 21 needs 2 / 25 = 8%.
    const ex: Exercise = {
      ...base, id: "t-even", kind: "odds", ask: "call",
      pot: 21, bet: 2, outs: 4, street: "turn", cardsToCome: 1, options: ["fold", "call"],
    };
    expect(computeKey(ex)).toBe(1);
  });

  it("gives -1 when no option is right, and null for a concept", () => {
    const outs: Exercise = {
      ...base, id: "t-none", kind: "outs",
      hole: ["Ah", "Kh"], board: ["7h", "2h", "9c"], target: "flush", options: [4, 8],
    };
    expect(computeKey(outs)).toBe(-1);
    expect(computeKey({ ...base, id: "t-c", kind: "concept", options: ["a", "b"] })).toBeNull();
  });
});
