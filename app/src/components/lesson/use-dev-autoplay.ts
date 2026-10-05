import { useEffect } from "react";

import type { RunState } from "@/components/lesson/lesson-run";
import type { Exercise } from "@/content/schema";

type Controls = {
  choose: (choice: number) => void;
  check: () => void;
  moveOn: () => void;
};

// The pause between two automatic taps, long enough to see each step on a simulator
const STEP_MS = 350;

// Development link only, like use-auto-check.ts: `play=rrrrrrrrww` answers the first exercises
// right (r) or wrong (w), one character each, through the same choose, check and continue a tap
// uses, so a whole boss can be played to a pass or a fail for a screenshot. Exercises past the
// end of the pattern are left for taps.
export function useDevAutoplay(pattern: string | null, run: RunState, exercise: Exercise, controls: Controls) {
  const step = nextStep(pattern, run, exercise);
  useEffect(() => {
    if (step === null) return;
    const timer = setTimeout(() => {
      if (step === "check") controls.check();
      else if (step === "continue") controls.moveOn();
      else controls.choose(step);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [step, controls]);
}

function nextStep(pattern: string | null, run: RunState, exercise: Exercise): number | "check" | "continue" | null {
  if (!__DEV__ || !pattern) return null;
  if (run.phase === "feedback") return run.answered <= pattern.length ? "continue" : null;
  if (run.phase !== "answering" || run.answered >= pattern.length) return null;
  if (run.choice !== null) return "check";
  const wrong = (exercise.answer + 1) % exercise.options.length;
  return pattern[run.answered] === "w" ? wrong : exercise.answer;
}
