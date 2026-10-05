import { DIALS } from "@/config/dials";
import type { PathOutline } from "@/game/path";
import type { PlayerState } from "@/game/player-state";

// D20: the placement check covers the first two units
const PLACED_UNIT_COUNT = 2;

export type PlacementRun = { size: number; answered: number; right: number };

// D20: the check is 10 exercises. A run of another size, or one left early, is not a check
// taken, so it changes nothing and the check stays open.
function isWholeCheck({ size, answered, right }: PlacementRun): boolean {
  return size === DIALS.placementSize && answered === size && right >= 0 && right <= answered;
}

// D20: the check runs once, with no lives and no XP. Eight right marks units 1 and 2 finished
// and opens unit 3, with no chest, because gems come from bosses played.
export function finishPlacement(
  state: PlayerState,
  run: PlacementRun,
  outline: PathOutline,
): PlayerState {
  if (state.placement !== "not-taken" || !isWholeCheck(run)) return state;
  if (run.right < DIALS.placementPassRight) return { ...state, placement: "failed" };
  const units = outline.units.slice(0, PLACED_UNIT_COUNT);
  const lessonIds = units.flatMap((unit) => unit.lessonIds);
  const finishedLessons = [...new Set([...state.finishedLessons, ...lessonIds])];
  const placedUnits = [...new Set([...state.placedUnits, ...units.map((unit) => unit.id)])];
  return { ...state, placement: "passed", finishedLessons, placedUnits };
}

export function completeOnboarding(state: PlayerState): PlayerState {
  return state.onboarded ? state : { ...state, onboarded: true };
}
