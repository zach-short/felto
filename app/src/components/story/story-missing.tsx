import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import { STORY_DONE, STORY_MISSING } from "@/components/story/story-copy";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// Rule U4, the error state: a unit with no story, drawn as a lesson id that is not on the path is
// (LessonClosed, "missing"), with words that fit a story. Android's back button needs no hook
// here: with nothing to lose, the native back closes the modal.
export function StoryMissing() {
  const router = useRouter();
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <LessonFrame bottom={<LessonButton label={STORY_DONE} onPress={() => router.back()} />}>
      <View style={styles.closed}>
        <Mascot character="fish" pose="sad" width={column * ART_SCALE.finishMascot} />
        <Text style={[styles.title, { color: colours.text }]}>{STORY_MISSING.title}</Text>
        <Text style={[styles.line, { color: colours.textMuted }]}>{STORY_MISSING.line}</Text>
      </View>
    </LessonFrame>
  );
}

const styles = StyleSheet.create({
  closed: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
});
