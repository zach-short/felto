import { describe, expect, it } from "vitest";

import type { Seat } from "@/content/schema";

import { dealHand } from "./deal";
import { startHand, wentMultiway, type Hand } from "./hand";
import { treeNodes, type GtoAction } from "./key";
import { act } from "./play";
import { toChips } from "./table";
import { nextTurn } from "./turn";

// KEY-SPEC.md 2.3 written out (rule Q3): the sizes of a row in big blinds. sb_defender and
// bb_defender share every size, so one table serves both.
const IP_DEFENDER = { open: 2.5, "3bet": 7.5, "4bet": 20, "5bet": 100 };
const BLIND_DEFENDER = { open: 2.5, "3bet": 10, "4bet": 22, "5bet": 100 };
const SB_VS_BB = { open: 3, "3bet": 9, "4bet": 23, "5bet": 100 };
const NODES = treeNodes();
const NODE_IDS = new Set(NODES.map((node) => node.id));

function row(opener: Seat, defender: Seat) {
  if (opener === "SB") return SB_VS_BB;
  return defender === "SB" || defender === "BB" ? BLIND_DEFENDER : IP_DEFENDER;
}

function blind(seat: Seat): number {
  return seat === "SB" ? 0.5 : seat === "BB" ? 1 : 0;
}

function seatOf(tokens: readonly string[], action: string): Seat | undefined {
  return tokens.find((token) => token.endsWith(`:${action}`))?.split(":")[0] as Seat | undefined;
}

// The options of KEY-SPEC.md 2.4 at a node, with each total from the table above, read from the
// node id alone; the engine reads the key's `totals` instead, so the two agree only if both are right.
function specOptions(id: string, actor: Seat): [string, number][] {
  const tokens = id === "root" ? [] : id.split("/");
  const opener = seatOf(tokens, "open");
  if (opener === undefined) return [["fold", blind(actor)], ["open", actor === "SB" ? 3 : 2.5]];
  const sizes = row(opener, actor === opener ? (seatOf(tokens, "3bet") ?? actor) : actor);
  const raises = tokens.filter((token) => /:[345]bet$/.test(token)).length;
  if (raises === 0) return [["fold", blind(actor)], ["call", sizes.open], ["3bet", sizes["3bet"]]];
  if (raises === 1) return [["fold", sizes.open], ["call", sizes["3bet"]], ["4bet", sizes["4bet"]]];
  if (raises === 2) return [["fold", sizes["3bet"]], ["call", sizes["4bet"]], ["5bet", sizes["5bet"]]];
  return [["fold", sizes["4bet"]], ["call", sizes["5bet"]]];
}

function skipRule(hand: Hand): Hand {
  let current = hand;
  while (nextTurn(current)?.actor === "rule") current = act(current, "fold");
  return current;
}

// Plays the history of a node id, every seat forced, the seats the rule removes folding between.
function play(history: readonly string[], playerSeat: Seat): Hand {
  let hand = startHand({ ...dealHand(1), playerSeat });
  for (const token of history) {
    const [seat, action] = token.split(":");
    hand = skipRule(hand);
    expect(nextTurn(hand)?.seat).toBe(seat);
    hand = act(hand, action as GtoAction);
  }
  return skipRule(hand);
}

function tokensOf(id: string): string[] {
  return id === "root" ? [] : id.split("/");
}

function terminals(): string[] {
  return NODES.flatMap((node) => node.actions.map((action) => [...tokensOf(node.id), `${node.actor}:${action}`].join("/")))
    .filter((history) => !NODE_IDS.has(history));
}

describe("nextTurn on the solved tree", () => {
  it("reaches each of the 65 nodes by its id, with the actor and the options of KEY-SPEC.md 2.3 and 2.4", () => {
    const wrong = NODES.filter((node) => {
      const turn = nextTurn(play(tokensOf(node.id), node.actor));
      const offered = turn?.options.map((option) => [option.action, option.total]);
      const wanted = specOptions(node.id, node.actor).map(([action, size]) => [action, toChips(size)]);
      return turn?.node !== node.id || turn.seat !== node.actor || turn.actor !== "player" || JSON.stringify(offered) !== JSON.stringify(wanted);
    });
    expect(wrong.map((node) => node.id)).toEqual([]);
  });

  it("ends the hand at each of the 111 terminals of KEY-SPEC.md 2.4", () => {
    const histories = terminals();
    expect(histories).toHaveLength(111);
    // The player sits at the opener, a seat never behind the defender, so no turn leaves the tree.
    const open = histories.filter((history) => {
      const tokens = history.split("/");
      return nextTurn(play(tokens, seatOf(tokens, "open") ?? "BB")) !== null;
    });
    expect(open).toEqual([]);
  });

  it("gives a seat that is not the player's to a bot", () => {
    const turn = nextTurn(play(["UTG:open"], "CO"));
    expect(turn).toMatchObject({ seat: "HJ", actor: "bot", node: "UTG:open" });
  });

  it("ends in a walk when the small blind folds, so the big blind never opens", () => {
    const hand = play(["UTG:fold", "HJ:fold", "CO:fold", "BTN:fold", "SB:fold"], "BB");
    expect(nextTurn(hand)).toBeNull();
  });

  it("removes every seat behind the defender with a fold and no node, the blinds included", () => {
    let hand = play([], "UTG");
    hand = act(act(hand, "open"), "call");
    const removed = ["CO", "BTN", "SB", "BB"].map(() => {
      const turn = nextTurn(hand);
      hand = act(hand, "fold");
      return turn && [turn.seat, turn.actor, turn.node, turn.options.map((option) => option.action).join()];
    });
    expect(removed).toEqual(["CO", "BTN", "SB", "BB"].map((seat) => [seat, "rule", null, "fold"]));
    expect(nextTurn(hand)).toBeNull();
  });

  it("refuses an action the turn does not offer, and any action once the hand is over", () => {
    expect(() => act(play([], "UTG"), "4bet")).toThrow("UTG cannot 4bet at root");
    expect(() => act(play(["UTG:open"], "UTG"), "open")).toThrow("HJ cannot open");
    const over = play(["UTG:open", "HJ:fold", "CO:fold", "BTN:fold", "SB:fold", "BB:fold"], "UTG");
    expect(() => act(over, "fold")).toThrow("the hand is over");
  });
});

describe("nextTurn off the solved tree (KEY-SPEC.md 5, BD-T21)", () => {
  it("lets the player behind a defender's call fold, call or raise to the row's 3-bet", () => {
    const turn = nextTurn(play(["UTG:open", "HJ:call"], "BTN"));
    expect(turn).toEqual({
      seat: "BTN", actor: "player", node: null,
      options: [{ action: "fold", total: 0 }, { action: "call", total: 25 }, { action: "3bet", total: 75 }],
    });
  });

  it("raises over a 3-bet to the row's 4-bet, and over a blind's call or 3-bet by the blind rows", () => {
    expect(nextTurn(play(["UTG:open", "HJ:3bet"], "CO"))?.options[2]).toEqual({ action: "4bet", total: 200 });
    const squeeze = nextTurn(play(["UTG:fold", "HJ:fold", "CO:fold", "BTN:open", "SB:call"], "BB"));
    expect(squeeze?.options).toEqual([{ action: "fold", total: 10 }, { action: "call", total: 25 }, { action: "3bet", total: 100 }]);
    const cold = nextTurn(play(["UTG:open", "HJ:fold", "CO:fold", "BTN:fold", "SB:3bet"], "BB"));
    expect(cold?.options).toEqual([{ action: "fold", total: 10 }, { action: "call", total: 100 }, { action: "4bet", total: 220 }]);
  });

  it("goes back to the key's node, written without the player's fold, when the player folds", () => {
    const hand = skipRule(act(play(["UTG:open", "HJ:3bet"], "CO"), "fold"));
    expect(nextTurn(hand)).toMatchObject({ seat: "UTG", actor: "bot", node: "UTG:open/HJ:3bet" });
    expect(wentMultiway(hand)).toBe(false);
  });

  it("ends a pot the player calls behind a call, since no one faces a bet", () => {
    const hand = skipRule(act(play(["UTG:open", "HJ:call"], "BTN"), "call"));
    expect(nextTurn(hand)).toBeNull();
    expect(wentMultiway(hand)).toBe(true);
  });

  it("asks the opener and then the defender to fold or call a raise, at no node, and then ends", () => {
    let hand = skipRule(act(play(["UTG:open", "HJ:3bet"], "CO"), "4bet"));
    const first = nextTurn(hand);
    hand = act(hand, "call");
    const second = nextTurn(hand);
    hand = act(hand, "fold");
    expect(first).toEqual({ seat: "UTG", actor: "bot", node: null, options: [{ action: "fold", total: 25 }, { action: "call", total: 200 }] });
    expect(second).toEqual({ seat: "HJ", actor: "bot", node: null, options: [{ action: "fold", total: 75 }, { action: "call", total: 200 }] });
    expect(nextTurn(hand)).toBeNull();
  });

  it("asks only the opener when the player calls a 3-bet", () => {
    const hand = skipRule(act(play(["UTG:open", "HJ:3bet"], "CO"), "call"));
    expect(nextTurn(hand)).toMatchObject({ seat: "UTG", node: null });
    expect(nextTurn(act(hand, "call"))).toBeNull();
  });
});
