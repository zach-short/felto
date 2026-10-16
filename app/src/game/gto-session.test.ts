import { describe, expect, it } from "vitest";

import { DIALS } from "@/config/dials";
import { addSession, playerActions, replayHand, sessionRecord } from "@/game/gto-session";
import { freshState } from "@/game/player-state";
import type { Hand } from "@/gto/hand";
import type { Option } from "@/gto/turn";
import { act, advance, newHand } from "@/gto/play";
import { reviewHand } from "@/gto/review";
import { nextTurn } from "@/gto/turn";

const now = new Date(2026, 9, 16, 20);

// A finished hand from its seed, with the player always taking the option the policy picks
function played(seed: number, pick: (options: readonly Option[]) => Option): Hand {
  let hand = newHand(seed);
  for (let turn = nextTurn(hand); turn !== null; turn = nextTurn(hand)) hand = advance(act(hand, pick(turn.options).action));
  return hand;
}

const boldest = (options: readonly Option[]) => options[options.length - 1];
const meekest = (options: readonly Option[]) => options[0];

// The same numbers counted a second way, from the reviews, with a loop of the test's own (rule Q3)
function countedAgain(hands: readonly Hand[]) {
  let decisions = 0;
  let mistakes = 0;
  let cost = 0;
  let worst = { cost: -1, seed: -1, index: -1 };
  for (const hand of hands) {
    reviewHand(hand)?.decisions.forEach((decision, index) => {
      if (decision.grade.kind !== "graded") return;
      decisions += 1;
      cost += decision.grade.costBb;
      if (decision.grade.label !== "mistake") return;
      mistakes += 1;
      if (decision.grade.costBb > worst.cost) worst = { cost: decision.grade.costBb, seed: hand.deal.seed, index };
    });
  }
  return { decisions, mistakes, cost, worst };
}

describe("the record of a GTO trainer session (PLAN.md phase 9, board item 44)", () => {
  const firstSeed = 4_000;
  const hands = Array.from({ length: DIALS.gtoHandsPerSession }, (_, i) => played(firstSeed + i, boldest));
  const record = sessionRecord(hands, firstSeed, now);
  const again = countedAgain(hands);

  it("counts the hands, the decisions graded and the mistakes as the reviews give them", () => {
    expect(record.day).toBe("2026-10-16");
    expect(record.firstSeed).toBe(firstSeed);
    expect(record.hands).toBe(10);
    expect(record.decisions).toBe(again.decisions);
    expect(record.mistakes).toBe(again.mistakes);
    expect(record.mistakes).toBeGreaterThan(0);
  });

  it("sums the cost to the key's four decimals", () => {
    expect(record.costBb).toBeCloseTo(again.cost, 4);
    expect(Math.round(record.costBb * 10_000)).toBe(record.costBb * 10_000);
  });

  it("names the costliest mistake, and its hand plays again from the seed to the same steps", () => {
    expect(record.worst?.seed).toBe(again.worst.seed);
    expect(record.worst?.decision).toBe(again.worst.index);
    const worst = record.worst;
    if (worst === null) throw new Error("no worst mistake");
    const original = hands[worst.seed - firstSeed];
    expect(worst.actions).toEqual(playerActions(original));
    expect(replayHand(worst.seed, worst.actions)).toEqual(original);
    const grade = reviewHand(original)?.decisions[worst.decision].grade;
    expect(grade?.kind === "graded" && grade.label).toBe("mistake");
  });

  it("has no worst mistake when there is none, and no decision in a session of no hands", () => {
    expect(sessionRecord([], firstSeed, now)).toEqual({
      day: "2026-10-16",
      firstSeed,
      hands: 0,
      decisions: 0,
      mistakes: 0,
      costBb: 0,
      worst: null,
    });
    const folds = Array.from({ length: 10 }, (_, i) => played(firstSeed + i, meekest));
    const quiet = sessionRecord(folds, firstSeed, now);
    expect(quiet.worst === null).toBe(countedAgain(folds).mistakes === 0);
  });

  it("refuses a hand that is not finished", () => {
    expect(() => sessionRecord([newHand(firstSeed)].filter((hand) => nextTurn(hand) !== null), firstSeed, now)).toThrow();
  });

  it("gives null for a replay the hand does not allow", () => {
    expect(replayHand(firstSeed, ["5bet", "5bet", "5bet", "5bet"])).toBeNull();
  });

  it("keeps only the latest sessions", () => {
    let state = freshState(now);
    for (let i = 0; i < DIALS.gtoSessionsKept + 3; i++) state = addSession(state, { ...record, firstSeed: i });
    expect(state.gto.sessions).toHaveLength(DIALS.gtoSessionsKept);
    expect(state.gto.sessions[0].firstSeed).toBe(3);
    expect(state.gto.sessions.at(-1)?.firstSeed).toBe(DIALS.gtoSessionsKept + 2);
  });
});
