import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import type { ArtName } from "@/art/sizes";
import { Mascot } from "@/art/mascot";
import { CAST } from "@/content/cast";
import { ART_SCALE, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type LessonFinishProps = {
  right: number;
  size: number;
  xp: number;
  streak: number;
};

// DESIGN.md 10.3: the finish is drawn inside the lesson modal, with the fish happy (10.5), the
// XP the lesson gave and the streak it kept (D8).
export function LessonFinish({ right, size, xp, streak }: LessonFinishProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={styles.finish}>
      <Mascot character="fish" pose="happy" width={column * ART_SCALE.finishMascot} />
      <Text style={[styles.title, { color: colours.text }]}>Lesson finished!</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>
        {`${right} of ${size} right. ${CAST.fish} is proud of you.`}
      </Text>
      <View style={styles.stats}>
        <Reward art="xp_bolt" text={`+${xp} XP`} />
        <Reward art="streak_flame" text={streak === 1 ? "1-day streak" : `${streak}-day streak`} />
      </View>
    </View>
  );
}

// Shared with the boss and review finishes (phase 10)
export function Reward({ art, text }: { art: ArtName; text: string }) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={[styles.reward, { backgroundColor: colours.surface }]}>
      <Art name={art} width={column * ART_SCALE.finishIcon} />
      <Text style={[styles.rewardText, { color: colours.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  finish: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  title: { fontSize: TYPE.title, fontWeight: "800" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
  stats: { flexDirection: "row", gap: SPACE.md },
  reward: { flexDirection: "row", alignItems: "center", gap: SPACE.sm, padding: SPACE.md, borderRadius: RADIUS.md },
  rewardText: { fontSize: TYPE.heading, fontWeight: "800" },
});
