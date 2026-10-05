import type { Href } from "expo-router";

import { isOpenAtLives } from "@/game/lives";
import type { PathNode } from "@/game/path";
import type { PlayerState } from "@/game/player-state";

// Where a tap on a path stop goes (DESIGN.md 10.1 and 10.3). D8: at 0 lives a lesson or the boss
// does not open, though the path still draws it as current; the out-of-lives sheet opens over
// the path in its place (audit of item 12). The review costs no lives and always opens once its
// boss is passed. A locked stop goes nowhere.
export function stopRoute(node: PathNode, state: PlayerState, now: Date): Href | null {
  if (node.status === "locked") return null;
  if (node.kind === "review") return { pathname: "/review/[unit]", params: { unit: node.unitId } };
  const id = node.kind === "lesson" ? node.id : node.unitId;
  if (!isOpenAtLives(node.kind, state, now)) return { pathname: "/out-of-lives", params: { kind: node.kind, id } };
  if (node.kind === "lesson") return { pathname: "/lesson/[id]", params: { id } };
  return { pathname: "/boss/[unit]", params: { unit: id } };
}

// Where the out-of-lives sheet sends a player after a refill: back to the stop they tapped
export function refilledRoute(kind: string | undefined, id: string | undefined): Href | null {
  if (!id) return null;
  if (kind === "lesson") return { pathname: "/lesson/[id]", params: { id } };
  if (kind === "boss") return { pathname: "/boss/[unit]", params: { unit: id } };
  return null;
}
