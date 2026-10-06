import { allHandClasses, type HandClass } from "@/cards/hand-class";
import { OPEN_SEATS, type Seat } from "@/content/schema";

import keyFile from "./data/key.json";

// The one reader of the solver's key (BD-T8 in docs/incomplete/gto-trainer/PLAN.md). The file is
// a byte copy of solver/data/key.json in the schema of KEY-SPEC.md 7, and nothing else under app/
// imports it (key.test.ts). Every later phase reads strategy here, and a key that is wrong in
// shape is wrong in silence, so the loader checks the file before anything reads a number from it.

export type GtoAction = "fold" | "open" | "call" | "3bet" | "4bet" | "5bet";

// A decision node as KEY-SPEC.md 2.4 and 7.2 define it, before the file is read.
export interface TreeNode {
  readonly id: string;
  readonly actor: Seat;
  readonly actions: readonly GtoAction[];
}

// One row per hand in the order of `GtoKey.hands`, one number per action (KEY-SPEC.md 7.1).
export interface GtoNode extends TreeNode {
  // The actor's total in the pot after each action, in big blinds; null for fold.
  readonly totals: readonly (number | null)[];
  readonly reach: number;
  readonly strategy: readonly (readonly number[])[];
  readonly ev: readonly (readonly number[])[];
  readonly handReach: readonly number[];
}

export interface GtoKey {
  readonly seats: readonly Seat[];
  readonly stackBb: number;
  readonly hands: readonly HandClass[];
  readonly nodes: ReadonlyMap<string, GtoNode>;
}

const SCHEMA = "felto-gto-key/1";
// KEY-SPEC.md 7.5: the app does not recompute the hash; it pins the one the solver wrote. This is
// the provisional freeze of BD-T20 (2026-10-06), and board item 60 re-pins it after RF-3.
export const SPEC_HASH = "659cdfd1072b0ea27a0b74737ce6f3a67c63a329ed18595c6f1f8233ffe845a7";
// Three frequencies written to four decimals can miss 1 by 0.00015 (KEY-SPEC.md 7.4); this leaves
// room for that and nothing else, the tolerance of solver/validate_key.py.
const SUM_TOLERANCE = 0.001;
const SEATS: readonly Seat[] = [...OPEN_SEATS, "BB"];
const HANDS = allHandClasses();

function folds(seats: readonly Seat[]): string[] {
  return seats.map((seat) => `${seat}:fold`);
}

function openNode(seat: Seat, i: number): TreeNode {
  const id = i === 0 ? "root" : folds(SEATS.slice(0, i)).join("/");
  return { id, actor: seat, actions: ["fold", "open"] };
}

// KEY-SPEC.md 2.4: the four nodes of one opener and defender pair. The seats between the two fold
// first; the seats behind the defender leave with no decision and are not written (7.2).
function pairNodes(o: number, d: number): TreeNode[] {
  const [opener, defender] = [SEATS[o], SEATS[d]];
  const first = [...folds(SEATS.slice(0, o)), `${opener}:open`, ...folds(SEATS.slice(o + 1, d))].join("/");
  const second = `${first}/${defender}:3bet`;
  const third = `${second}/${opener}:4bet`;
  return [
    { id: first, actor: defender, actions: ["fold", "call", "3bet"] },
    { id: second, actor: opener, actions: ["fold", "call", "4bet"] },
    { id: third, actor: defender, actions: ["fold", "call", "5bet"] },
    { id: `${third}/${defender}:5bet`, actor: opener, actions: ["fold", "call"] },
  ];
}

// The 65 nodes, built from the app's own seat list and never from the file, so a key that drops,
// adds or renames a node fails the load.
export function treeNodes(): TreeNode[] {
  const pairs = OPEN_SEATS.flatMap((_, o) => SEATS.slice(o + 1).flatMap((__, k) => pairNodes(o, o + 1 + k)));
  return [...OPEN_SEATS.map(openNode), ...pairs];
}

function fail(where: string, fault: string): never {
  throw new Error(`The GTO key is broken at ${where}: ${fault}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function numbers(where: string, name: string, value: unknown, length: number): number[] {
  if (Array.isArray(value) && value.length === length && value.every(isNumber)) return value;
  return fail(where, `${name} is not ${length} numbers`);
}

// BD-T6: one row per hand, so a grader never reads a hand that is not there.
function rows(where: string, name: string, value: unknown, width: number): number[][] {
  if (!Array.isArray(value) || value.length !== HANDS.length) fail(where, `${name} does not hold one row per hand`);
  return value.map((row, i) => numbers(where, `${name} for ${HANDS[i]}`, row, width));
}

function frequencies(where: string, value: unknown, width: number): number[][] {
  const strategy = rows(where, "strategy", value, width);
  strategy.forEach((row, i) => {
    const sum = row.reduce((total, frequency) => total + frequency, 0);
    if (row.some((frequency) => frequency < 0 || frequency > 1)) fail(where, `a frequency for ${HANDS[i]} is outside 0 to 1`);
    if (Math.abs(sum - 1) > SUM_TOLERANCE) fail(where, `the frequencies for ${HANDS[i]} sum to ${sum.toFixed(4)}`);
  });
  return strategy;
}

function totals(where: string, value: unknown, actions: readonly GtoAction[]): (number | null)[] {
  const fits = (total: unknown, i: number) => (actions[i] === "fold" ? total === null : isNumber(total));
  if (Array.isArray(value) && value.length === actions.length && value.every(fits)) return value;
  return fail(where, "the totals do not match the actions");
}

function checkShape(expected: TreeNode, value: Record<string, unknown>): void {
  const where = expected.id;
  const [found, wanted] = [JSON.stringify(value.actions), JSON.stringify(expected.actions)];
  if (value.actor !== expected.actor) fail(where, `the actor is ${String(value.actor)}, not ${expected.actor}`);
  if (found !== wanted) fail(where, `the actions are ${found}, not ${wanted}`);
}

function parseNode(expected: TreeNode, value: unknown): GtoNode {
  const where = expected.id;
  if (!isRecord(value)) return fail(where, "the node is missing");
  checkShape(expected, value);
  const reach = value.reach;
  if (!isNumber(reach) || reach < 0 || reach > 1) return fail(where, "reach is missing or not a probability");
  const width = expected.actions.length;
  const strategy = frequencies(where, value.strategy, width);
  const ev = rows(where, "ev", value.ev, width);
  const handReach = numbers(where, "hand_reach", value.hand_reach, HANDS.length);
  return { ...expected, totals: totals(where, value.totals, expected.actions), reach, strategy, ev, handReach };
}

function parseNodes(value: unknown): ReadonlyMap<string, GtoNode> {
  if (!isRecord(value)) return fail("the file", "the nodes are missing");
  const tree = treeNodes();
  const ids = new Set(tree.map((node) => node.id));
  const stray = Object.keys(value).find((id) => !ids.has(id));
  if (stray !== undefined) fail(stray, "it is not a node of the game tree in KEY-SPEC.md 2.4");
  return new Map(tree.map((node) => [node.id, parseNode(node, value[node.id])]));
}

function checkHeader(raw: Record<string, unknown>): void {
  if (raw.schema !== SCHEMA) fail("the file", `the schema is ${String(raw.schema)}, not ${SCHEMA}`);
  if (raw.spec_hash !== SPEC_HASH) fail("the file", `spec_hash ${String(raw.spec_hash)} is not the pinned ${SPEC_HASH}`);
  if (JSON.stringify(raw.hands) !== JSON.stringify(HANDS)) {
    fail("the file", "the hands are not the 169 classes in the order of allHandClasses()");
  }
}

function parseGame(value: unknown): Pick<GtoKey, "seats" | "stackBb"> {
  if (!isRecord(value) || JSON.stringify(value.seats) !== JSON.stringify(SEATS)) {
    return fail("game", `the seats are not ${SEATS.join(", ")}`);
  }
  const stackBb = value.stack_bb;
  return isNumber(stackBb) ? { seats: SEATS, stackBb } : fail("game", "stack_bb is missing");
}

// Throws on the first fault, naming the node (or "the file", or "game") and the fault.
export function parseKey(raw: unknown): GtoKey {
  if (!isRecord(raw)) return fail("the file", "it is not a JSON object");
  checkHeader(raw);
  return { ...parseGame(raw.game), hands: HANDS, nodes: parseNodes(raw.nodes) };
}

let loaded: GtoKey | undefined;

// The bundled key, checked on first read rather than at import, so a broken key throws where a
// caller reads it and the message reaches that caller's error boundary.
export function gtoKey(): GtoKey {
  loaded ??= parseKey(keyFile);
  return loaded;
}
