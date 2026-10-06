"""Tests of solver/best_response.py on strategies written by hand for the toy of cfr_test.py.

The gains below were worked by hand, not read from the solver: one profile that a seat can
exploit by a known amount, and the toy's equilibrium, which no seat can exploit.
Run: python3 -m unittest discover -s solver -p '*_test.py'
"""

import unittest

import numpy as np

import best_response
from cfr_test import TOY, TOY_E, TOY_W

IDS = ["X:fold", "X:fold/O:open", "X:fold/O:open/D:3bet", "X:fold/O:open/D:3bet/O:4bet",
       "X:fold/O:open/D:3bet/O:4bet/D:5bet"]


def profile(*rows):
    return {node_id: {"strategy": np.array(rows[i], dtype=np.float64)} for i, node_id in enumerate(IDS)}


# The equilibrium of the toy (cfr_test.py): O opens both; D jams N, and with D calls 0.75 and
# jams 0.25; O continues with N and with D 0.75; below that nobody folds.
EQUILIBRIUM = profile(
    [[0, 1], [0, 1]],
    [[0, 0, 1], [0, 0.75, 0.25]],
    [[0, 1, 0], [0.25, 0.75, 0]],
    [[0, 1, 0], [0, 1, 0]],
    [[0, 1], [0, 1]],
)
# D folds its air and jams the nuts; O opens both and folds its air to the jam. D's air then
# earns 0 where a jam earns 2.5 (-2 against N, +7 against D) and a call 1 (-1 against N, +3
# against D): the best response gains 2.5 on half the deals, 1.25 bb per hand. O has nothing
# to gain: its air cannot call a jam that is always the nuts.
TIMID = profile(
    [[0, 1], [0, 1]],
    [[0, 0, 1], [1, 0, 0]],
    [[0, 1, 0], [1, 0, 0]],
    [[0, 1, 0], [0, 1, 0]],
    [[0, 1], [0, 1]],
)


class BestResponseTest(unittest.TestCase):
    def test_the_timid_defender_leaves_a_known_gain(self):
        gains = best_response.gains(TIMID, TOY, TOY_E, TOY_W, "O")
        self.assertAlmostEqual(gains["D"], 1.25, places=12)
        self.assertAlmostEqual(gains["O"], 0, places=12)

    def test_nobody_gains_at_the_equilibrium(self):
        gains = best_response.gains(EQUILIBRIUM, TOY, TOY_E, TOY_W, "O")
        self.assertAlmostEqual(gains["O"], 0, places=12)
        self.assertAlmostEqual(gains["D"], 0, places=12)

    def test_an_opener_that_folds_the_nuts_gains_by_opening_it(self):
        # O folds N and opens D: opening N earns at least the all-fold money against D's folds
        # and the pot against the rest, so the gain is the whole value of opening N, 5.125 x 0.5.
        folded = profile([[1, 0], [0, 1]], [[0, 0, 1], [0, 0.75, 0.25]], [[0, 1, 0], [0.25, 0.75, 0]], [[0, 1, 0], [0, 1, 0]], [[0, 1], [0, 1]])
        gains = best_response.gains(folded, TOY, TOY_E, TOY_W, "O")
        self.assertAlmostEqual(gains["O"], 0.5 * 5.125, places=12)

    def test_the_fold_chain_is_the_range_average_fold_frequency(self):
        P = TOY_W / TOY_W.sum()
        self.assertTrue(np.allclose(best_response.fold_chain(TIMID, TOY, "O", P), [1.0, 0.5]))
        self.assertTrue(np.allclose(best_response.fold_chain(EQUILIBRIUM, TOY, "O", P), [1.0, 0.0]))


if __name__ == "__main__":
    unittest.main()
