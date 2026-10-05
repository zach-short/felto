import type { PlayerState } from "@/game/player-state";

// The part of the content the rules need: the units in path order and each unit's lesson ids.
// It is its own type so the rules do not depend on the content schema (PLAN.md phase 5).
export type PathOutline = {
  units: readonly { id: string; lessonIds: readonly string[] }[];
};

export type PathNode =
  | { kind: "lesson"; id: string; unitId: string; status: "locked" | "current" | "complete" }
  | { kind: "boss"; id: string; unitId: string; status: "locked" | "current" | "complete" }
  | { kind: "review"; id: string; unitId: string; status: "locked" | "open" };

// D8: a unit is done when its boss is passed, by play or by the placement check (D20)
export function unitDone(state: PlayerState, unitId: string): boolean {
  return state.passedBosses.includes(unitId) || state.placedUnits.includes(unitId);
}

// D20: a unit the placement check marked finished whose boss has not been beaten in play. Its
// boss shows complete and can still be played; its chest waits for that win (game/chest.ts).
export function placedPast(state: PlayerState, unitId: string): boolean {
  return state.placedUnits.includes(unitId) && !state.passedBosses.includes(unitId);
}

// DESIGN.md 10.1 and D8: the path is linear. A done unit (boss passed, or placed past by D20)
// shows every lesson and its boss complete and its review open. Only the first unit that is not
// done is in play: its first unfinished lesson is the one current lesson, its boss is current
// once all five are finished. Every unit after it is locked, keeping any lesson already finished.
// One rule, so a placed player never sees three current lessons at once (audit of item 12).
export function pathNodes(state: PlayerState, outline: PathOutline): PathNode[] {
  const playing = outline.units.findIndex((unit) => !unitDone(state, unit.id));
  return outline.units.flatMap((unit, index) => {
    if (unitDone(state, unit.id)) return doneUnitNodes(unit);
    return index === playing ? playingUnitNodes(state, unit) : lockedUnitNodes(state, unit);
  });
}

type OutlineUnit = PathOutline["units"][number];

function doneUnitNodes(unit: OutlineUnit): PathNode[] {
  const lessons = unit.lessonIds.map((id): PathNode => ({ kind: "lesson", id, unitId: unit.id, status: "complete" }));
  return [...lessons, ...tailNodes(unit.id, "complete", "open")];
}

function playingUnitNodes(state: PlayerState, unit: OutlineUnit): PathNode[] {
  const finished = unit.lessonIds.map((id) => state.finishedLessons.includes(id));
  const current = finished.indexOf(false);
  const lessons = unit.lessonIds.map((id, j): PathNode => {
    const status = finished[j] ? "complete" : j === current ? "current" : "locked";
    return { kind: "lesson", id, unitId: unit.id, status };
  });
  return [...lessons, ...tailNodes(unit.id, current === -1 ? "current" : "locked", "locked")];
}

function lockedUnitNodes(state: PlayerState, unit: OutlineUnit): PathNode[] {
  const lessons = unit.lessonIds.map((id): PathNode => {
    const status = state.finishedLessons.includes(id) ? "complete" : "locked";
    return { kind: "lesson", id, unitId: unit.id, status };
  });
  return [...lessons, ...tailNodes(unit.id, "locked", "locked")];
}

function tailNodes(unitId: string, boss: "locked" | "current" | "complete", review: "locked" | "open"): PathNode[] {
  return [
    { kind: "boss", id: `${unitId}:boss`, unitId, status: boss },
    { kind: "review", id: `${unitId}:review`, unitId, status: review },
  ];
}

// DESIGN.md 10.1: the current node's ring shows the unit's finished lessons out of five
export function finishedInUnit(state: PlayerState, lessonIds: readonly string[]): number {
  return lessonIds.filter((id) => state.finishedLessons.includes(id)).length;
}
