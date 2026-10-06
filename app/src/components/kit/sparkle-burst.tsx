import { StyleSheet, View } from "react-native";

import { burstAngles } from "@/components/kit/sparkle-places";
import { Star } from "@/components/kit/star";
import { DIALS } from "@/config/dials";
import { MotionView } from "@/motion/motion-view";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";
import { useBurst } from "@/motion/use-burst";
import { TONES, type Tone } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// GF-17: a one-shot ring of stars that flies out from the middle of its box and fades, each time
// `play` turns true: a celebration, a perfect answer. Put it in the box as the last child. A
// single shot, so nothing runs after it lands. It draws nothing under reduced motion (GF-8),
// takes no touches and is hidden from screen readers. Item 49 may later draw it with Lottie.
export function SparkleBurst({ play, tone = "gold" }: { play: boolean; tone?: Tone }) {
  const { colours } = useTheme();
  const allowed = motionAllowed("particles", useReducedMotion());
  if (!allowed) return null;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, styles.centre]}>
      {burstAngles(DIALS.particleCount).map((angle) => (
        <BurstStar key={angle} angle={angle} play={play} colour={colours[TONES[tone].face]} />
      ))}
    </View>
  );
}

function BurstStar({ angle, play, colour }: { angle: number; play: boolean; colour: string }) {
  const flight = useBurst(play, angle);
  return (
    <MotionView style={[styles.star, flight]}>
      <Star size={DIALS.sparkleSize} colour={colour} />
    </MotionView>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: "center", justifyContent: "center" },
  star: { position: "absolute" },
});
