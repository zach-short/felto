import type { CardCode } from "@/cards/card";
import type { HandCategory } from "@/cards/evaluate";
import type { HandClass } from "@/cards/hand-class";
import type { Street } from "@/cards/odds";

// The content model of `DESIGN.md` 10.4. A unit holds five lessons and a lesson ten exercises
// (the dials); `validate.ts` counts them, since a type cannot (rule V3). Lesson files are
// checked with `satisfies Unit` (BD-10).

export type ExerciseKind = "concept" | "hand-name" | "showdown" | "preflop" | "outs" | "odds";

// The six seats of a 6-max table, in the order they act preflop (`DESIGN.md` D7). The big blind
// never opens: when every other seat folds, the hand is over.
export type Seat = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";
export type OpenSeat = Exclude<Seat, "BB">;
export const OPEN_SEATS: readonly OpenSeat[] = ["UTG", "HJ", "CO", "BTN", "SB"];

export type PreflopAction = "fold" | "raise";
export type CallDecision = "call" | "fold";

// The hands each seat opens with a raise when every seat before it has folded. Phase 7 writes it.
export type OpeningChart = Readonly<Record<OpenSeat, readonly HandClass[]>>;

interface ExerciseBase<K extends ExerciseKind, O> {
  readonly id: string;
  readonly kind: K;
  readonly prompt: string;
  readonly options: readonly O[];
  // The index in `options` of the right answer, written by the author (rule Q3).
  readonly answer: number;
  readonly explanation: string;
}

export type ConceptExercise = ExerciseBase<"concept", string>;

// Five to seven cards; the options are hand categories, which the screen names with
// `categoryName`.
export interface HandNameExercise extends ExerciseBase<"hand-name", HandCategory> {
  readonly cards: readonly CardCode[];
}

// A full board and two or three players. Each option is the set of players who win, by index
// into `players`, in seat order: `[1]` is "player 2 wins", `[0, 1]` is a split between them.
export interface ShowdownExercise extends ExerciseBase<"showdown", readonly number[]> {
  readonly board: readonly CardCode[];
  readonly players: readonly (readonly [CardCode, CardCode])[];
}

export interface PreflopExercise extends ExerciseBase<"preflop", PreflopAction> {
  readonly seat: OpenSeat;
  readonly hole: readonly [CardCode, CardCode];
}

// Options are counts of outs to the named target, on the flop or the turn (`cards/outs.ts`).
export interface OutsExercise extends ExerciseBase<"outs", number> {
  readonly hole: readonly [CardCode, CardCode];
  readonly board: readonly CardCode[];
  readonly target: HandCategory;
}

// Three questions about odds, each with its numbers. `pot` is the pot before the bet and `bet`
// the amount to call, as in `cards/odds.ts`. Percent options are whole numbers.
export interface PotOddsExercise extends ExerciseBase<"odds", number> {
  readonly ask: "pot-odds";
  readonly pot: number;
  readonly bet: number;
}

// The chance to hit by the rule of 2 and 4. `cardsToCome` is 2 only on the flop ("by the river").
export interface EquityExercise extends ExerciseBase<"odds", number> {
  readonly ask: "equity";
  readonly outs: number;
  readonly street: Street;
  readonly cardsToCome: 1 | 2;
}

// Call when the rule of 2 and 4 gives at least the equity the price needs. `cardsToCome` is 2
// only on the flop when the player sees both cards for this one call (an all-in).
export interface CallExercise extends ExerciseBase<"odds", CallDecision> {
  readonly ask: "call";
  readonly pot: number;
  readonly bet: number;
  readonly outs: number;
  readonly street: Street;
  readonly cardsToCome: 1 | 2;
}

export type OddsExercise = PotOddsExercise | EquityExercise | CallExercise;

export type Exercise =
  | ConceptExercise
  | HandNameExercise
  | ShowdownExercise
  | PreflopExercise
  | OutsExercise
  | OddsExercise;

export interface Lesson {
  readonly id: string;
  readonly title: string;
  readonly exercises: readonly Exercise[];
}

export interface Unit {
  readonly id: UnitId;
  readonly title: string;
  readonly lessons: readonly Lesson[];
}

export type UnitId = "hands" | "table" | "preflop" | "odds";
