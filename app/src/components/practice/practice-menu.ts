import type { Session } from "@/components/lesson/lesson-run";
import { DIALS } from "@/config/dials";
import { CAST, type CastRole } from "@/content/cast";
import { OUTLINE } from "@/content/outline";
import { dealSet, type DrillKind } from "@/drills/deal";
import { OPENED_BY, openKinds } from "@/drills/open-kinds";
import type { PlayerState } from "@/game/player-state";

// The five dealt kinds in the order the units teach them, and what each asks, in D10's warm voice
const KIND_COPY: Readonly<Record<DrillKind, { title: string; about: string }>> = {
  "hand-name": { title: "Name the hand", about: "Five to seven cards. Which hand is it?" },
  showdown: { title: "Who wins?", about: "Two or three players show their cards. Pick the winner." },
  preflop: { title: "Raise or fold", about: "Your seat and two cards. Open the pot or let it go?" },
  outs: { title: "Count the outs", about: "A draw with one card to come. How many cards make it?" },
  odds: { title: "Pot odds", about: "A pot and a bet. Is the price right?" },
};

const PRACTICE_KINDS: readonly DrillKind[] = ["hand-name", "showdown", "preflop", "outs", "odds"];

export type PracticeRow = { kind: DrillKind; title: string; line: string; open: boolean };

// D21: every kind is listed, open or not, so a player sees what practice will hold. A locked kind
// names the unit that opens it, by number and title, from the outline.
export function practiceRows(state: PlayerState): PracticeRow[] {
  const open = openKinds(state);
  return PRACTICE_KINDS.map((kind) => {
    const isOpen = open.includes(kind);
    const { title, about } = KIND_COPY[kind];
    return { kind, title, open: isOpen, line: isOpen ? about : lockedLine(kind) };
  });
}

function lockedLine(kind: DrillKind): string {
  const index = OUTLINE.findIndex((unit) => unit.id === OPENED_BY[kind]);
  return `Finish unit ${index + 1}, ${OUTLINE[index].title}, to open this.`;
}

// The squid's line above the list: the empty state of rule U4 when nothing is open yet
export function practiceIntro(state: PlayerState): string {
  if (openKinds(state).length === 0) {
    return `${CAST.squid} deals fresh hands for everything you have learned. Finish unit 1 to open the first two.`;
  }
  return `${CAST.squid} deals fresh hands, as many as you like. Practice costs no hearts, each right answer gives ${DIALS.practiceXpPerRight} XP, and a finished set of ${DIALS.practiceSetSize} counts for your streak.`;
}

// D21 and DESIGN.md 10.7: the squid hosts practice, in a set and on its closed screen alike
export const PRACTICE_HOST: CastRole = "squid";

export type PracticeAccess = { kind: "open"; session: Session<"practice"> } | { kind: "locked" };

// D21: one set mixes every open kind, dealt from one seed, which the screen takes from the clock
// when the set opens (BD-12). It never looks at hearts: practice stays open at 0. `only` is the
// development link's single kind (dev-deal.ts), which may be a kind not yet open.
export function practiceAccess(state: PlayerState, seed: number, only: DrillKind | null = null): PracticeAccess {
  const kinds = only ? [only] : openKinds(state);
  if (kinds.length === 0) return { kind: "locked" };
  const exercises = dealSet(kinds, seed, DIALS.practiceSetSize);
  return { kind: "open", session: { kind: "practice", id: `practice-${seed >>> 0}`, host: PRACTICE_HOST, exercises } };
}
