import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { devPlay, devSeed } from "@/components/boss/dev-params";
import { clockSeed } from "@/components/boss/unit-exercises";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonClosed } from "@/components/lesson/lesson-closed";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import type { FinishView } from "@/components/lesson/lesson-run-view";
import { LessonRunView } from "@/components/lesson/lesson-run-view";
import { ReviewFinish } from "@/components/review/review-finish";
import { reviewAccess } from "@/components/review/review-session";
import { currentStreak } from "@/game/streak";
import { usePlayer } from "@/storage/use-player";

type ReviewParams = { unit: string; seed?: string; play?: string };

// The review of a unit (D8, D9: the squid): the lesson modal's loop over the unit's misses, with
// no life at stake. Rule U4: no loading state, as for the boss; no empty state (reviewSet fills up
// to ten from the unit's fifty); the error state is a unit that is not on the path.
export function ReviewScreen() {
  const { unit, seed, play } = useLocalSearchParams<ReviewParams>();
  return <ReviewOpening key={[unit, seed, play].join("|")} unitId={unit ?? ""} seed={seed} play={play} />;
}

function ReviewOpening({ unitId, seed, play }: { unitId: string; seed?: string; play?: string }) {
  const router = useRouter();
  const { state } = usePlayer();
  // Decided once, when the review opens: a miss cleared inside it must not change the set
  const [access] = useState(() => reviewAccess(state, unitId, devSeed(seed) ?? clockSeed(new Date())));
  const finish = (right: number, size: number): FinishView => ({
    body: <ReviewFinish right={right} size={size} streak={currentStreak(state, new Date())} />,
    label: "Continue",
    onPress: () => router.back(),
  });
  if (access.kind === "open") return <LessonRunView session={access.session} finish={finish} autoplay={devPlay(play)} />;
  return (
    <LessonFrame bottom={<LessonButton label="Back to the path" onPress={() => router.back()} />}>
      <LessonClosed reason={access.kind} nextLife={null} kind="review" />
    </LessonFrame>
  );
}
