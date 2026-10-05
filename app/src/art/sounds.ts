import answerRight from "@art/sounds/answer_right.wav";
import answerWrong from "@art/sounds/answer_wrong.wav";
import bossFail from "@art/sounds/boss_fail.wav";
import bossPass from "@art/sounds/boss_pass.wav";
import chestOpen from "@art/sounds/chest_open.wav";
import lessonFinish from "@art/sounds/lesson_finish.wav";

// Rule U6: the art module is the only importer of generated files under assets/, the six WAV
// effects of D15 (tools/build_sounds.py) as well as the SVGs. feedback/effects.ts plays them.
export type Effect =
  | "answer_right"
  | "answer_wrong"
  | "lesson_finish"
  | "boss_pass"
  | "boss_fail"
  | "chest_open";

export const SOUND_SOURCES: Readonly<Record<Effect, number>> = {
  answer_right: answerRight,
  answer_wrong: answerWrong,
  lesson_finish: lessonFinish,
  boss_pass: bossPass,
  boss_fail: bossFail,
  chest_open: chestOpen,
};
