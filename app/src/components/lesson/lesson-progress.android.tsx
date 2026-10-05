import { Host, LinearProgressIndicator } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";

import type { LessonProgressProps } from "@/components/lesson/lesson-progress";

// DESIGN.md 10.3: the lesson's progress bar is Compose's LinearProgressIndicator
export function LessonProgress({ done, colour, trackColour }: LessonProgressProps) {
  return (
    <Host matchContents={{ vertical: true }} style={styles.bar}>
      <LinearProgressIndicator
        progress={done}
        color={colour}
        trackColor={trackColour}
        modifiers={[fillMaxWidth()]}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  bar: { flex: 1 },
});
