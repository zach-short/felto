import type { Effect } from "@/art/sounds";
import { safely } from "@/feedback/safely";

// D15: the Sound switch in Profile turns every effect off, and an effect never throws into the
// screen that asked for it (audit of item 13, B1). This is that rule for an effect played on its
// own, such as the press sound of GF-5, outside the six moments of moments.ts. The player is an
// argument because feedback/effects.ts imports expo-audio, which vitest in node cannot load, the
// same reason should-buzz.ts has its own file (PLAN.md BD-G15).
export function playThrough(effect: Effect, sound: boolean, play: (effect: Effect) => void): void {
  if (sound) safely(() => play(effect));
}
