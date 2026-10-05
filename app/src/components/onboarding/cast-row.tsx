import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import type { CastRole } from "@/content/cast";
import { ART_SCALE, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type CastRowProps = { role: CastRole; name: string; job: string };

// D18 and DESIGN.md 10.7: one of the cast, happy, beside its name and its job
export function CastRow({ role, name, job }: CastRowProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={[styles.row, { backgroundColor: colours.surface }]} accessible accessibilityLabel={`${name}. ${job}`}>
      <Mascot character={role} pose="happy" width={column * ART_SCALE.castMascot} />
      <View style={styles.words}>
        <Text style={[styles.name, { color: colours.text }]}>{name}</Text>
        <Text style={[styles.job, { color: colours.textMuted }]}>{job}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SPACE.md, padding: SPACE.sm, borderRadius: RADIUS.md, alignSelf: "stretch" },
  words: { flex: 1, gap: SPACE.xs },
  name: { fontSize: TYPE.heading, fontWeight: "800" },
  job: { fontSize: TYPE.body, fontWeight: "600" },
});
