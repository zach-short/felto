import { Pressable, StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import { heartsLabel } from "@/components/lesson/hearts-label";
import { LessonProgress } from "@/components/lesson/lesson-progress";
import { MIN_STAT_ICON, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type LessonHeaderProps = {
  done: number;
  // null hides the hearts: a practice set has nothing to do with them (D21)
  lives: number | null;
  onLeave: () => void;
};

// The top of the lesson: a way out, the progress bar and the hearts left (D8)
export function LessonHeader({ done, lives, onLeave }: LessonHeaderProps) {
  const { colours } = useTheme();
  return (
    <View style={styles.header}>
      <Pressable onPress={onLeave} accessibilityRole="button" accessibilityLabel="Leave the lesson" hitSlop={SPACE.md}>
        <Text style={[styles.close, { color: colours.textMuted }]}>✕</Text>
      </Pressable>
      <LessonProgress done={done} colour={colours.right} trackColour={colours.line} />
      {lives === null ? null : (
        <View style={styles.lives} accessible accessibilityLabel={heartsLabel(lives)}>
          <Art name="lives_heart" width={MIN_STAT_ICON} />
          <Text style={[styles.count, { color: colours.text }]}>{lives}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingVertical: SPACE.sm },
  close: { fontSize: TYPE.heading, fontWeight: "700" },
  lives: { flexDirection: "row", alignItems: "center", gap: SPACE.xs },
  count: { fontSize: TYPE.stat, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
