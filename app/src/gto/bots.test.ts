import { describe, expect, it } from "vitest";

import { parseCards } from "@/cards/card";
import { allHandClasses } from "@/cards/hand-class";
import { OPENING_CHART } from "@/content/catalog";
import type { Seat } from "@/content/schema";

import { botAction, chartAnswer, keyRow, sampleAction, topAction, type BotMixMode } from "./bots";
import { dealHand, type Hole } from "./deal";
import { startHand, type Hand } from "./hand";
import { gtoKey, type GtoAction, type GtoNode } from "./key";
import { bySeat } from "./table";
import { nextTurn, type Turn } from "./turn";

const KEY = gtoKey();
const NODES = [...KEY.nodes.values()];
// The draws at both ends of the generator's range and between, the places a rounding gap would show.
const DRAWS = [0, 0.25, 0.5, 0.75, 1 - 2 ** -53];
const MODES: BotMixMode[] = ["sample", "top"];

function holding(codes: [string, string], seat: Seat): Hand {
  const cards = parseCards(codes);
  const deal = dealHand(7);
  const holes = bySeat((other): Hole => (other === seat ? [cards[0], cards[1]] : deal.holes[other]));
  return startHand({ ...deal, holes, playerSeat: seat === "BB" ? "SB" : "BB" });
}

function rootTurn(hand: Hand): Turn {
  const turn = nextTurn(hand);
  if (turn === null) throw new Error("the hand has no turn");
  return turn;
}

function tokensOf(id: string): string[] {
  return id === "root" ? [] : id.split("/");
}

// The share of hands of class i that a seat playing the key takes to this node by its own choices.
function ownReach(node: GtoNode, i: number): number {
  const tokens = tokensOf(node.id);
  return tokens.reduce((reach, token, j) => {
    const [seat, action] = token.split(":");
    if (seat !== node.actor) return reach;
    const parent = KEY.nodes.get(j === 0 ? "root" : tokens.slice(0, j).join("/"));
    return parent === undefined ? 0 : reach * parent.strategy[i][parent.actions.indexOf(action as GtoAction)];
  }, 1);
}

describe("sampleAction", () => {
  it("never draws an action at frequency 0, at any row of the key and any draw", () => {
    const drawn = NODES.flatMap((node) => node.strategy.flatMap((row) => DRAWS.map((draw) => row[node.actions.indexOf(sampleAction(node.actions, row, () => draw))])));
    expect(drawn).toHaveLength(10_985 * DRAWS.length);
    expect(drawn.filter((frequency) => frequency <= 0)).toEqual([]);
  });

  it("splits the draws by the row's frequencies, in the node's order", () => {
    const actions: GtoAction[] = ["fold", "call", "3bet"];
    const picks = [0.1, 0.3, 0.6, 0.99].map((draw) => sampleAction(actions, [0.2, 0.3, 0.5], () => draw));
    expect(picks).toEqual(["fold", "call", "3bet", "3bet"]);
  });
});

describe("topAction", () => {
  it("plays the most frequent action, and the first listed on a tie", () => {
    expect(topAction(["fold", "call", "3bet"], [0.2, 0.3, 0.5])).toBe("3bet");
    expect(topAction(["fold", "call"], [0.5, 0.5])).toBe("fold");
  });
});

describe("botAction", () => {
  it("plays the bot's row at its node: UTG opens AA and folds 72o in either mode", () => {
    const aces = holding(["As", "Ah"], "UTG");
    const sevenTwo = holding(["7c", "2d"], "UTG");
    expect(MODES.map((mode) => botAction(aces, rootTurn(aces), mode))).toEqual(["open", "open"]);
    expect(MODES.map((mode) => botAction(sevenTwo, rootTurn(sevenTwo), mode))).toEqual(["fold", "fold"]);
  });

  it("makes the same choice for the same hand and steps (BD-T7), and other choices for other seeds", () => {
    const hands = Array.from({ length: 200 }, (_, i) => startHand({ ...dealHand(i + 1), playerSeat: "BB" }));
    const choices = hands.map((hand) => botAction(hand, rootTurn(hand)));
    expect(hands.map((hand) => botAction(hand, rootTurn(hand)))).toEqual(choices);
    expect(new Set(choices)).toEqual(new Set(["fold", "open"]));
  });

  it("answers off the tree by the chart rule of BD-T21, whatever the key says", () => {
    const hand = holding(["Kc", "Qd"], "CO");
    const turn: Turn = { seat: "CO", actor: "bot", node: null, options: [{ action: "fold", total: 25 }, { action: "call", total: 200 }] };
    expect(botAction(hand, turn)).toBe("call");
    expect(botAction(holding(["Ac", "8d"], "CO"), turn)).toBe("fold");
  });
});

describe("chartAnswer (BD-T21)", () => {
  it("calls with the 25 classes of the unit 3 chart's UTG list and folds the other 144", () => {
    const calls = allHandClasses().filter((held) => chartAnswer(held) === "call");
    expect(calls.sort()).toEqual([...OPENING_CHART.UTG].sort());
    expect(calls).toHaveLength(25);
  });
});

describe("the rows a bot can hold", () => {
  // KEY-SPEC.md 10, second review, item 1: rows at hands the actor never holds carry the uniform
  // strategy, and their frequencies mean nothing. A bot that plays the key reaches a node only with
  // hands its own earlier choices kept, so none of those rows may be uniform.
  it("are never the uniform default at a node a key-following bot reaches with the hand", () => {
    const uniform = NODES.flatMap((node) => node.strategy.flatMap((row, i) => {
      const flat = row.every((frequency) => Math.abs(frequency - 1 / row.length) < 0.001);
      return flat && ownReach(node, i) > 0 ? [`${node.id} ${KEY.hands[i]}`] : [];
    }));
    expect(uniform).toEqual([]);
  });

  it("are read by hand class from the node the turn names", () => {
    expect(keyRow("root", "AA")).toEqual(KEY.nodes.get("root")?.strategy[0]);
  });
});
