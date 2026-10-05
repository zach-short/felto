import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ChoiceMark } from "@/components/exercise/exercise-view-model";
import { DIALS } from "@/config/dials";
import { MotionView } from "@/motion/motion-view";
import { useBounce } from "@/motion/use-bounce";
import { useFlash } from "@/motion/use-flash";
import { useLift } from "@/motion/use-lift";
import { useShake } from "@/motion/use-shake";
import { CHOICE_BORDER, OPACITY, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type ChoiceListProps = {
  labels: string[];
  marks: ChoiceMark[];
  selected: boolean[];
  // The colour the chosen row takes: its unit's, or the neutral accent (session-colour.ts)
  chosenColour: string;
  // null once the answer is checked, so a choice cannot change under its feedback
  onChoose: ((index: number) => void) | null;
};

// DESIGN.md 10.3: answer choices are not native controls; every kind uses this one tappable
// shape, so every exercise looks alike.
export function ChoiceList({ labels, marks, selected, chosenColour, onChoose }: ChoiceListProps) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {labels.map((label, index) => (
        <Choice
          key={label}
          label={label}
          mark={marks[index]}
          selected={selected[index]}
          chosenColour={chosenColour}
          onPress={onChoose ? () => onChoose(index) : null}
        />
      ))}
    </View>
  );
}

type ChoiceProps = {
  label: string;
  mark: ChoiceMark;
  selected: boolean;
  chosenColour: string;
  onPress: (() => void) | null;
};

// Game feel phase 4: a row rests on an edge of its border colour, as the primary button does
// (GF-2). The chosen row lifts and takes its colour; a right answer the player chose bounces and
// flashes the right colour; a wrong one shakes. Every movement is on a view inside the pressable,
// so the tap target never moves under a finger.
function Choice({ label, mark, selected, chosenColour, onPress }: ChoiceProps) {
  const { colours } = useTheme();
  const border = { plain: colours.line, chosen: chosenColour, right: colours.right, wrong: colours.wrong }[mark];
  const fill = { plain: colours.surface, chosen: colours.surface, right: colours.rightSoft, wrong: colours.wrongSoft }[mark];
  const won = mark === "right" && selected;
  const shake = useShake(mark === "wrong");
  const bounce = useBounce(won);
  const flash = useFlash(won);
  const lift = useLift(mark === "chosen");
  return (
    <Pressable
      onPress={onPress ?? undefined}
      disabled={!onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({ opacity: pressed ? OPACITY.pressed : 1 })}
    >
      <MotionView style={[styles.row, shake]}>
        <MotionView style={bounce}>
          <View style={[styles.edge, { backgroundColor: border }]} />
          <MotionView style={[styles.face, { borderColor: border, backgroundColor: fill }, lift]}>
            <MotionView pointerEvents="none" style={[styles.flash, { backgroundColor: colours.right }, flash]} />
            <Text style={[styles.label, { color: colours.text }]}>{label}</Text>
          </MotionView>
        </MotionView>
      </MotionView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACE.sm },
  // The edge is a second face drawn lower by the dial, so only its bottom strip shows
  row: { paddingBottom: DIALS.choiceEdge },
  edge: { position: "absolute", left: 0, right: 0, top: DIALS.choiceEdge, bottom: -DIALS.choiceEdge, borderRadius: RADIUS.md },
  face: {
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.md,
    borderWidth: CHOICE_BORDER,
    overflow: "hidden",
  },
  flash: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  label: { fontSize: TYPE.body, fontWeight: "700", textAlign: "center" },
});
