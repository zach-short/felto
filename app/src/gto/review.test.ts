import { describe, expect, it } from "vitest";

import { parseCards } from "@/cards/card";
import type { Seat } from "@/content/schema";

import type { Deal, Hole } from "./deal";
import { startHand, type Hand } from "./hand";
import type { GtoAction } from "./key";
import { act } from "./play";
import { reviewHand } from "./review";
import { bySeat } from "./table";
import { nextTurn } from "./turn";

// The player holds aces at every seat it is dealt; the board helps no one, so aces win any showdown.
const HOLES: Record<Seat, string> = { UTG: "2c 3d", HJ: "4h 5c", CO: "8c 8d", BTN: "9c 9d", SB: "2s 7d", BB: "6s 7h" };
const ACES = "Ah Ad";
const BOARD = "Kh Js 4d 3c Ts";

function dealOf(playerSeat: Seat): Deal {
  const hole = (seat: Seat): Hole => {
    const [a, b] = parseCards((seat === playerSeat ? ACES : HOLES[seat]).split(" "));
    return [a, b];
  };
  return { seed: 0, playerSeat, holes: bySeat(hole), board: parseCards(BOARD.split(" ")), botSeed: 0 };
}

// Every seat's action forced, bots' and the player's alike; the seats the heads-up rule removes fold between.
function play(deal: Deal, actions: readonly GtoAction[]): Hand {
  let hand = startHand(deal);
  const ruleFolds = () => {
    while (nextTurn(hand)?.actor === "rule") hand = act(hand, "fold");
  };
  for (const action of actions) {
    ruleFolds();
    hand = act(hand, action);
  }
  ruleFolds();
  return hand;
}

describe("the review of a hand", () => {
  it("is null while a turn is pending", () => {
    expect(reviewHand(play(dealOf("UTG"), ["open"]))).toBeNull();
  });

  it("lists an open that every seat folds to, with no board", () => {
    const review = reviewHand(play(dealOf("UTG"), ["open", "fold", "fold", "fold", "fold", "fold"]));
    expect(review?.scored).toBe(true);
    expect(review?.decisions).toHaveLength(1);
    expect(review?.decisions[0]).toMatchObject({ seat: "UTG", node: "root", grade: { kind: "graded", chosen: "open", label: "good" } });
    expect(review?.runout).toEqual({ postflop: "runout", board: [], winners: ["UTG"], potBb: 4, playerNetBb: 1.5 });
  });

  it("lists the player's decisions in order, and only the player's", () => {
    const review = reviewHand(play(dealOf("UTG"), ["open", "fold", "fold", "fold", "fold", "3bet", "call"]));
    expect(review?.decisions.map((decision) => [decision.node, decision.grade.chosen])).toEqual([
      ["root", "open"],
      ["UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet", "call"],
    ]);
  });

  it("runs the board out after a call and shows it, unscored", () => {
    const review = reviewHand(play(dealOf("BB"), ["open", "fold", "fold", "fold", "fold", "call"]));
    expect(review?.scored).toBe(true);
    expect(review?.decisions[0]).toMatchObject({ seat: "BB", node: "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold" });
    expect(review?.runout).toMatchObject({ board: parseCards(BOARD.split(" ")), winners: ["BB"], potBb: 5.5, playerNetBb: 3 });
  });

  it("marks a pot the player joins off the tree not scored, and its decision not graded", () => {
    // UTG opens and HJ calls; CO is removed, the player on the button calls off the tree and the
    // blinds are removed. The opener and the defender already match the call, so BD-T21 asks
    // neither of them, and three players run the board out.
    const review = reviewHand(play(dealOf("BTN"), ["open", "call", "call"]));
    expect(review?.scored).toBe(false);
    expect(review?.decisions).toEqual([{ seat: "BTN", node: null, grade: { kind: "off-tree", chosen: "call" } }]);
    expect(review?.runout).toMatchObject({ winners: ["BTN"], potBb: 9 });
    expect(review?.runout.board).toHaveLength(5);
  });
});
