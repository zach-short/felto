import { heartsLabel } from "@/components/lesson/hearts-label";
import { livesAt } from "@/game/lives";
import type { PlayerState } from "@/game/player-state";
import { currentStreak, heldFreezes } from "@/game/streak";

export type StatValues = {
  streak: number;
  xp: number;
  lives: number;
  gems: number;
  freezes: number;
};

// DESIGN.md 10.1 and D19: the numbers the stat bar shows. Lives, the streak and the freezes are
// settled to the given time, so the bar never shows a life that has come back as missing.
export function statValues(state: PlayerState, now: Date): StatValues {
  return {
    streak: currentStreak(state, now),
    xp: state.xp,
    lives: livesAt(state, now),
    gems: state.gems,
    freezes: heldFreezes(state, now),
  };
}

export type StatKind = "streak" | "freezes" | "xp" | "lives" | "gems";

// The spoken form of one stat, with the singular where the number is 1 ("1 heart", "1 streak
// freeze"). D10's warm word for a life is "heart", which heartsLabel already spells.
export function statLabel(kind: StatKind, value: number): string {
  const one = value === 1;
  if (kind === "lives") return heartsLabel(value);
  if (kind === "freezes") return one ? "1 streak freeze" : `${value} streak freezes`;
  if (kind === "gems") return one ? "1 gem" : `${value} gems`;
  return kind === "xp" ? `${value} XP` : `${value} day streak`;
}
