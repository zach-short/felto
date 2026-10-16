// GF-20 and GF-21 (board item 61): the celebrations that tools/build_celebrations.py writes into
// assets/celebrations/, one dotLottie file each, named as the files are
export type CelebrationName =
  | "lesson_complete"
  | "perfect_lesson"
  | "boss_beaten"
  | "review_done"
  | "practice_done"
  | "unit_complete"
  | "streak_extended"
  | "streak_milestone"
  | "xp_milestone"
  | "achievement"
  | "royal_flush"
  | "chip_jackpot"
  | "all_in_win"
  | "hot_streak"
  | "hearts_refilled"
  | "gems_earned"
  | "daily_goal"
  | "welcome";

// In the generator's order: session finishes, streaks and milestones, poker moments, small rewards
export const CELEBRATION_NAMES: readonly CelebrationName[] = [
  "lesson_complete",
  "perfect_lesson",
  "boss_beaten",
  "review_done",
  "practice_done",
  "unit_complete",
  "streak_extended",
  "streak_milestone",
  "xp_milestone",
  "achievement",
  "royal_flush",
  "chip_jackpot",
  "all_in_win",
  "hot_streak",
  "hearts_refilled",
  "gems_earned",
  "daily_goal",
  "welcome",
];

export type CelebrationMode = "play" | "end" | "none";

// GF-8 and GF-22: under reduced motion a celebration skips its movement and draws its held last
// frame, so the hero still shows; a file that fails to load draws nothing.
export function celebrationMode(motionAllowed: boolean, failed: boolean): CelebrationMode {
  if (failed) return "none";
  return motionAllowed ? "play" : "end";
}
