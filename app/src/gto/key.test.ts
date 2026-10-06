import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { allHandClasses, type HandClass } from "@/cards/hand-class";
import { DIALS } from "@/config/dials";
import { OPENING_CHART } from "@/content/opening-chart";
import { OPEN_SEATS, type OpenSeat } from "@/content/schema";

import { gtoKey, parseKey, SPEC_HASH, treeNodes, type GtoNode } from "./key";

const KEY_PATH = fileURLToPath(new URL("./data/key.json", import.meta.url));
const SOLVED_PATH = fileURLToPath(new URL("../../../solver/data/key.json", import.meta.url));
const KEY_TEXT = readFileSync(KEY_PATH, "utf8");
const SRC = fileURLToPath(new URL("..", import.meta.url));
const HANDS = allHandClasses();

// KEY-SPEC.md 2.4 written out: the five open nodes of 7.2 by hand, and the fifteen pairs in the
// spec's own order. key.ts builds the same tree from slices of the seat list; this file builds it
// a second way, so the two agree only if both read the spec right (rule Q3).
const OPEN_NODES: Record<string, string> = {
  root: "UTG",
  "UTG:fold": "HJ",
  "UTG:fold/HJ:fold": "CO",
  "UTG:fold/HJ:fold/CO:fold": "BTN",
  "UTG:fold/HJ:fold/CO:fold/BTN:fold": "SB",
};
const PAIRS = [
  ["UTG", "HJ"], ["UTG", "CO"], ["UTG", "BTN"], ["UTG", "SB"], ["UTG", "BB"],
  ["HJ", "CO"], ["HJ", "BTN"], ["HJ", "SB"], ["HJ", "BB"],
  ["CO", "BTN"], ["CO", "SB"], ["CO", "BB"],
  ["BTN", "SB"], ["BTN", "BB"],
  ["SB", "BB"],
] as const;
const ACTING_ORDER = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];

// Walk the seats in acting order up to the defender: the opener opens, every other seat folds.
function historyTo(opener: string, defender: string): string {
  const tokens: string[] = [];
  for (const seat of ACTING_ORDER) {
    if (seat === defender) break;
    tokens.push(`${seat}:${seat === opener ? "open" : "fold"}`);
  }
  return tokens.join("/");
}

function pairLines(opener: string, defender: string): string[] {
  const first = historyTo(opener, defender);
  return [
    `${first} ${defender} fold,call,3bet`,
    `${first}/${defender}:3bet ${opener} fold,call,4bet`,
    `${first}/${defender}:3bet/${opener}:4bet ${defender} fold,call,5bet`,
    `${first}/${defender}:3bet/${opener}:4bet/${defender}:5bet ${opener} fold,call`,
  ];
}

function specLines(): string[] {
  const opens = Object.entries(OPEN_NODES).map(([id, actor]) => `${id} ${actor} fold,open`);
  return [...opens, ...PAIRS.flatMap(([opener, defender]) => pairLines(opener, defender))].sort();
}

function lines(nodes: readonly { id: string; actor: string; actions: readonly string[] }[]): string[] {
  return nodes.map((node) => `${node.id} ${node.actor} ${node.actions.join(",")}`).sort();
}

describe("the game tree", () => {
  it("has the 65 nodes of KEY-SPEC.md 2.4, built a second way", () => {
    expect(specLines()).toHaveLength(65);
    expect(lines(treeNodes())).toEqual(specLines());
  });

  // KEY-SPEC.md 7.2's own examples, copied from the spec as written.
  it.each([
    ["UTG:open", "HJ"],
    ["UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet/UTG:4bet/BB:5bet", "UTG"],
    ["UTG:fold/HJ:fold/CO:open/BTN:3bet", "CO"],
  ])("names %s with %s to act", (id, actor) => {
    expect(treeNodes().find((node) => node.id === id)?.actor).toBe(actor);
  });
});

describe("the bundled key", () => {
  it("loads, with the pinned hash, the 169 hands in order and every node of the tree", () => {
    const key = gtoKey();
    const file: unknown = JSON.parse(KEY_TEXT);
    expect(isRecord(file) && file.spec_hash).toBe(SPEC_HASH);
    expect(key.hands).toEqual(HANDS);
    expect(lines([...key.nodes.values()])).toEqual(specLines());
    expect([...key.nodes.values()].reduce((sum, node) => sum + node.strategy.length, 0)).toBe(10985);
  });

  // The export is a copy, not a new format (BD-T8): a re-solve that is not re-exported fails here.
  it("is a byte copy of solver/data/key.json", () => {
    expect(Buffer.compare(readFileSync(KEY_PATH), readFileSync(SOLVED_PATH))).toBe(0);
  });

  // KEY-SPEC.md 9: the table the app deals is the table the key was solved for.
  it("has the seats and the stack of the dials", () => {
    expect(gtoKey().seats).toHaveLength(DIALS.tableSeats);
    expect(gtoKey().stackBb).toBe(DIALS.stackBigBlinds);
  });
});

// The big blind facing a UTG open: three actions, so a row can be pushed off 1 in one cell.
const NODE = "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// A fresh copy of the real file with one fault in it, so each case below fails for its own reason.
function brokenKey(change: (file: Record<string, unknown>, node: Record<string, unknown>) => void): unknown {
  const file: unknown = JSON.parse(KEY_TEXT);
  if (!isRecord(file) || !isRecord(file.nodes)) throw new Error("the real key lost its shape");
  const node = file.nodes[NODE];
  if (!isRecord(node)) throw new Error(`the real key has no node ${NODE}`);
  change(file, node);
  return file;
}

function withoutRow(rows: unknown, i: number): unknown {
  return Array.isArray(rows) ? rows.filter((_, j) => j !== i) : rows;
}

describe("a broken key", () => {
  it("is not the copy itself: the unbroken copy loads", () => {
    expect(parseKey(brokenKey(() => {})).nodes.size).toBe(65);
  });

  it.each([
    ["one hand deleted from a node", (_: Record<string, unknown>, node: Record<string, unknown>) => {
      for (const field of ["strategy", "ev", "hand_reach"]) node[field] = withoutRow(node[field], 30);
    }, `${NODE}: strategy does not hold one row per hand`],
    ["one hand deleted from the hand list", (file: Record<string, unknown>) => {
      file.hands = HANDS.filter((hand) => hand !== "72o");
    }, "the file: the hands are not the 169 classes"],
    ["one row summing to 1.1", (_: Record<string, unknown>, node: Record<string, unknown>) => {
      if (Array.isArray(node.strategy)) node.strategy[40] = [0.1, 0.5, 0.5];
    }, `${NODE}: the frequencies for ${HANDS[40]} sum to 1.1000`],
    ["the ev removed", (_: Record<string, unknown>, node: Record<string, unknown>) => {
      delete node.ev;
    }, `${NODE}: ev does not hold one row per hand`],
    ["reach removed", (_: Record<string, unknown>, node: Record<string, unknown>) => {
      delete node.reach;
    }, `${NODE}: reach is missing`],
    ["one node missing", (file: Record<string, unknown>) => {
      if (isRecord(file.nodes)) delete file.nodes[NODE];
    }, `${NODE}: the node is missing`],
    ["a node the tree does not have", (file: Record<string, unknown>, node: Record<string, unknown>) => {
      if (isRecord(file.nodes)) file.nodes["UTG:limp"] = node;
    }, "UTG:limp: it is not a node of the game tree"],
    ["the actor changed", (_: Record<string, unknown>, node: Record<string, unknown>) => {
      node.actor = "SB";
    }, `${NODE}: the actor is SB, not BB`],
    ["the hash changed", (file: Record<string, unknown>) => {
      file.spec_hash = "0".repeat(64);
    }, `the file: spec_hash ${"0".repeat(64)} is not the pinned`],
  ])("fails with %s", (_, change, fault) => {
    expect(() => parseKey(brokenKey(change))).toThrow(`The GTO key is broken at ${fault}`);
  });
});

// PLAN.md phase 4, step 3: every hand the unit 3 chart opens for a seat should open at least
// gtoChartMinOpen at that seat's open node. On 2026-10-06 (board item 39) the provisional key of
// BD-T20 opened the 46 hands below less often. Zach chose to pin them here and to change neither
// the chart nor the solver, so a new miss or a cured one fails this test, and board item 60's
// re-export updates the list. Most are suited connectors and gappers, the hands KEY-SPEC.md 4,
// item 3, says the leaf model undervalues; each hand's frequency is in HANDOFF.md, step 54.
const PINNED_UNDER: Record<OpenSeat, readonly HandClass[]> = {
  UTG: ["QTs", "JTs", "T9s"],
  HJ: ["K9s", "Q9s", "J9s", "T9s", "98s"],
  CO: ["22", "K8s", "J9s", "T9s", "T8s", "98s", "97s", "87s", "76s", "65s", "QTo", "JTo"],
  BTN: [
    "Q7s", "Q6s", "J8s", "J7s", "T8s", "T7s", "98s", "97s", "96s", "87s", "86s", "76s", "75s", "65s",
    "64s", "54s", "J9o", "T9o",
  ],
  SB: ["T7s", "97s", "87s", "86s", "76s", "75s", "65s", "54s"],
};

function openNode(seat: OpenSeat): GtoNode {
  const node = [...gtoKey().nodes.values()].find((each) => each.actor === seat && each.actions.includes("open"));
  if (!node) throw new Error(`the key has no open node for ${seat}`);
  return node;
}

function chartHandsUnder(seat: OpenSeat): HandClass[] {
  const node = openNode(seat);
  const open = node.actions.indexOf("open");
  return OPENING_CHART[seat].filter((hand) => node.strategy[HANDS.indexOf(hand)][open] < DIALS.gtoChartMinOpen);
}

describe("the unit 3 chart against the key", () => {
  it.each(OPEN_SEATS)("opens every %s chart hand at least gtoChartMinOpen, but for the pinned misses", (seat) => {
    expect(chartHandsUnder(seat)).toEqual(PINNED_UNDER[seat]);
  });
});

const KEY_IMPORT = /(from|import|require\()\s*["'][^"']*key\.json["']/;

// BD-T8: one module reads the table, so a change of format or of source stays inside gto/key.ts.
describe("the key boundary", () => {
  it("keeps every import of the key file inside gto/key.ts", () => {
    const sources = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file));
    const outside = sources.filter((file) => file !== "gto/key.ts" && KEY_IMPORT.test(readFileSync(`${SRC}/${file}`, "utf8")));
    expect(outside).toEqual([]);
  });

  it("finds key.ts's own import, so the scan is reading the right folder", () => {
    expect(KEY_IMPORT.test(readFileSync(`${SRC}/gto/key.ts`, "utf8"))).toBe(true);
  });
});
