import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { clockSeed } from "@/components/boss/unit-exercises";
import { GameButton } from "@/components/kit/game-button";
import { DIALS } from "@/config/dials";
import { handsLeftToday, trainerOpen } from "@/game/gto-allowance";
import { usePlayer } from "@/storage/use-player";
import { KIT, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

import { emptyAllowanceLine, handsLeftLine } from "./review-words";

// The start of the GTO trainer on the Practice tab (PLAN.md phase 9, board item 44). It is the one
// caller of handsLeftToday (BD-T9): with hands left it shows the count and the start button,
// which counts the first hand and opens the session with a seed from the clock (BD-T7, B3); with
// none it says so in plain words, and there is no paywall. The mode's name may say GTO (BD-T14).
export function TrainerStart() {
  const router = useRouter();
  const { state, actions } = usePlayer();
  const { colours } = useTheme();
  if (!trainerOpen(state)) return null;
  const left = handsLeftToday(state, new Date());
  const start = () => {
    const seed = clockSeed(new Date());
    if (actions.dealGtoHand().ok) router.push({ pathname: "/gto-session", params: { seed: String(seed) } });
  };
  return (
    <View style={[styles.box, { backgroundColor: colours.surface, borderColor: colours.line }]}>
      <Text accessibilityRole="header" style={[styles.heading, { color: colours.text }]}>
        GTO trainer
      </Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>
        {left > 0 ? handsLeftLine(left) : emptyAllowanceLine(DIALS.gtoFreeHandsPerDay)}
      </Text>
      {left > 0 ? <GameButton label="Take a seat" onPress={start} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: SPACE.sm, padding: SPACE.md, borderRadius: RADIUS.md, borderWidth: KIT.border, marginBottom: SPACE.lg },
  heading: { fontSize: TYPE.heading, fontWeight: "800" },
  line: { fontSize: TYPE.body, fontWeight: "600" },
});
