import { useLocalSearchParams } from "expo-router";

import { LessonButton } from "@/components/lesson/lesson-button";
import { useHardwareBack } from "@/components/lesson/use-hardware-back";
import { STORY_DONE } from "@/components/story/story-copy";
import { StoryFrame } from "@/components/story/story-frame";
import { StoryHeader } from "@/components/story/story-header";
import { StoryMissing } from "@/components/story/story-missing";
import { StorySlide } from "@/components/story/story-slide";
import { useStoryRun } from "@/components/story/use-story-run";
import { storyFor } from "@/content/stories/catalog";
import type { Story } from "@/content/stories/schema";

// A unit's story (docs/incomplete/unit-stories/DESIGN.md US-4 to US-7), a full-screen modal over
// the path. It gives no XP, spends no heart and counts for no streak, so it reads no player
// state. Rule U4: there is no loading state, because the stories are bundled; the empty state
// cannot happen, because the validator requires six slides (content/stories/validate-story.ts);
// the error state is a unit with no story, drawn by StoryMissing.
export function StoryScreen() {
  const { unit } = useLocalSearchParams<{ unit: string }>();
  const story = storyFor(unit ?? "");
  if (!story) return <StoryMissing />;
  return <StoryRun key={story.unit} story={story} />;
}

function StoryRun({ story }: { story: Story }) {
  const count = story.slides.length;
  const { index, tap, forward, back, close } = useStoryRun(count);
  // US-6: Android's back button closes the story, not the app
  useHardwareBack(close);
  return (
    <StoryFrame
      onTap={tap}
      top={<StoryHeader index={index} count={count} onClose={close} />}
      bottom={index === count - 1 ? <LessonButton label={STORY_DONE} onPress={close} /> : null}
    >
      <StorySlide slide={story.slides[index]} index={index} count={count} onForward={forward} onBack={back} />
    </StoryFrame>
  );
}
