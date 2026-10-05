import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ChoiceMark } from "@/components/exercise/exercise-view-model";
import { CHOICE_BORDER, OPACITY, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type ChoiceListProps = {
  labels: string[];
  marks: ChoiceMark[];
  selected: boolean[];
  // null once the answer is checked, so a choice cannot change under its feedback
  onChoose: ((index: number) => void) | null;
};

// DESIGN.md 10.3: answer choices are not native controls; every kind uses this one tappable
// shape, so every exercise looks alike.
export function ChoiceList({ labels, marks, selected, onChoose }: ChoiceListProps) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {labels.map((label, index) => (
        <Choice key={label} label={label} mark={marks[index]} selected={selected[index]} onPress={onChoose ? () => onChoose(index) : null} />
      ))}
    </View>
  );
}

type ChoiceProps = {
  label: string;
  mark: ChoiceMark;
  selected: boolean;
  onPress: (() => void) | null;
};

function Choice({ label, mark, selected, onPress }: ChoiceProps) {
  const { colours } = useTheme();
  const border = { plain: colours.line, chosen: colours.accent, right: colours.right, wrong: colours.wrong }[mark];
  const fill = { plain: colours.surface, chosen: colours.surface, right: colours.rightSoft, wrong: colours.wrongSoft }[mark];
  return (
    <Pressable
      onPress={onPress ?? undefined}
      disabled={!onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.choice, { borderColor: border, backgroundColor: fill, opacity: pressed ? OPACITY.pressed : 1 }]}
    >
      <Text style={[styles.label, { color: colours.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACE.sm },
  choice: {
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.md,
    borderWidth: CHOICE_BORDER,
  },
  label: { fontSize: TYPE.body, fontWeight: "700", textAlign: "center" },
});
