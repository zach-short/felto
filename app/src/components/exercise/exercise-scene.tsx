import { StyleSheet, Text, View } from "react-native";

import { CardRow } from "@/components/exercise/card-row";
import type { Fact, Scene } from "@/components/exercise/exercise-view-model";
import { RADIUS, SPACE, TILE_BORDER, TILE_MIN_WIDTH, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type ExerciseSceneProps = {
  scene: Scene;
  // The width the scene lays out in: the column, or its half beside the answer rows (D17)
  column: number;
};

// The cards or numbers above a prompt (DESIGN.md 10.4). A concept exercise has none.
export function ExerciseScene({ scene, column }: ExerciseSceneProps) {
  if (scene.kind === "none") return null;
  if (scene.kind === "facts") return <Facts facts={scene.facts} />;
  if (scene.kind === "cards") {
    return (
      <View style={styles.stack}>
        {scene.groups.map((group) => (
          <CardRow key={group.label ?? "cards"} group={group} width={column} column={column} />
        ))}
      </View>
    );
  }
  // Showdown: the players side by side under the board, so three hands fit one screen
  const playerWidth = (column - SPACE.md * (scene.players.length - 1)) / scene.players.length;
  return (
    <View style={styles.stack}>
      <CardRow group={scene.board} width={column} column={column} />
      <View style={styles.players}>
        {scene.players.map((player) => (
          <CardRow key={player.label} group={player} width={playerWidth} column={column} />
        ))}
      </View>
    </View>
  );
}

function Facts({ facts }: { facts: Fact[] }) {
  const { colours } = useTheme();
  return (
    <View style={styles.facts}>
      {facts.map((fact) => (
        <View key={fact.label} style={[styles.fact, { backgroundColor: colours.surface, borderColor: colours.line }]}>
          <Text style={[styles.factValue, { color: colours.text }]}>{fact.value}</Text>
          <Text style={[styles.factLabel, { color: colours.textMuted }]}>{fact.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: SPACE.md, alignItems: "center" },
  players: { flexDirection: "row", gap: SPACE.md },
  facts: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: SPACE.sm },
  fact: {
    minWidth: TILE_MIN_WIDTH,
    alignItems: "center",
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.md,
    borderWidth: TILE_BORDER,
  },
  factValue: { fontSize: TYPE.heading, fontWeight: "800", fontVariant: ["tabular-nums"] },
  factLabel: { fontSize: TYPE.caption, fontWeight: "600" },
});
