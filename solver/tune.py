"""Tune the leaf model of the GTO trainer's game to the acceptance bands and print the pick.

The harness of KEY-SPEC.md 13.4 (docs/incomplete/gto-trainer/, board item 60, RF-3). It runs a
coordinate descent over the fourteen leaf-model dials of RANGES in config.py (the nine of section
3.2 and the five class-adjustment coefficients of 3.2 as amended), each inside its range. A
setting is screened by solving the five opener subtrees with cfr.solve_tree at SCREEN_ITERATIONS
and scored by, in order: the button opening every pair (phase 3a's done-when), the number of rows
of cfr.BANDS inside their bands, the smallest total miss in points, the hand-level patterns P1 to
P4 of KEY-SPEC.md 13.3 (v) met, and the smallest distance from the 4-bet expectation of 13.3 (v)
(b), which is an expectation from one source and not a band. The class partition and the
weighting are those of KEY-SPEC.md 13.1 Part 5.

The search has two parts, because the misses are one mechanism and a single dial moved alone
cannot reach them (HANDOFF.md steps 50 and 51): first SAMPLES settings drawn inside the ranges
from a number stream seeded with SEED, so two runs draw the same settings, then the coordinate
descent from the best of those and the start. main() prints the start, every improvement with
its score, then the pick with k 2 and the best setting with k 1, each with its dials, its band
table, its patterns and its 4-bet rows. It writes no file and reads no clock: the pick is frozen
by hand into config.py and KEY-SPEC.md 12, then python3 solver/cfr.py re-solves at full length.
Screening is about five seconds a setting on a quiet Mac, so a run is under an hour.

Run: python3 solver/tune.py
"""

import copy

import numpy as np

import cfr
from config import DIAL_PATH, GAME, RANGES
from validate_key import HANDS, RANKS

SCREEN_ITERATIONS = 500
SAMPLES = 120
SEED = 1
MAX_SWEEPS = 3
STEPS = 5
BROADWAY = "AKQJT"
# Legend: class name -> the rule on (high rank letter, low rank letter, suited, pair), tested in
# order, first match wins (KEY-SPEC.md 13.1 Part 5).
CLASSES = [
    ("pairs 22-55", lambda hi, lo, s, p: p and hi in "5432"),
    ("pairs 66-99", lambda hi, lo, s, p: p and hi in "9876"),
    ("pairs TT-AA", lambda hi, lo, s, p: p),
    ("suited aces A2s-A5s", lambda hi, lo, s, p: hi == "A" and s and lo in "5432"),
    ("suited aces A6s-A9s", lambda hi, lo, s, p: hi == "A" and s and lo in "9876"),
    ("suited aces ATs-AKs", lambda hi, lo, s, p: hi == "A" and s),
    ("offsuit aces A2o-A9o", lambda hi, lo, s, p: hi == "A" and lo not in BROADWAY),
    ("offsuit aces ATo-AKo", lambda hi, lo, s, p: hi == "A"),
    ("suited broadways", lambda hi, lo, s, p: s and hi in BROADWAY and lo in BROADWAY),
    ("offsuit broadways", lambda hi, lo, s, p: hi in BROADWAY and lo in BROADWAY),
    ("suited connectors gap 0", lambda hi, lo, s, p: s and gap(hi, lo) == 0),
    ("suited one-gappers", lambda hi, lo, s, p: s and gap(hi, lo) == 1),
    ("suited two-gappers", lambda hi, lo, s, p: s and gap(hi, lo) == 2),
    ("other suited K and Q", lambda hi, lo, s, p: s and hi in "KQ"),
    ("other suited", lambda hi, lo, s, p: s),
    ("other offsuit", lambda hi, lo, s, p: True),
]
SUITED_ACES = ("suited aces A2s-A5s", "suited aces A6s-A9s")
# Legend: the defender facing a 4-bet, (opener, defender) per row of KEY-SPEC.md 2.3, and the
# expectation of 13.3 (v) (b): fold 35 to 60, call 20 to 45 percent of the 3-bet range.
VS4_ROWS = [("CO", "BTN"), ("BTN", "SB"), ("BTN", "BB"), ("SB", "BB")]
EXPECT_FOLD, EXPECT_CALL = (35, 60), (20, 45)


# ------------------------------------------------------------- CLASSES


def gap(high, low):
    return RANKS.index(low) - RANKS.index(high) - 1


def class_of(hand):
    high, low = hand[0], hand[1]
    suited, pair = len(hand) == 3 and hand[2] == "s", high == low
    for name, rule in CLASSES:
        if rule(high, low, suited, pair):
            return name
    raise SystemExit(f"{hand} is in no class")


MEMBERS = {name: np.array([class_of(h) == name for h in HANDS]) for name, _ in CLASSES}


def rate(nodes, node_id, column, weight, names):
    """The weighted frequency of one action over the hands of the named classes."""
    mask = np.any([MEMBERS[n] for n in names], axis=0)
    w = weight * mask
    return float((w * nodes[node_id]["strategy"][:, column]).sum() / w.sum())


def weights(nodes, game, p, opener, defender):
    """The weight of each hand at the defender's first node (the deal), at the opener's vs3 node
    (the deal times the open) and at the defender's vs4 node (the deal times the 3-bet)."""
    first, vs3, vs4, _ = (cfr.node_id(game, opener, defender, d) for d in range(1, 5))
    opens = p * nodes[cfr.node_id(game, opener)]["strategy"][:, 1]
    threebets = p * nodes[first]["strategy"][:, 2]
    return (first, p), (vs3, opens), (vs4, threebets)


# ------------------------------------------------------------ PATTERNS


def pattern_lines(nodes, game, p):
    """P1 to P4 of KEY-SPEC.md 13.3 (v) as (label, met) pairs."""
    out = []
    for opener in ("BTN", "SB"):
        (first, w), _, _ = weights(nodes, game, p, opener, "BB")
        met = rate(nodes, first, 2, w, SUITED_ACES[:1]) > rate(nodes, first, 2, w, ["offsuit aces A2o-A9o"])
        out.append((f"P1 BB vs {opener}: A2s-A5s 3-bet more than A2o-A9o", met))
    for opener, defender in (("CO", "BTN"), ("SB", "BB")):
        _, (vs3, w), _ = weights(nodes, game, p, opener, defender)
        suited = rate(nodes, vs3, 1, w, ["suited broadways"]) > rate(nodes, vs3, 1, w, ["offsuit broadways"])
        aces = rate(nodes, vs3, 1, w, SUITED_ACES) > rate(nodes, vs3, 1, w, ["offsuit aces A2o-A9o"])
        out.append((f"P2 {opener} vs {defender} 3-bet: suited call more than offsuit", suited and aces))
    btn = cfr.node_id(game, "BTN")
    out.append(("P3 BTN opens gap-0 suited connectors at least as often as A2o-A9o",
                rate(nodes, btn, 1, p, ["suited connectors gap 0"]) >= rate(nodes, btn, 1, p, ["offsuit aces A2o-A9o"])))
    return out + pair_patterns(nodes, game, p)


def pair_patterns(nodes, game, p):
    """P4: small pairs call a 3-bet (CO vs BTN) and a 4-bet (the four rows) less than medium pairs."""
    out = []
    _, (vs3, w), _ = weights(nodes, game, p, "CO", "BTN")
    out.append(("P4 CO vs BTN 3-bet: 22-55 call less than 66-99", rate(nodes, vs3, 1, w, ["pairs 22-55"]) < rate(nodes, vs3, 1, w, ["pairs 66-99"])))
    for opener, defender in VS4_ROWS:
        _, _, (vs4, w) = weights(nodes, game, p, opener, defender)
        met = rate(nodes, vs4, 1, w, ["pairs 22-55"]) < rate(nodes, vs4, 1, w, ["pairs 66-99"])
        out.append((f"P4 {defender} vs {opener} 4-bet: 22-55 call less than 66-99", met))
    return out


def vs4_rows(nodes, game, p):
    """(label, fold, call, 5-bet, miss against the expectation) per row of VS4_ROWS, in percent
    of the defender's 3-bet range."""
    out = []
    for opener, defender in VS4_ROWS:
        _, _, (vs4, w) = weights(nodes, game, p, opener, defender)
        fold, call, jam = (100 * (w * nodes[vs4]["strategy"][:, c]).sum() / w.sum() for c in range(3))
        miss = outside(fold, *EXPECT_FOLD) + outside(call, *EXPECT_CALL)
        out.append((f"{defender} vs {opener} 4-bet", fold, call, jam, miss))
    return out


def outside(value, floor, ceiling):
    return max(0.0, floor - value, value - ceiling)


# --------------------------------------------------------------- SCORE


def band_values(nodes, game, E, W):
    return [(label, cfr.measure(nodes, game, E, W, kind, args), floor, ceiling) for label, kind, args, floor, ceiling in cfr.BANDS]


def score(nodes, game, E, W):
    """The lexicographic score of a screened setting; larger is better."""
    p = W.sum(axis=1) / W.sum()
    bands = band_values(nodes, game, E, W)
    pairs = [i for i, h in enumerate(HANDS) if len(h) == 2]
    pairs_open = nodes[cfr.node_id(game, "BTN")]["strategy"][pairs, 1].min() >= 0.99
    inside = sum(floor <= value <= ceiling for _, value, floor, ceiling in bands)
    miss = sum(outside(value, floor, ceiling) for _, value, floor, ceiling in bands)
    patterns = sum(met for _, met in pattern_lines(nodes, game, p))
    expectation = sum(row[4] for row in vs4_rows(nodes, game, p))
    return (int(pairs_open), inside, -round(miss, 3), patterns, -round(expectation, 3))


def screen(game, E, W):
    nodes, _, _ = cfr.solve_tree(game, E, W, SCREEN_ITERATIONS)
    return nodes, score(nodes, game, E, W)


# ------------------------------------------------------------- DESCENT


def read_dial(game, dial):
    target = game["leaf_model"]
    for key in DIAL_PATH[dial]:
        target = target[key]
    return target


def set_dial(game, dial, value):
    *path, last = DIAL_PATH[dial]
    target = game["leaf_model"]
    for key in path:
        target = target[key]
    target[last] = value


def candidates(dial, current=None):
    """The values a sweep tries for one dial: STEPS points from floor to ceiling in the coarse
    pass, or the two half-steps either side of the current value in the fine pass, rounded so a
    frozen value reads plainly."""
    _, floor, ceiling = RANGES[dial]
    step = (ceiling - floor) / (STEPS - 1)
    if current is None:
        return [round(floor + step * i, 3) for i in range(STEPS)]
    return [round(v, 3) for v in (current - step / 2, current + step / 2) if floor <= v <= ceiling]


def sweep(game, E, W, best, dials, fine):
    """One pass over the dials: each candidate that beats the score so far is kept."""
    changed = False
    for dial in dials:
        current = read_dial(game, dial)
        for value in candidates(dial, current if fine else None):
            if value == current:
                continue
            trial = copy.deepcopy(game)
            set_dial(trial, dial, value)
            _, s = screen(trial, E, W)
            if s > best:
                game, best, current, changed = trial, s, value, True
                print(f"  {dial} -> {value}: score {s}", flush=True)
    return game, best, changed


def explore(game, E, W, dials, rng):
    """SAMPLES settings drawn inside the ranges of the dials; the best of them and the start."""
    best_game, best = game, screen(game, E, W)[1]
    print(f"start: score {best}", flush=True)
    for n in range(SAMPLES):
        trial = copy.deepcopy(game)
        for dial in dials:
            _, floor, ceiling = RANGES[dial]
            set_dial(trial, dial, round(float(rng.uniform(floor, ceiling)), 3))
        _, s = screen(trial, E, W)
        if s > best:
            best_game, best = trial, s
            print(f"  sample {n + 1}: score {s}: " + ", ".join(f"{d} {read_dial(trial, d)}" for d in dials), flush=True)
    return best_game, best


def descend(game, E, W, dials, best):
    """Coarse sweeps until none improves the score or MAX_SWEEPS is reached, then one fine sweep."""
    for n in range(MAX_SWEEPS):
        print(f"sweep {n + 1}", flush=True)
        game, best, changed = sweep(game, E, W, best, dials, False)
        if not changed:
            break
    print("fine sweep", flush=True)
    game, best, _ = sweep(game, E, W, best, dials, True)
    return game, best


# -------------------------------------------------------------- REPORT


def report(title, game, E, W):
    nodes, s = screen(game, E, W)
    p = W.sum(axis=1) / W.sum()
    lines = [f"== {title}: score {s} at {SCREEN_ITERATIONS} iterations"]
    lines.append("dials: " + ", ".join(f"{d} {read_dial(game, d)}" for d in RANGES))
    lines += cfr.band_lines(nodes, game, E, W)
    lines += [f"{label:70s} {'met' if met else 'NOT MET'}" for label, met in pattern_lines(nodes, game, p)]
    for label, fold, call, jam, miss in vs4_rows(nodes, game, p):
        lines.append(f"{label:18s} fold {fold:5.1f} call {call:5.1f} 5-bet {jam:5.1f}  expectation fold 35 to 60, call 20 to 45  miss {miss:.1f}")
    return "\n".join(lines)


def main():
    E, W, _ = cfr.load_equity()
    game = copy.deepcopy(GAME)
    print(report("start", game, E, W))
    dials = [d for d in RANGES if d != "k"]
    game, best = explore(game, E, W, dials, np.random.default_rng(SEED))
    pick, _ = descend(game, E, W, dials, best)
    print(report("pick, k 2", pick, E, W))
    other = copy.deepcopy(pick)
    set_dial(other, "k", 1)
    other, _ = descend(other, E, W, dials, screen(other, E, W)[1])
    print(report("best at k 1", other, E, W))


if __name__ == "__main__":
    main()
