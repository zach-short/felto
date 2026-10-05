import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import type { PathUnit } from "@/components/path/path-view-model";
import { StoryButton } from "@/components/story/story-button";
import { CAST } from "@/content/cast";
import { ART_SCALE, OPACITY, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type UnitHeaderProps = {
  unit: PathUnit;
};

// DESIGN.md 10.1: the unit's title and its chest, faded until the boss is passed. D20: a unit the
// placement check skipped shows its boss complete, but its chest is won only by beating that boss
// in play, so the chest stays faded and a line under the title says why (audit of item 12).
// US-5: a unit with a story shows the button that opens it under the title, in the words column,
// so the button wraps with the words and never pushes the chest off a small phone.
export function UnitHeader({ unit }: UnitHeaderProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const chestOpacity = unit.chest === "closed" ? OPACITY.faded : 1;
  const router = useRouter();
  // Phase 10: a ready chest opens the chest modal, for a player who left the boss without it
  const ready = unit.chest === "ready";
  const openChest = () => router.push({ pathname: "/chest/[unit]", params: { unit: unit.id } });
  return (
    <View style={styles.header}>
      <View style={styles.words}>
        <Text style={[styles.kicker, { color: colours.textMuted }]}>Unit {unit.number}</Text>
        <Text style={[styles.title, { color: colours.text }]}>{unit.title}</Text>
        {unit.placed ? <Text style={[styles.placed, { color: colours.textMuted }]}>{PLACED_LINE}</Text> : null}
        {unit.hasStory ? <StoryButton unit={unit} /> : null}
      </View>
      <Pressable
        onPress={ready ? openChest : undefined}
        disabled={!ready}
        style={{ opacity: chestOpacity }}
        accessible
        accessibilityRole={ready ? "button" : undefined}
        accessibilityLabel={unit.placed ? PLACED_CHEST_LABEL : CHEST_LABELS[unit.chest]}
      >
        <Art name="chest" width={column * ART_SCALE.chest} />
      </Pressable>
    </View>
  );
}

const CHEST_LABELS = {
  closed: "Chest, opens after the boss",
  ready: "Chest, ready to open",
  opened: "Chest, opened",
} as const;

const PLACED_LINE = `You placed past this unit. Beat ${CAST.shark} to win its chest.`;
const PLACED_CHEST_LABEL = `Chest, beat ${CAST.shark} to win it`;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACE.lg,
    marginBottom: SPACE.md,
  },
  words: { flexShrink: 1 },
  kicker: { fontSize: TYPE.caption, fontWeight: "700", textTransform: "uppercase" },
  title: { fontSize: TYPE.heading, fontWeight: "800" },
  placed: { fontSize: TYPE.caption, fontWeight: "600", marginTop: SPACE.xs },
});
