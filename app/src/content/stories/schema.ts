import type { Pose } from "@/art/names";
import type { CardCode } from "@/cards/card";
import type { HandCategory } from "@/cards/evaluate";
import type { UnitId } from "@/content/schema";

// The story model of docs/incomplete/unit-stories/DESIGN.md US-4 and US-7: an optional run of
// slides before a unit, tapped through like a phone story. The fish hosts every slide (D9), so a
// slide names only the pose. `validate-story.ts` counts the slides and the words against the
// dials, since a type cannot (rule V3). Story files are checked with `satisfies Story`.

export interface Slide {
  readonly pose: Pose;
  readonly title: string;
  readonly body: string;
  // One row of example cards, drawn with CardRow (US-7)
  readonly cards?: readonly CardCode[];
  // The hand the cards make, written by the author when the slide names one. A test computes it
  // again with the evaluator (rule Q3, extended to stories by US-7).
  readonly key?: HandCategory;
}

export interface Story {
  readonly unit: UnitId;
  readonly slides: readonly Slide[];
}
