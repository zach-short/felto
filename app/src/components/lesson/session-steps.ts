import type { RunEvent, RunState } from "@/components/lesson/lesson-run";
import type { Exercise } from "@/content/schema";
import { safely } from "@/feedback/safely";

export type CheckEffects = {
  dispatch: (event: RunEvent) => void;
  record: (right: boolean) => void;
  showWords: (exercise: Exercise) => void;
  playRight: () => void;
  playWrong: () => void;
};

// Check, in a safe order (audit of item 13, B1). Two presses inside one render both read the same
// `run`, still "answering", so the phase alone cannot stop the second (audit of item 14, finding
// a): `checkedFor` is the answer count Check last ran for, and only the first press for an answer
// goes on. The run then moves to its feedback before anything else, so a record or a sound that
// throws cannot leave the answer open for another press; then the answer is recorded (D8: a wrong
// one spends its life at once); the sound and the buzz come last and cannot throw.
export function performCheck(run: RunState, exercise: Exercise, checkedFor: { current: number }, effects: CheckEffects): void {
  if (run.phase !== "answering" || run.choice === null || checkedFor.current === run.answered) return;
  checkedFor.current = run.answered;
  const right = run.choice === exercise.answer;
  effects.dispatch({ type: "check", answer: exercise.answer });
  effects.record(right);
  effects.showWords(exercise);
  safely(right ? effects.playRight : effects.playWrong);
}

export type ContinueEffects = {
  dispatch: (event: RunEvent) => void;
  livesLeft: () => number;
  finish: () => void;
  playFinish: () => void;
};

// Continue, in the same safe order: the run moves on before the session is finished and before
// any sound, so a failing sound cannot leave the session counted but stuck on its feedback.
// `movedOnFrom` is the answer count Continue last ran for: the sheet closes by its button and by a
// swipe, and only the first moves on.
export function performContinue(run: RunState, size: number, movedOnFrom: { current: number }, effects: ContinueEffects): void {
  if (run.phase !== "feedback" || movedOnFrom.current === run.answered) return;
  movedOnFrom.current = run.answered;
  const last = run.index + 1 >= size;
  effects.dispatch({ type: "continue", size, livesLeft: effects.livesLeft() });
  if (!last) return;
  effects.finish();
  safely(effects.playFinish);
}

// D8: only a run answered from its first exercise to its last counts. A development link that
// starts part way (lesson-screen.tsx) reaches the end without counting, so its finish must not
// claim "Lesson finished!" (audit of item 13, finding 7).
export function runCounted(run: RunState, size: number): boolean {
  return run.phase === "finished" && run.answered === size;
}

export type SheetDismiss = "continue" | "ask-to-leave";

// The feedback sheet closes without its button by a swipe on both platforms, and on Android also
// by the back button, which the sheet takes before the screen's back handler sees it. A swipe on
// iOS reads as Continue; on Android every such close asks to leave, as Back does everywhere else
// in a session (audit of item 13, finding 2).
export function sheetDismissAction(os: string): SheetDismiss {
  return os === "android" ? "ask-to-leave" : "continue";
}
