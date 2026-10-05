import { Pressable, StyleSheet, Text, View } from "react-native";

import { DIALS } from "@/config/dials";
import { MotionView } from "@/motion/motion-view";
import { usePressScale } from "@/motion/use-press-scale";
import { BUTTON_HEIGHT, RADIUS, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  // Left open for game-feel phases 2 and 3, which pass the press haptic and the press sound. Each
  // runs as the finger goes down, so the answer is felt at the touch, not at the lift
  pressHaptic?: () => void;
  pressSound?: () => void;
};

// GF-2 (amends D2): Check and Continue are not native. A face sits on a raised edge of a darker
// tone, as the art's extruded shapes do, and sinks onto the edge while a finger is on it. It calls
// the same handler the native button did, so the double-press guards of session-steps.ts stand.
export function PrimaryButton({ label, onPress, disabled = false, pressHaptic, pressSound }: PrimaryButtonProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { buttonStyle, faceStyle, press, release } = usePressScale(disabled);
  const pressIn = () => {
    press();
    pressHaptic?.();
    pressSound?.();
  };
  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={release}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <MotionView style={[styles.button, { width: column }, buttonStyle]}>
        <View style={[styles.edge, { backgroundColor: disabled ? colours.buttonOffEdge : colours.buttonEdge }]} />
        <MotionView style={[styles.face, { backgroundColor: disabled ? colours.buttonOff : colours.button }, faceStyle]}>
          <Text style={[styles.label, { color: disabled ? colours.buttonOffInk : colours.buttonInk }]}>{label}</Text>
        </MotionView>
      </MotionView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { height: BUTTON_HEIGHT + DIALS.buttonEdge },
  // The edge is a second face drawn lower by its own height, so only its bottom strip shows
  edge: { position: "absolute", left: 0, right: 0, top: DIALS.buttonEdge, height: BUTTON_HEIGHT, borderRadius: RADIUS.md },
  face: { height: BUTTON_HEIGHT, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center" },
  label: { fontSize: TYPE.heading, fontWeight: "800" },
});
