import { categoryName } from "@/cards/describe";
import { optionLabels } from "@/components/exercise/exercise-view-model";
import type { Exercise, OddsExercise } from "@/content/schema";
import { seatPlace } from "@/drills/words";

// GF-11 (docs/incomplete/game-feel/DESIGN.md 9.4): in a lesson the host says the prompt in a
// speech bubble and colours one key word in it, as photo 2865 does. Board item 51 changes no
// content, so the line is the prompt as written and a key word is a phrase found in it, never
// one added to it. Plain data here, so a test reads every line without a phone.

// The longest named term, in words. A longer catch after "called" is a clause, not a term: "A
// disc called the button marks the dealer's seat" (table-1-02).
const TERM_WORDS = 3;

// The three ways the units name a new term: "... face down, called hole cards.", "To fold is to
// give up your hand." and "An out is a card ...". The article before a term is not part of it.
const CALLED = /\bcalled (?:the |an? )?([^.,;:?!"()]+)/i;
const DEFINED = [/\bTo (\w+) is to\b/, /(?:^|\. )An? (\w+) is an? /];

// What decides how many cards an odds question counts, as the prompts of units/odds.ts and
// drills/odds.ts word it: one card or two, by street and cardsToCome
const CARDS_TO_COME: Readonly<Record<"equity" | "call", Readonly<Record<string, string>>>> = {
  equity: { "turn-1": "on the river", "flop-1": "on the turn alone", "flop-2": "by the river" },
  call: { "turn-1": "only the river", "flop-1": "does not put you all in", "flop-2": "puts you all in" },
};

// The kit's bubble marks a key word with asterisks and has no way to escape one
// (kit/typing-steps.ts:9-14), so an asterisk a prompt holds is drawn as the asterisk operator,
// which looks the same and is no mark. No prompt or dealer held one on 2026-10-05.
const MARK = "*";
const LOOKALIKE = "∗";

// The line the host says, as the kit's Bubble takes it: the prompt, word for word, for all six
// kinds, with its key word between asterisks. The scene keeps its own labels ("Your hole cards",
// "Pot"), and the explanation stays on the feedback sheet.
export function hostLine(ex: Exercise): string {
  const plain = ex.prompt.replaceAll(MARK, LOOKALIKE);
  const word = keyWord(ex);
  const found = word === null ? null : matchPhrase(plain, word.replaceAll(MARK, LOOKALIKE));
  if (!found) return plain;
  const end = found.index + found[0].length;
  return `${plain.slice(0, found.index)}${MARK}${found[0]}${MARK}${plain.slice(end)}`;
}

// The phrase of the line to colour, or null. A term the prompt names comes first; then the
// detail the kind turns on. Whatever it is, it is never an answer choice or part of one, so the
// colour points at what to think about, not at what to pick.
export function keyWord(ex: Exercise): string | null {
  const labels = optionLabels(ex);
  for (const phrase of [namedTerm(ex.prompt), kindTerm(ex)]) {
    const found = phrase === null ? null : findPhrase(ex.prompt, phrase);
    if (found !== null && !labels.some((label) => overlaps(label, found))) return found;
  }
  return null;
}

function namedTerm(prompt: string): string | null {
  const called = CALLED.exec(prompt)?.[1]?.trim();
  if (called && called.split(" ").length <= TERM_WORDS) return called;
  return DEFINED.map((pattern) => pattern.exec(prompt)?.[1]).find((term) => term !== undefined) ?? null;
}

// preflop: the seat decides the answer (drills/preflop.ts:15). outs: the hand drawn to. odds: the
// share of the final pot, or how many cards come. concept: only a named term. hand-name and
// showdown: none, because every hand word on screen is an answer choice or the scene's.
function kindTerm(ex: Exercise): string | null {
  if (ex.kind === "preflop") return withoutArticle(seatPlace(ex.seat));
  if (ex.kind === "outs") return categoryName(ex.target);
  if (ex.kind === "odds") return oddsTerm(ex);
  return null;
}

function oddsTerm(ex: OddsExercise): string | null {
  if (ex.ask === "pot-odds") return "share of the final pot";
  return CARDS_TO_COME[ex.ask][`${ex.street}-${ex.cardsToCome}`] ?? null;
}

function withoutArticle(phrase: string): string {
  return phrase.replace(/^(?:the|an?) /, "");
}

// The first place the text holds the phrase, whole words only and in any case
function matchPhrase(text: string, phrase: string): RegExpExecArray | null {
  return new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").exec(text);
}

// The phrase as the text writes it, or null
function findPhrase(text: string, phrase: string): string | null {
  return matchPhrase(text, phrase)?.[0] ?? null;
}

function overlaps(label: string, phrase: string): boolean {
  return findPhrase(label, phrase) !== null || findPhrase(phrase, label) !== null;
}
