import { openChest } from "@/game/chest";
import type { FixtureName } from "@/game/fixtures";
import { fixtureState } from "@/game/fixtures";
import { buyFreeze } from "@/game/freeze";
import { refillLives } from "@/game/lives";
import type { PathOutline } from "@/game/path";
import type { PlacementRun } from "@/game/placement";
import { completeOnboarding, finishPlacement } from "@/game/placement";
import type { PlayerState } from "@/game/player-state";
import type { Answer, SessionResult } from "@/game/session";
import { finishSession, recordAnswer } from "@/game/session";
import { resetProgress, setReminderOn, setReminderTime, setSound } from "@/game/settings";
import type { PlayerCell } from "@/storage/player-cell";

type Change = (state: PlayerState, now: Date) => PlayerState;

type Outcome<Reason extends string> =
  | { ok: true; state: PlayerState }
  | { ok: false; reason: Reason };

// Called with the latest state just before a reset replaces it (rule Q2: copied, never dropped)
type BackUp = (state: PlayerState, now: Date) => void;

// BD-12: the actions are the edge where the clock is read, once per action, and passed to the
// rules. A screen calls these and never a rule that changes state. Every action reads the cell's
// latest state, never the last render's, so no action overwrites one queued before it.
export function playerActions(
  cell: PlayerCell,
  clock: () => Date = () => new Date(),
  backUp: BackUp = () => undefined,
) {
  const apply = (change: Change) => cell.set(change(cell.get(), clock()));
  function commit<Reason extends string>(
    decide: (state: PlayerState, now: Date) => Outcome<Reason>,
  ): Outcome<Reason> {
    const outcome = decide(cell.get(), clock());
    if (outcome.ok) cell.set(outcome.state);
    return outcome;
  }
  return {
    recordAnswer: (answer: Answer) => apply((s, now) => recordAnswer(s, answer, now)),
    finishSession: (result: SessionResult) => apply((s, now) => finishSession(s, result, now)),
    openChest: (unitId: string) => apply((s) => openChest(s, unitId)),
    finishPlacement: (run: PlacementRun, outline: PathOutline) =>
      apply((s) => finishPlacement(s, run, outline)),
    completeOnboarding: () => apply((s) => completeOnboarding(s)),
    setSound: (sound: boolean) => apply((s) => setSound(s, sound)),
    // PLAN.md phase 11 and D11: the reminder switch and its time in Profile
    setReminderOn: (on: boolean) => apply((s) => setReminderOn(s, on)),
    setReminderTime: (hour: number, minute: number) => apply((s) => setReminderTime(s, hour, minute)),
    resetProgress: () =>
      apply((s, now) => {
        backUp(s, now);
        return resetProgress(s, now);
      }),
    // BD-13: only the development fixture route calls this
    loadFixture: (name: FixtureName, outline: PathOutline) =>
      apply((_, now) => fixtureState(name, outline, now)),
    refillLives: () => commit(refillLives),
    buyFreeze: () => commit(buyFreeze),
  };
}

export type PlayerActions = ReturnType<typeof playerActions>;
