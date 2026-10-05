import type { Effect } from "@/art/sounds";
import { playEffect } from "@/feedback/effects";
import { playThrough } from "@/feedback/sound-switch";
import { usePlayer } from "@/storage/use-player";

// GF-5: an effect played through the player's Sound switch, so a screen never reads or passes the
// setting itself (the shape of useHaptics, GF-3). With Sound off nothing plays and no audio loads.
export function useSound(): (effect: Effect) => void {
  const { state } = usePlayer();
  const { sound } = state.settings;
  return (effect) => playThrough(effect, sound, playEffect);
}
