import { keyWord } from "@/components/exercise/host-speech";
import type { CastRole } from "@/content/cast";
import type { Exercise } from "@/content/schema";

// GF-11 and photo 2865: a tag over a lesson step that brings in a new idea. The kit's Tag changes
// no letter case (kit/tag.tsx:14), so the label is written as it is drawn, as the kit's own
// "NEW CONCEPT" sample writes it (screens/dev-kit-screen.tsx:144).
export const NEW_CONCEPT_LABEL = "NEW CONCEPT";

// Only on a concept step that names a term the bubble colours, so the tag and the colour agree
// and "new" stays true: a concept step that asks again what an earlier step taught ("Which hand
// ranks higher, a flush or a straight?") names no term. Only when the fish hosts: D9 gives it the
// lessons, and the shark's boss and the squid's review ask again what a lesson taught. The
// exercise view knows its host, not its session (lesson-run-view.tsx:112 passes `host` alone), so
// the fish stands for the lesson; it also hosts the placement check (placement-session.ts:30),
// where the tag shows too.
export function showsConceptTag(ex: Exercise, host: CastRole): boolean {
  return host === "fish" && ex.kind === "concept" && keyWord(ex) !== null;
}
