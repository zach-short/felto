import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { devPlay, devSeed } from "@/components/boss/dev-params";
import { clockSeed } from "@/components/boss/unit-exercises";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonClosed } from "@/components/lesson/lesson-closed";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import type { FinishView } from "@/components/lesson/lesson-run-view";
import { LessonRunView } from "@/components/lesson/lesson-run-view";
import { devDeal } from "@/components/practice/dev-deal";
import { PracticeFinish } from "@/components/practice/practice-finish";
import { PRACTICE_HOST, practiceAccess } from "@/components/practice/practice-menu";
import { currentStreak } from "@/game/streak";
import { usePlayer } from "@/storage/use-player";

type PracticeSetParams = { seed?: string; play?: string; deal?: string };

// One practice set (D21, DESIGN.md 10.7): the lesson modal's loop over ten dealt exercises, hosted
// by the squid, with no heart at stake. Rule U4: no loading state (the player is read before the
// first frame and the deal is computed); the empty state is a player with no kind open, drawn by
// LessonClosed like a locked review; there is no error state, since the deal needs no stored id.
export function PracticeSetScreen() {
  const { seed, play, deal } = useLocalSearchParams<PracticeSetParams>();
  return <PracticeOpening key={[seed, play, deal].join("|")} seed={seed} play={play} deal={deal} />;
}

function PracticeOpening({ seed, play, deal }: PracticeSetParams) {
  const router = useRouter();
  const { state } = usePlayer();
  // Dealt once, when the set opens: BD-12 reads the clock here, at the edge, for the seed, and the
  // set must not change under the player while it is played
  const [access] = useState(() => practiceAccess(state, devSeed(seed) ?? clockSeed(new Date()), devDeal(deal)));
  const finish = (right: number, size: number): FinishView => ({
    body: <PracticeFinish right={right} size={size} streak={currentStreak(state, new Date())} />,
    label: "Continue",
    onPress: () => router.back(),
  });
  if (access.kind === "open") return <LessonRunView session={access.session} finish={finish} autoplay={devPlay(play)} />;
  return (
    <LessonFrame bottom={<LessonButton label="Back to practice" onPress={() => router.back()} />}>
      <LessonClosed reason="locked" nextLife={null} kind="practice" host={PRACTICE_HOST} />
    </LessonFrame>
  );
}
