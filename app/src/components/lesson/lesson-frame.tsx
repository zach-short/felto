import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { SPACE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type LessonFrameProps = {
  top?: ReactNode;
  children: ReactNode;
  bottom?: ReactNode;
  // Drawn over the whole frame, edge to edge, and placed by itself: the feedback sheet
  overlay?: ReactNode;
  // True while the overlay holds the screen, so a screen reader reads only the overlay
  overlayModal?: boolean;
};

// The lesson is a full-screen modal (DESIGN.md 10.3), so it draws its own frame: the header
// above, the exercise scrolling in the middle, and the button held at the bottom where a thumb
// finds it. Same centred column as every screen (BD-27, D17).
export function LessonFrame({ top, children, bottom, overlay, overlayModal = false }: LessonFrameProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  // The native SafeAreaView measured 0 at the top in some opens of this modal (iPhone 17 Pro
  // simulator, 2026-10-05), so the frame pads by the root provider's insets, which are the window's
  const insets = useSafeAreaInsets();
  const edges = { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right };
  return (
    <View style={[styles.fill, { backgroundColor: colours.page }]}>
      <View
        style={[styles.fill, edges]}
        accessibilityElementsHidden={overlayModal}
        importantForAccessibility={overlayModal ? "no-hide-descendants" : "auto"}
      >
        <StatusBar style="auto" />
        {top ? <View style={[styles.edge, { width: column }]}>{top}</View> : null}
        <ScrollView contentContainerStyle={styles.centre}>
          <View style={{ width: column }}>{children}</View>
        </ScrollView>
        {bottom ? <View style={[styles.edge, styles.bottom, { width: column }]}>{bottom}</View> : null}
      </View>
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  edge: { alignSelf: "center" },
  bottom: { paddingVertical: SPACE.md },
  centre: { alignItems: "center", paddingVertical: SPACE.md },
});
