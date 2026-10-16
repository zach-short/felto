import { DIALS } from "@/config/dials";
import { dayKey } from "@/game/day-key";
import type { PlayerState } from "@/game/player-state";

// GF-24 and GF-26 (board item 62): what the celebration layer over the tabs plays after a change to
// the player, named as the celebration files are, so the layer passes the name straight through
export type StateMoment =
  | { name: "welcome" }
  | { name: "streak_extended" | "streak_milestone"; count: number }
  | { name: "xp_milestone"; count: number };

const STREAK_MILESTONES: readonly number[] = DIALS.streakMilestones;
const XP_MILESTONES: readonly number[] = DIALS.xpMilestones;

// The moments between two states of one player, in the order they play. A state with another
// chestSeed is another player, because a fixture and a reset both build on freshState, which draws
// a new seed from the clock (player-state.ts), so nothing between the two is celebrated. `now` is
// read by the caller just after the change (BD-12).
export function stateMoments(before: PlayerState, after: PlayerState, now: Date): StateMoment[] {
  if (before.chestSeed !== after.chestSeed) return [];
  const found = [welcomeMoment(before, after), streakMoment(before, after, now), xpMoment(before, after)];
  return found.filter((moment) => moment !== null);
}

function welcomeMoment(before: PlayerState, after: PlayerState): StateMoment | null {
  return !before.onboarded && after.onboarded ? { name: "welcome" } : null;
}

// D8 and D19: only a finish writes today into the streak's last day; a freeze moves it at most to
// yesterday (streak.ts settleStreak), so a freeze is never a moment. A change made in the last
// moment before midnight and read just after it is not celebrated, which is the safe way to miss.
function streakMoment(before: PlayerState, after: PlayerState, now: Date): StateMoment | null {
  const { lastDay, length } = after.streak;
  if (lastDay !== dayKey(now) || lastDay === before.streak.lastDay) return null;
  return { name: STREAK_MILESTONES.includes(length) ? "streak_milestone" : "streak_extended", count: length };
}

// GF-26: a change that passes two milestones at once plays the higher one
function xpMoment(before: PlayerState, after: PlayerState): StateMoment | null {
  const passed = XP_MILESTONES.filter((mark) => before.xp < mark && mark <= after.xp);
  return passed.length === 0 ? null : { name: "xp_milestone", count: Math.max(...passed) };
}
