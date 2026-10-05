import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text } from "react-native";

import { ExerciseView } from "@/components/exercise/exercise-view";
import { FeedbackSheet } from "@/components/lesson/feedback-sheet";
import { PrimaryButton } from "@/components/button/primary-button";
import { LessonClosed } from "@/components/lesson/lesson-closed";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { showsHearts, type Session } from "@/components/lesson/lesson-run";
import { runCounted, sheetDismissAction } from "@/components/lesson/session-steps";
import { useAutoCheck } from "@/components/lesson/use-auto-check";
import { useDevAutoplay } from "@/components/lesson/use-dev-autoplay";
import { useHardwareBack } from "@/components/lesson/use-hardware-back";
import { useLessonRun } from "@/components/lesson/use-lesson-run";
import { livesAt, nextLifeAt } from "@/game/lives";
import { usePlayer } from "@/storage/use-player";
import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// What a session shows once its last exercise is answered: the body, and the one button under it
export type FinishView = { body: ReactNode; label: string; onPress: () => void };

type LessonRunViewProps = {
  session: Session;
  finish: (right: number, size: number) => FinishView;
  // The first exercise shown; not 0 only through the development link, and such a run cannot
  // finish the lesson, because finishSession counts only a lesson answered from its start
  start?: number;
  pick?: number | null;
  autoCheck?: boolean;
  // Development only: see use-dev-autoplay.ts
  autoplay?: string | null;
};

// One session from its first exercise to its finish: a lesson (PLAN.md phase 9), a boss or a
// review (phase 10). The host character of D9 thinks, cheers and sulks beside each exercise.
export function LessonRunView({ session, finish, start = 0, pick = null, autoCheck = false, autoplay = null }: LessonRunViewProps) {
  const router = useRouter();
  const { state } = usePlayer();
  const { run, exercise, size, feedbackWords, choose, check, moveOn, onFeedback } = useLessonRun(session, start, pick);
  useAutoCheck(autoCheck, check);
  useDevAutoplay(autoplay, run, exercise, { choose, check, moveOn });
  // BD-12: the screen reads the clock once per render and passes it to the rules
  const now = new Date();
  const ended = run.phase === "finished" || run.phase === "out-of-lives";
  // Hidden while "Leave?" is asked over a feedback sheet that Android's back button closed
  const [sheetHidden, setSheetHidden] = useState(false);
  const leave = () => (ended || run.answered === 0 ? router.back() : confirmLeave(session.kind, () => router.back()));
  useHardwareBack(leave);
  const sheetDismissed = () => {
    if (!onFeedback()) return;
    if (sheetDismissAction(Platform.OS) === "continue") return moveOn();
    setSheetHidden(true);
    confirmLeave(session.kind, () => router.back(), () => setSheetHidden(false));
  };
  const done = run.phase === "finished" ? finishView(run, size, finish, () => router.back()) : null;
  return (
    <LessonFrame
      top={<LessonHeader done={run.answered / size} lives={showsHearts(session) ? livesAt(state, now) : null} onLeave={leave} />}
      bottom={
        done ? (
          <PrimaryButton label={done.label} onPress={done.onPress} />
        ) : ended ? (
          <PrimaryButton label="Continue" onPress={() => router.back()} />
        ) : (
          <PrimaryButton label="Check" onPress={check} disabled={run.choice === null || run.phase !== "answering"} />
        )
      }
    >
      {done ? (
        done.body
      ) : run.phase === "out-of-lives" ? (
        <LessonClosed reason="no-lives" nextLife={nextLifeAt(state, now)} kind={session.kind} />
      ) : (
        <ExerciseView
          exercise={exercise}
          choice={run.choice}
          checked={run.phase === "feedback"}
          onChoose={choose}
          host={session.host}
        />
      )}
      <FeedbackSheet
        shown={run.phase === "feedback" && !sheetHidden}
        right={run.lastRight}
        answer={feedbackWords.answer}
        explanation={feedbackWords.explanation}
        onContinue={moveOn}
        onDismiss={sheetDismissed}
        host={session.host}
      />
    </LessonFrame>
  );
}

// D8: a lesson or a boss left before its end gives no XP and does not count, and lives already
// lost stay lost, so leaving after an answer asks first. A review and a practice set (D21) cost no
// lives. D20: a placement check left part way counts for nothing and can be started again.
const LEAVE_COPY: Record<Session["kind"], { title: string; line: string }> = {
  lesson: { title: "Leave this lesson?", line: "It will not count, and hearts you lost stay lost." },
  boss: { title: "Leave the boss fight?", line: "It will not count, and hearts you lost stay lost." },
  review: { title: "Leave this review?", line: "It will not count for XP or your streak." },
  practice: { title: "Leave this set?", line: "It will not count for XP or your streak." },
  placement: { title: "Leave the check?", line: "It will not count. You can start it again from the beginning." },
};

function confirmLeave(kind: Session["kind"], leave: () => void, stay?: () => void) {
  const { title, line } = LEAVE_COPY[kind];
  Alert.alert(
    title,
    line,
    [
      { text: "Stay", style: "cancel", onPress: stay },
      { text: "Leave", style: "destructive", onPress: leave },
    ],
    { cancelable: true, onDismiss: stay },
  );
}

function finishView(
  run: Parameters<typeof runCounted>[0],
  size: number,
  finish: LessonRunViewProps["finish"],
  back: () => void,
): FinishView {
  if (runCounted(run, size)) return finish(run.right, size);
  return { body: <DevRunNote right={run.right} answered={run.answered} />, label: "Continue", onPress: back };
}

// Development link only: a run that started part way reaches the end without counting (D8)
function DevRunNote({ right, answered }: { right: number; answered: number }) {
  const { colours } = useTheme();
  return (
    <Text style={[styles.devNote, { color: colours.textMuted }]}>
      {`Development link: ${right} of ${answered} right. This run started part way, so it does not count.`}
    </Text>
  );
}

const styles = StyleSheet.create({
  devNote: { fontSize: TYPE.body, textAlign: "center", paddingTop: SPACE.xl },
});
