import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useIsFocused } from "expo-router";

import { twinklePlaces, type StarPlace } from "@/components/kit/sparkle-places";
import { Star } from "@/components/kit/star";
import { DIALS } from "@/config/dials";
import { MotionView } from "@/motion/motion-view";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";
import { useTwinkle } from "@/motion/use-twinkle";
import { TONES, type Tone } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type Box = { width: number; height: number };

// GF-17: a layer of twinkling stars over whatever box it is put in (the current path node, a chest,
// a finish screen), as the last child of that box. It measures the box itself, and the stars sit
// in fixed places (sparkle-places.ts). It loops only while its screen is in view, and draws nothing
// under reduced motion (GF-8). It takes no touches and is hidden from screen readers: it decorates.
export function Sparkles({ tone = "gold" }: { tone?: Tone }) {
  const { colours } = useTheme();
  const focused = useIsFocused();
  const allowed = motionAllowed("particles", useReducedMotion());
  const [box, setBox] = useState<Box | null>(null);
  const measure = (event: LayoutChangeEvent) => setBox(event.nativeEvent.layout);
  if (!allowed) return null;
  const places = box ? twinklePlaces(DIALS.sparkleCount, box, DIALS.sparkleSize, DIALS.sparklePeriodMs) : [];
  return (
    <View onLayout={measure} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      {places.map((place, i) => (
        <TwinkleStar key={i} place={place} colour={colours[TONES[tone].face]} active={focused} />
      ))}
    </View>
  );
}

function TwinkleStar({ place, colour, active }: { place: StarPlace; colour: string; active: boolean }) {
  const twinkle = useTwinkle(active, place.delayMs);
  return (
    <MotionView style={[styles.star, { left: place.x, top: place.y }, twinkle]}>
      <Star size={place.size} colour={colour} />
    </MotionView>
  );
}

const styles = StyleSheet.create({
  star: { position: "absolute" },
});
