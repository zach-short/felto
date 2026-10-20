import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";

import { GameButton, QUIET_BUTTON } from "@/components/kit/game-button";
import { PokerTable } from "@/components/table/poker-table";
import { SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// Development only (board item 42, PLAN.md phase 7): the table dealing one hand from a seed, as
// /dev/kit and /dev/fixture show their pieces. felto://dev/table?seed=12 opens on seed 12, so a
// screenshot can name its hand. It reads no stored state, so it has no loading, empty or error
// state (rule U4). The words here are for development; the trainer's are item 45's.
//
// Unlike Screen, the column fills the window so the action buttons sit at its foot, in one-handed
// reach; a window too short for the table scrolls instead (a tablet in landscape).
export function DevTableScreen() {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { seed: asked } = useLocalSearchParams<{ seed?: string }>();
  const [seed, setSeed] = useState(() => seedFrom(asked));
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colours.page }]}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.grow}>
        <View style={[styles.column, { width: column }]}>
          <View style={styles.tools}>
            <Text style={[styles.seed, { color: colours.textMuted }]}>Seed {seed}</Text>
            <View style={styles.next}>
              <GameButton label="Next hand" paint={QUIET_BUTTON} onPress={() => setSeed(seed + 1)} />
            </View>
          </View>
          <PokerTable key={seed} seed={seed} column={column} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function seedFrom(param: string | undefined): number {
  const seed = Number(param);
  return Number.isInteger(seed) && seed > 0 ? seed : 1;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1, alignItems: "center", paddingVertical: SPACE.sm },
  column: { flex: 1 },
  tools: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.sm },
  seed: { fontSize: TYPE.caption, fontWeight: "700" },
  next: { width: "45%" },
});
