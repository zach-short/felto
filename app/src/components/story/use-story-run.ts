import { useRouter } from "expo-router";
import { useEffect, useReducer } from "react";
import { useWindowDimensions } from "react-native";

import { STORY_START, storyStep } from "@/components/story/story-step";
import { storyTapAction } from "@/components/story/story-tap";
import { DIALS } from "@/config/dials";

// One story under the pure reducer. Every way out (the cross, "Back to the path", a forward tap
// on the last slide, Android's back button) only asks to close; the router goes back once, when
// the state first turns to closing, because a closing story takes no more events.
export function useStoryRun(size: number) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [story, dispatch] = useReducer(storyStep, STORY_START);
  useEffect(() => {
    if (story.closing) router.back();
  }, [story.closing, router]);
  const forward = () => dispatch({ type: "forward", size });
  const back = () => dispatch({ type: "back" });
  const close = () => dispatch({ type: "close" });
  // US-6: the tap layer is the whole screen, so the tap's x is measured against the screen width
  const tap = (x: number) => (storyTapAction(x, width, DIALS.storyBackZone) === "back" ? back() : forward());
  return { index: story.index, tap, forward, back, close };
}
