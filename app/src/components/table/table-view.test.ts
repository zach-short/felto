import { describe, expect, it } from "vitest";

import { act, advance, newHand } from "@/gto/play";
import { STACK } from "@/gto/table";
import { nextTurn } from "@/gto/turn";
import type { Hand } from "@/gto/hand";

import { castPose, tableView } from "./table-view";

const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

// Plays the player's turns with the first action that is not a fold, or folds, to the end
function playOut(hand: Hand, fold: boolean): Hand {
  let current = hand;
  for (let turn = nextTurn(current); turn !== null; turn = nextTurn(current)) {
    const pick = fold ? turn.options[0] : (turn.options.find((o) => o.action !== "fold") ?? turn.options[0]);
    current = advance(act(current, pick.action));
  }
  return current;
}

describe("tableView at the player's first decision", () => {
  it("draws the player at the bottom with their cards and the turn, and hides every bot's cards", () => {
    for (const seed of SEEDS) {
      const hand = newHand(seed);
      const view = tableView(hand);
      if (view.turn === null) continue;
      const toAct = view.seats.filter((seat) => seat.toAct);
      expect(toAct.map((seat) => seat.place)).toEqual([0]);
      expect(view.seats[0].seat).toBe(hand.deal.playerSeat);
      expect(view.seats[0].cards).toEqual(hand.deal.holes[hand.deal.playerSeat]);
      expect(view.seats.slice(1).every((seat) => seat.cards === null)).toBe(true);
      expect(view.board).toEqual([]);
      expect(view.result).toBeNull();
    }
  });

  it("marks one button and keeps every chip either in a stack or in front of a seat", () => {
    for (const seed of SEEDS) {
      const view = tableView(newHand(seed));
      expect(view.seats.filter((seat) => seat.button).map((seat) => seat.seat)).toEqual(["BTN"]);
      const total = view.seats.reduce((sum, seat) => sum + seat.stack + seat.bet, 0);
      expect(total).toBe(6 * STACK);
      expect(view.seats.reduce((sum, seat) => sum + seat.bet, 0)).toBe(view.pot);
    }
  });
});

describe("tableView at the end of a hand", () => {
  it("moves every bet into the stacks, with nets that sum to zero", () => {
    for (const seed of SEEDS) {
      const view = tableView(playOut(newHand(seed), seed % 2 === 0));
      expect(view.turn).toBeNull();
      expect(view.seats.every((seat) => seat.bet === 0 && seat.net !== null)).toBe(true);
      expect(view.seats.reduce((sum, seat) => sum + (seat.net ?? 0), 0)).toBe(0);
      expect(view.seats.reduce((sum, seat) => sum + seat.stack, 0)).toBe(6 * STACK);
    }
  });

  it("shows the board and the live seats' cards at a showdown, and neither when a pot is taken before it", () => {
    const views = SEEDS.flatMap((seed) => [true, false].map((fold) => tableView(playOut(newHand(seed), fold))));
    const showdowns = views.filter((view) => view.result?.showdown);
    const taken = views.filter((view) => view.result?.showdown === false);
    expect(showdowns.length).toBeGreaterThan(0);
    expect(taken.length).toBeGreaterThan(0);
    for (const view of showdowns) {
      expect(view.board).toHaveLength(5);
      expect(view.seats.filter((seat) => !seat.folded).every((seat) => seat.cards !== null)).toBe(true);
    }
    for (const view of taken) {
      expect(view.board).toEqual([]);
      expect(view.seats.slice(1).every((seat) => seat.cards === null)).toBe(true);
    }
  });
});

describe("castPose", () => {
  it("sleeps once folded and is glad while the hand runs", () => {
    expect([castPose(true, null), castPose(false, null)]).toEqual(["sleep", "happy"]);
  });

  it("follows the player's result at the end, folded or not", () => {
    expect([castPose(true, 25), castPose(false, -10), castPose(true, 0)]).toEqual(["cheer", "sad", "smug"]);
  });
});
