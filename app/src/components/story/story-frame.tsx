import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { SPACE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type StoryFrameProps = {
  // The x of a tap anywhere on the screen that no control took
  onTap: (x: number) => void;
  top: ReactNode;
  children: ReactNode;
  bottom: ReactNode | null;
};

// The story is a full-screen modal (US-4), drawn in the same centred column as every screen
// (BD-27, D17). US-6: the whole screen is the tap layer, so it lies behind everything else. A
// touch passes through views marked box-none or none to that layer, and the cross and the last
// slide's button take their own. The layer has no children, so a tap's x is its x on the screen.
export function StoryFrame({ onTap, top, children, bottom }: StoryFrameProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  // Padded by the window's insets, as LessonFrame is, since a modal's SafeAreaView can measure 0
  const insets = useSafeAreaInsets();
  const edges = { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right };
  return (
    <View style={[styles.fill, { backgroundColor: colours.page }]}>
      <StatusBar style="auto" />
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={(event) => onTap(event.nativeEvent.locationX)}
        accessible={false}
        importantForAccessibility="no"
      />
      <View style={[styles.fill, edges]} pointerEvents="box-none">
        <View style={[styles.edge, { width: column }]} pointerEvents="box-none">
          {top}
        </View>
        <View style={styles.middle} pointerEvents="box-none">
          {children}
        </View>
        {bottom ? (
          <View style={[styles.edge, styles.bottom, { width: column }]} pointerEvents="box-none">
            {bottom}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  edge: { alignSelf: "center" },
  middle: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: SPACE.md },
  bottom: { paddingVertical: SPACE.md },
});
