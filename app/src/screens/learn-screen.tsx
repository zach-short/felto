import { LearnPath } from "@/components/path/learn-path";
import { PathGreeting } from "@/components/path/path-greeting";
import { greetingMood, pathUnits } from "@/components/path/path-view-model";
import { RecoveredBanner } from "@/components/recovered-banner";
import { Screen } from "@/components/screen";
import { StatBar } from "@/components/stat-bar";
import { statValues } from "@/components/stat-values";
import { usePlayer } from "@/storage/use-player";

// The Learn tab (DESIGN.md 10.1). Rule U4: there is no loading state, because the provider reads
// the player synchronously before the first frame (storage/player-context.ts); the empty state is
// a new player, greeted by the fish above an open first lesson; the error state is a save that
// could not be read, shown by the banner above a fresh path.
export function LearnScreen() {
  const { status, state } = usePlayer();
  // BD-12: the screen is the edge that reads the clock, once per render
  const now = new Date();
  return (
    <Screen top={<StatBar values={statValues(state, now)} />}>
      {status === "recovered" ? <RecoveredBanner /> : null}
      <PathGreeting mood={greetingMood(state, now)} />
      <LearnPath units={pathUnits(state)} />
    </Screen>
  );
}
