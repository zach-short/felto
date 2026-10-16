import { DIALS } from "@/config/dials";
import type { Hand } from "@/gto/hand";
import { newHand } from "@/gto/play";
import { reviewHand } from "@/gto/review";

// Where a session of the GTO trainer stands (board item 44): which hand of the session is at the
// table, the hands finished so far, and the hand whose review sheet is open (BD-T32), or null
// while a hand is played. Hand n of the session is dealt from firstSeed + n (BD-T7).
export type SessionState = {
  readonly index: number;
  readonly played: readonly Hand[];
  readonly reviewing: Hand | null;
};

export function startSession(firstSeed: number): SessionState {
  return dealt({ index: 0, played: [], reviewing: null }, firstSeed);
}

// The session moves on only from an open review. A tap that reaches the sheet's button while the
// sheet sinks away runs it after the review has closed (seen on the iPhone 17 Pro simulator,
// 2026-10-16): it would deal, and count, the next hand over one the player has not played.
export function canMoveOn(session: SessionState): boolean {
  return session.reviewing !== null;
}

export function nextHand(session: SessionState, firstSeed: number): SessionState {
  if (!canMoveOn(session)) return session;
  const index = session.index + 1;
  return dealt({ ...session, index, reviewing: null }, firstSeed + index);
}

// The table tells the session of the hand each choice leaves; a finished one opens its review
export function handEnded(session: SessionState, hand: Hand): SessionState {
  if (reviewHand(hand) === null || session.reviewing !== null) return session;
  return { ...session, played: [...session.played, hand], reviewing: hand };
}

// The hand dealt to the big blind when every seat folds to it is over before the player acts, so
// its review opens at once
function dealt(session: SessionState, seed: number): SessionState {
  return handEnded(session, newHand(seed));
}

// The last hand of a session: the session's count is reached, or the day's allowance is spent
export function isLastHand(session: SessionState, handsLeft: number): boolean {
  return session.index + 1 >= DIALS.gtoHandsPerSession || handsLeft === 0;
}
