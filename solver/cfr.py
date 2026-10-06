"""Solve the GTO trainer's preflop game with CFR+ and write the raw strategy key.

The game is KEY-SPEC.md sections 2 and 3 (docs/incomplete/gto-trainer/), read from GAME in
config.py and nowhere else: six seats, 100 big blinds, one size at every level, the heads-up-only
rule, and leaves valued from the equity table through the realization model of section 3.2. The
tree falls into five opener subtrees (UTG, HJ, CO, BTN, SB) that share no decision: an opener's
open node and the four nodes of each pair it can play. Inside a subtree the two live hands are
dealt jointly from W, and a defender's fold frequency enters the reach of the defenders behind it
as one range-average number (section 3.3), so the opener's value loses a little mass when its hand
blocks the hands that continue, as section 4, item 6, says.

Method: CFR+ (regret matching+, alternating updates by seat, the average strategy weighted by the
iteration number), over every hand class at once in arrays of 169 rows, one subtree at a time
(solve). solve_tree runs the five subtrees in seat order and puts every number per dealt hand: a
subtree's reach is the product of the fold rates of the seats before its opener, read from their
open nodes, and a seat's gain over the tree is the sum over the subtrees it plays in of that reach
times its gain there. best_response.py, written apart from this file, measures the gains. main()
prints them at a quarter, a half and all of ITERATIONS, every band of section 8.2, the nodes
reached less often than REACH_FLOOR, then writes solver/data/key.json in the shape of section 7.1
(the strategy and the EV per hand and action, the reach and the reach per hand) through one write
path. The file's solver.seed is 1 and nothing reads it: the solver has no random source and reads
no clock, so two runs write the same bytes.

Input: solver/data/equity.json (E and W, written by equity.py), read with json.
Run: python3 solver/cfr.py
"""

import hashlib
import json
import os

import numpy as np

import best_response
from config import GAME, GTO_EXPLOITABILITY_BB, REACH_FLOOR
from validate_key import HANDS, SCHEMA, spec_hash

OUT = os.path.join(os.path.dirname(__file__), "data")
DATA = os.path.join(OUT, "equity.json")
DATE = "2026-10-06"
ITERATIONS = 12000
SIZE_NAMES = ("open", "3bet", "4bet", "5bet")
# Legend: node kind -> (its actions, the size each action totals to; None for a fold).
KINDS = {
    "open": (["fold", "open"], [None, "open"]),
    "first": (["fold", "call", "3bet"], [None, "open", "3bet"]),
    "vs3": (["fold", "call", "4bet"], [None, "3bet", "4bet"]),
    "vs4": (["fold", "call", "5bet"], [None, "4bet", "5bet"]),
    "vs5": (["fold", "call"], [None, "5bet"]),
}
# Legend: label, measure, its arguments, floor, ceiling: every row of KEY-SPEC.md 8.2 the tree
# answers, in percent. Action columns: 1 call, 2 3-bet; at vs3: 0 fold, 2 4-bet. The row "HJ or
# CO vs UTG, call" of 8.2 is two rows here, one per seat. The last row is the realization band.
BANDS = [
    ("UTG opens", "open", ("UTG",), 14, 21),
    ("HJ opens", "open", ("HJ",), 18, 25),
    ("CO opens", "open", ("CO",), 24, 31),
    ("BTN opens", "open", ("BTN",), 40, 48),
    ("SB opens", "open", ("SB",), 38, 55),
    ("BB vs BTN defends", "defend", ("BTN", "BB", (1, 2)), 50, 75),
    ("BB vs BTN 3-bets", "defend", ("BTN", "BB", (2,)), 9, 15),
    ("BB vs BTN calls", "defend", ("BTN", "BB", (1,)), 38, 62),
    ("BB vs CO defends", "defend", ("CO", "BB", (1, 2)), 42, 68),
    ("BB vs CO 3-bets", "defend", ("CO", "BB", (2,)), 7, 13),
    ("BB vs UTG defends", "defend", ("UTG", "BB", (1, 2)), 28, 60),
    ("BB vs UTG 3-bets", "defend", ("UTG", "BB", (2,)), 4, 10),
    ("BB vs SB defends", "defend", ("SB", "BB", (1, 2)), 48, 70),
    ("BB vs SB 3-bets", "defend", ("SB", "BB", (2,)), 12, 20),
    ("SB vs BTN 3-bets", "defend", ("BTN", "SB", (2,)), 9, 18),
    ("SB vs BTN calls", "defend", ("BTN", "SB", (1,)), 0, 5),
    ("BTN vs CO 3-bets", "defend", ("CO", "BTN", (2,)), 10, 17),
    ("BTN vs CO calls", "defend", ("CO", "BTN", (1,)), 0, 10),
    ("HJ vs UTG calls", "defend", ("UTG", "HJ", (1,)), 0, 10),
    ("CO vs UTG calls", "defend", ("UTG", "CO", (1,)), 0, 10),
    ("CO folds to BTN 3-bet", "vs3", ("CO", "BTN", 0), 52, 72),
    ("CO 4-bets BTN 3-bet", "vs3", ("CO", "BTN", 2), 15, 28),
    ("SB folds to BB 3-bet", "vs3", ("SB", "BB", 0), 55, 80),
    ("BTN folds to BB 3-bet", "vs3", ("BTN", "BB", 0), 45, 70),
    ("UTG folds to BB 3-bet", "vs3", ("UTG", "BB", 0), 45, 70),
    ("BB realizes vs BTN", "realization", ("BTN", "BB"), 65, 90),
]


# ------------------------------------------------------------- THE GAME


def load_equity(path=DATA):
    """E and W as arrays, and the file's SHA-256, the key's equity_table_sha256."""
    with open(path, "rb") as f:
        raw = f.read()
    table = json.loads(raw)
    if table["hands"] != HANDS:
        raise SystemExit("the equity table's hand order is not HANDS")
    return np.array(table["E"]), np.array(table["W"], dtype=np.float64), hashlib.sha256(raw).hexdigest()


def row_of(opener, defender):
    if opener == "SB":
        return "sb_vs_bb"
    if defender in ("SB", "BB"):
        return defender.lower() + "_defender"
    return "ip_defender"


def amounts(sizes):
    return tuple(sizes[name] for name in SIZE_NAMES)


def node_id(game, opener, defender=None, depth=0):
    """The id of KEY-SPEC.md 7.2: an opener's open node (no defender), or a pair's node at depth
    1 (the defender's first decision) to 4 (the opener facing the 5-bet)."""
    seats = game["seats"]
    tokens = [s + ":fold" for s in seats[:seats.index(opener)]]
    if defender is None:
        return "/".join(tokens) or "root"
    tokens.append(opener + ":open")
    tokens += [s + ":fold" for s in seats[seats.index(opener) + 1:seats.index(defender)]]
    raises = [defender + ":3bet", opener + ":4bet", defender + ":5bet"]
    return "/".join(tokens + raises[:depth - 1])


def pair_of(game, opener, defender):
    """What one opener and one defender play for: the sizes of their row, the dead money (the
    blinds of the seats the heads-up rule removes), who is in position after the flop, the tax
    on the defender's flat, and the defender's fold payoff."""
    blinds, order = game["blinds_bb"], game["postflop_order"]
    tax_kind = "sb" if defender == "SB" else "bb" if defender == "BB" else "ip"
    return {
        "opener": opener, "defender": defender,
        "sizes": game["sizes_bb"][row_of(opener, defender)],
        "dead": sum(v for s, v in blinds.items() if s not in (opener, defender)),
        "opener_ip": order.index(opener) > order.index(defender),
        "tax": game["leaf_model"]["flat_tax"][tax_kind],
        "fold_d": -blinds.get(defender, 0),
        "ids": [node_id(game, opener, defender, depth) for depth in range(1, 5)],
    }


def subtree_of(game, opener):
    """The opener's open node and its pairs with every seat behind it, in order of action."""
    if game["ante_bb"]:
        raise SystemExit("the solver models no ante")
    seats, blinds = game["seats"], game["blinds_bb"]
    return {
        "opener": opener,
        "id": node_id(game, opener),
        "fold_o": -blinds.get(opener, 0),
        "all_fold": sum(v for s, v in blinds.items() if s != opener),
        "pairs": [pair_of(game, opener, d) for d in seats[seats.index(opener) + 1:]],
    }


# --------------------------------------------------------------- LEAVES


def bent(e, c, k):
    """The share of the pot kept by the player without the edge (KEY-SPEC.md 3.2)."""
    return e - c * e * (1 - e) ** k


def shares(pair, E, leaf):
    """The caller's bent share at the three leaves with chips behind: the defender's in the
    single raised and 4-bet pots, the opener's in the 3-bet pot. The edge holder is the player
    whose raise was called, and its c depends on whether it is in position."""
    c_ip, c_oop = leaf["c_edge_in_position"], leaf["c_edge_out_of_position"]
    c_opener, c_defender = (c_ip, c_oop) if pair["opener_ip"] else (c_oop, c_ip)
    k = leaf["k"]
    return bent(E.T, c_opener["srp"], k), bent(E, c_defender["3bp"], k), bent(E.T, c_opener["4bp"], k)


def leaf_tables(pair, E, leaf):
    """The opener's and the defender's payoffs at the four board leaves (KEY-SPEC.md 2.5, 3.1
    and 3.2), by opener hand (rows) and defender hand (columns). The all-in leaf is exact."""
    a1, a2, a3, stack = amounts(pair["sizes"])
    p1, p2, p3, p4 = (2 * a + pair["dead"] for a in amounts(pair["sizes"]))
    s1, s2, s3 = shares(pair, E, leaf)
    keep = 1 - pair["tax"]
    uo = ((1 - s1) * keep * p1 - a1, s2 * p2 - a2, (1 - s3) * p3 - a3, E * p4 - stack)
    ud = (s1 * keep * p1 - a1, (1 - s2) * p2 - a2, s3 * p3 - a3, E.T * p4 - stack)
    return {"uo": uo, "ud": ud, "share_srp": s1}


# ----------------------------------------------------------------- CFR+


class Node:
    """One decision node: regret matching+ over its actions for every hand at once, and the
    iteration-weighted average strategy that the key reads."""

    def __init__(self, node_id, actor, kind, sizes, n):
        actions, totals = KINDS[kind]
        self.id, self.actor, self.actions = node_id, actor, actions
        self.totals = [None if t is None else sizes[t] for t in totals]
        self.regret = np.zeros((n, len(actions)))
        self.strategy = np.full((n, len(actions)), 1 / len(actions))
        self.summed = np.zeros((n, len(actions)))
        self.weight = np.zeros(n)

    def update(self, cf, reach, t):
        """Add the strategy this iteration played to the average, weighted by the iteration and
        by the actor's own reach, then move the strategy by the regrets, floored at zero."""
        self.summed += (t * reach)[:, None] * self.strategy
        self.weight += t * reach
        value = (self.strategy * cf).sum(axis=1, keepdims=True)
        self.regret = np.maximum(self.regret + cf - value, 0)
        self.strategy = normalized(self.regret)

    def average(self):
        return normalized(self.summed, self.weight)


def normalized(rows, total=None):
    """Each row scaled to sum to 1; a row with nothing in it is uniform."""
    total = rows.sum(axis=1) if total is None else total
    safe = np.where(total > 0, total, 1)[:, None]
    return np.where(total[:, None] > 0, rows / safe, 1 / rows.shape[1])


def build(game, opener, E, W):
    """The opener's subtree ready to iterate: its nodes, its pairs' payoff tables and the deal."""
    sub = subtree_of(game, opener)
    n = len(E)
    sub["open"] = Node(sub["id"], opener, "open", sub["pairs"][0]["sizes"], n)
    for pair in sub["pairs"]:
        actors = [pair["defender"], opener, pair["defender"], opener]
        kinds = ["first", "vs3", "vs4", "vs5"]
        pair["nodes"] = [Node(i, a, k, pair["sizes"], n) for i, a, k in zip(pair["ids"], actors, kinds)]
        pair.update(leaf_tables(pair, E, game["leaf_model"]))
    sub["P"] = W / W.sum()
    sub["p"] = sub["P"].sum(axis=1)
    return sub


def blend(s, axis, *terms):
    """Σ over actions of a node's strategy times each action's value, the strategy laid along
    the rows (axis 0, the opener's hands) or the columns (axis 1, the defender's)."""
    shape = (-1, 1) if axis == 0 else (1, -1)
    return sum(s[:, a].reshape(shape) * term for a, term in enumerate(terms))


def opener_values(pair, s):
    """The opener's value at each node of a pair under the strategies s, by hand pair. The
    defender's fold at its first node counts 0: that mass flows to the next pair's reach."""
    a1, a2, a3, _ = amounts(pair["sizes"])
    uo, d = pair["uo"], pair["dead"]
    v4 = blend(s[3], 0, -a3, uo[3])
    v3 = blend(s[2], 1, d + a2, uo[2], v4)
    v2 = blend(s[1], 0, -a1, uo[1], v3)
    return blend(s[0], 1, 0, uo[0], v2), v2, v3, v4


def defender_values(pair, s):
    """The defender's value at the nodes below its first decision, by hand pair."""
    a1, a2, a3, _ = amounts(pair["sizes"])
    ud, d = pair["ud"], pair["dead"]
    v4 = blend(s[3], 0, d + a3, ud[3])
    v3 = blend(s[2], 1, -a2, ud[2], v4)
    return blend(s[1], 0, d + a1, ud[1], v3), v3, v4


def by_row(w, *terms):
    """Counterfactual values of the player whose hands are the rows: Σ over the columns of the
    opponent reach times each action's value."""
    return np.stack([(w * term).sum(axis=1) for term in terms], axis=1)


def by_col(w, *terms):
    return np.stack([(w * term).sum(axis=0) for term in terms], axis=1)


def reaches(sub, strategies):
    """R_j for each pair: the product of the range-average fold frequencies of the defenders
    before it (KEY-SPEC.md 3.3); the last entry is the chance that every defender folds."""
    folds = [(sub["p"] * s[0][:, 0]).sum() for s in strategies]
    return np.cumprod([1.0] + folds)


def opponent_reach(P, r, first, second, axis, plain):
    """The opponent's reach at a player's two nodes in a pair: the deal, the fold chain and the
    opponent's two raises, laid along its hands (axis 1 the defender's, 0 the opener's). With
    plain, the deal alone: the EV of a hand that no opposing hand reaches (KEY-SPEC.md 7.1)."""
    if plain:
        return P, P
    shape = (-1, 1) if axis == 0 else (1, -1)
    w = P * r * first.reshape(shape)
    return w, w * second.reshape(shape)


def opener_cf(sub, strategies, s_open, plain=False):
    """(node, counterfactual values, opponent reach per hand, own reach) at each node of the
    opener: the open node, then vs3 and vs5 of each pair."""
    R, P, p = reaches(sub, strategies), sub["P"], sub["p"]
    cf_open = np.stack([p * sub["fold_o"], p * R[-1] * sub["all_fold"]], axis=1)
    out = []
    for pair, s, r in zip(sub["pairs"], strategies, R):
        a1, a2, a3, _ = amounts(pair["sizes"])
        v1, v2, v3, v4 = opener_values(pair, s)
        w2, w4 = opponent_reach(P, r, s[0][:, 2], s[2][:, 2], 1, plain)
        cf_open[:, 1] += r * (P * v1).sum(axis=1)
        out.append((pair["nodes"][1], by_row(w2, -a1, pair["uo"][1], v3), w2.sum(axis=1), s_open[:, 1]))
        out.append((pair["nodes"][3], by_row(w4, -a3, pair["uo"][3]), w4.sum(axis=1), s_open[:, 1] * s[1][:, 2]))
    return [(sub["open"], cf_open, p, np.ones(len(p)))] + out


def defender_cf(sub, strategies, s_open, j, plain=False):
    """The same four-tuples at the two nodes of the defender of pair j."""
    pair, s, P = sub["pairs"][j], strategies[j], sub["P"]
    a1, a2, a3, _ = amounts(pair["sizes"])
    r = reaches(sub, strategies)[j]
    v2, v3, v4 = defender_values(pair, s)
    w1, w3 = opponent_reach(P, r, s_open[:, 1], s[1][:, 2], 0, plain)
    first = (pair["nodes"][0], by_col(w1, pair["fold_d"], pair["ud"][0], v2), w1.sum(axis=0), np.ones(len(P)))
    vs4 = (pair["nodes"][2], by_col(w3, -a2, pair["ud"][2], v4), w3.sum(axis=0), s[0][:, 2])
    return [first, vs4]


def current(sub):
    return [[node.strategy for node in pair["nodes"]] for pair in sub["pairs"]], sub["open"].strategy


def iterate(sub, t):
    """One CFR+ iteration: the opener's nodes update together first, then each defender's in
    seat order, each against the strategies as they then stand."""
    strategies, s_open = current(sub)
    for node, cf, _, reach in opener_cf(sub, strategies, s_open):
        node.update(cf, reach, t)
    for j in range(len(sub["pairs"])):
        strategies, s_open = current(sub)
        for node, cf, _, reach in defender_cf(sub, strategies, s_open, j):
            node.update(cf, reach, t)


# --------------------------------------------------------------- OUTPUT


def every_cf(sub, strategies, s_open, plain=False):
    out = opener_cf(sub, strategies, s_open, plain)
    for j in range(len(sub["pairs"])):
        out += defender_cf(sub, strategies, s_open, j, plain)
    return out


def ev_rows(cf, norm, cf_plain, norm_plain):
    """EV per hand and action: the counterfactual value over the opponent reach, or over the
    plain deal for a hand that no opposing hand reaches."""
    reached = norm > 0
    safe = np.where(reached, norm, 1)[:, None]
    return np.where(reached[:, None], cf / safe, cf_plain / norm_plain[:, None])


def valued(sub):
    """Every node of the subtree in the key's shape (KEY-SPEC.md 7.1), from the average
    strategies. reach is conditional on the opener's open decision being reached."""
    strategies, s_open = [[n.average() for n in pair["nodes"]] for pair in sub["pairs"]], sub["open"].average()
    real = every_cf(sub, strategies, s_open)
    plain = every_cf(sub, strategies, s_open, plain=True)
    nodes = {}
    for (node, cf, norm, own), (_, cf_plain, norm_plain, _) in zip(real, plain):
        hand_reach = own * norm
        nodes[node.id] = {
            "actor": node.actor, "actions": node.actions, "totals": node.totals,
            "reach": hand_reach.sum(), "strategy": node.average(),
            "ev": ev_rows(cf, norm, cf_plain, norm_plain), "hand_reach": hand_reach,
        }
    return nodes


def solve(game, opener, E, W, iterations, report=()):
    """Run CFR+ on one opener's subtree. At each iteration count in report, measure every seat's
    best-response gain against the average strategy and keep it. Returns the key-shaped nodes
    and {iterations: {seat: gain}}."""
    sub = build(game, opener, E, W)
    gains = {}
    for t in range(1, iterations + 1):
        iterate(sub, t)
        if t in report:
            gains[t] = best_response.gains(valued(sub), game, E, W, opener)
    return valued(sub), gains


def fold_rate(nodes, game, opener, p):
    """The range-average fold frequency at the opener's open node under the plain deal: the one
    number a seat's fold enters the reach of the seats behind it as (KEY-SPEC.md 3.3)."""
    return (p * nodes[node_id(game, opener)]["strategy"][:, 0]).sum()


def scaled(part, chain):
    """A subtree's nodes with reach and hand_reach per dealt hand: the values conditional on the
    opener's open decision, times the chance that every seat before the opener folds."""
    for node in part.values():
        node["reach"] = chain * node["reach"]
        node["hand_reach"] = chain * node["hand_reach"]
    return part


def tally(totals, gains, chain, seats):
    """Add a subtree's gains at each iteration count, times its reach, to the seats' totals."""
    for t, by_seat in gains.items():
        total = totals.setdefault(t, dict.fromkeys(seats, 0.0))
        for seat, gain in by_seat.items():
            total[seat] += chain * gain


def chained(parts, game, p):
    """The solved subtrees, (opener, nodes, gains) in seat order and each conditional on its root,
    put per dealt hand. Returns (nodes, {iterations: {seat: gain}}, {opener: reach})."""
    nodes, totals, reach, chain = {}, {}, {}, 1.0
    for opener, part, gains in parts:
        nodes.update(scaled(part, chain))
        reach[opener] = chain
        tally(totals, gains, chain, game["seats"])
        chain *= fold_rate(part, game, opener, p)
    return nodes, totals, reach


def solve_tree(game, E, W, iterations, report=()):
    """Solve every opener's subtree in seat order (the last seat never opens) and return the whole
    tree per dealt hand, as chained does."""
    parts = [(o, *solve(game, o, E, W, iterations, report)) for o in game["seats"][:-1]]
    return chained(parts, game, W.sum(axis=1) / W.sum())


def measure(nodes, game, E, W, kind, args):
    """One band's number, in percent: a rate of hands by the plain deal (a published range's
    percentage), a rate of the opening range at a vs3 node, or the realization of 8.2."""
    p = W.sum(axis=1) / W.sum()
    if kind == "open":
        return 100 * (p * nodes[node_id(game, *args)]["strategy"][:, 1]).sum()
    if kind == "defend":
        opener, defender, columns = args
        return 100 * (p * nodes[node_id(game, opener, defender, 1)]["strategy"][:, list(columns)].sum(axis=1)).sum()
    if kind == "vs3":
        opener, defender, column = args
        opens = p * nodes[node_id(game, opener)]["strategy"][:, 1]
        return 100 * (opens * nodes[node_id(game, opener, defender, 2)]["strategy"][:, column]).sum() / opens.sum()
    return 100 * realization(nodes, game, E, W, *args)


def realization(nodes, game, E, W, opener, defender):
    """The defender's realized share of its raw equity when it flats the open, averaged over the
    deals where the opener opens and the defender calls (KEY-SPEC.md 8.2, the last table)."""
    pair = pair_of(game, opener, defender)
    share = shares(pair, E, game["leaf_model"])[0]
    weight = W / W.sum() * nodes[node_id(game, opener)]["strategy"][:, 1][:, None]
    weight = weight * nodes[pair["ids"][0]]["strategy"][:, 1][None, :]
    return (weight * share).sum() / (weight * E.T).sum()


def band_lines(nodes, game, E, W):
    lines = []
    for label, kind, args, floor, ceiling in BANDS:
        value = measure(nodes, game, E, W, kind, args)
        verdict = "inside" if floor <= value <= ceiling else "MISSED"
        lines.append(f"{label:24s} {value:6.1f}  band {floor} to {ceiling}  {verdict}")
    return lines


def number(x, places):
    """A number at the precision of KEY-SPEC.md 7.4, never written as negative zero."""
    return format(round(float(x), places) + 0.0, f".{places}f")


def rows(table, places):
    return "[" + ",".join("[" + ",".join(number(x, places) for x in row) + "]" for row in table) + "]"


def node_json(node):
    """One node of KEY-SPEC.md 7.1: frequencies and EVs to four places, the reaches to six."""
    head = json.dumps({"actor": node["actor"], "actions": node["actions"], "totals": node["totals"]})
    return (
        head[:-1] + ', "reach": ' + number(node["reach"], 6)
        + ', "strategy": ' + rows(node["strategy"], 4) + ', "ev": ' + rows(node["ev"], 4)
        + ', "hand_reach": [' + ",".join(number(x, 6) for x in node["hand_reach"]) + "]}"
    )


def render_key(nodes, gains, iterations, sha, game=GAME):
    """The key file of KEY-SPEC.md 7.1 and 7.4, one node per line. seed is 1 and nothing reads
    it: the solver has no random source."""
    by_seat = ", ".join(f'"{s}": {number(g, 6)}' for s, g in gains.items())
    solver = (
        f'{{"method": "CFR+", "iterations": {iterations}, "exploitability_bb": {{{by_seat}}}, '
        f'"seed": 1, "date": "{DATE}", "equity_table_sha256": "{sha}"}}'
    )
    body = ",\n".join(json.dumps(i) + ": " + node_json(n) for i, n in nodes.items())
    return (
        f'{{\n"schema": "{SCHEMA}",\n"spec_hash": "{spec_hash(game)}",\n"game": ' + json.dumps(game)
        + ',\n"solver": ' + solver + ',\n"hands": ' + json.dumps(HANDS) + ',\n"nodes": {\n' + body + "\n}\n}\n"
    )


def write(name, content):
    """The one write path (rule W1): <OUT>/<name>.json."""
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        f.write(content)
    return 1


def below_floor(nodes):
    """The ids of the nodes the grader treats as never reached (KEY-SPEC.md 7.1)."""
    return [i for i, n in nodes.items() if n["reach"] < REACH_FLOOR]


def gain_lines(totals, reach):
    lines = []
    for t, seats in totals.items():
        verdict = "under" if max(seats.values()) <= GTO_EXPLOITABILITY_BB else "OVER"
        lines.append(f"{t} iterations: " + "  ".join(f"{s} {g:.6f}" for s, g in seats.items()) + f"  ({verdict} {GTO_EXPLOITABILITY_BB})")
    return lines + ["subtree reach: " + "  ".join(f"{o} {r:.4f}" for o, r in reach.items())]


def main():
    E, W, sha = load_equity()
    checks = (ITERATIONS // 4, ITERATIONS // 2, ITERATIONS)
    nodes, totals, reach = solve_tree(GAME, E, W, ITERATIONS, checks)
    gains = best_response.tree_gains(nodes, GAME, E, W)
    print("\n".join(gain_lines(totals, reach)))
    print("best response over the tree: " + "  ".join(f"{s} {g:.6f}" for s, g in gains.items()))
    print("\n".join(band_lines(nodes, GAME, E, W)))
    pairs = [i for i, h in enumerate(HANDS) if len(h) == 2]
    print(f"BTN opens its pairs at least {100 * nodes[node_id(GAME, 'BTN')]['strategy'][pairs, 1].min():.1f} percent")
    below = below_floor(nodes)
    print(f"{len(below)} nodes under REACH_FLOOR {REACH_FLOOR}: " + ", ".join(below))
    n = write("key", render_key(nodes, gains, ITERATIONS, sha))
    print(f"wrote {n} file to {os.path.abspath(OUT)}: {len(nodes)} nodes; spec_hash {spec_hash(GAME)}; equity_table_sha256 {sha}")


if __name__ == "__main__":
    main()
