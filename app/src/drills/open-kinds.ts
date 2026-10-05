import type { UnitId } from "@/content/schema";
import { unitDone } from "@/game/path";
import type { PlayerState } from "@/game/player-state";

import type { DrillKind } from "./deal";

// `DESIGN.md` D21: Practice deals a kind once the unit that teaches it is done (its boss passed,
// or the placement check skipped it, `unitDone`): `hand-name` and `showdown` after unit 1,
// `preflop` after unit 3, `outs` and `odds` after unit 4. Unit 2 teaches no dealt kind.
export const OPENED_BY: Readonly<Record<DrillKind, UnitId>> = {
  "hand-name": "hands",
  showdown: "hands",
  preflop: "preflop",
  outs: "odds",
  odds: "odds",
};

const ORDER: readonly DrillKind[] = ["hand-name", "showdown", "preflop", "outs", "odds"];

export function openKinds(state: PlayerState): DrillKind[] {
  return ORDER.filter((kind) => unitDone(state, OPENED_BY[kind]));
}
