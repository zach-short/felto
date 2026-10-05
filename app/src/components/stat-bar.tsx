import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import type { ArtName } from "@/art/sizes";
import { statLabel, type StatKind, type StatValues } from "@/components/stat-values";
import { ART_SCALE, MIN_STAT_ICON, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type StatBarProps = {
  values: StatValues;
};

// DESIGN.md 10.1: streak, XP, lives and gems, each with its number. D19: a held freeze shows
// beside the streak, with a count when more than one is held.
export function StatBar({ values }: StatBarProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const iconWidth = Math.max(MIN_STAT_ICON, column * ART_SCALE.statIcon);
  return (
    <View style={[styles.bar, { backgroundColor: colours.surface }]}>
      <View style={styles.group}>
        <Stat art="streak_flame" value={values.streak} kind="streak" width={iconWidth} />
        {values.freezes > 0 ? (
          <Stat art="streak_freeze" value={values.freezes} kind="freezes" width={iconWidth} hideOne />
        ) : null}
      </View>
      <Stat art="xp_bolt" value={values.xp} kind="xp" width={iconWidth} />
      <Stat art="lives_heart" value={values.lives} kind="lives" width={iconWidth} />
      <Stat art="gem" value={values.gems} kind="gems" width={iconWidth} />
    </View>
  );
}

type StatProps = {
  art: ArtName;
  value: number;
  kind: StatKind;
  width: number;
  // One held freeze is shown by the icon alone
  hideOne?: boolean;
};

function Stat({ art, value, kind, width, hideOne = false }: StatProps) {
  const { colours } = useTheme();
  const showNumber = !(hideOne && value === 1);
  return (
    <View style={styles.stat} accessible accessibilityLabel={statLabel(kind, value)}>
      <Art name={art} width={width} />
      {showNumber ? <Text style={[styles.number, { color: colours.text }]}>{value}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    borderRadius: RADIUS.md,
  },
  group: { flexDirection: "row", alignItems: "center", gap: SPACE.sm },
  stat: { flexDirection: "row", alignItems: "center", gap: SPACE.xs },
  number: { fontSize: TYPE.stat, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
