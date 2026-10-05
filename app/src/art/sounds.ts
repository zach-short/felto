import answerRight from "@art/sounds/answer_right.wav";
import answerWrong from "@art/sounds/answer_wrong.wav";
import bossFail from "@art/sounds/boss_fail.wav";
import bossPass from "@art/sounds/boss_pass.wav";
import chestOpen from "@art/sounds/chest_open.wav";
import heartLost from "@art/sounds/heart_lost.wav";
import lessonFinish from "@art/sounds/lesson_finish.wav";
import optionSelect from "@art/sounds/option_select.wav";
import rewardClaim from "@art/sounds/reward_claim.wav";
import sparkle from "@art/sounds/sparkle.wav";
import tap from "@art/sounds/tap.wav";
import xpTick from "@art/sounds/xp_tick.wav";

// Rule U6: the art module is the only importer of generated files under assets/, the WAV effects
// of tools/build_sounds.py as well as the SVGs: six of D15 for answers and endings, and six of
// GF-5 for presses, ticks and rewards. feedback/effects.ts plays them.
export type Effect =
  | "answer_right"
  | "answer_wrong"
  | "lesson_finish"
  | "boss_pass"
  | "boss_fail"
  | "chest_open"
  | "tap"
  | "option_select"
  | "heart_lost"
  | "xp_tick"
  | "reward_claim"
  | "sparkle";

export const SOUND_SOURCES: Readonly<Record<Effect, number>> = {
  answer_right: answerRight,
  answer_wrong: answerWrong,
  lesson_finish: lessonFinish,
  boss_pass: bossPass,
  boss_fail: bossFail,
  chest_open: chestOpen,
  tap,
  option_select: optionSelect,
  heart_lost: heartLost,
  xp_tick: xpTick,
  reward_claim: rewardClaim,
  sparkle,
};
