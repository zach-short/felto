import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { LessonFrame } from "@/components/lesson/lesson-frame";
import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type OnboardingPageProps = {
  // The cast art above the words (DESIGN.md 10.7: the three mascots, happy); a page whose art
  // is a list under its title passes it as children instead
  art?: ReactNode;
  title: string;
  line: string;
  // The native buttons held at the bottom, as in the lesson
  bottom: ReactNode;
  children?: ReactNode;
};

// D20: each first-launch screen is full screen, before the tabs (DESIGN.md 10.7). It reuses the
// lesson's frame, so the column, the safe area and the button at the bottom match the lesson the
// player meets next.
export function OnboardingPage({ art, title, line, bottom, children }: OnboardingPageProps) {
  const { colours } = useTheme();
  return (
    <LessonFrame bottom={bottom}>
      <View style={styles.page}>
        {art}
        <Text style={[styles.title, { color: colours.text }]} accessibilityRole="header">{title}</Text>
        <Text style={[styles.line, { color: colours.textMuted }]}>{line}</Text>
        {children}
      </View>
    </LessonFrame>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.lg },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
});
