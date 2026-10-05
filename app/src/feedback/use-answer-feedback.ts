import * as Haptics from "expo-haptics";
import { useEffect } from "react";

import { loadEffects, playEffect } from "@/feedback/effects";
import { feedbackMoment, prepareSound } from "@/feedback/moments";
import { usePlayer } from "@/storage/use-player";

const { Success, Error: Failure } = Haptics.NotificationFeedbackType;

// The sound and the touch of each moment in a session. BD-19: success for a right answer, error
// for a wrong one, on every answer. D15: the Sound setting of the player turns the effects off.
// feedback/moments.ts keeps every failure inside the moment (audit of item 13, B1).
export function useAnswerFeedback() {
  const { state } = usePlayer();
  const sound = state.settings.sound;
  useEffect(() => prepareSound(sound, loadEffects), [sound]);
  const devices = { sound, play: playEffect, buzz: Haptics.notificationAsync };
  return {
    right: feedbackMoment("answer_right", Success, devices),
    wrong: feedbackMoment("answer_wrong", Failure, devices),
    finish: feedbackMoment("lesson_finish", Success, devices),
    // Phase 10: the boss's two endings and the chest (D15 names all six effects)
    bossPass: feedbackMoment("boss_pass", Success, devices),
    bossFail: feedbackMoment("boss_fail", Failure, devices),
    chestOpen: feedbackMoment("chest_open", Success, devices),
  };
}
