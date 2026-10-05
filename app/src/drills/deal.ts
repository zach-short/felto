import { DIALS } from "@/config/dials";
import type { Exercise, ExerciseKind } from "@/content/schema";

import { dealHandName } from "./hand-name";
import { dealOdds } from "./odds";
import { dealOuts } from "./outs";
import { dealPreflop } from "./preflop";
import { childSeed, pickOne, randomFrom } from "./random";
import { dealShowdown } from "./showdown";

// Every kind a program can key (`DESIGN.md` 10.4); `concept` needs a writer, so it is never dealt.
export type DrillKind = Exclude<ExerciseKind, "concept">;

const DEALERS: Readonly<Record<DrillKind, (seed: number) => Exercise>> = {
  "hand-name": dealHandName,
  showdown: dealShowdown,
  preflop: dealPreflop,
  outs: dealOuts,
  odds: dealOdds,
};

export function dealExercise(kind: DrillKind, seed: number): Exercise {
  return DEALERS[kind](seed);
}

// A Practice set (`D21`): `size` exercises, each of a kind picked from the open ones, all from
// one seed. An id keeps the set seed, the place in the set, the kind and the dealer's own seed,
// so no two in a set share one and any one exercise replays with `dealExercise`.
export function dealSet(kinds: readonly DrillKind[], seed: number, size: number = DIALS.practiceSetSize): Exercise[] {
  if (kinds.length === 0) throw new Error("no kind is open for practice yet");
  const random = randomFrom(seed);
  return Array.from({ length: size }, (_, i) => {
    const [kind, child] = [pickOne(random, kinds), childSeed(random)];
    return { ...dealExercise(kind, child), id: `practice-${seed >>> 0}-${i + 1}-${kind}-${child}` };
  });
}
