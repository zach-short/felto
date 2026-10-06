import { Pressable, StyleSheet, Text, View } from "react-native";

import { DIALS } from "@/config/dials";
import { useHaptics } from "@/feedback/use-haptics";
import { useSound } from "@/feedback/use-sound";
import { MotionView } from "@/motion/motion-view";
import { usePressScale } from "@/motion/use-press-scale";
import { BUTTON_HEIGHT, RADIUS, TYPE, type ColourName } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// A button's face, its raised edge and its label, each a colour token
export type ButtonPaint = { face: ColourName; edge: ColourName; ink: ColourName };

export const BLUE_BUTTON: ButtonPaint = { face: "button", edge: "buttonEdge", ink: "buttonInk" };
// The second choice of a dialog: the card's own surface, raised on the line colour
export const QUIET_BUTTON: ButtonPaint = { face: "surface", edge: "line", ink: "text" };

type GameButtonProps = {
  label: string;
  onPress: () => void;
  paint?: ButtonPaint;
};

// GF-10: the raised button of the kit. It is PrimaryButton's pattern (GF-2, BD-G18), with the same
// press, in any paint of the tokens and as wide as its parent, so it fits a popover card or a
// dialog where the column-wide PrimaryButton does not. It gives the press touch and sound itself,
// through the player's switches (GF-3, GF-5).
export function GameButton({ label, onPress, paint = BLUE_BUTTON }: GameButtonProps) {
  const { colours } = useTheme();
  const buzz = useHaptics();
  const play = useSound();
  const { buttonStyle, faceStyle, press, release } = usePressScale(false);
  const pressIn = () => {
    press();
    buzz(DIALS.pressHaptic);
    play(DIALS.pressSound);
  };
  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={release} accessibilityRole="button" accessibilityLabel={label}>
      <MotionView style={[styles.button, buttonStyle]}>
        <View style={[styles.edge, { backgroundColor: colours[paint.edge] }]} />
        <MotionView style={[styles.face, { backgroundColor: colours[paint.face] }, faceStyle]}>
          <Text style={[styles.label, { color: colours[paint.ink] }]}>{label}</Text>
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
  // White on the blue face is 4.0 to 1, which passes only as large text, as on PrimaryButton
  label: { fontSize: TYPE.heading, fontWeight: "800" },
});
