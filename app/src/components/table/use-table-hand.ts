import { useMemo, useState } from "react";

import type { Hand } from "@/gto/hand";
import type { GtoAction } from "@/gto/key";
import { act, advance, newHand } from "@/gto/play";

import { tableView } from "./table-view";

// One hand at the table, from its seed (BD-T7): the player's choice is taken and the bots then play
// up to the player's next decision or the end of the hand. The caller keys the table by its seed,
// so a new seed starts a new hand. A session (board item 44) is told of each hand the choice leaves,
// so it can open the review once the hand is over.
export function useTableHand(seed: number, onHand?: (hand: Hand) => void) {
  const [hand, setHand] = useState(() => newHand(seed));
  const view = useMemo(() => tableView(hand), [hand]);
  const choose = (action: GtoAction) => {
    const next = advance(act(hand, action));
    setHand(next);
    onHand?.(next);
  };
  return { hand, view, choose };
}
