import { StyleSheet, Text, View } from "react-native";
import { Button, Host } from "@expo/ui";

import { Art } from "@/art/art";
import { Screen } from "@/components/screen";
import { StatBar } from "@/components/stat-bar";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// Development only (PLAN.md phase 3, step 7): the art drawn on the phone, to compare
// with the files in a browser. It reads no stored state, so it has no loading, empty or
// error state (rule U4).
export function DevArtScreen() {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <Screen>
      <Text style={[styles.title, { color: colours.text }]}>Art check</Text>
      {/* No BD-13 fixture holds a freeze, so the freeze icon of D19 is checked here */}
      <StatBar values={SAMPLE_STATS} />
      <View style={styles.row}>
        <Art name="card_A_spades" width={column * ART_SCALE.card} />
        <Art name="card_10_hearts" width={column * ART_SCALE.card} />
      </View>
      <View style={styles.row}>
        <Art name="node_current_base" width={column * ART_SCALE.node} />
        <Art name="gem" width={column * ART_SCALE.icon} />
      </View>
      <View style={styles.row}>
        <Art name="fish_happy" width={column * ART_SCALE.mascot} />
      </View>
      <Host matchContents style={styles.button}>
        {/* The button does nothing: the check is that a native control draws. */}
        <Button label="Native button" onPress={() => undefined} />
      </Host>
    </Screen>
  );
}

const SAMPLE_STATS = { streak: 12, xp: 1450, lives: 5, gems: 40, freezes: 2 };

const styles = StyleSheet.create({
  title: { fontSize: TYPE.title, fontWeight: "700", marginBottom: SPACE.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.md,
    marginBottom: SPACE.lg,
  },
  button: { alignSelf: "center" },
});
