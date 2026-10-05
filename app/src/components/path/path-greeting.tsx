import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import type { GreetingMood } from "@/components/path/path-view-model";
import { CAST } from "@/content/cast";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type PathGreetingProps = {
  mood: GreetingMood;
};

// DESIGN.md 10.5: the fish sleeps at the top of the path until a lesson is finished on this local
// day. Lines are in the warm register of D10.
const LINES: Record<GreetingMood, string> = {
  "new-player": `Meet ${CAST.fish}, your guide. Your first lesson is just below.`,
  "not-today": `Shh, ${CAST.fish} is napping. One lesson today counts for your streak.`,
  "done-today": `Nice work today! ${CAST.fish} is proud of you.`,
};

export function PathGreeting({ mood }: PathGreetingProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const pose = mood === "done-today" ? "happy" : "sleep";
  return (
    <View style={styles.row}>
      <Mascot character="fish" pose={pose} width={column * ART_SCALE.pathMascot} />
      <Text style={[styles.line, { color: colours.text }]}>{LINES[mood]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: SPACE.md, marginTop: SPACE.md },
  line: { flex: 1, fontSize: TYPE.body, fontWeight: "600" },
});
