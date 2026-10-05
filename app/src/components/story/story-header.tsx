import { Pressable, StyleSheet, Text, View } from "react-native";

import { STORY_CLOSE_LABEL } from "@/components/story/story-copy";
import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type StoryHeaderProps = {
  index: number;
  count: number;
  onClose: () => void;
};

// US-6: a way out and one progress mark per slide, laid out as the lesson header is (the cross,
// then the bar). The marks take no touch, so a tap on them reaches the tap layer below, and a
// screen reader hears the position on the slide itself.
export function StoryHeader({ index, count, onClose }: StoryHeaderProps) {
  const { colours } = useTheme();
  return (
    <View style={styles.header} pointerEvents="box-none">
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={STORY_CLOSE_LABEL} hitSlop={SPACE.md}>
        <Text style={[styles.close, { color: colours.textMuted }]}>✕</Text>
      </Pressable>
      <View style={styles.marks} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: count }, (_, mark) => (
          <View key={mark} style={[styles.mark, { backgroundColor: mark <= index ? colours.accent : colours.line }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingVertical: SPACE.sm },
  close: { fontSize: TYPE.heading, fontWeight: "700" },
  marks: { flex: 1, flexDirection: "row", gap: SPACE.xs },
  mark: { flex: 1, height: SPACE.xs, borderRadius: SPACE.xs / 2 },
});
