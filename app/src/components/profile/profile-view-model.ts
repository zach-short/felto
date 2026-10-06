import type { ArtName } from "@/art/sizes";
import { DIALS } from "@/config/dials";
import { CAST } from "@/content/cast";
import { livesAt } from "@/game/lives";
import type { PlayerState } from "@/game/player-state";
import { currentStreak, heldFreezes } from "@/game/streak";

export type ProfileStat = { art: ArtName; label: string; value: number };

// DESIGN.md 10.3 and 10.7: Profile shows the player's numbers beside the stat icons. Lives, the
// streak and the freezes are settled to the given time, as the stat bar's are.
export function profileStats(state: PlayerState, now: Date): ProfileStat[] {
  return [
    { art: "streak_flame", label: "Day streak", value: currentStreak(state, now) },
    { art: "xp_bolt", label: "Total XP", value: state.xp },
    { art: "lives_heart", label: "Hearts", value: livesAt(state, now) },
    { art: "gem", label: "Gems", value: state.gems },
    { art: "node_complete", label: "Lessons finished", value: state.finishedLessons.length },
    { art: "node_boss", label: "Bosses beaten", value: state.passedBosses.length },
  ];
}

export type FreezeShop = {
  held: number;
  price: number;
  canBuy: boolean;
  line: string;
};

// D19: a freeze costs 10 gems and a player holds at most 2. The line says what a freeze does, or
// why it cannot be bought now; D10's warm register.
export function freezeShop(state: PlayerState, now: Date): FreezeShop {
  const held = heldFreezes(state, now);
  const price = DIALS.freezePriceGems;
  const full = held >= DIALS.freezeMaxHeld;
  const canBuy = !full && state.gems >= price;
  return { held, price, canBuy, line: freezeLine(full, canBuy, state.gems) };
}

function freezeLine(full: boolean, canBuy: boolean, gems: number): string {
  if (full) return `You hold ${DIALS.freezeMaxHeld}, the most you can. Each one saves your streak on a missed day.`;
  if (canBuy) return "A freeze saves your streak on a day you miss. It is used by itself.";
  const short = DIALS.freezePriceGems - gems;
  return `${short} more ${short === 1 ? "gem" : "gems"} to go. Beat a boss and claim a reward.`;
}

export function heldLine(held: number): string {
  return held === 1 ? "1 freeze held" : `${held} freezes held`;
}

// D11 and D10: the line under the reminder switch says whether a nudge can arrive, and when. The
// permission is asked at the first finish of a day, so on a day already played that is tomorrow.
export function reminderLine(
  on: boolean,
  permission: "granted" | "denied" | "undetermined" | null,
  time: string,
  playedToday: boolean,
): string {
  if (!on) return `No nudges. ${CAST.fish} will wait for you here.`;
  if (permission === "denied") return "Notifications are off for Felto in your phone's Settings, so no nudge can arrive.";
  if (permission === "granted") return `${CAST.fish} sends one nudge at ${time} on a day you have not played yet.`;
  const when = playedToday ? "after your first lesson tomorrow" : "after your next lesson";
  return `${CAST.fish} will ask to send you notifications ${when}.`;
}
