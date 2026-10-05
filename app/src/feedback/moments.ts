import type { Effect } from "@/art/sounds";
import { safely } from "@/feedback/safely";

// The parts of a feedback moment that touch the phone, passed in so this module stays free of
// expo-audio and expo-haptics and runs in node (rule B2's reason, BD-4)
export type MomentDevices<Touch> = {
  sound: boolean;
  play: (effect: Effect) => void;
  buzz: (touch: Touch) => Promise<unknown>;
};

// D15: the Sound setting turns the effects off; haptics stay, as they follow the phone's own
// setting (BD-19). Neither may throw into the session that called it.
export function feedbackMoment<Touch>(effect: Effect, touch: Touch, devices: MomentDevices<Touch>): () => void {
  return () => {
    if (devices.sound) safely(() => devices.play(effect));
    safely(() => devices.buzz(touch));
  };
}

// BD-24: the players are made before the first answer needs one, but only while Sound is on, so a
// player who turned Sound off never loads audio at all
export function prepareSound(sound: boolean, load: () => void): void {
  if (sound) safely(load);
}
