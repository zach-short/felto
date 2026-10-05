import { createContext } from "react";

import type { PlayerState } from "@/game/player-state";
import type { PlayerActions } from "@/storage/player-actions";
import type { LoadResult } from "@/storage/player-store";

// Rule U4: "new" is the empty state a first player sees, and "recovered" is the error state: the
// stored value could not be read and sits under backupKey. There is no loading state, because the
// player is read synchronously before the first render.
export type PlayerContextValue = {
  status: LoadResult["status"];
  backupKey: string | null;
  state: PlayerState;
  actions: PlayerActions;
};

export const PlayerContext = createContext<PlayerContextValue | null>(null);
