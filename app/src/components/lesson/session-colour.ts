import type { Session } from "@/components/lesson/lesson-run";
import { UNITS } from "@/content/catalog";
import type { UnitId } from "@/content/schema";
import type { ColourName } from "@/theme/tokens";

// GF-4: each unit's colour token
const UNIT_COLOUR: Record<UnitId, ColourName> = {
  hands: "unitHands",
  table: "unitTable",
  preflop: "unitPreflop",
  odds: "unitOdds",
};

// The unit a session belongs to. A lesson is found by its id; a boss and a review carry their
// unit's id (lesson-run.ts). A practice set mixes kinds and the placement check mixes units 1 and
// 2, so neither belongs to one unit.
export function sessionUnit(session: Pick<Session, "kind" | "id">): UnitId | null {
  if (session.kind === "boss" || session.kind === "review") return UNITS.find((unit) => unit.id === session.id)?.id ?? null;
  if (session.kind !== "lesson") return null;
  return UNITS.find((unit) => unit.lessons.some((lesson) => lesson.id === session.id))?.id ?? null;
}

// The colour a chosen answer row takes (Zach, 2026-10-05, board item 29): its unit's colour in a
// session of one unit, and the app's neutral accent in a session that is not one unit's
export function chosenColour(session: Pick<Session, "kind" | "id">): ColourName {
  const unit = sessionUnit(session);
  return unit ? UNIT_COLOUR[unit] : "accent";
}
