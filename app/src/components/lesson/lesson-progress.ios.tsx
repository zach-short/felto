import { Host, ProgressView } from "@expo/ui/swift-ui";
import { progressViewStyle, tint } from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";

import type { LessonProgressProps } from "@/components/lesson/lesson-progress";

// DESIGN.md 10.3: the lesson's progress bar is SwiftUI's ProgressView in the linear style
export function LessonProgress({ done, colour }: LessonProgressProps) {
  return (
    <Host matchContents={{ vertical: true }} style={styles.bar}>
      <ProgressView value={done} modifiers={[progressViewStyle("linear"), tint(colour)]} />
    </Host>
  );
}

const styles = StyleSheet.create({
  bar: { flex: 1 },
});
