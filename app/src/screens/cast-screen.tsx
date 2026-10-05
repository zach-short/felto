import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { LessonButton } from "@/components/lesson/lesson-button";
import { CastRow } from "@/components/onboarding/cast-row";
import { CAST_PAGE, CAST_ROWS } from "@/components/onboarding/onboarding-copy";
import { OnboardingPage } from "@/components/onboarding/onboarding-page";
import { SPACE } from "@/theme/tokens";

// D20, second of three: the cast by name (D18), each with the job D9 gives it. Rule U4: it reads
// no player state, so it has no loading, empty or error state of its own.
export function CastScreen() {
  const router = useRouter();
  return (
    <OnboardingPage
      title={CAST_PAGE.title}
      line={CAST_PAGE.line}
      bottom={<LessonButton label={CAST_PAGE.button} onPress={() => router.push("/onboarding/level")} />}
    >
      <View style={styles.rows}>{CAST_ROWS.map((row) => <CastRow key={row.role} {...row} />)}</View>
    </OnboardingPage>
  );
}

const styles = StyleSheet.create({
  rows: { gap: SPACE.sm, alignSelf: "stretch" },
});
