"""Validate a strategy key against the frozen schema in docs/incomplete/gto-trainer/KEY-SPEC.md.

A key that fails here must not be exported to the app (BD-T6 in docs/incomplete/gto-trainer/
PLAN.md). The checks: the file names the 169 hand classes in the fixed order, every node holds
one frequency row and one EV row per hand, every frequency row sums to 1 within SUM_TOLERANCE,
every EV is a number, and spec_hash is the SHA-256 of the canonical game object.
Run: python3 solver/validate_key.py <key.json>
Exit code 0 when the key is valid; otherwise one finding per line and exit code 1.
"""

import hashlib
import json
import sys

# The rank order of app/src/cards/card.ts reversed, so hand_classes() repeats allHandClasses()
# in app/src/cards/hand-class.ts and the two sides agree on row order without a shared file.
RANKS = "AKQJT98765432"
SCHEMA = "felto-gto-key/1"
# Three frequencies written to four decimals can miss 1 by 0.00015; 0.001 leaves room for that
# and nothing else.
SUM_TOLERANCE = 0.001


def hand_classes():
    out = []
    for i, high in enumerate(RANKS):
        out.append(high + high)
        for low in RANKS[i + 1:]:
            out.append(high + low + "s")
            out.append(high + low + "o")
    return out


HANDS = hand_classes()


def canonical(game):
    return json.dumps(game, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def spec_hash(game):
    return hashlib.sha256(canonical(game).encode("utf-8")).hexdigest()


def is_number(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def check_header(key):
    found = []
    if key.get("schema") != SCHEMA:
        found.append(f"schema is {key.get('schema')!r}, expected {SCHEMA!r}")
    if not isinstance(key.get("game"), dict):
        found.append("game object missing")
    elif key.get("spec_hash") != spec_hash(key["game"]):
        found.append("spec_hash does not match the game object")
    if key.get("hands") != HANDS:
        found.append("hands is not the 169 classes in the fixed order")
    return found


def check_rows(node_id, name, rows, width):
    if not isinstance(rows, list) or len(rows) != len(HANDS):
        return [f"{node_id}: {name} does not hold one row per hand"]
    found = []
    for hand, row in zip(HANDS, rows):
        if not isinstance(row, list) or len(row) != width or not all(is_number(v) for v in row):
            found.append(f"{node_id}: {name} for {hand} is not {width} numbers")
    return found


def check_sums(node_id, rows):
    found = []
    for hand, row in zip(HANDS, rows):
        if abs(sum(row) - 1) > SUM_TOLERANCE:
            found.append(f"{node_id}: frequencies for {hand} sum to {sum(row):.4f}")
    return found


def check_node(node_id, node):
    actions = node.get("actions")
    if not isinstance(actions, list) or not actions:
        return [f"{node_id}: actions missing"]
    found = check_rows(node_id, "strategy", node.get("strategy"), len(actions))
    if not found:
        found += check_sums(node_id, node["strategy"])
    found += check_rows(node_id, "ev", node.get("ev"), len(actions))
    return found


def validate(key):
    found = check_header(key)
    nodes = key.get("nodes")
    if not isinstance(nodes, dict) or not nodes:
        return found + ["nodes missing"]
    for node_id, node in nodes.items():
        found += check_node(node_id, node)
    return found


def main():
    if len(sys.argv) != 2:
        print("usage: python3 solver/validate_key.py <key.json>")
        sys.exit(2)
    with open(sys.argv[1]) as f:
        key = json.load(f)
    found = validate(key)
    for line in found:
        print(line)
    print("valid" if not found else f"{len(found)} findings")
    sys.exit(0 if not found else 1)


if __name__ == "__main__":
    main()
