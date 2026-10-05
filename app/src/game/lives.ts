import { DIALS } from "@/config/dials";
import type { PlayerState } from "@/game/player-state";

const REGAIN_MS = DIALS.lifeRegainHours * 3_600_000;

export type RefillOutcome =
  | { ok: true; state: PlayerState }
  | { ok: false; reason: "lives-full" | "not-enough-gems" };

// D8: one life back every 4 hours, up to the maximum. The clock runs only while lives are below
// the maximum, so it restarts from the moment a full set is first spent.
export function settleLives(state: PlayerState, now: Date): PlayerState {
  if (state.lives >= DIALS.maxLives) return state;
  const regained = Math.floor((now.getTime() - state.livesClock) / REGAIN_MS);
  if (regained <= 0) return state;
  const lives = Math.min(DIALS.maxLives, state.lives + regained);
  return { ...state, lives, livesClock: state.livesClock + regained * REGAIN_MS };
}

export function livesAt(state: PlayerState, now: Date): number {
  return settleLives(state, now).lives;
}

export function nextLifeAt(state: PlayerState, now: Date): Date | null {
  const settled = settleLives(state, now);
  if (settled.lives >= DIALS.maxLives) return null;
  return new Date(settled.livesClock + REGAIN_MS);
}

export function spendLife(state: PlayerState, now: Date): PlayerState {
  const settled = settleLives(state, now);
  if (settled.lives === 0) return settled;
  const livesClock = settled.lives >= DIALS.maxLives ? now.getTime() : settled.livesClock;
  return { ...settled, lives: settled.lives - 1, livesClock };
}

export function refillLives(state: PlayerState, now: Date): RefillOutcome {
  const settled = settleLives(state, now);
  if (settled.lives >= DIALS.maxLives) return { ok: false, reason: "lives-full" };
  if (settled.gems < DIALS.lifeRefillGems) return { ok: false, reason: "not-enough-gems" };
  const gems = settled.gems - DIALS.lifeRefillGems;
  return { ok: true, state: { ...settled, lives: DIALS.maxLives, gems } };
}

// D8: at 0 lives, lessons and the boss close; the review, practice (D21) and the placement
// check (D20) cost no lives and stay open.
export function isOpenAtLives(kind: SessionKindForLives, state: PlayerState, now: Date): boolean {
  if (kind === "lesson" || kind === "boss") return livesAt(state, now) > 0;
  return true;
}

export type SessionKindForLives = "lesson" | "boss" | "review" | "practice" | "placement";
