import { Host } from "@expo/ui";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type ProfileFrameProps = {
  children: ReactNode;
  // Drawn outside the Form's Host: the Android time dialog brings a Host of its own
  outside?: ReactNode;
};

// The Profile tab is a native settings Form (FieldGroup), which scrolls by itself, so it cannot
// sit in the screen wrapper's ScrollView. It keeps the wrapper's centred column (BD-27, D17)
// and its page colour (D16).
export function ProfileFrame({ children, outside }: ProfileFrameProps) {
  const { colours, scheme } = useTheme();
  const column = useColumnWidth();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colours.page }]} edges={["top", "left", "right"]}>
      <StatusBar style="auto" />
      <Text style={[styles.title, { color: colours.text, width: column }]}>Profile</Text>
      <View style={[styles.fill, styles.column, { width: column }]}>
        <Host style={styles.fill} colorScheme={scheme}>
          {children}
        </Host>
      </View>
      {outside}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { alignSelf: "center" },
  title: { alignSelf: "center", fontSize: TYPE.title, fontWeight: "800", paddingTop: SPACE.md, paddingHorizontal: SPACE.md },
});
