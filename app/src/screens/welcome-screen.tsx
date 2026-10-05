import { useRouter } from "expo-router";

import { Mascot } from "@/art/mascot";
import { LessonButton } from "@/components/lesson/lesson-button";
import { WELCOME } from "@/components/onboarding/onboarding-copy";
import { OnboardingPage } from "@/components/onboarding/onboarding-page";
import { RecoveredBanner } from "@/components/recovered-banner";
import { usePlayer } from "@/storage/use-player";
import { ART_SCALE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";

// D20, first of three: the fish says hello. Rule U4: no loading state (the provider reads the
// player before the first frame); this screen is itself the empty state, a player with nothing
// yet; the error state is a save that could not be read, which starts fresh and so lands here,
// with the banner that says so.
export function WelcomeScreen() {
  const router = useRouter();
  const { status } = usePlayer();
  const column = useColumnWidth();
  return (
    <OnboardingPage
      art={<Mascot character="fish" pose="happy" width={column * ART_SCALE.welcomeMascot} />}
      title={WELCOME.title}
      line={WELCOME.line}
      bottom={<LessonButton label={WELCOME.button} onPress={() => router.push("/onboarding/cast")} />}
    >
      {status === "recovered" ? <RecoveredBanner /> : null}
    </OnboardingPage>
  );
}
