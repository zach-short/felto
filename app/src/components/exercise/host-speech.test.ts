import { describe, expect, it } from "vitest";

import { parseLine, plainLine } from "@/components/kit/typing-steps";
import { UNITS } from "@/content/catalog";
import type { Exercise } from "@/content/schema";
import { DEALERS } from "@/drills/deal";

import { optionLabels } from "./exercise-view-model";
import { hostLine, keyWord } from "./host-speech";

const WRITTEN: Exercise[] = UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => [...lesson.exercises]));
// Every dealer over a run of seeds, as a practice set or a dealt lesson slot shows them
const DEALT: Exercise[] = Object.values(DEALERS).flatMap((deal) => Array.from({ length: 60 }, (_, i) => deal(i + 1)));
const ALL = [...WRITTEN, ...DEALT];

function written(id: string): Exercise {
  const ex = WRITTEN.find((e) => e.id === id);
  if (!ex) throw new Error(`no exercise ${id}`);
  return ex;
}

function sharesText(label: string, word: string): boolean {
  const [a, b] = [label.toLowerCase(), word.toLowerCase()];
  return a.includes(b) || b.includes(a);
}

// The line as the kit's Bubble reads it: the words, and the parts it colours
function asBubbleReadsIt(line: string): { words: string; keys: string[] } {
  const parts = parseLine(line);
  return { words: plainLine(parts), keys: parts.filter((part) => part.key).map((part) => part.text) };
}

describe("the host's line", () => {
  it("reads in the bubble as the prompt, word for word, for every written and dealt exercise", () => {
    expect(ALL.filter((ex) => asBubbleReadsIt(hostLine(ex)).words !== ex.prompt).map((ex) => ex.id)).toEqual([]);
  });

  it("marks the key word and nothing else, or nothing when there is none", () => {
    const wrong = ALL.filter((ex) => {
      const word = keyWord(ex);
      return JSON.stringify(asBubbleReadsIt(hostLine(ex)).keys) !== JSON.stringify(word === null ? [] : [word]);
    });
    expect(wrong.map((ex) => ex.id)).toEqual([]);
  });

  it("marks the first place the key word stands", () => {
    expect(hostLine(written("table-3-03"))).toBe(
      "After the flop's betting, one more shared card comes, called the *turn*. Then the last one comes, called the river. Which board card is the turn?",
    );
  });

  it("draws an asterisk the prompt holds as a lookalike, so the bubble colours only the key word", () => {
    const starred = { ...written("hands-1-07"), prompt: "Count the *stars*. Each player gets cards called hole cards. How many?" };
    expect(asBubbleReadsIt(hostLine(starred))).toEqual({
      words: "Count the ∗stars∗. Each player gets cards called hole cards. How many?",
      keys: ["hole cards"],
    });
  });
});

describe("the key word", () => {
  it("is a phrase of the line and shares no text with any answer choice", () => {
    const bad = ALL.filter((ex) => {
      const word = keyWord(ex);
      if (word === null) return false;
      return !ex.prompt.includes(word) || optionLabels(ex).some((label) => sharesText(label, word));
    });
    expect(bad.map((ex) => ex.id)).toEqual([]);
  });

  it("is the term a step names, after 'called', 'To ... is to' or 'A ... is a'", () => {
    const cases: [string, string][] = [
      ["hands-1-07", "hole cards"],
      ["hands-1-08", "board"],
      ["table-3-07", "fold"],
      ["table-5-09", "pot-sized bet"],
      ["preflop-1-09", "opening the pot"],
      ["odds-1-01", "out"],
    ];
    expect(cases.map(([id]) => [id, keyWord(written(id))])).toEqual(cases);
  });

  it("is none when the named term is a choice, the catch is a clause, or nothing is named", () => {
    const none = ["table-2-09", "table-4-02", "hands-2-10", "table-1-02", "hands-1-05"];
    expect(none.map((id) => keyWord(written(id)))).toEqual(none.map(() => null));
  });

  it("is what a preflop, outs or odds step turns on, when the step names no term", () => {
    const cases: [string, string][] = [
      ["preflop-2-06", "UTG"],
      ["preflop-3-09", "hijack"],
      ["preflop-5-03", "small blind"],
      ["preflop-4-05", "connectors"],
      ["odds-2-05", "full house"],
      ["odds-3-04", "share of the final pot"],
      ["odds-4-04", "on the river"],
      ["odds-4-06", "on the turn alone"],
      ["odds-5-05", "does not put you all in"],
      ["odds-5-07", "puts you all in"],
    ];
    expect(cases.map(([id]) => [id, keyWord(written(id))])).toEqual(cases);
  });

  it("is none in every hand-name and showdown step, where each hand word is a choice", () => {
    const named = ALL.filter((ex) => (ex.kind === "hand-name" || ex.kind === "showdown") && keyWord(ex) !== null);
    expect(named.map((ex) => ex.id)).toEqual([]);
  });

  it("is found in every dealt preflop, outs and odds step, so the phrases match the dealers' words", () => {
    const missing = DEALT.filter((ex) => ex.kind !== "hand-name" && ex.kind !== "showdown" && keyWord(ex) === null);
    expect(missing.map((ex) => `${ex.id}: ${ex.prompt}`)).toEqual([]);
  });
});
