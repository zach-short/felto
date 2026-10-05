import { useEffect } from "react";
import { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// A view that fades in when it first draws. GF-8 keeps fades under reduced motion; if the dial
// ever lists "fade", the view simply appears.
export function useFadeIn() {
  const allowed = motionAllowed("fade", useReducedMotion());
  const opacity = useSharedValue(allowed ? 0 : 1);
  useEffect(() => {
    opacity.set(withTiming(1, { duration: allowed ? DIALS.fadeMs : 0, reduceMotion: ReduceMotion.Never }));
  }, [allowed, opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}
