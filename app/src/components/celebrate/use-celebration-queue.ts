import { useState } from "react";

import { stateMoments, type StateMoment } from "@/game/celebration-moments";
import type { PlayerState } from "@/game/player-state";

// Each moment carries an id, so the layer mounts a fresh player for it and the art starts again
export type QueuedMoment = { id: number; moment: StateMoment };

type Queue = { items: QueuedMoment[]; added: number };

// GF-24: the moments the layer has still to play, found by comparing each player state with the
// one before it. The comparison runs while rendering, in the way React's guide adjusts a state when
// a prop changes, so no frame is drawn with a found moment missing. The queue lives in memory: an
// app closed before the layer shows loses the show, and the action had saved the state already.
export function useCelebrationQueue(state: PlayerState) {
  const [seen, setSeen] = useState(state);
  const [queue, setQueue] = useState<Queue>({ items: [], added: 0 });
  if (state !== seen) {
    setSeen(state);
    // BD-12: the hook is the edge, so it reads the clock, once for each change
    const found = stateMoments(seen, state, new Date());
    if (found.length > 0) setQueue((latest) => enqueue(latest, found));
  }
  const next = () => setQueue((latest) => ({ ...latest, items: latest.items.slice(1) }));
  return { current: queue.items.length > 0 ? queue.items[0] : null, next };
}

function enqueue(queue: Queue, found: readonly StateMoment[]): Queue {
  const items = found.map((moment, index) => ({ id: queue.added + index, moment }));
  return { items: [...queue.items, ...items], added: queue.added + found.length };
}
