import { useReducer, useRef, useState } from "react";

import { answerLabel } from "@/components/exercise/exercise-view-model";
import { costsLives, RUN_START, runStep, type Session } from "@/components/lesson/lesson-run";
import { answerToRecord, sessionEnd } from "@/components/lesson/session-end";
import { performCheck, performContinue } from "@/components/lesson/session-steps";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import type { Exercise } from "@/content/schema";
import { DIALS } from "@/config/dials";
import { useAnswerFeedback } from "@/feedback/use-answer-feedback";
import { useSound } from "@/feedback/use-sound";
import { bossPasses } from "@/game/boss";
import { livesAt } from "@/game/lives";
import { usePlayer } from "@/storage/use-player";

// Rule O2: the session loop as one hook, for a lesson, a boss, a review, a practice set or the
// placement check. The order of the loop
// is the pure runStep, and the order of each step's effects is session-steps.ts.
export function useLessonRun(session: Session, start = 0, pick: number | null = null) {
  const { state, actions } = usePlayer();
  const feedback = useAnswerFeedback();
  const play = useSound();
  const [run, dispatch] = useReducer(runStep, { ...RUN_START, index: start, choice: pick });
  const movedOnFrom = useRef(-1);
  const checkedFor = useRef(-1);
  // What the sheet says, fixed when Check is pressed, so the sheet keeps its words while it slides
  // away and the next exercise is already on screen
  const [feedbackWords, setFeedbackWords] = useState({ answer: "", explanation: "" });
  const size = session.exercises.length;
  const exercise = session.exercises[Math.min(run.index, size - 1)];
  const choose = (choice: number) => dispatch({ type: "choose", choice });
  const check = () =>
    performCheck(run, exercise, checkedFor, {
      dispatch,
      record: (right) => {
        const answer = answerToRecord(session, exercise.id, right);
        if (answer) actions.recordAnswer(answer);
      },
      showWords: (shown: Exercise) => setFeedbackWords({ answer: answerLabel(shown), explanation: shown.explanation }),
      playRight: feedback.right,
      // Game feel phase 4: in a session that costs lives a wrong answer has just spent a heart
      // (D8), so the heart's sound plays with the wrong answer's; it starts a third below it
      playWrong: () => {
        feedback.wrong();
        if (costsLives(session)) play(DIALS.heartSound);
      },
    });
  const moveOn = () =>
    performContinue(run, size, movedOnFrom, {
      dispatch,
      // BD-12: the clock is read here, at the edge. D8 and D21: a review and a practice set cost no
      // life, so they never stop.
      livesLeft: () => (costsLives(session) ? livesAt(state, new Date()) : Number.POSITIVE_INFINITY),
      finish: () => {
        const end = sessionEnd(session, run, size);
        if (end.type === "placement") actions.finishPlacement(end.run, PATH_OUTLINE);
        else actions.finishSession(end.result);
      },
      playFinish: finishMoment(session, run.right, feedback),
    });
  // False once Continue has run for this answer, so a sheet that closes after it asks nothing
  const onFeedback = () => run.phase === "feedback" && movedOnFrom.current !== run.answered;
  return { run, exercise, size, feedbackWords, choose, check, moveOn, onFeedback };
}

// D15: a boss ends in its own pass or fail sound; a lesson and a review end in the finish sound
function finishMoment(session: Session, right: number, feedback: ReturnType<typeof useAnswerFeedback>) {
  if (session.kind !== "boss") return feedback.finish;
  return bossPasses(right) ? feedback.bossPass : feedback.bossFail;
}
