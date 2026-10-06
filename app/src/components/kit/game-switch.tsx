import { Pressable, StyleSheet, View } from "react-native";

import { DIALS } from "@/config/dials";
import { useHaptics } from "@/feedback/use-haptics";
import { useSound } from "@/feedback/use-sound";
import { MotionView } from "@/motion/motion-view";
import { useSlide } from "@/motion/use-slide";
import { KIT, OPACITY, SPACE, TONES } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type GameSwitchProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  // What the switch turns on, for a screen reader: "Haptics"
  label: string;
  disabled?: boolean;
};

// The knob rests this far inside the track at either end, so it travels the rest
const INSET = (KIT.switchHeight - KIT.switchKnob) / 2;
const TRAVEL = KIT.switchWidth - KIT.switchKnob - INSET * 2;

// GF-10: replaces the native switch (Profile's Sound and Haptics, the reminder). A raised track,
// green when on and the locked grey when off, with a white knob that slides across. A screen
// reader hears a switch, its label and whether it is on, as it did the native one. A flip gives
// the touch and the effect of a choice. The touch target reaches past the small track.
export function GameSwitch({ value, onChange, label, disabled = false }: GameSwitchProps) {
  const { colours } = useTheme();
  const buzz = useHaptics();
  const play = useSound();
  const knob = useSlide(value, TRAVEL);
  const flip = () => {
    buzz(DIALS.switchHaptic);
    play(DIALS.switchSound);
    onChange(!value);
  };
  const track = value ? { face: colours[TONES.green.face], edge: colours[TONES.green.edge] } : { face: colours.buttonOff, edge: colours.buttonOffEdge };
  return (
    <Pressable
      onPress={flip}
      disabled={disabled}
      hitSlop={SPACE.sm}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      style={disabled && styles.off}
    >
      <View style={[styles.track, { backgroundColor: track.face, borderBottomColor: track.edge }]}>
        <MotionView style={[styles.knob, { backgroundColor: colours.switchKnob }, knob]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: KIT.switchWidth,
    height: KIT.switchHeight + KIT.switchEdge,
    borderRadius: KIT.pillRadius,
    borderBottomWidth: KIT.switchEdge,
  },
  knob: { position: "absolute", top: INSET, left: INSET, width: KIT.switchKnob, height: KIT.switchKnob, borderRadius: KIT.pillRadius },
  off: { opacity: OPACITY.faded },
});
