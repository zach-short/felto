"""Tests of solver/data/equity.json, the table that solver/equity.py writes.

No test reads its answer from the file under test. Each compares the file with a fact or with a
number found here by other means: the deal weights with a count over the combinations listed
here, and ten matchups with a Monte Carlo run over random boards, scored by a plain seven-card
evaluator that shares no code with equity.py. The file imports the standard library only.
Run: python3 -m unittest discover -s solver -p '*_test.py'
"""

import json
import os
import random
import unittest

from validate_key import HANDS

DATA = os.path.join(os.path.dirname(__file__), "data", "equity.json")
RANK_CHARS = "23456789TJQKA"
# Exact enumeration: the only error is the rounding to six decimals.
BOUND = 0.0000005
SAMPLES = 200_000
# 200,000 samples give a standard error under 0.0012, so 0.01 is more than eight of them.
MC_BOUND = 0.01
SEED = 36
MATCHUPS = [
    ("AA", "KK"), ("AKs", "QQ"), ("AKo", "22"), ("72o", "AA"), ("JTs", "AKo"),
    ("55", "AKs"), ("AKs", "AKo"), ("T9s", "88"), ("A5s", "KQo"), ("KJs", "KTo"),
]


def combos(name):
    """The combinations of a class, each card 4 x rank + suit, rank 0 for a deuce."""
    high, low = RANK_CHARS.index(name[0]), RANK_CHARS.index(name[1])
    kind = "pair" if high == low else name[2]
    keep = {"pair": lambda a, b: a < b, "s": lambda a, b: a == b, "o": lambda a, b: a != b}[kind]
    return [(4 * high + a, 4 * low + b) for a in range(4) for b in range(4) if keep(a, b)]


def straight(ranks):
    """The top rank of the highest five ranks in a row, the ace high or low, or None."""
    present = set(ranks) | ({-1} if 12 in ranks else set())
    for top in range(12, 2, -1):
        if all(r in present for r in range(top - 4, top + 1)):
            return top
    return None


def unsuited_hand(ranks):
    counts = sorted(((ranks.count(r), r) for r in set(ranks)), reverse=True)
    (n1, r1), (n2, r2) = counts[0], counts[1]
    rest = lambda *drop: sorted((r for r in ranks if r not in drop), reverse=True)
    if n1 == 4:
        return (7, r1, rest(r1)[0])
    if n1 == 3 and n2 >= 2:
        return (6, r1, r2)
    if straight(ranks) is not None:
        return (4, straight(ranks))
    if n1 == 3:
        return (3, r1, *rest(r1)[:2])
    if n1 == 2:
        return (2, r1, r2, rest(r1, r2)[0]) if n2 == 2 else (1, r1, *rest(r1)[:3])
    return (0, *sorted(ranks, reverse=True)[:5])


def best_hand(cards):
    """The best five of seven cards as a tuple that compares as the hands do."""
    # Five cards of one suit leave two others, too few for quads or a full house, so a flush
    # is the best hand whenever there is one.
    for suit in range(4):
        suited = [c // 4 for c in cards if c % 4 == suit]
        if len(suited) >= 5:
            top = straight(suited)
            return (8, top) if top is not None else (5, *sorted(suited, reverse=True)[:5])
    return unsuited_hand([c // 4 for c in cards])


def monte_carlo(hero, villain, rng):
    """The equity of hero against villain over random deals that share no card."""
    hands, others = combos(hero), combos(villain)
    total = 0
    for _ in range(SAMPLES):
        h, v = rng.choice(hands), rng.choice(others)
        while set(h) & set(v):
            h, v = rng.choice(hands), rng.choice(others)
        board = rng.sample([c for c in range(52) if c not in h and c not in v], 5)
        a, b = best_hand([*h, *board]), best_hand([*v, *board])
        total += 2 if a > b else 1 if a == b else 0
    return total / (2 * SAMPLES)


class EquityTableTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(DATA) as f:
            cls.table = json.load(f)
        cls.E, cls.W = cls.table["E"], cls.table["W"]
        cls.at = {h: i for i, h in enumerate(HANDS)}

    def test_header_names_the_method_the_bound_and_the_order(self):
        meta = self.table["meta"]
        self.assertIn("exact enumeration", meta["method"])
        self.assertEqual(meta["bound"], BOUND)
        self.assertIn("app/src/cards/hand-class.ts", meta["hand_order"])
        self.assertEqual(self.table["hands"], HANDS)
        self.assertEqual(HANDS[:5] + HANDS[-1:], ["AA", "AKs", "AKo", "AQs", "AQo", "22"])

    def test_both_tables_are_169_by_169(self):
        for table in (self.E, self.W):
            self.assertEqual(len(table), 169)
            self.assertTrue(all(len(row) == 169 for row in table))
        self.assertTrue(all(0 <= x <= 1 for row in self.E for x in row))
        self.assertTrue(all(isinstance(x, int) and x > 0 for row in self.W for x in row))

    def test_equities_of_a_matchup_sum_to_one(self):
        for i in range(169):
            for j in range(169):
                self.assertLessEqual(abs(self.E[i][j] + self.E[j][i] - 1), 2 * BOUND + 1e-12)

    def test_a_class_against_itself_is_one_half(self):
        for i in range(169):
            self.assertLessEqual(abs(self.E[i][i] - 0.5), BOUND)

    def test_class_sizes(self):
        kinds = {"pair": [], "s": [], "o": []}
        for h in HANDS:
            kinds["pair" if len(h) == 2 else h[2]].append(len(combos(h)))
        self.assertEqual(kinds, {"pair": [6] * 13, "s": [4] * 78, "o": [12] * 78})
        every = [frozenset(c) for h in HANDS for c in combos(h)]
        self.assertEqual(len(set(every)), len(every))
        self.assertEqual(len(every), 13 * 6 + 78 * 4 + 78 * 12)
        self.assertEqual(len(every), 52 * 51 // 2)

    def test_deal_weights_are_symmetric_and_sum_by_class_size(self):
        self.assertEqual(sum(map(sum, self.W)), 1326 * 1225)
        for i, h in enumerate(HANDS):
            self.assertEqual(sum(self.W[i]), len(combos(h)) * 1225)
            self.assertEqual(self.W[i], [self.W[j][i] for j in range(169)])

    def test_deal_weights_match_a_count_made_here(self):
        sets = [[set(c) for c in combos(h)] for h in HANDS]
        count = [[sum(1 for c in a for d in b if not c & d) for b in sets] for a in sets]
        self.assertEqual(self.W, count)

    def test_ten_matchups_agree_with_a_monte_carlo_estimate(self):
        for k, (hero, villain) in enumerate(MATCHUPS):
            with self.subTest(hero=hero, villain=villain):
                estimate = monte_carlo(hero, villain, random.Random(SEED + k))
                table = self.E[self.at[hero]][self.at[villain]]
                self.assertAlmostEqual(table, estimate, delta=MC_BOUND)


if __name__ == "__main__":
    unittest.main()
