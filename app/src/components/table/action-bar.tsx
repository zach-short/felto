import { StyleSheet, View } from "react-native";

import { DIALS } from "@/config/dials";
import { BLUE_BUTTON, GameButton, QUIET_BUTTON, type ButtonPaint } from "@/components/kit/game-button";
import type { GtoAction } from "@/gto/key";
import type { Turn } from "@/gto/turn";
import { BUTTON_HEIGHT, SPACE } from "@/theme/tokens";

import { actionLabel } from "./amounts";

// A raise is the red chip, so the three kinds of action read apart by colour as well as by word
const RAISE_BUTTON: ButtonPaint = { face: "toneRed", edge: "toneRedEdge", ink: "inkOnTone" };

function paintOf(action: GtoAction): ButtonPaint {
  if (action === "fold") return QUIET_BUTTON;
  return action === "call" ? BLUE_BUTTON : RAISE_BUTTON;
}

type ActionBarProps = {
  // Null while no decision is the player's; the bar keeps its height, so the table does not jump
  turn: Turn | null;
  alreadyIn: number;
  onAct: (action: GtoAction) => void;
};

// The options of nextTurn as one row of buttons at the foot of the screen, in one-handed reach
// (PLAN.md phase 7). A turn has two or three options (KEY-SPEC.md 2.3 and BD-T21).
export function ActionBar({ turn, alreadyIn, onAct }: ActionBarProps) {
  return (
    <View style={styles.bar}>
      {turn?.options.map((option) => (
        <View key={option.action} style={styles.slot}>
          <GameButton label={actionLabel(option, alreadyIn)} paint={paintOf(option.action)} onPress={() => onAct(option.action)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", gap: SPACE.sm, minHeight: BUTTON_HEIGHT + DIALS.buttonEdge },
  slot: { flex: 1 },
});
