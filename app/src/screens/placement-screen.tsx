import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { devPlay, devSeed } from "@/components/boss/dev-params";
import { clockSeed } from "@/components/boss/unit-exercises";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonClosed } from "@/components/lesson/lesson-closed";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import type { FinishView } from "@/components/lesson/lesson-run-view";
import { LessonRunView } from "@/components/lesson/lesson-run-view";
import { PLACEMENT_BUTTON } from "@/components/onboarding/onboarding-copy";
import { placementAccess } from "@/components/onboarding/placement-session";
import { PlacementResult } from "@/components/onboarding/placement-result";
import { usePlayer } from "@/storage/use-player";

type PlacementParams = { seed?: string; play?: string };

// The placement check (D20, DESIGN.md 10.7): the lesson loop over ten exercises from units 1 and
// 2, hosted by the fish, with no hearts, no XP and no streak. It ends in a pass or a fail; the
// button under the result finishes onboarding, and the root navigator then opens the path.
// Development link: felto://onboarding/placement?seed=<n>&play=<rw...> (after fixture `fresh`).
// Rule U4: no loading state (the draw is computed before the first frame); no empty state (units 1
// and 2 are always written); a check already taken is drawn by LessonClosed, with the way on.
export function PlacementScreen() {
  const { seed, play } = useLocalSearchParams<PlacementParams>();
  return <PlacementOpening key={[seed, play].join("|")} seed={seed} play={play} />;
}

function PlacementOpening({ seed, play }: PlacementParams) {
  const { state, actions } = usePlayer();
  // Drawn once, when the check opens: BD-12 reads the clock here, at the edge, for the seed, and
  // the check must not change under the player while it is answered
  const [access] = useState(() => placementAccess(state, devSeed(seed) ?? clockSeed(new Date())));
  const finish = (right: number, size: number): FinishView => ({
    body: <PlacementResult passed={state.placement === "passed"} right={right} size={size} />,
    label: PLACEMENT_BUTTON,
    onPress: actions.completeOnboarding,
  });
  if (access.kind === "open") return <LessonRunView session={access.session} finish={finish} autoplay={devPlay(play)} />;
  return (
    <LessonFrame bottom={<LessonButton label={PLACEMENT_BUTTON} onPress={actions.completeOnboarding} />}>
      <LessonClosed reason="locked" nextLife={null} kind="placement" />
    </LessonFrame>
  );
}
