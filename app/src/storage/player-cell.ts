import type { PlayerState } from "@/game/player-state";

// Holds the latest player state outside React's render cycle. Two actions in one tick (an answer,
// then a refill) must each see the other's result; a value captured at the last render would
// make the second action overwrite the first.
export type PlayerCell = {
  get(): PlayerState;
  set(next: PlayerState): void;
};

export function createPlayerCell(
  initial: PlayerState,
  onChange: (next: PlayerState) => void,
): PlayerCell {
  let latest = initial;
  return {
    get: () => latest,
    set: (next) => {
      latest = next;
      onChange(next);
    },
  };
}
