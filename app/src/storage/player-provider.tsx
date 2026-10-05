import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { kvStore } from "@/storage/kv-store-adapter";
import { playerActions } from "@/storage/player-actions";
import { createPlayerCell } from "@/storage/player-cell";
import { PlayerContext } from "@/storage/player-context";
import type { KeyValueStore } from "@/storage/player-store";
import { backupPlayer } from "@/storage/player-store";
import { useStoredPlayer } from "@/storage/use-stored-player";

type Props = { children: ReactNode; store?: KeyValueStore };

// D3 and rule B4: the one provider of player state. It goes at the root layout, above every
// screen that reads the player. The cell holds the latest state for the actions; React state
// follows it for rendering and saving.
export function PlayerProvider({ children, store = kvStore }: Props) {
  const { loaded, state, setState } = useStoredPlayer(store);
  const [actions] = useState(() => {
    const cell = createPlayerCell(loaded.state, setState);
    return playerActions(cell, () => new Date(), (latest, now) => backupPlayer(store, latest, now));
  });
  const value = useMemo(() => {
    const backupKey = loaded.status === "recovered" ? loaded.backupKey : null;
    return { status: loaded.status, backupKey, state, actions };
  }, [loaded, state, actions]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
