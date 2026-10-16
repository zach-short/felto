import { describe, expect, it } from "vitest";

import { handClass } from "@/cards/hand-class";
import type { Seat } from "@/content/schema";
import { pickOne, randomFrom } from "@/drills/random";

import { keyRow } from "./bots";
import { dealHand } from "./deal";
import { startHand, type Hand, type Step } from "./hand";
import { gtoKey } from "./key";
import { act, autoStep } from "./play";
import { handResult, type HandResult } from "./result";
import { STACK, TABLE_SEATS, toChips } from "./table";
import { nextTurn } from "./turn";

// The done-when of PLAN.md phase 5: 1,000 seeded hands, the player in every seat and choosing at
// random, with no illegal action and every chip kept. Zach's answer (c) of board item 40
// (2026-10-15): the log is played here from its seeds, not kept as a fixture.
const SEEDS = Array.from({ length: 1000 }, (_, i) => i + 1);

// KEY-SPEC.md 2.3 written out (rule Q3), in big blinds; sb_defender and bb_defender share sizes.
const IP_DEFENDER = { open: 2.5, "3bet": 7.5, "4bet": 20, "5bet": 100 };
const BLIND_DEFENDER = { open: 2.5, "3bet": 10, "4bet": 22, "5bet": 100 };
const SB_VS_BB = { open: 3, "3bet": 9, "4bet": 23, "5bet": 100 };

interface Logged {
  readonly seed: number;
  readonly hand: Hand;
  readonly result: HandResult;
  readonly faults: string[];
}

// The table as this test sees it, rebuilt from the steps without the engine's own helpers.
interface Seen {
  chips: Record<Seat, number>;
  out: Set<Seat>;
  top: number;
  opener?: Seat;
  defender?: Seat;
}

function sizes(opener: Seat, defender: Seat) {
  if (opener === "SB") return SB_VS_BB;
  return defender === "SB" || defender === "BB" ? BLIND_DEFENDER : IP_DEFENDER;
}

function seen(steps: readonly Step[]): Seen {
  const table: Seen = { chips: { UTG: 0, HJ: 0, CO: 0, BTN: 0, SB: 5, BB: 10 }, out: new Set(), top: 10 };
  for (const step of steps) {
    if (step.action === "open") table.opener = step.seat;
    if (table.opener && !table.defender && (step.action === "call" || step.action === "3bet")) table.defender = step.seat;
    if (step.action === "fold") table.out.add(step.seat);
    table.chips[step.seat] = step.total;
    table.top = Math.max(table.top, step.total);
  }
  return table;
}

function raiseFault(table: Seen, step: Step): string | null {
  if (table.opener === undefined || step.action === "fold" || step.action === "call" || step.action === "open") return "a raise before any open";
  const size = toChips(sizes(table.opener, table.defender ?? step.seat)[step.action]);
  return step.total === size && step.total > table.top ? null : `a ${step.action} to ${step.total}, not ${size}`;
}

// The rules of KEY-SPEC.md 2.1 to 2.3 and 5 for one step, judged before it is taken.
function stepFault(prior: readonly Step[], step: Step): string | null {
  const table = seen(prior);
  if (table.out.has(step.seat)) return `${step.seat} acts after folding`;
  if (step.total > STACK) return `${step.seat} puts in more than a stack`;
  if (step.action === "fold") return step.total === table.chips[step.seat] ? null : "a fold moves chips";
  if (step.action === "call") return step.total === table.top && table.top > 10 ? null : "a call that is no call (or a limp)";
  if (step.action === "open") {
    const size = step.seat === "SB" ? 30 : 25;
    return table.top === 10 && step.seat !== "BB" && step.total === size ? null : `an open by ${step.seat} to ${step.total}`;
  }
  return raiseFault(table, step);
}

// The heads-up rule (KEY-SPEC.md 2.2): only seats behind the defender leave with no decision, and a
// pot keeps three or more players only when the player called or raised off the tree (BD-T21).
function handFaults(hand: Hand, result: HandResult): string[] {
  const defender = seen(hand.steps).defender;
  const behind = defender ? TABLE_SEATS.slice(TABLE_SEATS.indexOf(defender) + 1) : [];
  const ruled = hand.steps.filter((step) => step.actor === "rule" && !behind.includes(step.seat));
  const faults = ruled.map((step) => `${step.seat} removed without being behind the defender`);
  if (result.live.length > 2 && !result.multiway) faults.push("three players left on the solved tree");
  const net = Object.values(result.net).reduce((sum, chips) => sum + chips, 0);
  const put = Object.values(seen(hand.steps).chips).reduce((sum, chips) => sum + chips, 0);
  if (net !== 0 || put !== result.pot) faults.push(`chips not conserved: net ${net}, pot ${result.pot}, put in ${put}`);
  return faults;
}

// Every option of the turn is judged, not only the one taken, so an illegal offer cannot hide.
function offerFaults(hand: Hand): string[] {
  const turn = nextTurn(hand);
  if (turn === null) return [];
  const steps = turn.options.map((option) => ({ seat: turn.seat, ...option, node: turn.node, actor: turn.actor }));
  return steps.flatMap((step) => stepFault(hand.steps, step) ?? []);
}

function logHand(seed: number): Logged {
  const choose = randomFrom(seed + 7_000_000);
  let hand = startHand({ ...dealHand(seed), playerSeat: TABLE_SEATS[seed % TABLE_SEATS.length] });
  const faults: string[] = [];
  for (let turn = nextTurn(hand); turn !== null && hand.steps.length < 20; turn = nextTurn(hand)) {
    faults.push(...offerFaults(hand));
    hand = autoStep(hand) ?? act(hand, pickOne(choose, turn.options).action);
  }
  const result = handResult(hand);
  if (result === null) return { seed, hand, result: emptyResult(), faults: [...faults, "the hand never ended"] };
  return { seed, hand, result, faults: [...faults, ...handFaults(hand, result)] };
}

function emptyResult(): HandResult {
  const zero = { UTG: 0, HJ: 0, CO: 0, BTN: 0, SB: 0, BB: 0 };
  return { postflop: "runout", live: [], showdown: false, winners: [], pot: 0, won: zero, net: zero, multiway: false };
}

const LOG = SEEDS.map(logHand);
const STEPS = LOG.flatMap((logged) => logged.hand.steps.map((step) => ({ logged, step })));

describe("the log of 1,000 seeded hands", () => {
  it("offers and takes no illegal action and keeps every chip in every hand", () => {
    expect(LOG.flatMap((logged) => logged.faults.map((fault) => `seed ${logged.seed}: ${fault}`))).toEqual([]);
  });

  it("seats the player in every seat", () => {
    expect(new Set(LOG.map((logged) => logged.hand.deal.playerSeat))).toEqual(new Set(TABLE_SEATS));
  });

  it("has every bot take only actions its row plays, at nodes the key reaches", () => {
    const wrong = STEPS.filter(({ logged, step }) => {
      if (step.node === null) return false;
      const node = gtoKey().nodes.get(step.node);
      const bad = node === undefined || node.actor !== step.seat || node.reach <= 0;
      const row = keyRow(step.node, handClass(logged.hand.deal.holes[step.seat]));
      return bad || (step.actor === "bot" && row[node.actions.indexOf(step.action)] <= 0);
    });
    expect(wrong.map(({ logged, step }) => `seed ${logged.seed} ${step.node} ${step.seat}:${step.action}`)).toEqual([]);
  });

  it("reaches every ending the engine has: a walk, a pot no one contests, showdowns, splits, all-ins and multiway pots", () => {
    const ends = LOG.map(({ result, hand }) => ({ result, allIn: hand.steps.some((step) => step.total === STACK && step.action === "call") }));
    const count = (test: (end: (typeof ends)[number]) => boolean) => ends.filter(test).length;
    expect(count(({ result }) => result.winners.includes("BB") && result.pot === 15)).toBeGreaterThan(0);
    expect(count(({ result }) => !result.showdown && result.pot > 15)).toBeGreaterThan(0);
    expect(count(({ result }) => result.showdown && result.live.length === 2)).toBeGreaterThan(0);
    expect(count(({ result }) => result.winners.length > 1)).toBeGreaterThan(0);
    expect(count(({ allIn }) => allIn)).toBeGreaterThan(0);
    expect(count(({ result }) => result.multiway)).toBeGreaterThan(0);
  });
});
