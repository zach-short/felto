import type { Touch } from "@/feedback/haptics";
import { buzz } from "@/feedback/haptics";
import { usePlayer } from "@/storage/use-player";

// GF-3: a touch of the vocabulary, given through the player's Haptics switch, so a screen never
// reads or passes the setting itself
export function useHaptics(): (touch: Touch) => void {
  const { state } = usePlayer();
  const { haptics } = state.settings;
  return (touch) => buzz(touch, haptics);
}
