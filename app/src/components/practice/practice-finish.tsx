import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { Reward } from "@/components/lesson/lesson-finish";
import { CAST } from "@/content/cast";
import { DIALS } from "@/config/dials";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type PracticeFinishProps = {
  right: number;
  size: number;
  streak: number;
};

// D21: a finished set gives 5 XP for each right answer and counts for the streak. DESIGN.md 10.7:
// the squid hosts practice, and is happy at the end as in a review (10.5).
export function PracticeFinish({ right, size, streak }: PracticeFinishProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={styles.finish}>
      <Mascot character="squid" pose="happy" width={column * ART_SCALE.finishMascot} />
      <Text style={[styles.title, { color: colours.text }]}>Set finished!</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>
        {`${right} of ${size} right. ${CAST.squid} has another deck ready whenever you are.`}
      </Text>
      <View style={styles.stats}>
        <Reward art="xp_bolt" text={`+${right * DIALS.practiceXpPerRight} XP`} />
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
