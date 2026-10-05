import { useEffect, useState } from "react";

import type { PlayerState } from "@/game/player-state";
import type { KeyValueStore, LoadResult } from "@/storage/player-store";
import { loadPlayer, savePlayer } from "@/storage/player-store";

// Reads the player once, before the first render, and writes it back after every change
export function useStoredPlayer(store: KeyValueStore) {
  const [loaded] = useState<LoadResult>(() => loadPlayer(store, new Date()));
  const [state, setState] = useState<PlayerState>(loaded.state);
  useEffect(() => {
    savePlayer(store, state);
  }, [store, state]);
  return { loaded, state, setState };
}
