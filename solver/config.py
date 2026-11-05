"""The solver's dials: the game object of KEY-SPEC.md section 12 and the nine leaf-model dials.

GAME is the object the key embeds and hashes (docs/incomplete/gto-trainer/KEY-SPEC.md, sections
7.5 and 12), as a Python dict with the same keys and values, so spec_hash(GAME) in validate_key.py
is the hash recorded in section 7.5. The solver (cfr.py) and the best-response check
(best_response.py) read the seats, the blinds, the sizes and the leaf model from here and from
nowhere else (BD-T2 in PLAN.md).

RANGES holds, for each of the nine leaf-model dials of KEY-SPEC.md 3.2, its starting value and the
floor and ceiling phase 3a may tune inside (PLAN.md section 3). The values inside GAME are the
frozen ones once phase 3a has tuned them; the starting values stay here as the record of where the
tuning began. Frozen 2026-10-06 as provisional (board item 37, HANDOFF.md step 52, Zach's choice
of KEY-SPEC.md 11, third batch): the best setting inside the ranges, which lands 13 of the 19
bands of KEY-SPEC.md 8.2 and opens every pair from the button; the six misses are KEY-SPEC.md 8.5,
and board item 60 (RF-3, a per-class adjustment) re-freezes them. Amended 2026-11-05 (board item
60, RF-3): leaf_model gains class_adjustment, five coefficients in log-odds units on fixed hand
features (KEY-SPEC.md 3.2 as amended, 13.3 (ii)), tuned by tune.py together with the nine old
dials and frozen here; schema_game is 2 because the object's meaning changed. The other solver
dials of KEY-SPEC.md section 9 follow.
"""

GAME = {
    "schema_game": 2,
    "seats": ["UTG", "HJ", "CO", "BTN", "SB", "BB"],
    "postflop_order": ["SB", "BB", "UTG", "HJ", "CO", "BTN"],
    "stack_bb": 100,
    "blinds_bb": {"SB": 0.5, "BB": 1},
    "ante_bb": 0,
    "rake": 0,
    "max_live_players": 2,
    "sb_may_limp": False,
    "sizes_bb": {
        "ip_defender": {"open": 2.5, "3bet": 7.5, "4bet": 20, "5bet": 100},
        "sb_defender": {"open": 2.5, "3bet": 10, "4bet": 22, "5bet": 100},
        "bb_defender": {"open": 2.5, "3bet": 10, "4bet": 22, "5bet": 100},
        "sb_vs_bb": {"open": 3, "3bet": 9, "4bet": 23, "5bet": 100},
    },
    "leaf_model": {
        "kind": "edge_realization",
        "formula": (
            "bent_share = e - c * e * (1 - e)^k; R = exp(z_bent - z_edge); share = bent_share * R / "
            "(bent_share * R + 1 - bent_share); edge_share = 1 - share; a flat by a seat other than "
            "BB multiplies both shares by (1 - t)"
        ),
        "k": 2,
        "c_edge_in_position": {"srp": 0.5, "3bp": 0.4, "4bp": 0.1, "all_in": 0},
        "c_edge_out_of_position": {"srp": 0.2, "3bp": 0, "4bp": 0.05, "all_in": 0},
        "flat_tax": {"ip": 0.1, "sb": 0.25, "bb": 0},
        "class_adjustment": {
            "kind": "log_odds_shift",
            "features": (
                "z = a_pair * pair + a_suited * suited + a_connected * connected + a_ace_high * "
                "ace_high + a_high_card * high_card; pair, suited and ace_high are 0 or 1 (suited "
                "and ace_high are 0 for a pair); connected is 1, 0.5, 0.25 for a non-pair with a "
                "gap of 0, 1, 2 between its ranks, the ace high only, else 0; high_card is (rank "
                "of the higher card - 10) / 4 with the ace 14"
            ),
            "a_pair": 0,
            "a_suited": 0,
            "a_connected": 0,
            "a_ace_high": 0,
            "a_high_card": 0,
        },
    },
    "card_removal": "two_live_hands",
    "hand_classes": 169,
}

# Legend: dial -> (starting value, floor, ceiling), from KEY-SPEC.md 3.2 and its section 9 table;
# the five class-adjustment coefficients from KEY-SPEC.md 13.4 (signs from section 4, item 3).
RANGES = {
    "c_srp": (0.7, 0.0, 1.0),
    "c_3bp": (0.4, 0.0, 0.6),
    "c_4bp": (0.2, 0.0, 0.3),
    "c_srp_oop": (0.3, 0.0, 0.5),
    "c_3bp_oop": (0.2, 0.0, 0.4),
    "c_4bp_oop": (0.1, 0.0, 0.2),
    "k": (2, 1, 2),
    "t_ip": (0.1, 0.0, 0.5),
    "t_sb": (0.25, 0.0, 0.5),
    "a_pair": (0, -0.6, 0.6),
    "a_suited": (0, 0.0, 0.6),
    "a_connected": (0, 0.0, 0.6),
    "a_ace_high": (0, -0.6, 0.0),
    "a_high_card": (0, -0.6, 0.6),
}

# Where each dial sits inside GAME["leaf_model"], so a tuning run can set it by name.
DIAL_PATH = {
    "c_srp": ("c_edge_in_position", "srp"),
    "c_3bp": ("c_edge_in_position", "3bp"),
    "c_4bp": ("c_edge_in_position", "4bp"),
    "c_srp_oop": ("c_edge_out_of_position", "srp"),
    "c_3bp_oop": ("c_edge_out_of_position", "3bp"),
    "c_4bp_oop": ("c_edge_out_of_position", "4bp"),
    "k": ("k",),
    "t_ip": ("flat_tax", "ip"),
    "t_sb": ("flat_tax", "sb"),
    "a_pair": ("class_adjustment", "a_pair"),
    "a_suited": ("class_adjustment", "a_suited"),
    "a_connected": ("class_adjustment", "a_connected"),
    "a_ace_high": ("class_adjustment", "a_ace_high"),
    "a_high_card": ("class_adjustment", "a_high_card"),
}

# The stop rule of phases 3a and 3b: the best-response gain of every seat, in big blinds per hand.
GTO_EXPLOITABILITY_BB = 0.005
# A node reached less often than this is one the grader treats as never reached (KEY-SPEC.md 7.1).
REACH_FLOOR = 0.0001
# The containment test of phase 4: a chart hand opens at least this often in the key.
GTO_CHART_MIN_OPEN = 0.5
