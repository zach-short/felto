import type { Seat } from "@/content/schema";

import { defenderIndex, inPot, liveSeats, openerSeat, topBet, wentMultiway, type Actor, type Hand, type Step } from "./hand";
import { gtoKey, type GtoAction, type GtoNode } from "./key";
import { TABLE_SEATS, toChips } from "./table";

// One action a seat may take, with the seat's chips in the pot after it.
export interface Option {
  readonly action: GtoAction;
  readonly total: number;
}

// Whose turn it is and what is legal. `node` is the key's node id where one exists (KEY-SPEC.md
// 7.2), so the grader can read the key at the player's decisions; null off the solved tree.
export interface Turn {
  readonly seat: Seat;
  readonly actor: Actor;
  readonly node: string | null;
  readonly options: readonly Option[];
}

// KEY-SPEC.md 7.2: a node id is the history of the decisions taken at nodes. A seat the heads-up
// rule removes and the player's decision off the tree are not written.
export function nodeId(steps: readonly Step[]): string {
  const tokens = steps.filter((step) => step.node !== null).map((step) => `${step.seat}:${step.action}`);
  return tokens.length === 0 ? "root" : tokens.join("/");
}

// The next decision, or null when the hand is over. Once a defender is in, the seats behind it go
// first (removed, or the player off the tree); a pot the player then joins is answered by the
// rule of BD-T21; every other point is a node of the key, and a history that is no node is a
// terminal of KEY-SPEC.md 2.4.
export function nextTurn(hand: Hand): Turn | null {
  const d = defenderIndex(hand);
  if (d >= 0) {
    const behind = behindTurn(hand, d);
    if (behind !== null) return behind;
    if (wentMultiway(hand)) return answerTurn(hand, d);
  }
  return keyTurn(hand);
}

function keyNode(id: string): GtoNode {
  const node = gtoKey().nodes.get(id);
  if (node === undefined) throw new Error(`the hand engine asked for ${id}, which is not a node of the key`);
  return node;
}

function keyTurn(hand: Hand): Turn | null {
  const id = nodeId(hand.steps);
  const node = gtoKey().nodes.get(id);
  if (node === undefined) return null;
  const kept = inPot(hand)[node.actor];
  const options = node.actions.map((action, i) => ({ action, total: totalOf(node.totals[i], kept) }));
  return { seat: node.actor, actor: actorOf(hand, node.actor), node: id, options };
}

// `totals` is null for fold (KEY-SPEC.md 7.1): the folder's chips stay in the pot as they are.
function totalOf(total: number | null, kept: number): number {
  return total === null ? kept : toChips(total);
}

function actorOf(hand: Hand, seat: Seat): Actor {
  return seat === hand.deal.playerSeat ? "player" : "bot";
}

// KEY-SPEC.md 2.2 and 5: every seat behind the defender leaves with no decision, except the player,
// whom the table lets act off the solved tree. The k-th step after the defender's is the k-th seat
// behind it; null once all of them have acted.
function behindTurn(hand: Hand, d: number): Turn | null {
  const defender = hand.steps[d];
  const behind = TABLE_SEATS.slice(TABLE_SEATS.indexOf(defender.seat) + 1);
  const seat = behind[hand.steps.length - d - 1];
  if (seat === undefined) return null;
  const fold = { action: "fold" as const, total: inPot(hand)[seat] };
  if (seat !== hand.deal.playerSeat) return { seat, actor: "rule", node: null, options: [fold] };
  const call = { action: "call" as const, total: topBet(hand) };
  return { seat, actor: "player", node: null, options: [fold, call, raiseOver(defender)] };
}

// BD-T21 (Zach's answer (a) of board item 40, 2026-10-15): the player's raise off the tree is one
// level up in the pot's own row of KEY-SPEC.md 2.3, read from the key's totals: over an open and a
// call, the defender's 3-bet; over a 3-bet, the opener's 4-bet.
function raiseOver(defender: Step): Option {
  const first = defender.node;
  if (first === null) throw new Error("a defender always acts at a node of the key");
  if (defender.action === "call") return { action: "3bet", total: sizeAt(first, "3bet") };
  return { action: "4bet", total: sizeAt(`${first}/${defender.seat}:3bet`, "4bet") };
}

function sizeAt(id: string, action: GtoAction): number {
  const node = keyNode(id);
  const total = node.totals[node.actions.indexOf(action)];
  if (total === null || total === undefined) throw new Error(`the key has no ${action} size at ${id}`);
  return toChips(total);
}

// BD-T21: after the player calls or raises off the tree, the opener and then the defender each
// fold or call, in the order they act; no bot raises there, so the hand then ends.
function answerTurn(hand: Hand, d: number): Turn | null {
  const [chips, top, live] = [inPot(hand), topBet(hand), liveSeats(hand)];
  const seat = [openerSeat(hand), hand.steps[d].seat].find((s) => s !== undefined && live.includes(s) && chips[s] < top);
  if (seat === undefined) return null;
  return { seat, actor: "bot", node: null, options: [{ action: "fold", total: chips[seat] }, { action: "call", total: top }] };
}
