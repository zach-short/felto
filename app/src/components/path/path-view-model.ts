import { PATH_OUTLINE } from "@/components/path/path-outline";
import { CAST } from "@/content/cast";
import { OUTLINE } from "@/content/outline";
import { storyFor } from "@/content/stories/catalog";
import { chestState, type ChestState } from "@/game/chest";
import { finishedInUnit, pathNodes, placedPast, type PathNode } from "@/game/path";
import type { PlayerState } from "@/game/player-state";
import { finishedToday } from "@/game/streak";
import { DIALS } from "@/config/dials";

export type GreetingMood = "new-player" | "not-today" | "done-today";

export type PathStop = {
  node: PathNode;
  title: string;
  // The unit's finished lessons out of five; only the current lesson draws it (DESIGN.md 10.1)
  progress: number;
};

export type PathUnit = {
  id: string;
  number: number;
  title: string;
  chest: ChestState;
  // D20: placed past by the check, so the boss shows complete while the chest still waits for it
  placed: boolean;
  // US-4 and US-5: the unit has a story, so its header shows the button that opens it. The story
  // gates nothing, so this does not depend on the player's progress.
  hasStory: boolean;
  stops: PathStop[];
};

// Everything the Learn path draws, from the rules and the outline. Pure, so a test can check the
// node states of a fixture without a phone.
export function pathUnits(state: PlayerState): PathUnit[] {
  const nodes = pathNodes(state, PATH_OUTLINE);
  return OUTLINE.map((unit, index) => {
    const lessonIds = unit.lessons.map((lesson) => lesson.id);
    const progress = finishedInUnit(state, lessonIds) / DIALS.lessonsPerUnit;
    const titles = new Map<string, string>(unit.lessons.map((lesson) => [lesson.id, lesson.title]));
    const stops = nodes
      .filter((node) => node.unitId === unit.id)
      .map((node) => ({ node, title: stopTitle(node, titles), progress }));
    const chest = chestState(state, unit.id);
    const hasStory = storyFor(unit.id) !== null;
    return { id: unit.id, number: index + 1, title: unit.title, chest, placed: placedPast(state, unit.id), hasStory, stops };
  });
}

// D9: the shark is the boss and the squid hosts the review; names come from the cast (BD-28)
function stopTitle(node: PathNode, titles: ReadonlyMap<string, string>): string {
  if (node.kind === "boss") return `Beat ${CAST.shark}`;
  if (node.kind === "review") return `Review with ${CAST.squid}`;
  return titles.get(node.id) ?? node.id;
}

// DESIGN.md 10.5: the fish sleeps until a lesson is finished on this local day. A player with no
// progress at all gets the welcome line instead (rule U4, the empty state).
export function greetingMood(state: PlayerState, now: Date): GreetingMood {
  if (finishedToday(state, now)) return "done-today";
  const started = state.finishedLessons.length + state.passedBosses.length + state.placedUnits.length;
  return started === 0 ? "new-player" : "not-today";
}

const STATUS_WORDS = {
  locked: "locked",
  current: "up next",
  complete: "finished",
  open: "open",
} as const;

// What a screen reader says for a stop. The current lesson is the one with the progress ring, so
// it also says how many of the unit's lessons are done (DESIGN.md 10.1); the other stops have no
// ring and say only their state.
export function stopLabel(stop: PathStop): string {
  const base = `${stop.title}, ${STATUS_WORDS[stop.node.status]}`;
  if (stop.node.kind !== "lesson" || stop.node.status !== "current") return base;
  return `${base}, ${Math.round(stop.progress * DIALS.lessonsPerUnit)} of ${DIALS.lessonsPerUnit} lessons done`;
}
