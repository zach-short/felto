import { describe, expect, it } from "vitest";

import { act, advance, newHand } from "@/gto/play";
import { nextTurn } from "@/gto/turn";

import { canMoveOn, handEnded, isLastHand, nextHand, startSession } from "./session-state";

// The first seed from 1 whose hand is over before the player acts (a walk to the big blind), and
// the first whose hand waits for the player, found by playing them
function firstSeedWhere(over: boolean): number {
  for (let seed = 1; ; seed++) if ((nextTurn(newHand(seed)) === null) === over) return seed;
}

describe("a session of the GTO trainer (board item 44)", () => {
  it("opens with no review while the first hand waits for the player", () => {
    const seed = firstSeedWhere(false);
    expect(startSession(seed)).toEqual({ index: 0, played: [], reviewing: null });
  });

  it("opens the review of a hand that ends with the player's choice, once", () => {
    const seed = firstSeedWhere(false);
    const session = startSession(seed);
    const folded = advance(act(newHand(seed), "fold"));
    const ended = handEnded(session, folded);
    expect(ended.reviewing).toBe(folded);
    expect(ended.played).toEqual([folded]);
    expect(handEnded(ended, folded)).toBe(ended);
  });

  it("keeps playing when the choice leaves the hand running", () => {
    const seed = firstSeedWhere(false);
    const running = newHand(seed);
    expect(handEnded(startSession(seed), running)).toEqual(startSession(seed));
  });

  it("opens the review at once for a walk", () => {
    const walk = firstSeedWhere(true);
    const session = startSession(walk);
    expect(session.reviewing?.deal.seed).toBe(walk);
    expect(session.played).toHaveLength(1);
  });

  it("deals hand n from the first seed plus n", () => {
    const first = firstSeedWhere(false);
    const second = nextHand(handEnded(startSession(first), advance(act(newHand(first), "fold"))), first);
    expect(second.index).toBe(1);
    expect(second.played).toHaveLength(1);
    expect(second.reviewing === null ? newHand(first + 1).deal.seed : second.reviewing.deal.seed).toBe(first + 1);
  });

  it("does not move on while a hand is played, so a late tap cannot skip it", () => {
    const seed = firstSeedWhere(false);
    const playing = startSession(seed);
    expect(canMoveOn(playing)).toBe(false);
    expect(nextHand(playing, seed)).toBe(playing);
  });

  it("ends at the session's count or when the allowance is spent", () => {
    const session = startSession(firstSeedWhere(false));
    expect(isLastHand(session, 9)).toBe(false);
    expect(isLastHand(session, 0)).toBe(true);
    expect(isLastHand({ ...session, index: 9 }, 5)).toBe(true);
    expect(isLastHand({ ...session, index: 8 }, 5)).toBe(false);
  });
});
