import { useEffect, useEffectEvent, useState } from "react";
import { StyleSheet, View } from "react-native";
import LottieView, { type AnimationObject } from "lottie-react-native";

import burst from "@art/lottie/burst.json";
import chipFlyUp from "@art/lottie/chip_fly_up.json";
import confetti from "@art/lottie/confetti.json";
import flameFlicker from "@art/lottie/flame_flicker.json";
import gemFlyUp from "@art/lottie/gem_fly_up.json";
import sparkleShower from "@art/lottie/sparkle_shower.json";

import { EFFECT_LOOPS, effectHeight, effectMode, type EffectName } from "@/art/effects";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// Rule U6, widened to Lottie by board item 49: the generated files and the runtime are imported
// here and nowhere else, so every other file asks for an effect by name
const SOURCES: Record<EffectName, AnimationObject> = {
  burst,
  confetti,
  sparkle_shower: sparkleShower,
  gem_fly_up: gemFlyUp,
  chip_fly_up: chipFlyUp,
  flame_flicker: flameFlicker,
};

type EffectProps = {
  name: EffectName;
  width: number;
  // Left out, the effect keeps its own habit (EFFECT_LOOPS)
  loop?: boolean;
  onEnd?: () => void;
};

// GF-15: a generated effect, drawn over whatever is behind it and never in the way of a touch
export function Effect({ name, width, loop = EFFECT_LOOPS[name], onEnd }: EffectProps) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const mode = effectMode(loop, motionAllowed("particles", reduced), failed);
  const end = useEffectEvent(() => onEnd?.());
  // A skipped effect still ends, so a caller that waits on onEnd moves on (GF-8)
  useEffect(() => {
    if (mode === "none") end();
  }, [mode]);
  if (mode === "none") return null;
  const source = SOURCES[name];
  return (
    <View
      style={[styles.stage, { width, height: effectHeight(width, source) }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LottieView
        source={source}
        autoPlay={mode === "play"}
        loop={loop}
        progress={mode === "still" ? 0 : undefined}
        onAnimationFinish={(cancelled) => cancelled || onEnd?.()}
        onAnimationFailure={() => setFailed(true)}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { pointerEvents: "none" },
  fill: { flex: 1 },
});
