"""The solver's dials: the game object of KEY-SPEC.md section 12 and the nine leaf-model dials.

GAME is the object the key embeds and hashes (docs/incomplete/gto-trainer/KEY-SPEC.md, sections
7.5 and 12), as a Python dict with the same keys and values, so spec_hash(GAME) in validate_key.py
is the hash recorded in section 7.5. The solver (cfr.py) and the best-response check
(best_response.py) read the seats, the blinds, the sizes and the leaf model from here and from
nowhere else (BD-T2 in PLAN.md).

RANGES holds, for each of the nine leaf-model dials of KEY-SPEC.md 3.2, its starting value and the
floor and ceiling phase 3a may tune inside (PLAN.md section 3). The values inside GAME are the
frozen ones once phase 3a has tuned them; the starting values stay here as the record of where the
tuning began. The other solver dials of KEY-SPEC.md section 9 follow.
"""

GAME = {
    "schema_game": 1,
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
            "bent_share = e - c * e * (1 - e)^k; edge_share = 1 - bent_share; a flat by a seat "
            "other than BB multiplies both shares by (1 - t)"
        ),
        "k": 2,
        "c_edge_in_position": {"srp": 0.7, "3bp": 0.4, "4bp": 0.2, "all_in": 0},
        "c_edge_out_of_position": {"srp": 0.3, "3bp": 0.2, "4bp": 0.1, "all_in": 0},
        "flat_tax": {"ip": 0.1, "sb": 0.25, "bb": 0},
    },
    "card_removal": "two_live_hands",
    "hand_classes": 169,
}

# Legend: dial -> (starting value, floor, ceiling), from KEY-SPEC.md 3.2 and its section 9 table.
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
}

# The stop rule of phases 3a and 3b: the best-response gain of every seat, in big blinds per hand.
GTO_EXPLOITABILITY_BB = 0.005
# A node reached less often than this is one the grader treats as never reached (KEY-SPEC.md 7.1).
REACH_FLOOR = 0.0001
# The containment test of phase 4: a chart hand opens at least this often in the key.
GTO_CHART_MIN_OPEN = 0.5
