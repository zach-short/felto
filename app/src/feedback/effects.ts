import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { SOUND_SOURCES, type Effect } from "@/art/sounds";
import { quietly } from "@/feedback/safely";

export type { Effect } from "@/art/sounds";

let players: Record<Effect, AudioPlayer> | null = null;

// BD-24: one player per effect, made once and kept for the life of the app. D15: the effects
// follow the iPhone's silent switch (playsInSilentMode false; on Android, the ringer mode), and
// mix with other audio, so a lesson never stops the player's music. A throw here reaches only
// the caller's safely() (feedback/safely.ts), never a session.
export function loadEffects(): Record<Effect, AudioPlayer> {
  if (players) return players;
  quietly(setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers" }));
  const made = {} as Record<Effect, AudioPlayer>;
  for (const effect of Object.keys(SOUND_SOURCES) as Effect[]) made[effect] = createAudioPlayer(SOUND_SOURCES[effect]);
  players = made;
  return made;
}

// D15: turning Sound off in Profile cuts off an effect that is still playing. It never loads the
// players to do so: a player who never had Sound on has none to stop.
export function stopEffects(): void {
  if (!players) return;
  for (const player of Object.values(players)) player.pause();
}

// A player keeps its place after it ends, so each play starts again from the top
export function playEffect(effect: Effect): void {
  const player = loadEffects()[effect];
  quietly(player.seekTo(0));
  player.play();
}
