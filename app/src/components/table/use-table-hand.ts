import { useMemo, useState } from "react";

import type { GtoAction } from "@/gto/key";
import { act, advance, newHand } from "@/gto/play";

import { tableView } from "./table-view";

// One hand at the table, from its seed (BD-T7): the player's choice is taken and the bots then play
// up to the player's next decision or the end of the hand. The caller keys the table by its seed,
// so a new seed starts a new hand.
export function useTableHand(seed: number) {
  const [hand, setHand] = useState(() => newHand(seed));
  const view = useMemo(() => tableView(hand), [hand]);
  const choose = (action: GtoAction) => setHand(advance(act(hand, action)));
  return { hand, view, choose };
}
