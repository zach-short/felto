import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Scrim } from "@/components/kit/scrim";
import { useBackClose } from "@/components/kit/use-back-close";
import { useSheetFocus } from "@/components/lesson/use-sheet-focus";
import { MotionView } from "@/motion/motion-view";
import { useSheetRise } from "@/motion/use-sheet-rise";
import { SHEET_RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type GameSheetProps = {
  shown: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

// GF-10: the base of a custom bottom sheet (the out-of-lives sheet will be the first), drawn as
// the feedback sheet is (board item 29): it rises on the plan's spring, pads above the home
// indicator and Android's gesture bar, and moves a screen reader to its title. Unlike the feedback
// sheet it can be dismissed: a tap on the dimmed screen, Android's back button and the screen
// reader's escape gesture each close it. The caller draws it over the whole screen, as LessonFrame
// draws its overlay, and hides the screen beneath from a screen reader while it is shown.
export function GameSheet({ shown, title, children, onClose }: GameSheetProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const insets = useSafeAreaInsets();
  const rise = useSheetRise(shown);
  const heading = useSheetFocus(shown);
  useBackClose(shown, onClose);
  const edges = { paddingBottom: insets.bottom + SPACE.md, paddingLeft: insets.left, paddingRight: insets.right };
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={shown ? "auto" : "none"}>
      {shown ? <Scrim onPress={onClose} /> : null}
      <MotionView
        onLayout={rise.onLayout}
        accessibilityViewIsModal={shown}
        accessibilityElementsHidden={!shown}
        importantForAccessibility={shown ? "auto" : "no-hide-descendants"}
        onAccessibilityEscape={onClose}
        style={[styles.sheet, edges, { backgroundColor: colours.surface }, rise.style]}
      >
        <View style={[styles.content, { width: column }]}>
          <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: colours.text }]}>
            {title}
          </Text>
          {children}
        </View>
      </MotionView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: SPACE.lg,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  content: { gap: SPACE.md },
  title: { fontSize: TYPE.heading, fontWeight: "800" },
});
