import { StyleSheet, Text, View } from "react-native";

import { CardArt } from "@/art/card-art";
import type { CardGroup } from "@/components/exercise/exercise-view-model";
import { ART_SCALE, CARD_GAP, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type CardRowProps = {
  group: CardGroup;
  // The width this row may fill; a group beside another gets part of the column
  width: number;
};

// A labelled row of cards. Five cards shrink to fit a small phone (PLAN.md phase 9, watch-for);
// on a wide column the cards stop growing at the token share.
export function CardRow({ group, width }: CardRowProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const count = Math.max(group.cards.length, 1);
  const cardWidth = Math.min(column * ART_SCALE.lessonCard, (width - CARD_GAP * (count - 1)) / count);
  return (
    <View style={[styles.group, { width }]}>
      {group.label ? <Text style={[styles.label, { color: colours.textMuted }]}>{group.label}</Text> : null}
      <View style={styles.row} accessible accessibilityLabel={`${group.label ?? "Cards"}: ${group.cards.join(" ")}`}>
        {group.cards.map((card) => (
          <CardArt key={card} card={card} width={cardWidth} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { alignItems: "center", gap: SPACE.xs },
  label: { fontSize: TYPE.caption, fontWeight: "700" },
  row: { flexDirection: "row", gap: CARD_GAP, justifyContent: "center" },
});
