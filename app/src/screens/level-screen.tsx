import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { LessonButton } from "@/components/lesson/lesson-button";
import { ButtonStack } from "@/components/onboarding/button-stack";
import { LEVEL_PAGE } from "@/components/onboarding/onboarding-copy";
import { OnboardingPage } from "@/components/onboarding/onboarding-page";
import { usePlayer } from "@/storage/use-player";
import { ART_SCALE, SPACE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";

// D20, third of three: "How much poker do you know?" with two answers. "I am new" finishes
// onboarding, and the root navigator then opens the path at unit 1. "I know the basics" opens the
// placement check, which runs once: a player who already took it (the app closed on its result)
// goes straight to the path. Rule U4: no loading or error state here (the welcome screen shows a
// recovered save); a new player is the only player this screen meets.
export function LevelScreen() {
  const router = useRouter();
  const { state, actions } = usePlayer();
  const column = useColumnWidth();
  const knowBasics = () =>
    state.placement === "not-taken" ? router.push("/onboarding/placement") : actions.completeOnboarding();
  return (
    <OnboardingPage
      art={
        <View style={styles.trio}>
          <Mascot character="squid" pose="happy" width={column * ART_SCALE.castMascot} />
          <Mascot character="fish" pose="happy" width={column * ART_SCALE.castMascot} />
          <Mascot character="shark" pose="happy" width={column * ART_SCALE.castMascot} />
        </View>
      }
      title={LEVEL_PAGE.title}
      line={LEVEL_PAGE.line}
      bottom={
        <ButtonStack>
          <LessonButton label={LEVEL_PAGE.newButton} onPress={actions.completeOnboarding} />
          <LessonButton label={LEVEL_PAGE.basicsButton} onPress={knowBasics} />
        </ButtonStack>
      }
    />
  );
}

const styles = StyleSheet.create({
  trio: { flexDirection: "row", alignItems: "flex-end", gap: SPACE.sm },
});
