import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { SPACE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type ScreenProps = {
  children: ReactNode;
  // Drawn in the column above the scrolling content, so it stays put while the content scrolls
  // (the stat bar above the path, DESIGN.md 10.1)
  top?: ReactNode;
};

// BD-27 and D17: every screen draws in one centred column, so phones and tablets in any
// orientation share one layout. The page colour follows the phone (D16).
export function Screen({ children, top }: ScreenProps) {
  const { colours } = useTheme();
  const columnWidth = useColumnWidth();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colours.page }]} edges={["top", "left", "right"]}>
      <StatusBar style="auto" />
      {top ? <View style={[styles.top, { width: columnWidth }]}>{top}</View> : null}
      {/* The bottom edge is left out: on a tab the custom bar sits below the scene and pads the
          home indicator itself (GameTabBar), and on a full-screen route iOS adjusts the inset */}
      <ScrollView contentContainerStyle={styles.centre} contentInsetAdjustmentBehavior="automatic">
        <View style={{ width: columnWidth }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { alignSelf: "center", paddingTop: SPACE.sm },
  centre: { alignItems: "center", paddingVertical: SPACE.lg },
});
