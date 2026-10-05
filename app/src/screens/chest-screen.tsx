import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

import { chestMoment } from "@/components/chest/chest-moment";
import { ChestView } from "@/components/chest/chest-view";
import { LessonButton } from "@/components/lesson/lesson-button";
import { LessonFrame } from "@/components/lesson/lesson-frame";
import { useAnswerFeedback } from "@/feedback/use-answer-feedback";
import { usePlayer } from "@/storage/use-player";

// The chest modal (DESIGN.md 10.3), opened after a boss pass or from a ready chest on the path.
// openChest is the one rule that gives the gems, and it gives them once per unit (D8). Rule U4:
// no loading state, as for the boss; the empty state is a chest already opened; the error state
// is a unit that is not on the path.
export function ChestScreen() {
  const { unit } = useLocalSearchParams<{ unit: string }>();
  const unitId = unit ?? "";
  const router = useRouter();
  const { state, actions } = usePlayer();
  const feedback = useAnswerFeedback();
  const [openedHere, setOpenedHere] = useState(false);
  const moment = chestMoment(state, unitId, openedHere);
  const open = () => {
    setOpenedHere(true);
    actions.openChest(unitId);
    feedback.chestOpen();
  };
  const button =
    moment === "ready" ? (
      <LessonButton label="Open the chest" onPress={open} />
    ) : (
      <LessonButton label="Back to the path" onPress={() => router.back()} />
    );
  return (
    <LessonFrame bottom={button}>
      <ChestView moment={moment} gems={state.gems} />
    </LessonFrame>
  );
}
