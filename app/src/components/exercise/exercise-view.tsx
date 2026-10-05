import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { ChoiceList } from "@/components/exercise/choice-list";
import { ExerciseScene } from "@/components/exercise/exercise-scene";
import { choiceMarks, choiceSelected, exerciseScene, optionLabels } from "@/components/exercise/exercise-view-model";
import type { CastRole } from "@/content/cast";
import type { Exercise } from "@/content/schema";
import { ART_SCALE, LINE_HEIGHT, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type ExerciseViewProps = {
  exercise: Exercise;
  choice: number | null;
  checked: boolean;
  onChoose: (index: number) => void;
  // The colour a chosen row takes (components/lesson/session-colour.ts)
  chosenColour: string;
  // D9: the fish hosts a lesson, the shark a boss, the squid a review
  host?: CastRole;
};

// One view for every kind of DESIGN.md 10.4: the guide thinking beside the prompt (10.5), the
// cards or numbers, and the shared answer choices.
export function ExerciseView({ exercise, choice, checked, onChoose, chosenColour, host = "fish" }: ExerciseViewProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={styles.body}>
      <View style={styles.promptRow}>
        <Mascot character={host} pose="think" width={column * ART_SCALE.lessonMascot} />
        <Text style={[styles.prompt, { color: colours.text }]}>{exercise.prompt}</Text>
      </View>
      <ExerciseScene scene={exerciseScene(exercise)} />
      <ChoiceList
        labels={optionLabels(exercise)}
        marks={choiceMarks(exercise.options.length, choice, exercise.answer, checked)}
        selected={choiceSelected(exercise.options.length, choice)}
        chosenColour={chosenColour}
        onChoose={checked ? null : onChoose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: SPACE.lg },
  promptRow: { flexDirection: "row", alignItems: "center", gap: SPACE.md },
  prompt: { flex: 1, fontSize: TYPE.body, fontWeight: "700", lineHeight: LINE_HEIGHT.body },
});
