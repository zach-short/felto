import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import type { SessionAccess } from "@/components/boss/boss-session";
import { devPlay } from "@/components/boss/dev-params";
import { clockSeed } from "@/components/boss/unit-exercises";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonClosed } from "@/components/lesson/lesson-closed";
import { LessonFinish } from "@/components/lesson/lesson-finish";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import { lessonAccess } from "@/components/lesson/lesson-lookup";
import type { FinishView } from "@/components/lesson/lesson-run-view";
import { LessonRunView } from "@/components/lesson/lesson-run-view";
import type { Lesson } from "@/content/schema";
import { DIALS } from "@/config/dials";
import { DEALERS } from "@/drills/deal";
import { isDealtLesson, withDealtSlots } from "@/game/dealt-slots";
import { nextLifeAt } from "@/game/lives";
import type { PlayerState } from "@/game/player-state";
import { currentStreak } from "@/game/streak";
import { usePlayer } from "@/storage/use-player";

// The lesson modal (DESIGN.md 10.3). Rule U4: there is no loading state, because the player is
// read before the first frame (storage/player-context.ts) and the content is bundled; the empty
// state cannot happen, as every lesson holds ten exercises (content/validate.ts); the error
// state is a lesson id that is not on the path, drawn by LessonClosed like a locked lesson.
export function LessonScreen() {
  const { id, at, pick, check, play } = useLocalSearchParams<{ id: string; at?: string; pick?: string; check?: string; play?: string }>();
  // A link to the lesson route that is already open hands new params to the same screen, so the
  // body is keyed on them and starts again
  return <LessonOpening key={[id, at, pick, check, play].join("|")} id={id ?? ""} at={at} pick={pick} check={check} play={play} />;
}

type LessonOpeningProps = { id: string; at?: string; pick?: string; check?: string; play?: string };

function LessonOpening({ id, at, pick, check, play }: LessonOpeningProps) {
  const router = useRouter();
  // Development only, like BD-13: felto://lesson/<id>?at=<n>&pick=<m>&check=1 opens any lesson at
  // exercise n with choice m made and checked, so each kind's feedback is seen without taps
  const start = devIndex(at);
  const { state } = usePlayer();
  const finish = (right: number, size: number): FinishView => ({
    body: <LessonFinish right={right} size={size} xp={right * DIALS.xpPerRightAnswer} streak={currentStreak(state, new Date())} />,
    label: "Continue",
    onPress: () => router.back(),
  });
  // Decided once, when the lesson opens: a life spent inside the lesson must not close it under
  // the player (D8 lets the lesson run to the next exercise, then stops it), and a dealt hand
  // must not change under the player when the screen draws again (US-1)
  const [opened] = useState(() => {
    const now = new Date();
    return { now, access: openLesson(state, id, now, start !== null) };
  });
  if (opened.access.kind === "open") {
    const devPick = start === null ? null : devIndex(pick);
    return (
      <LessonRunView
        session={opened.access.session}
        finish={finish}
        start={start ?? 0}
        pick={devPick}
        autoCheck={start !== null && check === "1"}
        autoplay={devPlay(play)}
      />
    );
  }
  return (
    <LessonFrame bottom={<LessonButton label="Back to the path" onPress={() => router.back()} />}>
      <LessonClosed reason={opened.access.kind} nextLife={nextLifeAt(state, opened.now)} />
    </LessonFrame>
  );
}

function openLesson(state: PlayerState, id: string, now: Date, skipLock: boolean): SessionAccess {
  const access = lessonAccess(state, id, now, skipLock);
  return access.kind === "open" ? { kind: "open", session: lessonSession(access.lesson, now) } : access;
}

// US-1: a lesson named in the dial deals fresh hands into its drill slots, seeded from the clock
// when it opens (BD-12), so a replay or a retry after hearts run out shows new cards
function lessonSession(lesson: Lesson, now: Date) {
  const exercises = isDealtLesson(lesson.id) ? withDealtSlots(lesson.exercises, clockSeed(now), DEALERS) : lesson.exercises;
  return { kind: "lesson", id: lesson.id, host: "fish", exercises } as const;
}

function devIndex(value: string | undefined): number | null {
  if (!__DEV__ || value === undefined) return null;
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 && index < DIALS.exercisesPerLesson ? index : null;
}
