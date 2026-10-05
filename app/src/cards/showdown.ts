import { hasDuplicate, type Card } from "./card";
import { evaluate, type HandValue } from "./evaluate";

// Each player's best five from their two hole cards and the shared board. A board that beats
// every player's hole cards plays for all of them, and they split.
export function showdownValues(board: readonly Card[], holes: readonly (readonly Card[])[]): HandValue[] {
  if (hasDuplicate([...board, ...holes.flat()])) {
    throw new Error("a showdown deals the same card twice");
  }
  return holes.map((hole) => evaluate([...hole, ...board]));
}

// The indexes of every player who wins, in seat order. More than one index is a split pot.
export function showdownWinners(board: readonly Card[], holes: readonly (readonly Card[])[]): number[] {
  const values = showdownValues(board, holes);
  const best = Math.max(...values.map((value) => value.score));
  return values.flatMap((value, index) => (value.score === best ? [index] : []));
}
