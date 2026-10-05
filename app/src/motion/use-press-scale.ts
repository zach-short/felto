import { useEffect } from "react";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { pressedShape } from "@/motion/motion-steps";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// Every animation here passes ReduceMotion.Never, because motionAllowed has already asked the
// phone (BD-G4); Reanimated's own default would skip the fades that GF-8 keeps.
const NEVER = ReduceMotion.Never;

// GF-2: a primary button shrinks while a finger is on it, its face sinks onto the raised edge,
// and both spring back when the finger lifts. Each change of `disabled` puts the button back at
// rest with an animation, not a bare value, so the style is drawn again even when the value is
// already 0: a press can be held while the screen disables the button, and on the Pixel_9
// emulator Check was once seen drawn sunk after the lesson moved on (2026-10-05, not reproduced).
export function usePressScale(disabled: boolean) {
  const allowed = motionAllowed("press", useReducedMotion());
  const progress = useSharedValue(0);
  const press = () => {
    if (allowed) progress.set(withTiming(1, { duration: DIALS.pressDownMs, reduceMotion: NEVER }));
  };
  const release = () =>
    progress.set(withSpring(0, { duration: DIALS.pressReleaseMs, dampingRatio: DIALS.pressReleaseDamping, reduceMotion: NEVER }));
  useEffect(() => {
    progress.set(withTiming(0, { duration: 0, reduceMotion: NEVER }));
  }, [disabled, progress]);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressedShape(progress.get()).scale }] }));
  const faceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pressedShape(progress.get()).sink }] }));
  return { buttonStyle, faceStyle, press, release };
}
