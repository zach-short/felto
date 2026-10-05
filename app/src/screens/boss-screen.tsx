import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { BossFinish } from "@/components/boss/boss-finish";
import { bossAccess } from "@/components/boss/boss-session";
import { devPlay, devSeed } from "@/components/boss/dev-params";
import { clockSeed } from "@/components/boss/unit-exercises";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonClosed } from "@/components/lesson/lesson-closed";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import type { FinishView } from "@/components/lesson/lesson-run-view";
import { LessonRunView } from "@/components/lesson/lesson-run-view";
import { bossPasses } from "@/game/boss";
import { chestState } from "@/game/chest";
import { nextLifeAt } from "@/game/lives";
import { currentStreak } from "@/game/streak";
import { usePlayer } from "@/storage/use-player";

type BossParams = { unit: string; seed?: string; play?: string };

// The boss of a unit (D8, D9: the shark), the lesson modal's loop over ten drawn exercises.
// Rule U4: no loading state (the player is read before the first frame and the content is
// bundled); no empty state (every unit holds fifty exercises, content/validate.ts); the error
// state is a unit that is not on the path, drawn by LessonClosed.
export function BossScreen() {
  const { unit, seed, play } = useLocalSearchParams<BossParams>();
  return <BossOpening key={[unit, seed, play].join("|")} unitId={unit ?? ""} seed={seed} play={play} />;
}

function BossOpening({ unitId, seed, play }: { unitId: string; seed?: string; play?: string }) {
  const router = useRouter();
  const { state } = usePlayer();
  // Decided once, when the boss opens, as the lesson does: the draw must not change under the
  // player, and a life spent inside must not close the boss mid-way (D8)
  const [opened] = useState(() => {
    const now = new Date();
    return { now, access: bossAccess(state, unitId, now, devSeed(seed) ?? clockSeed(now)) };
  });
  const finish = (right: number, size: number): FinishView => {
    const passed = bossPasses(right);
    const chestReady = passed && chestState(state, unitId) === "ready";
    const toChest = () => router.replace({ pathname: "/chest/[unit]", params: { unit: unitId } });
    const streak = currentStreak(state, new Date());
    return {
      body: <BossFinish right={right} size={size} passed={passed} chestReady={chestReady} streak={streak} />,
      label: chestReady ? "Open the chest" : "Continue",
      onPress: chestReady ? toChest : () => router.back(),
    };
  };
  if (opened.access.kind === "open") {
    return <LessonRunView session={opened.access.session} finish={finish} autoplay={devPlay(play)} />;
  }
  return (
    <LessonFrame bottom={<LessonButton label="Back to the path" onPress={() => router.back()} />}>
      <LessonClosed reason={opened.access.kind} nextLife={nextLifeAt(state, opened.now)} kind="boss" />
    </LessonFrame>
  );
}
