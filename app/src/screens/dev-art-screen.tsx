import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Host } from "@expo/ui";
import { useLocalSearchParams } from "expo-router";

import { Art } from "@/art/art";
import { Effect } from "@/art/effect";
import { EFFECT_NAMES, type EffectName } from "@/art/effects";
import { FlopRive } from "@/art/flop-rive";
import { Screen } from "@/components/screen";
import { StatBar } from "@/components/stat-bar";
import { ART_SCALE, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// Board item 49: three effects across, so all six and their buttons fit on one phone screen
const EFFECT_COLUMNS = 3;

// Development only (PLAN.md phase 3, step 7): the art drawn on the phone, to compare
// with the files in a browser. It reads no stored state, so it has no loading, empty or
// error state (rule U4).
export function DevArtScreen() {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const [perfect, setPerfect] = useState(false);
  // felto://dev/art?loop=1 opens with every effect looping, so a screenshot can catch each one mid-flight
  const { loop } = useLocalSearchParams<{ loop?: string }>();
  const [loopAll, setLoopAll] = useState(loop === "1");
  const cell = (column - SPACE.sm * (EFFECT_COLUMNS - 1)) / EFFECT_COLUMNS;
  return (
    <Screen>
      <Text style={[styles.title, { color: colours.text }]}>Art check</Text>
      {/* Board item 49: the generated Lottie effects, each with its own replay */}
      <View style={styles.grid}>
        {EFFECT_NAMES.map((name) => (
          <EffectCell key={name} name={name} width={cell} loop={loopAll ? true : undefined} />
        ))}
      </View>
      <Host matchContents style={styles.button}>
        <Button label={loopAll ? "Effects: each once" : "Effects: loop all"} onPress={() => setLoopAll(!loopAll)} />
      </Host>
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
      {/* Board item 34: the rigged Flop, so the Rive file can be watched before the finish screen uses it */}
      <FlopRive perfect={perfect} width={column * ART_SCALE.finishMascot} />
      <Host matchContents style={styles.button}>
        <Button label={perfect ? "Flop: rest" : "Flop: swim"} onPress={() => setPerfect(!perfect)} />
      </Host>
      <Host matchContents style={styles.button}>
        {/* The button does nothing: the check is that a native control draws. */}
        <Button label="Native button" onPress={() => undefined} />
      </Host>
    </Screen>
  );
}

function EffectCell({ name, width, loop }: { name: EffectName; width: number; loop?: boolean }) {
  const { colours } = useTheme();
  const [plays, setPlays] = useState(0);
  return (
    <View style={[styles.cell, { width, backgroundColor: colours.surface }]}>
      {/* A new key mounts a fresh player, which starts the effect from its first frame */}
      <Effect key={`${plays}:${String(loop)}`} name={name} width={width} loop={loop} />
      <Text style={[styles.caption, { color: colours.textMuted }]}>{name}</Text>
      <Host matchContents style={styles.replay}>
        <Button label="Replay" onPress={() => setPlays(plays + 1)} />
      </Host>
    </View>
  );
}

const SAMPLE_STATS = { streak: 12, xp: 1450, lives: 5, gems: 40, freezes: 2 };

const styles = StyleSheet.create({
  title: { fontSize: TYPE.title, fontWeight: "700", marginBottom: SPACE.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm, marginBottom: SPACE.md },
  cell: { borderRadius: RADIUS.md, alignItems: "center", paddingBottom: SPACE.sm },
  caption: { fontSize: TYPE.caption, marginVertical: SPACE.xs },
  replay: { alignSelf: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.md,
    marginBottom: SPACE.lg,
  },
  button: { alignSelf: "center" },
});
