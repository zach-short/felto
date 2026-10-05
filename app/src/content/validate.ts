import { hasDuplicate, parseCards } from "@/cards/card";
import { exactEquity, requiredEquity, ruleOfTwoAndFour, toPercent } from "@/cards/odds";
import { makesTarget } from "@/cards/outs";
import { DIALS } from "@/config/dials";

import { OUTLINE } from "./outline";
import type {
  CallExercise,
  EquityExercise,
  Exercise,
  Lesson,
  OddsExercise,
  OutsExercise,
  ShowdownExercise,
  Unit,
} from "./schema";

// The structural checks of `PLAN.md` phase 5. Each returns a list of problems, each naming the
// unit, lesson or exercise it is about; an empty list is a pass. Whether an answer key is right
// is `computeKey`'s job, not this file's.

function spotCards(ex: Exercise): readonly string[] {
  switch (ex.kind) {
    case "hand-name":
      return ex.cards;
    case "showdown":
      return [...ex.board, ...ex.players.flat()];
    case "preflop":
      return ex.hole;
    case "outs":
      return [...ex.hole, ...ex.board];
    default:
      return [];
  }
}

function cardProblems(ex: Exercise): string[] {
  try {
    return hasDuplicate(parseCards(spotCards(ex))) ? [`${ex.id}: a card is dealt twice`] : [];
  } catch (error) {
    return [`${ex.id}: ${error instanceof Error ? error.message : String(error)}`];
  }
}

// A showdown option is a set of players, so [0, 1] and [1, 0] are the same option.
function optionKey(option: Exercise["options"][number]): string {
  return JSON.stringify(Array.isArray(option) ? [...option].sort((a, b) => a - b) : option);
}

function optionProblems(ex: Exercise): string[] {
  const problems: string[] = [];
  const n = ex.options.length;
  if (n < 2 || n > 4) problems.push(`${ex.id}: has ${n} options, not two to four`);
  if (new Set(ex.options.map(optionKey)).size !== n) {
    problems.push(`${ex.id}: two options are the same`);
  }
  if (!Number.isInteger(ex.answer) || ex.answer < 0 || ex.answer >= n) {
    problems.push(`${ex.id}: answer ${ex.answer} is not an option index`);
  }
  if (!ex.prompt.trim() || !ex.explanation.trim()) problems.push(`${ex.id}: empty prompt or explanation`);
  return problems;
}

function countProblem(ex: Exercise, what: string, count: number, low: number, high: number): string[] {
  return count < low || count > high ? [`${ex.id}: ${count} ${what}, not ${low} to ${high}`] : [];
}

function showdownOptionProblems(ex: ShowdownExercise): string[] {
  const players = ex.players.length;
  const bad = ex.options.some(
    (option) =>
      option.length === 0 ||
      new Set(option).size !== option.length ||
      option.some((i) => !Number.isInteger(i) || i < 0 || i >= players),
  );
  return bad ? [`${ex.id}: an option names no player, a player twice, or a player not at the table`] : [];
}

// The rule of 2 and 4 and the exact chance must make the same call, or the exercise has two
// defensible answers. The rule side is compared in integers, as `computeKey` does.
function callProblems(ex: CallExercise): string[] {
  const estimate = ruleOfTwoAndFour(ex.outs, ex.cardsToCome);
  const byRule = estimate * (ex.pot + 2 * ex.bet) >= 100 * ex.bet;
  const byExact = exactEquity(ex.outs, ex.street, ex.cardsToCome) >= requiredEquity(ex.pot, ex.bet);
  return byRule === byExact ? [] : [`${ex.id}: the rule of 2 and 4 and the exact chance disagree`];
}

// 100 * bet / (pot + 2 * bet) ends in exactly .5 when 200 * bet over the same is an odd whole
// number; then the key depends on how the percent is rounded, so the exercise must not ask it.
function halfPercent(pot: number, bet: number): boolean {
  const twice = 200 * bet;
  const share = pot + 2 * bet;
  return twice % share === 0 && (twice / share) % 2 === 1;
}

function amountProblems(ex: OddsExercise): string[] {
  const whole = (n: number, low: number, high: number) => Number.isInteger(n) && n >= low && n <= high;
  const ok =
    (ex.ask === "pot-odds" || whole(ex.outs, 0, 20)) &&
    (ex.ask === "equity" || (whole(ex.pot, 1, Infinity) && whole(ex.bet, 1, Infinity)));
  return ok ? [] : [`${ex.id}: the pot and bet must be whole numbers above 0, and outs 0 to 20`];
}

function oddsProblems(ex: OddsExercise): string[] {
  const amounts = amountProblems(ex);
  if (amounts.length) return amounts;
  if (ex.ask === "pot-odds") {
    return halfPercent(ex.pot, ex.bet) ? [`${ex.id}: the price falls on a half percent`] : [];
  }
  if (ex.cardsToCome === 2 && ex.street !== "flop") return [`${ex.id}: two cards come only from the flop`];
  return ex.ask === "call" ? callProblems(ex) : equityProblems(ex);
}

// The key is the rule-of-2-and-4 value. An option equal to the exact chance, when that differs,
// is a second defensible answer: a player who works it out exactly would pick it.
function equityProblems(ex: EquityExercise): string[] {
  const exact = toPercent(exactEquity(ex.outs, ex.street, ex.cardsToCome));
  const byRule = ruleOfTwoAndFour(ex.outs, ex.cardsToCome);
  return exact !== byRule && ex.options.includes(exact)
    ? [`${ex.id}: option ${exact} is the exact chance, a second right answer beside the rule's ${byRule}`]
    : [];
}

// Outs to a pair or two pair count every card that pairs the board too (Ah Kd on 7c 2s 9h has 15
// outs to one pair, not the textbook 6), because `outsTo` counts the category, not whose cards
// make it. Those targets are refused until the counter can tell the two apart.
function outsTargetProblems(ex: OutsExercise): string[] {
  return ex.target === "one-pair" || ex.target === "two-pair"
    ? [`${ex.id}: outs to ${ex.target} would count cards that pair the board, which help every player`]
    : [];
}

function kindProblems(ex: Exercise): string[] {
  switch (ex.kind) {
    case "hand-name":
      return countProblem(ex, "cards", ex.cards.length, 5, 7);
    case "showdown":
      return [
        ...countProblem(ex, "board cards", ex.board.length, 5, 5),
        ...countProblem(ex, "players", ex.players.length, 2, 3),
        ...showdownOptionProblems(ex),
      ];
    case "outs":
      return [...countProblem(ex, "board cards", ex.board.length, 3, 4), ...outsTargetProblems(ex)];
    case "odds":
      return oddsProblems(ex);
    default:
      return [];
  }
}

// An outs spot must not already make its target (BD-26): the count would then be meaningless.
function madeTargetProblem(ex: Exercise): string[] {
  if (ex.kind !== "outs" || ex.board.length < 3) return [];
  const known = parseCards([...ex.hole, ...ex.board]);
  return makesTarget(known, ex.target) ? [`${ex.id}: already makes ${ex.target}`] : [];
}

export function validateExercise(ex: Exercise): string[] {
  const problems = [...optionProblems(ex), ...cardProblems(ex), ...kindProblems(ex)];
  return problems.length ? problems : madeTargetProblem(ex);
}

function lessonProblems(unit: Unit, lesson: Lesson, index: number): string[] {
  const outline = OUTLINE.find((u) => u.id === unit.id)?.lessons[index];
  const problems = lesson.exercises.flatMap(validateExercise);
  if (!outline || outline.id !== lesson.id || outline.title !== lesson.title) {
    problems.push(`${unit.id}: lesson ${index + 1} is "${lesson.id}" ("${lesson.title}"), not as the outline has it`);
  }
  if (lesson.exercises.length !== DIALS.exercisesPerLesson) {
    problems.push(`${lesson.id}: ${lesson.exercises.length} exercises, not ${DIALS.exercisesPerLesson}`);
  }
  return problems;
}

function unitProblems(unit: Unit): string[] {
  const outline = OUTLINE.find((u) => u.id === unit.id);
  const problems = unit.lessons.flatMap((lesson, i) => lessonProblems(unit, lesson, i));
  if (!outline || outline.title !== unit.title) problems.push(`${unit.id}: not titled as the outline has it`);
  if (unit.lessons.length !== DIALS.lessonsPerUnit) {
    problems.push(`${unit.id}: ${unit.lessons.length} lessons, not ${DIALS.lessonsPerUnit}`);
  }
  return problems;
}

function duplicateIds(units: readonly Unit[]): string[] {
  const ids = units.flatMap((u) => [u.id, ...u.lessons.flatMap((l) => [l.id, ...l.exercises.map((e) => e.id)])]);
  const twice = ids.filter((id, i) => ids.indexOf(id) !== i);
  return [...new Set(twice)].map((id) => `id "${id}" is used more than once`);
}

export function validateUnits(units: readonly Unit[]): string[] {
  return [...duplicateIds(units), ...units.flatMap(unitProblems)];
}
