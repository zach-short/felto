import { StyleSheet, Text, View } from "react-native";

import { Tag } from "@/components/kit/tag";
import type { ReviewDecision } from "@/gto/review";
import { LINE_HEIGHT, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

import { costLine, labelWord, solverLine, youDid } from "./review-words";

type DecisionRowProps = { decision: ReviewDecision };

// One of the player's decisions in a hand's review: the seat and the action, its label (good,
// mistake or none, BD-T25), what it cost against the solver's best, and the solver's mix. The
// row is read as one element by a screen reader, in that order.
export function DecisionRow({ decision }: DecisionRowProps) {
  const { colours } = useTheme();
  const { grade } = decision;
  const label = grade.kind === "graded" ? labelWord(grade.label) : null;
  const cost = grade.kind === "graded" ? costLine(grade.costBb) : null;
  const did = `${decision.seat} · ${youDid(grade.chosen)}`;
  const verdict = solverLine(grade);
  const spoken = [did, label, cost, verdict].filter((part) => part !== null).join(". ");
  return (
    <View style={[styles.row, { borderColor: colours.line }]} accessible accessibilityLabel={spoken}>
      <View style={styles.top}>
        <Text style={[styles.did, { color: colours.text }]}>{did}</Text>
        {label === null ? null : <Tag label={label} tone={label === "Good" ? "green" : "red"} />}
      </View>
      {cost === null ? null : <Text style={[styles.cost, { color: colours.textMuted }]}>{cost}</Text>}
      <Text style={[styles.verdict, { color: colours.text }]}>{verdict}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: SPACE.xs, paddingVertical: SPACE.sm, borderTopWidth: StyleSheet.hairlineWidth },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACE.sm },
  did: { flex: 1, fontSize: TYPE.body, fontWeight: "800" },
  cost: { fontSize: TYPE.caption, fontWeight: "700" },
  verdict: { fontSize: TYPE.body, fontWeight: "600", lineHeight: LINE_HEIGHT.body },
});
