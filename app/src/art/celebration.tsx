import { useEffect, useEffectEvent, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

import achievement from "@art/celebrations/achievement.lottie";
import allInWin from "@art/celebrations/all_in_win.lottie";
import bossBeaten from "@art/celebrations/boss_beaten.lottie";
import chipJackpot from "@art/celebrations/chip_jackpot.lottie";
import dailyGoal from "@art/celebrations/daily_goal.lottie";
import gemsEarned from "@art/celebrations/gems_earned.lottie";
import heartsRefilled from "@art/celebrations/hearts_refilled.lottie";
import hotStreak from "@art/celebrations/hot_streak.lottie";
import lessonComplete from "@art/celebrations/lesson_complete.lottie";
import perfectLesson from "@art/celebrations/perfect_lesson.lottie";
import practiceDone from "@art/celebrations/practice_done.lottie";
import reviewDone from "@art/celebrations/review_done.lottie";
import royalFlush from "@art/celebrations/royal_flush.lottie";
import streakExtended from "@art/celebrations/streak_extended.lottie";
import streakMilestone from "@art/celebrations/streak_milestone.lottie";
import unitComplete from "@art/celebrations/unit_complete.lottie";
import welcome from "@art/celebrations/welcome.lottie";
import xpMilestone from "@art/celebrations/xp_milestone.lottie";

import { celebrationMode, type CelebrationName } from "@/art/celebrations";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// Rule U6, widened to the celebrations by board item 61: the dotLottie files are imported here and
// nowhere else, so every other file asks for a celebration by name
const SOURCES: Record<CelebrationName, number> = {
  lesson_complete: lessonComplete,
  perfect_lesson: perfectLesson,
  boss_beaten: bossBeaten,
  review_done: reviewDone,
  practice_done: practiceDone,
  unit_complete: unitComplete,
  streak_extended: streakExtended,
  streak_milestone: streakMilestone,
  xp_milestone: xpMilestone,
  achievement,
  royal_flush: royalFlush,
  chip_jackpot: chipJackpot,
  all_in_win: allInWin,
  hot_streak: hotStreak,
  hearts_refilled: heartsRefilled,
  gems_earned: gemsEarned,
  daily_goal: dailyGoal,
  welcome,
};

type CelebrationProps = {
  name: CelebrationName;
  // Every celebration is square (400 by 400 in its file), so the width sets the height too
  width: number;
  onEnd?: () => void;
};

// GF-20 and GF-22: a painted hero with rays and particles that plays once and holds its last pose,
// drawn over whatever is behind it and never in the way of a touch
export function Celebration({ name, width, onEnd }: CelebrationProps) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  // The hero's pop and bounce are the movement GF-8 names first, so a celebration counts as a pop
  const mode = celebrationMode(motionAllowed("pop", reduced), failed);
  const end = useEffectEvent(() => onEnd?.());
  // A celebration that does not play still ends, so a caller that waits on onEnd moves on (GF-8)
  useEffect(() => {
    if (mode !== "play") end();
  }, [mode]);
  if (mode === "none") return null;
  // The player's own path for a bundled number resolves it to this URI; passing it as { uri } keeps
  // the source inside the prop's declared type, and the ".lottie" in it routes it the same way
  const uri = Image.resolveAssetSource(SOURCES[name]).uri;
  return (
    <View
      style={[styles.stage, { width, height: width }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <LottieView
        source={{ uri }}
        autoPlay={mode === "play"}
        loop={false}
        progress={mode === "end" ? 1 : undefined}
        onAnimationFinish={(cancelled) => cancelled || onEnd?.()}
        onAnimationFailure={() => setFailed(true)}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { pointerEvents: "none" },
  fill: { flex: 1 },
});
