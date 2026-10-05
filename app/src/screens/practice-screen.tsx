import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { LessonButton } from "@/components/lesson/lesson-button";
import { PracticeKindRow } from "@/components/practice/practice-kind-row";
import { practiceIntro, practiceRows } from "@/components/practice/practice-menu";
import { RecoveredBanner } from "@/components/recovered-banner";
import { Screen } from "@/components/screen";
import { usePlayer } from "@/storage/use-player";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// The Practice tab (D21, DESIGN.md 10.7): the squid, the kinds open and locked, and one button
// that deals a mixed set of the open kinds. It never reads hearts, so it opens at 0 (D21). Rule U4:
// no loading state (the provider reads the player before the first frame); the empty state is a
// player with no kind open, who sees every kind locked with the unit that opens it and no button;
// the error state is the banner of a save that could not be read, as on Learn.
export function PracticeScreen() {
  const router = useRouter();
  const { status, state } = usePlayer();
  const { colours } = useTheme();
  const column = useColumnWidth();
  const rows = practiceRows(state);
  const anyOpen = rows.some((row) => row.open);
  return (
    <Screen>
      <Text style={[styles.title, { color: colours.text }]}>Practice</Text>
      {status === "recovered" ? <RecoveredBanner /> : null}
      <View style={styles.host}>
        <Mascot character="squid" pose="think" width={column * ART_SCALE.pathMascot} />
        <Text style={[styles.intro, { color: colours.textMuted }]}>{practiceIntro(state)}</Text>
      </View>
      {anyOpen ? (
        <View style={styles.start}>
          <LessonButton label="Start a set" onPress={() => router.push("/practice-set")} />
        </View>
      ) : null}
      <View style={styles.rows}>
        {rows.map((row) => (
          <PracticeKindRow key={row.kind} row={row} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: TYPE.title, fontWeight: "800", marginBottom: SPACE.md },
  host: { flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg },
  intro: { flex: 1, fontSize: TYPE.body, fontWeight: "600" },
  rows: { gap: SPACE.sm },
  start: { marginBottom: SPACE.lg, alignItems: "center" },
});
