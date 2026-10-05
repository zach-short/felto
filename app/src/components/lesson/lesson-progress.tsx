import { StyleSheet, View } from "react-native";

import { MotionView } from "@/motion/motion-view";
import { useFill } from "@/motion/use-fill";
import { PROGRESS_HEIGHT } from "@/theme/tokens";

type LessonProgressProps = {
  // The share of the lesson answered, from 0 to 1
  done: number;
  colour: string;
  trackColour: string;
};

// The lesson's progress bar. DESIGN.md 10.3 made it a native pair (SwiftUI's ProgressView and
// Compose's LinearProgressIndicator); Zach replaced it on 2026-10-05 (board item 29, an amendment
// of D2 under GF-2) with one view of the app's tokens, so its fill can grow after each answer.
// A screen reader hears it as a progress bar with its share in percent, as it heard the native one.
export function LessonProgress({ done, colour, trackColour }: LessonProgressProps) {
  const fill = useFill(done);
  return (
    <View
      style={[styles.track, { backgroundColor: trackColour }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(done * 100) }}
    >
      <MotionView style={[styles.fill, { backgroundColor: colour }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: PROGRESS_HEIGHT, borderRadius: PROGRESS_HEIGHT / 2, overflow: "hidden" },
  fill: { height: PROGRESS_HEIGHT, borderRadius: PROGRESS_HEIGHT / 2 },
});
