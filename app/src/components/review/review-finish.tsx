import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { Reward } from "@/components/lesson/lesson-finish";
import { CAST } from "@/content/cast";
import { DIALS } from "@/config/dials";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type ReviewFinishProps = {
  right: number;
  size: number;
  streak: number;
};

// DESIGN.md 10.5: the squid is happy at the end of a review. D8: a finished review gives 10 XP
// for each right answer and counts for the streak; it never cost a heart.
export function ReviewFinish({ right, size, streak }: ReviewFinishProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={styles.finish}>
      <Mascot character="squid" pose="happy" width={column * ART_SCALE.finishMascot} />
      <Text style={[styles.title, { color: colours.text }]}>Review finished!</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>
        {`${right} of ${size} right. ${CAST.squid} is impressed.`}
      </Text>
      <View style={styles.stats}>
        <Reward art="xp_bolt" text={`+${right * DIALS.xpPerRightAnswer} XP`} />
        <Reward art="streak_flame" text={streak === 1 ? "1-day streak" : `${streak}-day streak`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  finish: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
  stats: { flexDirection: "row", gap: SPACE.md },
});
