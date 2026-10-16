import { describe, expect, it } from "vitest";

import { parseCards } from "@/cards/card";
import type { Seat } from "@/content/schema";

import type { Deal, Hole } from "./deal";
import { startHand, type Hand } from "./hand";
import type { GtoAction } from "./key";
import { act } from "./play";
import { handResult } from "./result";
import { bySeat, toBigBlinds } from "./table";
import { nextTurn } from "./turn";

// Low cards no board below helps, and a board that is a straight to the ace, so every hand left in
// plays the board and splits, unless a test hands a seat something better.
const HOLES: Record<Seat, string> = { UTG: "2c 3d", HJ: "4h 5c", CO: "8c 8d", BTN: "9c 9d", SB: "2s 3s", BB: "6s 7h" };
const STRAIGHT = "Ts Jh Qd Kc Ad";

// KEY-SPEC.md 2.5 written out: by row, one opener and defender pair, the four pots after a call (of
// the open, the 3-bet, the 4-bet, the 5-bet) and the four fold payoffs (the opener when all fold,
// the defender when the opener folds to the 3-bet, the opener when the defender folds to the 4-bet,
// the defender when the opener folds to the 5-bet), in big blinds.
const ROWS: { pair: [Seat, Seat]; pots: number[]; wins: number[] }[] = [
  { pair: ["HJ", "CO"], pots: [6.5, 16.5, 41.5, 201.5], wins: [1.5, 4, 9, 21.5] },
  { pair: ["BTN", "SB"], pots: [6, 21, 45, 201], wins: [1.5, 3.5, 11, 23] },
  { pair: ["BTN", "BB"], pots: [5.5, 20.5, 44.5, 200.5], wins: [1.5, 3, 10.5, 22.5] },
  { pair: ["SB", "BB"], pots: [6, 18, 46, 200], wins: [1, 3, 9, 23] },
];
const RAISES: GtoAction[] = ["3bet", "4bet", "5bet"];

function dealOf(playerSeat: Seat, holes: Partial<Record<Seat, string>> = {}, board = STRAIGHT): Deal {
  const hole = (seat: Seat): Hole => {
    const [a, b] = parseCards((holes[seat] ?? HOLES[seat]).split(" "));
    return [a, b];
  };
  return { seed: 0, playerSeat, holes: bySeat(hole), board: parseCards(board.split(" ")), botSeed: 0 };
}

// Every seat's action forced; the seats the heads-up rule removes fold between.
function play(deal: Deal, actions: readonly GtoAction[]): Hand {
  let hand = startHand(deal);
  for (const action of actions) {
    while (nextTurn(hand)?.actor === "rule") hand = act(hand, "fold");
    hand = act(hand, action);
  }
  while (nextTurn(hand)?.actor === "rule") hand = act(hand, "fold");
  return hand;
}

// The forced actions that bring the opener's open to the defender, every seat between folding.
function toDefender([opener, defender]: [Seat, Seat]): GtoAction[] {
  const order: Seat[] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
  return order.slice(0, order.indexOf(defender)).map((seat) => (seat === opener ? "open" : "fold"));
}

// Raises up to `level` (0 is the open alone), then the given last action.
function line(pair: [Seat, Seat], level: number, last: GtoAction): GtoAction[] {
  return [...toDefender(pair), ...RAISES.slice(0, level), last];
}

function result(hand: Hand) {
  const found = handResult(hand);
  if (found === null) throw new Error("the hand is not over");
  return found;
}

function netSum(net: Readonly<Record<Seat, number>>): number {
  return Object.values(net).reduce((sum, chips) => sum + chips, 0);
}

describe("handResult and the chips of KEY-SPEC.md 2.5", () => {
  it("pays the fold payoffs of every row", () => {
    const paid = ROWS.map(({ pair: [opener, defender] }) => {
      const behind = Array<GtoAction>(6 - toDefender([opener, defender]).length).fill("fold");
      const all = result(play(dealOf(opener), [...toDefender([opener, defender]), ...behind]));
      const folds = [1, 2, 3].map((level) => result(play(dealOf(opener), line([opener, defender], level, "fold"))));
      const winner = (level: number) => (level % 2 === 1 ? defender : opener);
      return [all.net[opener], ...folds.map((found, i) => found.net[winner(i + 1)])].map(toBigBlinds);
    });
    expect(paid).toEqual(ROWS.map((row) => row.wins));
  });

  it("builds the pot of every row after a call at each level, and conserves every chip", () => {
    const pots = ROWS.map(({ pair }) => [0, 1, 2, 3].map((level) => result(play(dealOf(pair[0]), line(pair, level, "call")))));
    expect(pots.map((row) => row.map((found) => toBigBlinds(found.pot)))).toEqual(ROWS.map((row) => row.pots));
    expect(pots.flat().map((found) => netSum(found.net))).toEqual(Array(16).fill(0));
  });

  it("gives the big blind the small blind's 0.5 in a walk, with no showdown", () => {
    const found = result(play(dealOf("BB"), ["fold", "fold", "fold", "fold", "fold"]));
    expect(found).toMatchObject({ live: ["BB"], winners: ["BB"], showdown: false, pot: 15, multiway: false, postflop: "runout" });
    expect(found.net).toEqual({ UTG: 0, HJ: 0, CO: 0, BTN: 0, SB: -5, BB: 5 });
  });

  it("runs the board out between two players and pays the better hand", () => {
    const deal = dealOf("UTG", { UTG: "As Ah", BB: "Kc Kd" }, "2c 7d 9h Js 4h");
    const found = result(play(deal, line(["UTG", "BB"], 0, "call")));
    expect(found).toMatchObject({ live: ["UTG", "BB"], winners: ["UTG"], showdown: true, pot: 55 });
    expect(found.net).toEqual({ UTG: 30, HJ: 0, CO: 0, BTN: 0, SB: -5, BB: -25 });
  });

  it("splits a pot and gives the odd chip to the first winner after the flop", () => {
    const found = result(play(dealOf("UTG"), line(["UTG", "BB"], 0, "call")));
    expect(found.winners).toEqual(["UTG", "BB"]);
    expect([found.won.BB, found.won.UTG, netSum(found.net)]).toEqual([28, 27, 0]);
  });

  it("splits three ways, flags the pot multiway and keeps every chip", () => {
    const found = result(play(dealOf("BB"), ["open", "call", "call"]));
    expect(found).toMatchObject({ live: ["UTG", "HJ", "BB"], showdown: true, pot: 80, multiway: true });
    expect([found.won.BB, found.won.UTG, found.won.HJ, netSum(found.net)]).toEqual([27, 27, 26, 0]);
  });

  it("pays an all-in, a call of the 5-bet, from both full stacks", () => {
    const deal = dealOf("BTN", { BTN: "Ks Kh", BB: "As Ah" }, "2c 7d 9h Js 4h");
    const found = result(play(deal, line(["BTN", "BB"], 3, "call")));
    expect([found.pot, found.net.BB, found.net.BTN, found.net.SB]).toEqual([2005, 1005, -1000, -5]);
  });

  it("has no result while a turn is pending", () => {
    expect(handResult(startHand(dealOf("BB")))).toBeNull();
  });
});
