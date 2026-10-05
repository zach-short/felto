import { DIALS } from "@/config/dials";
import type { PlayerState } from "@/game/player-state";
import { settleStreak } from "@/game/streak";

export type FreezeOutcome =
  | { ok: true; state: PlayerState }
  | { ok: false; reason: "freezes-full" | "not-enough-gems" };

// D19: a freeze costs 10 gems and a player holds at most 2. The streak is settled first, so a
// freeze bought today can never cover a day that was already missed.
export function buyFreeze(state: PlayerState, now: Date): FreezeOutcome {
  const settled = settleStreak(state, now);
  if (settled.freezes >= DIALS.freezeMaxHeld) return { ok: false, reason: "freezes-full" };
  if (settled.gems < DIALS.freezePriceGems) return { ok: false, reason: "not-enough-gems" };
  const gems = settled.gems - DIALS.freezePriceGems;
  return { ok: true, state: { ...settled, gems, freezes: settled.freezes + 1 } };
}
