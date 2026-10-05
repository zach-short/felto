import { StyleSheet, Text, View } from "react-native";

import { RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// Rule U4, the error state: the stored player could not be read, so the data module kept it under
// a backup key and started fresh (rule Q2). The player is told; nothing is lost.
export function RecoveredBanner() {
  const { colours } = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: colours.surface }]} accessibilityRole="alert">
      <Text style={[styles.text, { color: colours.text }]}>
        We could not read your saved progress, so you are starting fresh. Your old save is kept safe
        on this phone.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: SPACE.md, borderRadius: RADIUS.md, marginTop: SPACE.md },
  text: { fontSize: TYPE.caption, fontWeight: "600" },
});
