import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

import { PATH_OUTLINE } from "@/components/path/path-outline";
import { fixtureState, isFixtureName } from "@/game/fixtures";
import { usePlayer } from "@/storage/use-player";

export type FixtureLoad = "loading" | "unknown" | "unavailable";

// BD-13: in a development build only, felto://dev/fixture/<name> replaces the player with a named
// state and opens the path, so a screenshot names a fixture and not a hand-made state. A release
// build never loads one: a link must not be able to overwrite a real player's progress.
export function useLoadFixture(name: string | undefined): FixtureLoad {
  const { state, actions } = usePlayer();
  const router = useRouter();
  const known = name !== undefined && isFixtureName(name);
  const load: FixtureLoad = !__DEV__ ? "unavailable" : known ? "loading" : "unknown";
  const written = useRef(false);
  useEffect(() => {
    if (load !== "loading" || name === undefined || !isFixtureName(name)) return;
    actions.loadFixture(name, PATH_OUTLINE);
    written.current = true;
  }, [load, name, actions]);
  // D20: a fixture that is not onboarded (`fresh`) opens onboarding, any other the path. The root
  // navigator opens one or the other from the player, so the move waits until the new player is
  // on screen: sent in the same tick as the write, it hit the closed side and went nowhere.
  const onboarded = known ? fixtureState(name, PATH_OUTLINE, new Date()).onboarded : null;
  useEffect(() => {
    if (!written.current || onboarded === null || state.onboarded !== onboarded) return;
    written.current = false;
    router.replace(onboarded ? "/" : "/onboarding");
  }, [state, onboarded, router]);
  return load;
}
