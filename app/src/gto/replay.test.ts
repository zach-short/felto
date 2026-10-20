import { describe, expect, it } from "vitest";

import { pickOne, randomFrom } from "@/drills/random";

import { dealHand } from "./deal";
import { startHand, type Hand } from "./hand";
import type { GtoAction } from "./key";
import { act, advance, newHand } from "./play";
import { handResult } from "./result";
import { nextTurn } from "./turn";

// Plays a hand out: the bots and the heads-up rule through `advance`, the player by `choose`, which
// gets each of the player's turns in order. Returns the hand and the player's choices.
function playOut(seed: number, choose: (turn: number, actions: GtoAction[]) => GtoAction): [Hand, GtoAction[]] {
  let hand = advance(startHand(dealHand(seed)));
  const chosen: GtoAction[] = [];
  for (let turn = nextTurn(hand); turn !== null; turn = nextTurn(hand)) {
    chosen.push(choose(chosen.length, turn.options.map((option) => option.action)));
    hand = advance(act(hand, chosen[chosen.length - 1]));
  }
  return [hand, chosen];
}

function atRandom(seed: number) {
  const random = randomFrom(seed);
  return (_: number, actions: GtoAction[]) => pickOne(random, actions);
}

describe("a hand replayed from its seed (BD-T7)", () => {
  it("plays the same steps and result from the same seed and the same choices, for 200 seeds", () => {
    const differ = Array.from({ length: 200 }, (_, i) => i + 1).filter((seed) => {
      const [first, choices] = playOut(seed, atRandom(seed + 9000));
      const [again] = playOut(seed, (turn) => choices[turn]);
      return JSON.stringify([first, handResult(first)]) !== JSON.stringify([again, handResult(again)]);
    });
    expect(differ).toEqual([]);
  });

  it("deals and plays up to the same first decision every time", () => {
    expect(newHand(77)).toEqual(newHand(77));
    const turn = nextTurn(newHand(77));
    expect(turn === null || turn.actor === "player").toBe(true);
  });

  it("plays other hands from other seeds", () => {
    const hands = Array.from({ length: 50 }, (_, i) => JSON.stringify(newHand(i + 1).steps));
    expect(new Set(hands).size).toBeGreaterThan(10);
  });
});
