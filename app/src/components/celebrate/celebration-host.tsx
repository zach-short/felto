import { useSegments } from "expo-router";

import { layerCopy } from "@/components/celebrate/celebration-copy";
import { CelebrationLayer } from "@/components/celebrate/celebration-layer";
import { useCelebrationQueue } from "@/components/celebrate/use-celebration-queue";
import { usePlayer } from "@/storage/use-player";

// GF-24 (board item 62): the layer waits for a tab route, so a moment won in a session plays once
// the session has closed and the path, Practice or Profile shows, as Duolingo shows its streak
// after the lesson; onboarding, a session and the out-of-lives sheet all keep it hidden
export function CelebrationHost() {
  const { state } = usePlayer();
  const { current, next } = useCelebrationQueue(state);
  const [first] = useSegments();
  if (current === null || first !== "(tabs)") return null;
  const { id, moment } = current;
  return <CelebrationLayer key={id} name={moment.name} copy={layerCopy(moment)} onContinue={next} />;
}
