import { StyleSheet, Text, View } from "react-native";

import type { Review } from "@/gto/review";
import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

import { DecisionRow } from "./decision-row";
import { MULTIWAY_LINE, resultLine, WALK_LINE } from "./review-words";

type HandReviewProps = { review: Review };

// A view of reviewHand (gto/review.ts) for one finished hand: the player's result, a line when the
// hand went multiway and is not scored (BD-T4), and each decision with its grade. A hand the
// player took no decision in (everyone folded to the big blind) says so.
export function HandReview({ review }: HandReviewProps) {
  const { colours } = useTheme();
  return (
    <View style={styles.review}>
      <Text style={[styles.result, { color: colours.text }]}>{resultLine(review.runout.playerNetBb)}</Text>
      {review.scored ? null : <Text style={[styles.note, { color: colours.textMuted }]}>{MULTIWAY_LINE}</Text>}
      {review.decisions.length === 0 ? <Text style={[styles.note, { color: colours.textMuted }]}>{WALK_LINE}</Text> : null}
      {review.decisions.map((decision, index) => (
        <DecisionRow key={`${index}-${decision.node ?? "off"}`} decision={decision} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  review: { gap: SPACE.sm },
  result: { fontSize: TYPE.body, fontWeight: "800" },
  note: { fontSize: TYPE.caption, fontWeight: "700" },
});
