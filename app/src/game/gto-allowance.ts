import { DIALS } from "@/config/dials";
import { dayKey } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";

// BD-T9: the free allowance of the GTO trainer. handsLeftToday is the one seam of the free tier:
// the start button calls it, nothing else knows about a tier, and the store phase later replaces
// what it returns. The count lives in the stored player on this phone, so a player who deletes
// the app's data gets the day's hands back (trainer DESIGN.md hazard 6): it is an allowance for a
// development build, not a gate.

// The hands dealt on the local day of now (B3, hazard 9): a count from an earlier day is spent.
export function handsDealtToday(state: PlayerState, now: Date): number {
  return state.gto.day === dayKey(now) ? state.gto.handsToday : 0;
}

export function handsLeftToday(state: PlayerState, now: Date): number {
  return Math.max(0, DIALS.gtoFreeHandsPerDay - handsDealtToday(state, now));
}

type Dealt = { ok: true; state: PlayerState } | { ok: false; reason: "none-left" };

// BD-T33, Zach's answer (b) of board item 44: a hand counts when it is dealt, so leaving a session
// in the middle keeps the count of every hand it dealt.
export function countDealtHand(state: PlayerState, now: Date): Dealt {
  if (handsLeftToday(state, now) === 0) return { ok: false, reason: "none-left" };
  const gto = { ...state.gto, day: dayKey(now), handsToday: handsDealtToday(state, now) + 1 };
  return { ok: true, state: { ...state, gto } };
}

// PLAN.md phase 9, step 4: the trainer opens for every player while gtoRequiresUnit is null, and
// otherwise once that unit's boss is passed or placed out of.
export function trainerOpen(state: PlayerState): boolean {
  const unit: string | null = DIALS.gtoRequiresUnit;
  return unit === null || state.passedBosses.includes(unit) || state.placedUnits.includes(unit);
}
