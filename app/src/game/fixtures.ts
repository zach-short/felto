import { DIALS } from "@/config/dials";
import { addDays, dayKey } from "@/game/day-key";
import type { PathOutline } from "@/game/path";
import { completeOnboarding, finishPlacement } from "@/game/placement";
import type { PlayerState } from "@/game/player-state";
import { freshState } from "@/game/player-state";

// BD-13: named player states, so a screenshot or a runtime-pass entry names a fixture and not a
// hand-made state. Each is built from the outline, so it holds the content's real ids.
// `fresh` is a first launch, so it opens onboarding (D20); `placed` and `all-done` came with
// phase 16, so the path after a passed check and an open Practice tab can be seen.
export const FIXTURE_NAMES = ["fresh", "unit1-mid", "zero-lives", "boss-ready", "placed", "all-done"] as const;

export type FixtureName = (typeof FIXTURE_NAMES)[number];

export function isFixtureName(name: string): name is FixtureName {
  return (FIXTURE_NAMES as readonly string[]).includes(name);
}

export function fixtureState(name: FixtureName, outline: PathOutline, now: Date): PlayerState {
  if (name === "fresh") return freshState(now);
  if (name === "unit1-mid") return unitOneState(outline, now, 3, 2);
  if (name === "zero-lives") return unitOneState(outline, now, 3, 0);
  if (name === "placed") return placedState(outline, now);
  if (name === "all-done") return allDoneState(outline, now);
  return unitOneState(outline, now, DIALS.lessonsPerUnit, DIALS.maxLives);
}

// A new player who passed the placement check with the fewest right it takes, built by the rule
// itself, so the fixture cannot drift from what a real pass does (D20)
function placedState(outline: PathOutline, now: Date): PlayerState {
  const size = DIALS.placementSize;
  const run = { size, answered: size, right: DIALS.placementPassRight };
  return completeOnboarding(finishPlacement(freshState(now), run, outline));
}

// A player who played the whole path: every lesson finished, every boss beaten and every chest
// opened, so every Practice kind is open (D21). XP is as if each lesson and boss had 8 right.
function allDoneState(outline: PathOutline, now: Date): PlayerState {
  const unitIds = outline.units.map((unit) => unit.id);
  const finishedLessons = outline.units.flatMap((unit) => [...unit.lessonIds]);
  const sessions = finishedLessons.length + unitIds.length;
  return {
    ...unitOneState(outline, now, 0, DIALS.maxLives),
    gems: unitIds.length * DIALS.chestGems,
    xp: sessions * 8 * DIALS.xpPerRightAnswer,
    finishedLessons,
    passedBosses: unitIds,
    openedChests: unitIds,
  };
}

// A player who finished the first lessons of unit 1 on earlier days: a 4-day streak whose last
// finish was yesterday, so the streak is alive and today has no finish yet, and 20 gems. Its XP
// is as if each finished lesson had 8 of 10 right.
function unitOneState(outline: PathOutline, now: Date, lessons: number, lives: number): PlayerState {
  const unitOne = outline.units[0];
  const finishedLessons = unitOne ? unitOne.lessonIds.slice(0, lessons) : [];
  return {
    ...freshState(now),
    onboarded: true,
    lives,
    gems: 20,
    xp: finishedLessons.length * 8 * DIALS.xpPerRightAnswer,
    streak: { length: 4, lastDay: addDays(dayKey(now), -1) },
    finishedLessons,
  };
}
