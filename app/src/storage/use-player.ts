import { useContext } from "react";

import type { PlayerContextValue } from "@/storage/player-context";
import { PlayerContext } from "@/storage/player-context";

// Rule B4: the one way a screen reaches player state
export function usePlayer(): PlayerContextValue {
  const value = useContext(PlayerContext);
  if (value === null) throw new Error("usePlayer needs a PlayerProvider above it");
  return value;
}
