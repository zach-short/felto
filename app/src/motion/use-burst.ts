import { useAnimatedStyle } from "react-native-reanimated";

import { DIALS } from "@/config/dials";
import type { MotionStep } from "@/motion/motion-steps";
import { useStepsOn } from "@/motion/use-steps-on";

// The flight from the middle (0) to the end (1). It starts by jumping back to 0, so a second burst
// flies again from the middle, and it rests at 1, where the star has faded out
function burstSteps(): MotionStep[] {
  return [
    { to: 0, ms: 0 },
    { to: 1, ms: DIALS.particleMs },
  ];
}

// GF-17: one star of a burst flies out from the middle at `angle` (radians), shrinking and fading,
// each time `active` turns true (BD-G21). It fades with the square of its flight, so it stays bright
// for the first half: a straight fade left the ring faint by the time it opened (iPhone 17 Pro
// simulator, 2026-10-05). A particle, so reduced motion skips it and the star stays hidden (GF-8).
export function useBurst(active: boolean, angle: number) {
  const flight = useStepsOn("particles", active, burstSteps, 1);
  const distance = DIALS.burstDistance;
  const smallest = DIALS.sparkleMinScale;
  return useAnimatedStyle(() => {
    const reach = flight.get() * distance;
    return {
      opacity: 1 - flight.get() * flight.get(),
      transform: [
        { translateX: Math.cos(angle) * reach },
        { translateY: Math.sin(angle) * reach },
        { scale: 1 - (1 - smallest) * flight.get() },
      ],
    };
  });
}
