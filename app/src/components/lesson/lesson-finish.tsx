import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import type { ArtName } from "@/art/sizes";
import { FlopRive } from "@/art/flop-rive";
import { loganLine } from "@/components/lesson/logan-line";
import { CAST } from "@/content/cast";
import { ART_SCALE, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type LessonFinishProps = {
  right: number;
  size: number;
  xp: number;
  streak: number;
  loganMode: boolean;
};

// DESIGN.md 10.3: the finish is drawn inside the lesson modal, with the fish happy (10.5), the
// XP the lesson gave and the streak it kept (D8). Board item 34: the rigged Flop darts around only
// when every answer was right; otherwise it holds the idle loop. FlopRive draws the static happy
// pose itself under reduced motion or a failed load.
export function LessonFinish({ right, size, xp, streak, loganMode }: LessonFinishProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={styles.finish}>
      <FlopRive perfect={right === size} width={column * ART_SCALE.finishMascot} />
      <Text style={[styles.title, { color: colours.text }]}>Lesson finished!</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>
        {`${right} of ${size} right. ${CAST.fish} is proud of you.`}
      </Text>
      <LoganLine loganMode={loganMode} />
      <View style={styles.stats}>
        <Reward art="xp_bolt" text={`+${xp} XP`} />
        <Reward art="streak_flame" text={streak === 1 ? "1-day streak" : `${streak}-day streak`} />
      </View>
    </View>
  );
}

// Logan Mode: the loving line under the score, drawn only when the switch is on
export function LoganLine({ loganMode }: { loganMode: boolean }) {
  const { colours } = useTheme();
  const line = loganLine(loganMode);
  return line === null ? null : <Text style={[styles.logan, { color: colours.text }]}>{line}</Text>;
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
  logan: { fontSize: TYPE.heading, fontWeight: "800", textAlign: "center" },
  stats: { flexDirection: "row", gap: SPACE.md },
  reward: { flexDirection: "row", alignItems: "center", gap: SPACE.sm, padding: SPACE.md, borderRadius: RADIUS.md },
  rewardText: { fontSize: TYPE.heading, fontWeight: "800" },
});
