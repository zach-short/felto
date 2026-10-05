import { useEffect } from "react";

import { loadEffects, playEffect } from "@/feedback/effects";
import { buzz, type Touch } from "@/feedback/haptics";
import { feedbackMoment, prepareSound } from "@/feedback/moments";
import { usePlayer } from "@/storage/use-player";

// The sound and the touch of each moment in a session. D15: the Sound setting of the player turns
// the effects off, and GF-3: the Haptics setting turns the touch off. feedback/moments.ts keeps
// every failure inside the moment (audit of item 13, B1). Game feel phase 4 (board item 29) moved
// the six touches from expo-haptics' success and error buzzes onto the vocabulary of haptics.ts,
// so that file is the one importer of expo-haptics: success for a right answer and the good
// endings, and the rigid tap for a wrong answer (PLAN.md phase 4) and a failed boss, since the
// vocabulary has no error buzz (BD-G17).
export function useAnswerFeedback() {
  const { state } = usePlayer();
  const { sound, haptics } = state.settings;
  useEffect(() => prepareSound(sound, loadEffects), [sound]);
  const devices = { sound, haptics, play: playEffect, buzz: async (touch: Touch) => buzz(touch, haptics) };
  return {
    right: feedbackMoment("answer_right", "success", devices),
    wrong: feedbackMoment("answer_wrong", "rigid", devices),
    finish: feedbackMoment("lesson_finish", "success", devices),
    // Phase 10: the boss's two endings and the chest (D15 names all six effects)
    bossPass: feedbackMoment("boss_pass", "success", devices),
    bossFail: feedbackMoment("boss_fail", "rigid", devices),
    chestOpen: feedbackMoment("chest_open", "success", devices),
  };
}
