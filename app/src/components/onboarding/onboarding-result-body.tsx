import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type OnboardingResultBodyProps = { art: ReactNode; title: string; line: string };

// The words of the placement result, drawn inside the lesson frame the check already holds
export function OnboardingResultBody({ art, title, line }: OnboardingResultBodyProps) {
  const { colours } = useTheme();
  return (
    <View style={styles.body}>
      {art}
      <Text style={[styles.title, { color: colours.text }]} accessibilityRole="header">{title}</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>{line}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
});
