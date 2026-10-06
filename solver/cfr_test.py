"""Tests of solver/cfr.py: the game it builds from config.py against KEY-SPEC.md, read by hand,
and the solver on a toy tree whose equilibrium was worked by hand.

No test reads its answer from the solver: the leaf payoffs are the worked numbers of KEY-SPEC.md
2.5 and 3.2 at the dials' starting values, the fold payoffs are the table of 2.5, the node ids
are the examples of 7.2, and the toy's equilibrium is derived below. The tree tests put the
fold chain and the per-dealt-hand arithmetic on hand-made parts, the key file's shape through
validate_key.validate and the rounding of 7.4 on a row that sums to 1 only after rounding; one
cross-check runs the two modules' fold chains against each other on a cut of the real game.
Run: python3 -m unittest discover -s solver -p '*_test.py'
"""

import copy
import json
import re
import unittest

import numpy as np

import best_response
import cfr
from config import DIAL_PATH, GAME, RANGES
from validate_key import HANDS, check_sums, spec_hash, validate

SPEC_HASH = "659cdfd1072b0ea27a0b74737ce6f3a67c63a329ed18595c6f1f8233ffe845a7"

# Opener hands are rows, defender hands columns: E[h][g] is the opener's equity.
E3 = np.array([[0.5, 0.7, 0.4], [0.3, 0.5, 0.45], [0.6, 0.55, 0.5]])
# Legend: (opener, defender, leaf index, opener hand, defender hand) -> (to opener, to defender).
# srp: BB flats a BTN open with 30 percent equity, c_srp 0.7, k 2: the share 0.1971 of 5.5.
# srp: BTN flats a CO open at 50 percent equity, c_srp_oop 0.3, taxed 0.1: 0.4625 of 0.9 x 6.5.
# 3bp: SB calls a BB 3-bet to 9 with 40 percent equity, c_3bp 0.4: 0.3424 of 18.
# 4bp: SB calls a BTN 4-bet to 22 with 45 percent equity, c_4bp 0.2: 0.422775 of 45.
# all-in: UTG against HJ with 70 percent equity: 0.7 x 201.5 - 100.
LEAF_CASES = {
    ("BTN", "BB", 0, 0, 1): (1.91595, -1.41595),
    ("CO", "BTN", 0, 0, 0): (0.644375, 0.205625),
    ("SB", "BB", 1, 0, 2): (-2.8368, 2.8368),
    ("BTN", "SB", 2, 2, 1): (3.975125, -2.975125),
    ("UTG", "HJ", 3, 0, 1): (41.05, -39.55),
}
# Legend: row -> (all fold, opener folds to the 3-bet, defender folds to the 4-bet, opener folds
# to the 5-bet): what the winner takes, KEY-SPEC.md 2.5.
FOLD_WINS = {
    ("UTG", "HJ"): (1.5, 4, 9, 21.5),
    ("BTN", "SB"): (1.5, 3.5, 11, 23),
    ("CO", "BB"): (1.5, 3, 10.5, 22.5),
    ("SB", "BB"): (1, 3, 9, 23),
}
POTS = {("UTG", "HJ"): (6.5, 16.5, 41.5, 201.5), ("BTN", "SB"): (6, 21, 45, 201), ("CO", "BB"): (5.5, 20.5, 44.5, 200.5), ("SB", "BB"): (6, 18, 46, 200)}

# A toy: hand N always beats hand D, both dealt alike with no card removal, no bending, no tax.
# The seat X posts 6 and folds, so the opener O plays the defender D for 6 of dead money with an
# open of 1 and a 3-bet that is all-in at 2 (the 4-bet and the 5-bet add nothing). Worked by hand:
# O opens both hands. D jams N. With D it calls 0.75 and jams 0.25, the jam frequency that leaves
# O's D indifferent between folding and calling the jam (-2 against N, +3 against D, N four times
# as often as D in the jam range). O continues with N and continues 0.75 with D, the frequency
# that leaves D's D indifferent between calling (1.0) and jamming (1.0). EVs at the open: N 5.125,
# D 0.5; at D's first node: N [0, 5, 5.375], D [0, 1, 1]. Total 6, the dead money.
TOY = {
    "seats": ["X", "O", "D"],
    "postflop_order": ["X", "O", "D"],
    "blinds_bb": {"X": 6},
    "ante_bb": 0,
    "sizes_bb": {"ip_defender": {"open": 1, "3bet": 2, "4bet": 2, "5bet": 2}},
    "leaf_model": {
        "k": 2,
        "c_edge_in_position": {"srp": 0, "3bp": 0, "4bp": 0, "all_in": 0},
        "c_edge_out_of_position": {"srp": 0, "3bp": 0, "4bp": 0, "all_in": 0},
        "flat_tax": {"ip": 0, "sb": 0, "bb": 0},
    },
}
TOY_E = np.array([[0.5, 1.0], [0.0, 0.5]])
TOY_W = np.ones((2, 2))
# The toy with no seat before the opener, so its ids lose the "X:fold" prefix and the tree is the
# one subtree; X's blind is still the dead money. The equilibrium and the timid profile are the
# ones best_response_test.py works by hand, row by row in the order of best_response.ids.
TOY_TWO = {**TOY, "seats": ["O", "D"], "postflop_order": ["O", "D"]}
EQUILIBRIUM_ROWS = [[[0, 1], [0, 1]], [[0, 0, 1], [0, 0.75, 0.25]], [[0, 1, 0], [0.25, 0.75, 0]], [[0, 1, 0], [0, 1, 0]], [[0, 1], [0, 1]]]
TIMID_ROWS = [[[0, 1], [0, 1]], [[0, 0, 1], [1, 0, 0]], [[0, 1, 0], [1, 0, 0]], [[0, 1, 0], [0, 1, 0]], [[0, 1], [0, 1]]]
# A three-seat cut of the real game, so a tree of two subtrees solves in about a second; the
# rows, the dead money and the node ids follow from the seats as they do in GAME.
MINI = {**GAME, "seats": ["BTN", "SB", "BB"], "postflop_order": ["SB", "BB", "BTN"]}


def starting_game():
    """GAME with the leaf model at the starting values of RANGES, where the worked numbers live."""
    game = copy.deepcopy(GAME)
    for dial, (start, _, _) in RANGES.items():
        *path, last = DIAL_PATH[dial]
        target = game["leaf_model"]
        for key in path:
            target = target[key]
        target[last] = start
    return game


class GameTest(unittest.TestCase):
    def test_game_object_hashes_to_the_spec(self):
        self.assertEqual(spec_hash(GAME), SPEC_HASH)

    def test_rows_and_dead_money(self):
        pairs = [(o, d) for i, o in enumerate(GAME["seats"]) for d in GAME["seats"][i + 1:]]
        rows = [cfr.row_of(o, d) for o, d in pairs]
        self.assertEqual(len(pairs), 15)
        self.assertEqual([rows.count(r) for r in ("ip_defender", "sb_defender", "bb_defender", "sb_vs_bb")], [6, 4, 4, 1])
        self.assertEqual([cfr.pair_of(GAME, o, d)["dead"] for o, d in FOLD_WINS], [1.5, 1, 0.5, 0])

    def test_fold_payoffs_and_pots_match_section_2_5(self):
        for (opener, defender), wins in FOLD_WINS.items():
            pair = cfr.pair_of(GAME, opener, defender)
            a1, a2, a3, _ = cfr.amounts(pair["sizes"])
            sub = cfr.subtree_of(GAME, opener)
            self.assertEqual((sub["all_fold"], pair["dead"] + a1, pair["dead"] + a2, pair["dead"] + a3), wins)
            self.assertEqual(tuple(2 * a + pair["dead"] for a in cfr.amounts(pair["sizes"])), POTS[opener, defender])
        self.assertEqual([cfr.subtree_of(GAME, s)["fold_o"] for s in GAME["seats"][:5]], [0, 0, 0, 0, -0.5])
        self.assertEqual([cfr.pair_of(GAME, "UTG", d)["fold_d"] for d in ("HJ", "SB", "BB")], [0, -0.5, -1])

    def test_position_and_tax_follow_the_rows(self):
        self.assertEqual([cfr.pair_of(GAME, o, d)["opener_ip"] for o, d in FOLD_WINS], [False, True, True, False])
        self.assertEqual([cfr.pair_of(GAME, "CO", d)["tax"] for d in ("BTN", "SB", "BB")], [0.1, 0.25, 0])

    def test_leaf_payoffs_match_the_hand_worked_cases_in_both_modules(self):
        game = starting_game()
        for (opener, defender, leaf, h, g), (to_o, to_d) in LEAF_CASES.items():
            with self.subTest(opener=opener, defender=defender, leaf=leaf):
                tables = cfr.leaf_tables(cfr.pair_of(game, opener, defender), E3, game["leaf_model"])
                self.assertAlmostEqual(tables["uo"][leaf][h, g], to_o, places=9)
                self.assertAlmostEqual(tables["ud"][leaf][h, g], to_d, places=9)
                other = best_response.payoffs(game, opener, defender, E3)
                self.assertAlmostEqual(other[leaf][0][h, g], to_o, places=9)
                self.assertAlmostEqual(other[leaf][1][h, g], to_d, places=9)

    def test_the_pot_is_conserved_at_every_leaf(self):
        game = starting_game()
        for opener, defender in FOLD_WINS:
            pair = cfr.pair_of(game, opener, defender)
            tables = cfr.leaf_tables(pair, E3, game["leaf_model"])
            pots = [2 * a + pair["dead"] for a in cfr.amounts(pair["sizes"])]
            total = [tables["uo"][i] + tables["ud"][i] for i in range(4)]
            self.assertTrue(np.allclose(total[0], pair["dead"] - pair["tax"] * pots[0]))
            for i in (1, 2, 3):
                self.assertTrue(np.allclose(total[i], pair["dead"]))

    def test_node_ids_match_the_spec_examples(self):
        self.assertEqual(cfr.node_id(GAME, "UTG"), "root")
        self.assertEqual(cfr.node_id(GAME, "HJ"), "UTG:fold")
        self.assertEqual(cfr.node_id(GAME, "SB"), "UTG:fold/HJ:fold/CO:fold/BTN:fold")
        self.assertEqual(cfr.node_id(GAME, "UTG", "BB", 1), "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold")
        self.assertEqual(cfr.node_id(GAME, "UTG", "BB", 2), "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet")
        self.assertEqual(cfr.node_id(GAME, "UTG", "BB", 4), "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet/UTG:4bet/BB:5bet")
        self.assertEqual(cfr.node_id(GAME, "CO", "BTN", 1), "UTG:fold/HJ:fold/CO:open")
        self.assertEqual(cfr.node_id(GAME, "CO", "BTN", 2), "UTG:fold/HJ:fold/CO:open/BTN:3bet")
        for opener, defender in FOLD_WINS:
            expected = [cfr.node_id(GAME, opener)] + [cfr.node_id(GAME, opener, defender, k) for k in range(1, 5)]
            self.assertEqual(best_response.ids(GAME, opener, defender), expected)

    def test_the_subtree_nodes_count_and_actions(self):
        nodes = sum((cfr.subtree_of(GAME, s)["pairs"] for s in GAME["seats"][:5]), [])
        self.assertEqual(len(nodes), 15)
        sub = cfr.build(GAME, "BTN", np.full((169, 169), 0.5), np.ones((169, 169)))
        ids = [sub["open"].id] + [n.id for pair in sub["pairs"] for n in pair["nodes"]]
        self.assertEqual(len(ids), 9)
        self.assertEqual(len(set(ids)), 9)
        self.assertEqual(sub["pairs"][1]["nodes"][0].totals, [None, 2.5, 10])
        self.assertEqual(sub["open"].totals, [None, 2.5])


class ToyTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.nodes, cls.gains = cfr.solve(TOY, "O", TOY_E, TOY_W, 4000, report=(2000, 4000))
        cls.first = cls.nodes["X:fold/O:open"]
        cls.vs3 = cls.nodes["X:fold/O:open/D:3bet"]

    def test_the_opener_opens_both_hands(self):
        self.assertTrue(np.allclose(self.nodes["X:fold"]["strategy"], [[0, 1], [0, 1]], atol=1e-3))
        self.assertTrue(np.allclose(self.nodes["X:fold"]["ev"][:, 1], [5.125, 0.5], atol=2e-3))

    def test_the_defender_jams_the_nuts_and_mixes_the_air(self):
        self.assertTrue(np.allclose(self.first["strategy"], [[0, 0, 1], [0, 0.75, 0.25]], atol=1e-2))
        self.assertTrue(np.allclose(self.first["ev"], [[0, 5, 5.375], [0, 1, 1]], atol=2e-3))

    def test_the_opener_bluff_catches_three_quarters(self):
        keep = self.vs3["strategy"][:, 1:].sum(axis=1)
        self.assertTrue(np.allclose(keep, [1, 0.75], atol=1e-2))
        self.assertTrue(np.allclose(self.vs3["ev"][1], [-1, -1, -1], atol=2e-3))
        self.assertAlmostEqual(self.vs3["ev"][0, 1], 4.0, delta=2e-3)

    def test_nobody_gains_against_the_average_strategy_and_it_keeps_falling(self):
        self.assertLess(max(self.gains[4000].values()), 2e-3)
        self.assertLess(max(self.gains[4000].values()), max(self.gains[2000].values()))

    def test_reach_and_fold_ev_follow_the_key_rules(self):
        self.assertAlmostEqual(self.nodes["X:fold"]["reach"], 1.0)
        self.assertAlmostEqual(self.first["reach"], 1.0, delta=1e-3)
        self.assertAlmostEqual(self.vs3["reach"], 0.625, delta=5e-3)
        self.assertTrue(np.allclose(self.first["ev"][:, 0], 0))
        self.assertTrue(np.allclose(self.vs3["ev"][:, 0], -1))


def profile(rows):
    return {i: {"strategy": np.array(r, dtype=np.float64)} for i, r in zip(best_response.ids(TOY_TWO, "O", "D"), rows)}


def chained_toy():
    """Hand-made parts of the toy through the chain: X folds half its hands by the deal, so O's
    subtree is reached half the time, and X's own subtree is reached always."""
    p = np.array([0.5, 0.5])
    x_part = {"root": {"strategy": np.array([[0, 1], [1, 0]]), "reach": 1.0, "hand_reach": p.copy()}}
    o_part = {
        "X:fold": {"strategy": np.array([[0, 1], [0, 1]]), "reach": 1.0, "hand_reach": p.copy()},
        "X:fold/O:open": {"strategy": np.array([[0, 0, 1], [0, 0.75, 0.25]]), "reach": 0.8, "hand_reach": np.array([0.5, 0.3])},
    }
    parts = [("X", x_part, {4: {"X": 0.1, "O": 0.2, "D": 0.4}}), ("O", o_part, {4: {"O": 0.3, "D": 0.5}})]
    return cfr.chained(parts, TOY, p)


class TreeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.E, cls.W, cls.sha = cfr.load_equity()
        cls.p = cls.W.sum(axis=1) / cls.W.sum()
        cls.nodes, cls.totals, cls.reach = cfr.solve_tree(MINI, cls.E, cls.W, 300, report=(300,))

    def test_the_fold_rate_is_the_range_average_fold_frequency(self):
        part = {"root": {"strategy": np.array([[0, 1], [1, 0]])}}
        self.assertAlmostEqual(cfr.fold_rate(part, TOY, "X", np.array([0.5, 0.5])), 0.5)
        self.assertAlmostEqual(cfr.fold_rate(part, TOY, "X", np.array([0.2, 0.8])), 0.8)

    def test_the_chain_puts_the_gains_per_dealt_hand(self):
        # The gains of the seats in O's subtree are halved; X's are not.
        _, totals, reach = chained_toy()
        self.assertEqual(reach, {"X": 1.0, "O": 0.5})
        self.assertEqual(list(totals), [4])
        for seat, expected in {"X": 0.1, "O": 0.35, "D": 0.65}.items():
            self.assertAlmostEqual(totals[4][seat], expected, places=12)

    def test_the_chain_scales_each_subtree_by_its_reach(self):
        nodes, _, _ = chained_toy()
        self.assertEqual(nodes["root"]["reach"], 1.0)
        self.assertEqual(nodes["X:fold"]["reach"], 0.5)
        self.assertEqual(nodes["X:fold/O:open"]["reach"], 0.4)
        self.assertTrue(np.allclose(nodes["root"]["hand_reach"], [0.5, 0.5]))
        self.assertTrue(np.allclose(nodes["X:fold/O:open"]["hand_reach"], [0.25, 0.15]))

    def test_tree_gains_on_the_two_seat_toy_are_the_hand_worked_gains(self):
        self.assertEqual(best_response.ids(TOY_TWO, "O", "D")[:2], ["root", "O:open"])
        at_equilibrium = best_response.tree_gains(profile(EQUILIBRIUM_ROWS), TOY_TWO, TOY_E, TOY_W)
        self.assertEqual(list(at_equilibrium), ["O", "D"])
        self.assertAlmostEqual(at_equilibrium["O"], 0, places=12)
        self.assertAlmostEqual(at_equilibrium["D"], 0, places=12)
        timid = best_response.tree_gains(profile(TIMID_ROWS), TOY_TWO, TOY_E, TOY_W)
        self.assertAlmostEqual(timid["D"], 1.25, places=12)
        self.assertAlmostEqual(timid["O"], 0, places=12)

    def test_the_two_modules_agree_on_the_chain_over_a_cut_of_the_real_game(self):
        self.assertEqual(len(self.nodes), 14)
        self.assertEqual(self.reach["BTN"], 1.0)
        self.assertAlmostEqual(self.reach["SB"], cfr.fold_rate(self.nodes, MINI, "BTN", self.p), places=12)
        self.assertLess(self.reach["SB"], 0.7)
        gains = best_response.tree_gains(self.nodes, MINI, self.E, self.W)
        for seat in MINI["seats"]:
            self.assertAlmostEqual(gains[seat], self.totals[300][seat], places=12)
        self.assertLess(max(gains.values()), 0.005)

    def test_the_key_file_has_the_shape_of_the_spec(self):
        text = cfr.render_key(self.nodes, self.totals[300], 300, self.sha, MINI)
        key = json.loads(text)
        self.assertEqual(validate(key), [])
        self.assertEqual((key["schema"], key["spec_hash"], key["hands"], key["game"]), ("felto-gto-key/1", spec_hash(MINI), HANDS, MINI))
        solver = key["solver"]
        self.assertEqual((solver["method"], solver["iterations"], solver["seed"], solver["date"]), ("CFR+", 300, 1, cfr.DATE))
        self.assertEqual((solver["equity_table_sha256"], list(solver["exploitability_bb"])), (self.sha, MINI["seats"]))
        self.assertEqual(list(key["nodes"]), list(self.nodes))
        node = key["nodes"]["root"]
        self.assertEqual((node["actor"], node["actions"], node["totals"], node["reach"]), ("BTN", ["fold", "open"], [None, 2.5], 1.0))
        self.assertEqual((len(node["strategy"]), len(node["ev"]), len(node["hand_reach"])), (169, 169, 169))
        self.assertAlmostEqual(sum(node["hand_reach"]), 1.0, delta=1e-4)
        self.assertIsNone(re.search(r"-0\.0+[,\]}]", text))
        self.assertEqual(len(text.splitlines()), len(self.nodes) + 9)

    def test_the_rounding_of_7_4(self):
        self.assertEqual([cfr.number(x, 4) for x in (1 / 3, -1e-9, 5.125, -1.0, 2 / 3)], ["0.3333", "0.0000", "5.1250", "-1.0000", "0.6667"])
        self.assertEqual(cfr.number(0.123456789, 6), "0.123457")
        # Three thirds written to four places sum to 0.9999, inside the validator's tolerance.
        rendered = cfr.rows(np.array([[1 / 3, 1 / 3, 1 / 3]]), 4)
        self.assertEqual(rendered, "[[0.3333,0.3333,0.3333]]")
        self.assertEqual(check_sums("n", json.loads(rendered) * len(HANDS)), [])
        self.assertEqual(len(check_sums("n", [[0.3333, 0.3333, 0.3323]] * len(HANDS))), len(HANDS))

    def test_nodes_under_the_reach_floor_are_listed(self):
        nodes = {"a": {"reach": 0.5}, "b": {"reach": 0.00009}, "c": {"reach": 0.0001}}
        self.assertEqual(cfr.below_floor(nodes), ["b"])


if __name__ == "__main__":
    unittest.main()
