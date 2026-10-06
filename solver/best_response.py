"""Measure how much each seat gains by deviating from a strategy of the GTO trainer's game.

For one opener's subtree (KEY-SPEC.md 2.2) and a strategy in the key's shape (section 7.1: a dict
from node id to a node with "strategy" rows), a seat's best response is the most it can win, in
big blinds per hand, when every other seat plays the strategy and it plays what it likes at its
own nodes; its gain is that less what the strategy itself wins it. Every seat's gain at or under
the dial GTO_EXPLOITABILITY_BB is the stop rule of phases 3a and 3b. The numbers are conditional
on the hand reaching the opener's open decision, which is the stricter reading.

This file is written apart from cfr.py on purpose (PLAN.md phase 3a, step 3): it builds the leaf
payoffs and the node ids its own way from GAME and the equity table, and walks one seat's nodes
by backward induction over counterfactual values, so a bug in the solver has nowhere to hide
here. The two files share only config.py, validate_key.py and the equity file.
"""

import numpy as np

from config import GAME

SIZES = ("open", "3bet", "4bet", "5bet")


# ------------------------------------------------------------- THE GAME


def row(opener, defender):
    if opener == "SB":
        return "sb_vs_bb"
    return {"SB": "sb_defender", "BB": "bb_defender"}.get(defender, "ip_defender")


def ids(game, opener, defender):
    """The five node ids of a pair (KEY-SPEC.md 7.2): the opener's open node, the defender's
    first decision, the opener facing the 3-bet, the defender facing the 4-bet, the opener
    facing the 5-bet."""
    seats = game["seats"]
    before = [s + ":fold" for s in seats[:seats.index(opener)]]
    between = [s + ":fold" for s in seats[seats.index(opener) + 1:seats.index(defender)]]
    first = before + [opener + ":open"] + between
    later = [defender + ":3bet", opener + ":4bet", defender + ":5bet"]
    return ["/".join(before) or "root"] + ["/".join(first + later[:k]) for k in range(4)]


def realized(e, c, k):
    return e - c * e * (1 - e) ** k


def split(pot, e_caller, c, k, keep=1):
    """The caller's and the raiser's shares of a pot with chips behind: the caller keeps its bent
    share and the raiser the rest, both after the flat tax where it applies."""
    caller = realized(e_caller, c, k) * keep * pot
    return caller, keep * pot - caller


def c_of(leaf, holder_ip, pot):
    """The c of KEY-SPEC.md 3.2 for a pot whose edge holder is in or out of position."""
    return leaf["c_edge_in_position" if holder_ip else "c_edge_out_of_position"][pot]


def stakes(game, opener, defender):
    """(open, 3-bet, 4-bet, stack, dead money, opener in position, share kept after the tax)."""
    order = game["postflop_order"]
    a1, a2, a3, stack = (game["sizes_bb"][row(opener, defender)][s] for s in SIZES)
    dead = sum(v for s, v in game["blinds_bb"].items() if s not in (opener, defender))
    tax = game["leaf_model"]["flat_tax"]["sb" if defender == "SB" else "bb" if defender == "BB" else "ip"]
    return a1, a2, a3, stack, dead, order.index(opener) > order.index(defender), 1 - tax


def payoffs(game, opener, defender, E):
    """(to the opener, to the defender) at the four board leaves of KEY-SPEC.md 2.5 and 3, in the
    order single raised pot, 3-bet pot, 4-bet pot, all-in, by opener hand (rows) and defender
    hand (columns). The edge holder is the player whose raise was called."""
    leaf, k = game["leaf_model"], game["leaf_model"]["k"]
    a1, a2, a3, stack, dead, opener_ip, keep = stakes(game, opener, defender)
    to_d, to_o = split(2 * a1 + dead, E.T, c_of(leaf, opener_ip, "srp"), k, keep)
    srp = (to_o - a1, to_d - a1)
    to_o, to_d = split(2 * a2 + dead, E, c_of(leaf, not opener_ip, "3bp"), k)
    threebet = (to_o - a2, to_d - a2)
    to_d, to_o = split(2 * a3 + dead, E.T, c_of(leaf, opener_ip, "4bp"), k)
    all_in = 2 * stack + dead
    return [srp, threebet, (to_o - a3, to_d - a3), (E * all_in - stack, E.T * all_in - stack)]


# -------------------------------------------------------- BEST RESPONSE


def rows(w, *terms):
    """Counterfactual values by row: Σ over the columns of the opponent reach times a value."""
    return np.stack([(w * t).sum(axis=1) for t in terms], axis=1)


def cols(w, *terms):
    return np.stack([(w * t).sum(axis=0) for t in terms], axis=1)


def strategy(nodes, node_id):
    return np.asarray(nodes[node_id]["strategy"], dtype=np.float64)


def fold_chain(nodes, game, opener, P):
    """R_j for every defender behind the opener: the product of the range-average fold
    frequencies of the defenders before it, then the chance that all of them fold."""
    seats = game["seats"]
    p = P.sum(axis=1)
    folds = [(p * strategy(nodes, ids(game, opener, d)[1])[:, 0]).sum() for d in seats[seats.index(opener) + 1:]]
    return np.cumprod([1.0] + folds)


def best_and_current(cf, s, best_below, current_below, column):
    """Add the best and the current value of the node below to one action's counterfactual
    values, then take the best action and the strategy's own mix."""
    best, current = cf.copy(), cf.copy()
    best[:, column] += best_below
    current[:, column] += current_below
    return best.max(axis=1), (s * current).sum(axis=1)


def opener_pair(nodes, game, E, P, r, opener, defender):
    """The opener's best and current value from one pair, by opener hand, given that it opened:
    the flat leaf plus its vs3 node, which holds its vs5 node."""
    _, first, vs3, vs4, vs5 = (strategy(nodes, i) for i in ids(game, opener, defender))
    a1, a2, a3, _ = (game["sizes_bb"][row(opener, defender)][s] for s in SIZES)
    dead = sum(v for s, v in game["blinds_bb"].items() if s not in (opener, defender))
    u = payoffs(game, opener, defender, E)
    w2 = P * r * first[:, 2][None, :]
    w4 = w2 * vs4[:, 2][None, :]
    cf5 = rows(w4, -a3, u[3][0])
    best5, current5 = cf5.max(axis=1), (vs5 * cf5).sum(axis=1)
    cf3 = rows(w2, -a1, u[1][0], vs4[:, 0][None, :] * (dead + a2) + vs4[:, 1][None, :] * u[2][0])
    best3, current3 = best_and_current(cf3, vs3, best5, current5, 2)
    flat = r * (P * first[:, 1][None, :] * u[0][0]).sum(axis=1)
    return flat + best3, flat + current3


def opener_gain(nodes, game, E, P, opener):
    """What the opener gains by best-responding at its open, vs3 and vs5 nodes."""
    seats = game["seats"]
    behind = seats[seats.index(opener) + 1:]
    R = fold_chain(nodes, game, opener, P)
    p = P.sum(axis=1)
    best = current = p * R[-1] * sum(v for s, v in game["blinds_bb"].items() if s != opener)
    for defender, r in zip(behind, R):
        b, c = opener_pair(nodes, game, E, P, r, opener, defender)
        best, current = best + b, current + c
    fold = p * -game["blinds_bb"].get(opener, 0)
    s_open = strategy(nodes, ids(game, opener, behind[0])[0])
    return np.maximum(fold, best).sum() - (s_open[:, 0] * fold + s_open[:, 1] * current).sum()


def defender_gain(nodes, game, E, P, r, opener, defender):
    """What one defender gains by best-responding at its first and its vs4 node."""
    s_open, first, vs3, vs4, vs5 = (strategy(nodes, i) for i in ids(game, opener, defender))
    a1, a2, a3, _ = (game["sizes_bb"][row(opener, defender)][s] for s in SIZES)
    dead = sum(v for s, v in game["blinds_bb"].items() if s not in (opener, defender))
    u = payoffs(game, opener, defender, E)
    w1 = P * r * s_open[:, 1][:, None]
    w3 = w1 * vs3[:, 2][:, None]
    cf4 = cols(w3, -a2, u[2][1], vs5[:, 0][:, None] * (dead + a3) + vs5[:, 1][:, None] * u[3][1])
    best4, current4 = best_and_current(cf4, vs4, 0, 0, 0)
    fold = -game["blinds_bb"].get(defender, 0)
    cf1 = cols(w1, fold, u[0][1], vs3[:, 0][:, None] * (dead + a1) + vs3[:, 1][:, None] * u[1][1])
    best1, current1 = best_and_current(cf1, first, best4, current4, 2)
    return best1.sum() - current1.sum()


def gains(nodes, game, E, W, opener):
    """{seat: best-response gain in big blinds per hand} for the opener and every defender in
    its subtree, each given that the opener's open decision is reached."""
    P = W / W.sum()
    seats = game["seats"]
    behind = seats[seats.index(opener) + 1:]
    R = fold_chain(nodes, game, opener, P)
    out = {opener: opener_gain(nodes, game, E, P, opener)}
    for defender, r in zip(behind, R):
        out[defender] = defender_gain(nodes, game, E, P, r, opener, defender)
    return out
