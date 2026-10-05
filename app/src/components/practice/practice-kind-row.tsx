import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import type { PracticeRow } from "@/components/practice/practice-menu";
import { ART_SCALE, OPACITY, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// One kind on the Practice tab (D21): a card back beside an open kind, the path's lock beside a
// locked one, with what the kind asks or which unit opens it
export function PracticeKindRow({ row }: { row: PracticeRow }) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View
      style={[styles.row, { backgroundColor: colours.surface }]}
      accessible
      accessibilityLabel={`${row.title}. ${row.open ? "Open." : "Locked."} ${row.line}`}
    >
      <View style={[styles.icon, { width: column * ART_SCALE.practiceIcon }, row.open ? null : styles.locked]}>
        <Art name={row.open ? "card_back" : "node_locked"} width={column * ART_SCALE.practiceIcon} />
      </View>
      <View style={styles.words}>
        <Text style={[styles.title, { color: row.open ? colours.text : colours.textMuted }]}>{row.title}</Text>
        <Text style={[styles.line, { color: colours.textMuted }]}>{row.line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SPACE.md, padding: SPACE.md, borderRadius: RADIUS.md },
  icon: { alignItems: "center" },
  locked: { opacity: OPACITY.faded },
  words: { flex: 1, gap: SPACE.xs },
  title: { fontSize: TYPE.heading, fontWeight: "800" },
  line: { fontSize: TYPE.caption, fontWeight: "600" },
});
