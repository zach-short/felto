import { OPENING_CHART as CHART } from "./opening-chart";
import type { OpeningChart, Unit } from "./schema";
import { unitHands } from "./units/hands";
import { unitOdds } from "./units/odds";
import { unitPreflop } from "./units/preflop";
import { unitTable } from "./units/table";

// Every written unit, in path order, and the opening chart: units 1 and 2 from phase 6, units 3
// and 4 and the chart from phase 7. `keys.test.ts` checks every exercise listed here (rule Q3),
// so a unit that is not listed is not checked.
//
// A unit file is named for its unit id (`units/hands.ts` holds unit "hands"). `keys.test.ts`
// fails when a file in `units/` names a unit missing from `UNITS`, or when a listed unit lacks
// a lesson of the outline, so a written unit cannot ship unchecked. The chart is not a unit, so
// it lives beside this file, not in `units/`.
export const UNITS: readonly Unit[] = [unitHands, unitTable, unitPreflop, unitOdds];

// The chart unit 3's keys come from (`opening-chart.ts`), and the one the app reads.
export const OPENING_CHART: OpeningChart = CHART;
