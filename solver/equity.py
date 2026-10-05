"""Build the preflop equity table and the deal weights that the GTO trainer's solver reads.

E[h][g] is the share of the pot that hand class h wins against class g when both hands see five
board cards with no more betting, a tie counting a half, averaged over every pair of
combinations of h and g that share no card and every board of five from the other 48 cards.
W[h][g] is the number of ordered pairs of combinations of h and g that share no card; the deal
probability of KEY-SPEC.md section 3.3 is W[h][g] / (1,326 x 1,225).

Method: exact enumeration with suit symmetry. Each of the 2,598,960 boards is mapped to the
least member of its class under the 24 permutations of the suits, and each of the 134,459
classes is scored once and counted by its size. That is exact, because a hand class is closed
under a suit permutation. On a board, a hand's value is the better of the best non-flush hand
of its seven ranks and its best flush. Wins and ties are integer counts, so the only error in
the file is the rounding of each equity to six decimals.

Hand order: allHandClasses() in app/src/cards/hand-class.ts:16-22, read here as HANDS from
solver/validate_key.py. Output: solver/data/equity.json, one file with E and W.
Run: python3 solver/equity.py
"""

import itertools
import json
import math
import os

import numpy as np

from validate_key import HANDS

OUT = os.path.join(os.path.dirname(__file__), "data")
DATE = "2026-10-05"
RANK_CHARS = "23456789TJQKA"
G = len(HANDS)
BOARDS_PER_PAIR = math.comb(48, 5)
PAIRS_TOTAL = 1326 * 1225
BOUND = 0.0000005
# A batch's weighted sums of 0, 1 and 2 stay under 2 ** 24 at 32 boards of weight at most 24,
# so float32 adds them exactly and the result does not depend on the order of the sum.
BATCH = 32
SUIT_LANE = np.int64(sum(1 << (4 * r) for r in range(13)))
SHAPE_CATEGORY = {(1, 1, 1, 1, 1): 0, (2, 1, 1, 1): 1, (2, 2, 1): 2, (3, 1, 1): 3, (3, 2): 6, (4, 1): 7}

META = {
    "date": DATE,
    "source": "solver/equity.py",
    "method": (
        "exact enumeration with suit symmetry: the 2,598,960 five-card boards in 134,459 classes "
        "under the 24 suit permutations, one board scored per class and counted by the class "
        "size; wins and ties counted as integers"
    ),
    "bound": BOUND,
    "bound_note": "the only error is the rounding of each equity to six decimals",
    "hand_order": "allHandClasses() in app/src/cards/hand-class.ts:16-22; HANDS in solver/validate_key.py",
    "E": (
        "E[h][g]: the share of the pot class h wins against class g over every pair of "
        "combinations that share no card and every board of five from the other 48 cards, "
        "a tie counting a half (KEY-SPEC.md 3.3)"
    ),
    "W": (
        "W[h][g]: the number of ordered pairs of combinations of h and g that share no card; "
        "the deal probability is W[h][g] / pairs_total (KEY-SPEC.md 3.3)"
    ),
    "boards_per_pair": BOARDS_PER_PAIR,
    "pairs_total": PAIRS_TOTAL,
}


# ----------------------------------------------------------- HAND CLASSES


def class_name(a, b):
    high, low = max(a // 4, b // 4), min(a // 4, b // 4)
    name = RANK_CHARS[high] + RANK_CHARS[low]
    if high == low:
        return name
    return name + ("s" if a % 4 == b % 4 else "o")


# A card is 4 x rank + suit, rank 0 for a deuce to 12 for an ace.
PAIRS = np.array(list(itertools.combinations(range(52), 2)), dtype=np.int64)
HAND_OF = np.array([HANDS.index(class_name(a, b)) for a, b in PAIRS.tolist()])
PAIR_MASK = (np.int64(1) << PAIRS).sum(axis=1)
PAIR_KEY = (5 ** (PAIRS // 4)).sum(axis=1)
SUITED_RANKS = np.stack(
    [np.where(PAIRS % 4 == s, np.int64(1) << (PAIRS // 4), 0).sum(axis=1) for s in range(4)]
)
PAIR_AT = np.full((52, 52), -1)
PAIR_AT[PAIRS[:, 0], PAIRS[:, 1]] = np.arange(len(PAIRS))
PAIR_AT[PAIRS[:, 1], PAIRS[:, 0]] = np.arange(len(PAIRS))
# Two combinations that share card x are (x, y) and (x, z): every such pair is one cell here.
TRIPLE_VALID = (PAIR_AT[:, :, None] >= 0) & (PAIR_AT[:, None, :] >= 0)
TRIPLE_CLASS = (HAND_OF[PAIR_AT][:, :, None] * G + HAND_OF[PAIR_AT][:, None, :])[TRIPLE_VALID]


# ------------------------------------------------------------- HAND VALUES


def straight_top(ranks):
    low = sorted(set(ranks))
    if len(low) != 5:
        return -1
    if low == [0, 1, 2, 3, 12]:
        return 3
    return low[4] if low[4] - low[0] == 4 else -1


def value5(ranks, flush):
    """One number that orders five-card hands: the category, then the tie-break ranks."""
    groups = sorted(((ranks.count(r), r) for r in dict.fromkeys(ranks)), reverse=True)
    top = straight_top(ranks)
    category = SHAPE_CATEGORY[tuple(n for n, _ in groups)]
    if top >= 0:
        category, digits = (8 if flush else 4), [top]
    else:
        category = 5 if flush else category
        digits = [r for n, r in groups for _ in range(n)]
    return category * 13**5 + sum(d * 13 ** (4 - i) for i, d in enumerate(digits))


def nonflush_table():
    """The best hand of every multiset of seven ranks, keyed by the sum of 5 ** rank."""
    keys, best = [], []
    for ranks in itertools.combinations_with_replacement(range(13), 7):
        if max(ranks.count(r) for r in ranks) > 4:
            continue
        keys.append(sum(5**r for r in ranks))
        best.append(max(value5(five, False) for five in itertools.combinations(ranks, 5)))
    order = np.argsort(keys)
    return np.array(keys, dtype=np.int64)[order], np.array(best, dtype=np.int64)[order]


def flush_table():
    """The best flush of five to seven ranks of one suit, by their 13-bit mask; else -1."""
    best = np.full(1 << 13, -1, dtype=np.int64)
    for mask in range(1 << 13):
        ranks = [r for r in range(13) if mask >> r & 1]
        if 5 <= len(ranks) <= 7:
            best[mask] = max(value5(five, True) for five in itertools.combinations(ranks, 5))
    return best


def values(boards, nf_key, nf_value, fl_value):
    """Each combination's best hand on each board; -1 where it shares a card with the board."""
    ranks, suits = boards // 4, boards % 4
    live = ((np.int64(1) << boards).sum(axis=1)[:, None] & PAIR_MASK) == 0
    key = (5**ranks).sum(axis=1)[:, None] + PAIR_KEY
    at = np.searchsorted(nf_key, key).clip(max=len(nf_key) - 1)
    if not (nf_key[at] == key)[live].all():
        raise SystemExit("a live hand's ranks are missing from the non-flush table")
    value = nf_value[at]
    for suit in range(4):
        mask = np.where(suits == suit, np.int64(1) << ranks, 0).sum(axis=1)
        value = np.maximum(value, fl_value[mask[:, None] | SUITED_RANKS[suit]])
    return np.where(live, value, -1).astype(np.int32)


# ------------------------------------------------------------- ENUMERATION


def board_classes():
    """The least board of each class under the 24 suit permutations, and the class sizes."""
    cards = itertools.chain.from_iterable(itertools.combinations(range(52), 5))
    flat = np.fromiter(cards, dtype=np.int64, count=5 * math.comb(52, 5))
    masks = (np.int64(1) << flat.reshape(-1, 5)).sum(axis=1)
    planes = [(masks >> suit) & SUIT_LANE for suit in range(4)]
    least = masks
    for perm in itertools.permutations(range(4)):
        least = np.minimum(least, sum(plane << to for plane, to in zip(planes, perm)))
    classes, sizes = np.unique(least, return_counts=True)
    bits = (classes[:, None] >> np.arange(52)) & 1
    return np.nonzero(bits)[1].reshape(-1, 5), sizes


def all_pair_totals(value, weights):
    """2 x wins + ties by class pair over every ordered pair of live combinations, even those
    that share a card; shared_card_totals() takes the second kind back out."""
    total = np.zeros((G, G))
    for row, w in zip(value, weights):
        live = row >= 0
        levels, level = np.unique(row[live], return_inverse=True)
        n = len(levels)
        hist = np.bincount(HAND_OF[live] * n + level, minlength=G * n).reshape(G, n)
        below = 2 * np.cumsum(hist, axis=1) - hist
        total += w * (hist.astype(np.float64) @ below.T.astype(np.float64))
    return total


def shared_card_totals(value, weights):
    """2 x wins + ties for each cell of TRIPLE_VALID, summed over the batch by board weight."""
    grid = np.where(PAIR_AT >= 0, value[:, PAIR_AT], -1)
    a, b = grid[:, :, :, None], grid[:, :, None, :]
    f = ((a > b).view(np.int8) * 2 + (a == b).view(np.int8)) * (b >= 0).view(np.int8)
    return weights.astype(np.float32) @ f.reshape(len(value), -1).astype(np.float32)


def equity_counts(pair_totals, shared):
    """2 x wins + ties by class pair over every pair of combinations that share no card."""
    by_class = np.bincount(TRIPLE_CLASS, weights=shared[TRIPLE_VALID.ravel()], minlength=G * G)
    # A combination meets itself once in pair_totals and once for each of its two cards in
    # shared, so it is added back once. It is live on every board of the other 50 cards.
    own = np.bincount(HAND_OF, minlength=G) * math.comb(50, 5)
    return pair_totals - np.rint(by_class).astype(np.int64).reshape(G, G) + np.diag(own)


def deal_weights():
    disjoint = (PAIR_MASK[:, None] & PAIR_MASK[None, :]) == 0
    index = HAND_OF[:, None] * G + HAND_OF[None, :]
    return np.bincount(index[disjoint], minlength=G * G).reshape(G, G)


def checked(counts, deal):
    """The equity table; the run stops unless every pair met every board exactly once."""
    if deal.sum() != PAIRS_TOTAL:
        raise SystemExit(f"the deal weights sum to {deal.sum()}, not {PAIRS_TOTAL}")
    if not np.array_equal(counts + counts.T, 2 * deal * BOARDS_PER_PAIR):
        raise SystemExit("the win and tie counts do not cover every pair and board once")
    return counts / (2 * deal * BOARDS_PER_PAIR)


# ------------------------------------------------------------------ OUTPUT


def render(equity, deal):
    def rows(table, spec):
        return ",\n".join("[" + ",".join(format(x, spec) for x in row) + "]" for row in table)

    return (
        '{\n"meta": ' + json.dumps(META, indent=2) + ',\n"hands": ' + json.dumps(HANDS)
        + ',\n"E": [\n' + rows(equity, ".6f") + '\n],\n"W": [\n' + rows(deal, "d") + "\n]\n}\n"
    )


def write(name, content):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        f.write(content)
    return 1


def main():
    tables = (*nonflush_table(), flush_table())
    boards, sizes = board_classes()
    pair_totals = np.zeros((G, G), dtype=np.int64)
    shared = np.zeros(52**3, dtype=np.int64)
    for start in range(0, len(boards), BATCH):
        value = values(boards[start:start + BATCH], *tables)
        w = sizes[start:start + BATCH]
        pair_totals += np.rint(all_pair_totals(value, w)).astype(np.int64)
        shared += np.rint(shared_card_totals(value, w)).astype(np.int64)
    deal = deal_weights()
    equity = checked(equity_counts(pair_totals, shared), deal)
    n = write("equity", render(equity, deal))
    print("wrote", n, "file to", os.path.abspath(OUT), "from", len(boards), "board classes")


if __name__ == "__main__":
    main()
