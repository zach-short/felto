import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { ChoiceList } from "@/components/exercise/choice-list";
import { NEW_CONCEPT_LABEL, showsConceptTag } from "@/components/exercise/concept-tag";
import { DENSITY, exerciseArrangement, PANE_GAP, paneWidth } from "@/components/exercise/exercise-layout";
import { ExerciseScene } from "@/components/exercise/exercise-scene";
import { choiceMarks, choiceSelected, exerciseScene, optionLabels } from "@/components/exercise/exercise-view-model";
import { hostLine } from "@/components/exercise/host-speech";
import { useExerciseDensity } from "@/components/exercise/use-exercise-density";
import { useTalkBob } from "@/components/exercise/use-talk-bob";
import { Bubble } from "@/components/kit/bubble";
import { Tag } from "@/components/kit/tag";
import type { CastRole } from "@/content/cast";
import type { Exercise } from "@/content/schema";
import { MotionView } from "@/motion/motion-view";
import { ART_SCALE, SPACE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";

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

// One view for every kind of DESIGN.md 10.4: the host saying the prompt in a speech bubble
// (GF-11), the cards or numbers, and the shared answer choices. On a phone turned on its side the
// column splits, with the rows in the right half; when the rows would end below the screen they
// tighten (exercise-layout.ts, D17).
export function ExerciseView({ exercise, choice, checked, onChoose, chosenColour, host = "fish" }: ExerciseViewProps) {
  const column = useColumnWidth();
  const arrangement = exerciseArrangement(useWindowDimensions(), column);
  const pane = paneWidth(column, arrangement);
  const scene = exerciseScene(exercise);
  const labels = optionLabels(exercise);
  const { density, onRowsLayout } = useExerciseDensity(arrangement, labels.length, scene.kind === "none" ? 1 : 2);
  const gap = { gap: DENSITY[density].blockGap };
  const prompt = <HostPrompt exercise={exercise} host={host} width={pane} />;
  const rows = (
    <View onLayout={onRowsLayout}>
      <ChoiceList
        labels={labels}
        marks={choiceMarks(exercise.options.length, choice, exercise.answer, checked)}
        selected={choiceSelected(exercise.options.length, choice)}
        chosenColour={chosenColour}
        onChoose={checked ? null : onChoose}
        density={density}
      />
    </View>
  );
  if (arrangement === "split") {
    return (
      <View style={styles.split}>
        <View style={[{ width: pane }, gap]}>
          {prompt}
          <ExerciseScene scene={scene} column={pane} />
        </View>
        <View style={{ width: pane }}>{rows}</View>
      </View>
    );
  }
  return (
    <View style={gap}>
      {prompt}
      <ExerciseScene scene={scene} column={pane} />
      {rows}
    </View>
  );
}

type HostPromptProps = {
  exercise: Exercise;
  host: CastRole;
  // The width the host and its bubble share: the column, or its left half
  width: number;
};

// GF-11 and photo 2865: the host beside its bubble, the tail pointing at it, and the NEW CONCEPT
// tag over both on a step that names a new term. The host bobs while its line types. The bubble is
// keyed by the exercise, so a step whose prompt repeats the last one's still types afresh.
function HostPrompt({ exercise, host, width }: HostPromptProps) {
  const [talking, setTalking] = useState(false);
  const bob = useTalkBob(talking);
  return (
    <View style={styles.prompt}>
      {showsConceptTag(exercise, host) ? <Tag label={NEW_CONCEPT_LABEL} tone="blue" /> : null}
      <View style={styles.promptRow}>
        <MotionView style={bob}>
          <Mascot character={host} pose="think" width={width * ART_SCALE.lessonMascot} />
        </MotionView>
        <View style={styles.bubble}>
          <Bubble key={exercise.id} line={hostLine(exercise)} tail="left" onTalking={setTalking} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  split: { flexDirection: "row", alignItems: "flex-start", gap: PANE_GAP },
  prompt: { gap: SPACE.sm },
  // The gap leaves room for the bubble's tail, which reaches into it
  promptRow: { flexDirection: "row", alignItems: "center", gap: SPACE.md },
  bubble: { flex: 1 },
});
