import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { LoganLine, Reward } from "@/components/lesson/lesson-finish";
import { CAST } from "@/content/cast";
import { DIALS } from "@/config/dials";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type BossFinishProps = {
  right: number;
  size: number;
  passed: boolean;
  // A chest waits only after the first pass of this unit's boss (D8)
  chestReady: boolean;
  streak: number;
  loganMode: boolean;
};

// DESIGN.md 10.5: the shark is sad when the player beats it and smug when it wins. D8: a boss
// played to its end gives 10 XP for each right answer and counts for the streak, passed or not.
export function BossFinish({ right, size, passed, chestReady, streak, loganMode }: BossFinishProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { title, line } = bossFinishCopy(right, size, passed, chestReady);
  return (
    <View style={styles.finish}>
      <Mascot character="shark" pose={passed ? "sad" : "smug"} width={column * ART_SCALE.finishMascot} />
      <Text style={[styles.title, { color: colours.text }]}>{title}</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>{line}</Text>
      {/* Only a win completes the stage, so a lost round gets no loving line */}
      <LoganLine loganMode={loganMode && passed} />
      <View style={styles.stats}>
        <Reward art="xp_bolt" text={`+${right * DIALS.xpPerRightAnswer} XP`} />
        <Reward art="streak_flame" text={streak === 1 ? "1-day streak" : `${streak}-day streak`} />
      </View>
    </View>
  );
}

function bossFinishCopy(right: number, size: number, passed: boolean, chestReady: boolean) {
  const score = `${right} of ${size} right.`;
  if (!passed) {
    return {
      title: `${CAST.shark} wins this round.`,
      line: `${score} You need ${DIALS.bossPassRight} to win. Have another go when you are ready.`,
    };
  }
  const after = chestReady ? `${CAST.squid} found a chest for you.` : `${CAST.shark} is sulking.`;
  return { title: `You beat ${CAST.shark}!`, line: `${score} ${after}` };
}

const styles = StyleSheet.create({
  finish: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
  stats: { flexDirection: "row", gap: SPACE.md },
});
