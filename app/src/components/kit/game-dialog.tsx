import { StyleSheet, Text, View } from "react-native";

import { GameButton, QUIET_BUTTON } from "@/components/kit/game-button";
import { Scrim } from "@/components/kit/scrim";
import { useBackClose } from "@/components/kit/use-back-close";
import { useSheetFocus } from "@/components/lesson/use-sheet-focus";
import { MotionView } from "@/motion/motion-view";
import { usePop } from "@/motion/use-pop";
import { KIT, LINE_HEIGHT, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type DialogButton = { label: string; onPress: () => void };

type GameDialogProps = {
  title: string;
  line: string;
  // The main choice, drawn as the blue button
  confirm: DialogButton;
  // The way out, when there is one: "Keep going" beside "Leave"
  cancel?: DialogButton;
};

// Android's back button is always taken while the dialog is up, so it never leaves the screen
// behind an open question; with no cancel it does nothing, as a one-button alert there does
function ignore() {}

// GF-10: replaces Alert.alert (the lesson's leave question, the reminder's notice). A card with a
// title, a line and one or two raised buttons pops up over the dimmed screen. The caller mounts it
// to ask and unmounts it once a button's handler has run. A tap on the dimmed screen, Android's
// back button and the screen reader's escape gesture press cancel, when there is one. A screen
// reader is moved to the title and kept in the card, and the caller hides the screen beneath.
export function GameDialog({ title, line, confirm, cancel }: GameDialogProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const pop = usePop(true);
  const heading = useSheetFocus(true);
  useBackClose(true, cancel?.onPress ?? ignore);
  const card = { width: Math.min(column, KIT.dialogMaxWidth), backgroundColor: colours.surface, borderBottomColor: colours.line };
  return (
    <View style={StyleSheet.absoluteFill}>
      <Scrim onPress={cancel?.onPress} />
      <View style={styles.centre} pointerEvents="box-none">
        <MotionView accessibilityViewIsModal onAccessibilityEscape={cancel?.onPress} style={[styles.card, card, pop]}>
          <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: colours.text }]}>
            {title}
          </Text>
          <Text style={[styles.line, { color: colours.text }]}>{line}</Text>
          <View style={styles.buttons}>
            <GameButton label={confirm.label} onPress={confirm.onPress} />
            {cancel ? <GameButton label={cancel.label} onPress={cancel.onPress} paint={QUIET_BUTTON} /> : null}
          </View>
        </MotionView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  card: { borderRadius: RADIUS.md, borderBottomWidth: KIT.cardEdge, padding: SPACE.lg, gap: SPACE.sm },
  title: { fontSize: TYPE.heading, fontWeight: "800" },
  line: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body },
  buttons: { gap: SPACE.sm, marginTop: SPACE.sm },
});
