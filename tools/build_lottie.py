"""Build the extruded-flat Lottie effects for Felto.

Style (from the approved Higgsfield reference, as tools/build_icons.py:4-6
states it): no outlines, solid fills, a darker extrusion offset down-right
and one small gloss highlight. The hard pale shadow is left out: the app
swaps that colour for the theme's in every SVG (BD-25), a Lottie file cannot
take the swap, and a pale shadow would show as a smudge on the dark page.

Every effect runs at 60 frames a second and stops under 1.5 s (checked()):
- burst: eight gold stars and eight chip-coloured dots fly out from the
  centre after a gold pop; each pops and fades, and the stars spin. 0.8 s.
- confetti: 26 pieces in the chip colours drop from the top, sway, spin and
  flip edge-on as they fall, then fade at the bottom edge. 1.4 s.
- sparkle_shower: 12 four-point stars in gold, cream and ice twinkle in
  turn as they drift down. 1.2 s.
- gem_fly_up: five gems pop out at the bottom, hop apart, then fly to the
  top and shrink away, one every 0.1 s. 1.2 s.
- chip_fly_up: the same flight with five chips, each spinning. 1.2 s.
- flame_flicker: the streak flame's three layers sway out of step while two
  embers rise; a 1 s loop that ends on the pose it starts from.

Placement comes from Lcg, a seeded number stream of this file's own, one
seed per effect, so every run writes the same bytes (rule G1).

Outputs to assets/lottie.
Run: python3 tools/build_lottie.py
"""
import json
import math
import os

from common import CREAM

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "lottie")
FPS = 60
# Board item 49: an effect ends in under 1.5 s, so it never holds up the screen it decorates
CEILING = 1.5

# The chip colours as CHIPS holds them, face, depth, light accent (rule C3;
# tools/build_icons.py:34-41). Black is left out: it reads as a hole in a burst.
CHIPS = {
    "red": ("#E8252F", "#8E0F1A", "#F0414A"),
    "blue": ("#2F7BF0", "#0F47B8", "#5A98F5"),
    "green": ("#22B573", "#0E7A4B", "#45CC8F"),
    "gold": ("#FFC83A", "#C98F00", "#FFD968"),
    "purple": ("#8A5BFF", "#4F2FC4", "#A583FF"),
}
GEM_FACE, GEM_DEPTH = "#38B6F5", "#0E6FB0"  # ui_gem, tools/build_icons.py:334 (ICE, :291)
GEM_LIGHT, GEM_PALE, GEM_SHADE = "#7FD3FF", "#A6E3FF", "#1E96DA"  # its facets, :335-338
FLAME_FACE, FLAME_DEPTH = "#FF6A1A", "#C5360E"  # ui_flame's defaults, :295
FLAME_MID, FLAME_INNER = "#FFA81E", "#FFE066"  # :295

# The icons' own outlines, so an effect draws the same gem and flame as the stat bar
GEM_PATH = "M50 26 H130 L164 66 L90 156 L16 66Z"  # ui_gem, tools/build_icons.py:332
GEM_CENTRE = (90, 91)  # the middle of that path's box, x 16 to 164, y 26 to 156
# path, colour, opacity in per cent; ui_gem's facets, tools/build_icons.py:335-338
GEM_FACETS = [
    ("M50 26 L68 66 H16Z", GEM_LIGHT, 100),
    ("M130 26 L112 66 H164Z", GEM_SHADE, 100),
    ("M68 66 H112 L90 156Z", GEM_SHADE, 55),
    ("M50 26 H130 L112 66 H68Z", GEM_PALE, 100),
]
FLAME_PATH = (
    "M80 8 C100 42 140 64 140 114 C140 152 114 182 80 182 C46 182 20 152 20 114 "
    "C20 86 40 70 48 46 C56 62 64 66 72 66 C64 44 68 26 80 8Z"
)  # ui_flame, tools/build_icons.py:296
FLAME_BASE = (80, 182)  # the point ui_flame scales its mid and inner layers about, :299-306

# name: the out handle of one keyframe, then the in handle of the next, as cubic-bezier points
EASES = {
    "linear": ((0, 0), (1, 1)),
    "out": ((0.16, 1), (0.3, 1)),
    "in": ((0.55, 0.09), (0.68, 0.53)),
    "inout": ((0.42, 0), (0.58, 1)),
}


# ------------------------------------------------------------- NUMBERS
class Lcg:
    # A 32-bit linear congruential stream with the Numerical Recipes constants: the same sequence
    # on every run and every platform, from a seed written in this file
    def __init__(self, seed):
        self.state = seed

    def between(self, lo, hi):
        self.state = (1664525 * self.state + 1013904223) % 4294967296
        return lo + (hi - lo) * self.state / 4294967296

    def sign(self):
        return 1 if self.between(0, 1) < 0.5 else -1


def num(v, places=2):
    # Rule G3: a calculated number is written at a fixed precision, so a reordered sum cannot move
    # the bytes; a whole number is written bare, which keeps the files small
    r = round(v, places)
    return int(r) if r == int(r) else r


def vec(v):
    if isinstance(v, (list, tuple)):
        return [num(x) for x in v]
    return [num(v)]


def rgba(colour):
    h = colour.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    # Four places, not two: two would move a channel by up to one step of 255
    return [num(int(h[i:i + 2], 16) / 255, 4) for i in (0, 2, 4)] + [1]


def sc(v):
    return (v, v, 100)


# ------------------------------------------------------- LOTTIE FIELDS
def still(v):
    return {"a": 0, "k": v}


def prop(v):
    # An animated property passes through; a plain value becomes a still one (a lone number stays
    # a number, because a still rotation or opacity must not be written as a list)
    if isinstance(v, dict):
        return v
    return still(vec(v) if isinstance(v, (list, tuple)) else num(v))


def keys(rows):
    """An animated property from (frame, value, ease) rows; each ease shapes the move to the next row."""
    k = []
    for t, v, ease in rows[:-1]:
        o, i = EASES[ease]
        k.append({"t": t, "s": vec(v), "o": {"x": [o[0]], "y": [o[1]]}, "i": {"x": [i[0]], "y": [i[1]]}})
    k.append({"t": rows[-1][0], "s": vec(rows[-1][1])})
    return {"a": 1, "k": k}


def transform(p, s=sc(100), r=0, o=100):
    return {"o": prop(o), "r": prop(r), "p": prop(p), "a": prop((0, 0, 0)), "s": prop(s)}


def layer(name, back_to_front, ks, ip, op):
    # Lottie paints the first shape on top, so the back-to-front list is reversed (rule L4)
    return {
        "ddd": 0, "ty": 4, "nm": name, "sr": 1, "ks": ks, "ao": 0,
        "shapes": back_to_front[::-1], "ip": ip, "op": op, "st": 0, "bm": 0,
    }


def animation(name, w, h, op, back_to_front):
    layers = [dict(ly, ind=i + 1) for i, ly in enumerate(back_to_front[::-1])]
    return {
        "v": "5.7.4", "fr": FPS, "ip": 0, "op": op, "w": w, "h": h,
        "nm": name, "ddd": 0, "assets": [], "layers": layers,
    }


# ------------------------------------------------------------- SHAPES
def group(name, items, p=(0, 0), a=(0, 0), s=(100, 100), r=0):
    """A shape group; items are in Lottie order (the shapes, then the fill that paints them)."""
    tr = {
        "ty": "tr", "p": prop(p), "a": prop(a), "s": prop(s), "r": prop(r),
        "o": prop(100), "sk": prop(0), "sa": prop(0),
    }
    return {"ty": "gr", "nm": name, "it": items + [tr]}


def stack(name, back_to_front, **tr):
    return group(name, back_to_front[::-1], **tr)


def fill(colour, opacity=100):
    return {"ty": "fl", "c": still(rgba(colour)), "o": prop(opacity), "r": 1}


def edge(colour, width):
    # Rule L5: a stroke in the fill's own colour only rounds the corners, as the icons' stars do
    return {"ty": "st", "c": still(rgba(colour)), "o": prop(100), "w": prop(width), "lc": 2, "lj": 2, "ml": 4}


def paint(name, geometry, colour, opacity=100, rounding=0, at=(0, 0)):
    items = [geometry, fill(colour, opacity)]
    if rounding:
        items.append(edge(colour, rounding))
    return group(name, items, p=at)


def ellipse(w, h):
    return {"ty": "el", "d": 1, "p": prop((0, 0)), "s": prop((w, h))}


def rect(w, h, radius):
    return {"ty": "rc", "d": 1, "p": prop((0, 0)), "s": prop((w, h)), "r": prop(radius)}


def bezier(points, ins=None, outs=None):
    flat = [(0, 0)] * len(points)
    ks = {
        "i": [vec(p) for p in ins or flat], "o": [vec(p) for p in outs or flat],
        "v": [vec(p) for p in points], "c": True,
    }
    return {"ty": "sh", "d": 1, "ks": still(ks)}


def svg_parts(d):
    # "M80 8 C100 42 140 64 140 114Z" becomes [("M", [80, 8]), ("C", [100, 42, 140, 64, 140, 114])]
    for c in "MLHCZ":
        d = d.replace(c, "|" + c)
    return [(p[0], [float(n) for n in p[1:].split()]) for p in d.split("|") if p.strip() and p[0] != "Z"]


# Vertices with their in and out handles from an SVG path of absolute M, L, H and C commands; a
# path that ends where it starts drops the repeated point, as a closed Lottie path must
def svg_points(d):
    pts, ins, outs = [], [], []
    for cmd, n in svg_parts(d):
        last = pts[-1] if pts else (0, 0)
        end = (n[0], last[1]) if cmd == "H" else (n[-2], n[-1])
        if cmd == "C":
            outs[-1] = (n[0] - last[0], n[1] - last[1])
        pts.append(end)
        ins.append((n[2] - end[0], n[3] - end[1]) if cmd == "C" else (0, 0))
        outs.append((0, 0))
    if pts[-1] == pts[0]:
        ins[0] = ins.pop()
        pts.pop()
        outs.pop()
    return pts, ins, outs


def from_svg(d, centre=(0, 0), k=1):
    pts, ins, outs = svg_points(d)
    cx, cy = centre
    moved = [((x - cx) * k, (y - cy) * k) for x, y in pts]
    return bezier(moved, [(x * k, y * k) for x, y in ins], [(x * k, y * k) for x, y in outs])


def solid(geometry, face, dark, dx, dy, steps=2, rounding=0):
    """The depth stepped out to (dx, dy), then the face, as the icons' solid() paints them; back to front."""
    o = [
        paint("depth", geometry, dark, rounding=rounding, at=(dx * i / steps, dy * i / steps))
        for i in range(steps, 0, -1)
    ]
    o.append(paint("face", geometry, face, rounding=rounding))
    return o


def gloss(x, y, rx, ry, rot, opacity):
    # Shine white (rule C2): the one small highlight of the style, as tools/common.py:44-50 draws it
    return group("gloss", [ellipse(rx * 2, ry * 2), fill("#fff", opacity)], p=(x, y), r=rot)


def gem(size):
    k = size / 148
    o = solid(from_svg(GEM_PATH, GEM_CENTRE, k), GEM_FACE, GEM_DEPTH, 9 * k, 12 * k, 3, 6 * k)
    o += [paint("facet", from_svg(d, GEM_CENTRE, k), c, op) for d, c, op in GEM_FACETS]
    o.append(gloss((72 - GEM_CENTRE[0]) * k, (44 - GEM_CENTRE[1]) * k, 12 * k, 5 * k, -10, 70))
    return o


# The chip of tools/build_icons.py:44-57, drawn at radius r; the notches are straight-edged, because
# at this size the arc of a notch bows by less than half a point
def chip(r, face, dark, light):
    k = r / 86

    def notch(i):
        rim = [(86, -11), (86, 0), (86, 11), (58, 11), (58, -11)]
        a = [(rr * math.cos(math.radians(i * 45 + da)), rr * math.sin(math.radians(i * 45 + da))) for rr, da in rim]
        return bezier([(x * k, y * k) for x, y in a])

    o = solid(ellipse(2 * r, 2 * r), face, dark, 12 * k, 14 * k, 3)
    o.append(group("notches", [notch(i) for i in range(8)] + [fill(CREAM)]))
    o.append(paint("ring", ellipse(120 * k, 120 * k), dark, 55))
    o.append(paint("disc", ellipse(110 * k, 110 * k), face))
    o.append(paint("light", ellipse(88 * k, 88 * k), light, 35))
    o.append(gloss(-22 * k, -26 * k, 18 * k, 10 * k, -40, 60))
    return o


# -------------------------------------------------------------- BURST
def burst():
    size, centre, end = 400, (200, 200), 48
    seed = Lcg(4901)
    dots = ["red", "blue", "green", "purple"]

    def star(r, face, dark):
        # The path node's star: five points, the inner radius 15/34 of the outer (tools/build_icons.py:205)
        pts = []
        for i in range(10):
            rr = r if i % 2 == 0 else r * 15 / 34
            a = -math.pi / 2 + i * math.pi / 5
            pts.append((rr * math.cos(a), rr * math.sin(a)))
        return solid(bezier(pts), face, dark, r * 0.16, r * 0.2, rounding=r * 0.24) + [
            gloss(-r * 0.22, -r * 0.3, r * 0.2, r * 0.1, -35, 60)
        ]

    def dot(r, face, dark):
        return solid(ellipse(2 * r, 2 * r), face, dark, r * 0.16, r * 0.2) + [
            gloss(-r * 0.3, -r * 0.35, r * 0.3, r * 0.16, -35, 60)
        ]

    def towards(a, reach):
        return (centre[0] + reach * math.cos(a), centre[1] + reach * math.sin(a), 0)

    def flash():
        # A solid pop that grows and shrinks at full opacity: a fade through half opacity mixed with
        # the dark page and showed as a muddy disc (seen on the iPhone Air, 2026-10-05)
        s = keys([(0, sc(0), "out"), (5, sc(100), "in"), (12, sc(0), "linear")])
        art = [paint("flash", ellipse(120, 120), CHIPS["gold"][2])]
        return layer("flash", art, transform(centre + (0,), s), 0, 12)

    def fly(k):
        is_star = k % 2 == 0
        a = math.radians(k * 22.5 + seed.between(-6, 6))
        reach = seed.between(130, 170) if is_star else seed.between(80, 125)
        r = seed.between(17, 22) if is_star else seed.between(7, 11)
        t0 = round(seed.between(0, 4))
        t1 = t0 + round(seed.between(28, 36))
        art = star(r, *CHIPS["gold"][:2]) if is_star else dot(r, *CHIPS[dots[k // 2 % 4]][:2])
        p = keys([(t0, towards(a, 10), "out"), (t1, towards(a, reach), "linear")])
        s = keys([(t0, sc(0), "out"), (t0 + 8, sc(115), "inout"), (t0 + 14, sc(100), "linear"), (t1 + 6, sc(55), "linear")])
        turn = keys([(t0, 0, "out"), (t1, seed.sign() * seed.between(40, 120), "linear")]) if is_star else 0
        o = keys([(t0, 100, "linear"), (t1 - 6, 100, "linear"), (t1 + 6, 0, "linear")])
        return layer(f"particle_{k}", art, transform(p, s, turn, o), t0, t1 + 6)

    return animation("burst", size, size, end, [flash()] + [fly(k) for k in range(16)])


# ----------------------------------------------------------- CONFETTI
def confetti():
    w, h, end = 360, 480, 84
    seed = Lcg(4902)
    names = list(CHIPS)

    def piece(k):
        face, dark = CHIPS[names[k % len(names)]][:2]
        shape = [rect(10, 20, 3), rect(14, 14, 3), rect(8, 16, 2)][k % 3]
        x0, y0, t0 = seed.between(30, w - 30), seed.between(0, 60), round(seed.between(0, 18))
        sway, hz, phase = seed.between(8, 20), seed.between(0.7, 1.3), seed.between(0, 2 * math.pi)
        flip, spin, turn = seed.between(0.8, 1.4), seed.between(0, 180), seed.sign() * seed.between(240, 560)

        def at(t):
            u, secs = (t - t0) / (end - t0), (t - t0) / FPS
            return (x0 + sway * math.sin(2 * math.pi * hz * secs + phase), y0 + (h - y0) * u * (0.4 + 0.6 * u), 0)

        def size(t):
            # Grows in over 0.1 s, then narrows to an edge and back as the piece flips
            grow = min(1, (t - t0) / 6)
            edge_on = max(0.15, abs(math.cos(2 * math.pi * flip * (t - t0) / FPS)))
            return (100 * grow * edge_on, 100 * grow, 100)

        frames = list(range(t0, end, 4)) + [end]
        p = keys([(t, at(t), "linear") for t in frames])
        s = keys([(t, size(t), "linear") for t in frames])
        r = keys([(t0, spin, "linear"), (end, spin + turn, "linear")])
        o = keys([(t0, 100, "linear"), (end - 12, 100, "linear"), (end, 0, "linear")])
        return layer(f"piece_{k}", solid(shape, face, dark, 1.5, 2, 1), transform(p, s, r, o), t0, end)

    return animation("confetti", w, h, end, [piece(k) for k in range(26)])


# ------------------------------------------------------------ SPARKLE
def sparkle_shower():
    size, end = 300, 72
    seed = Lcg(4903)
    tints = [CHIPS["gold"][:2], (CREAM, CHIPS["gold"][1]), (GEM_LIGHT, GEM_FACE)]

    def twinkle(r, face, dark):
        # Four tips joined by curves that bow toward the centre, the usual twinkle shape
        tips = [(0, -r), (r, 0), (0, r), (-r, 0)]
        pull = [(-x * 0.62, -y * 0.62) for x, y in tips]
        return solid(bezier(tips, pull, pull), face, dark, r * 0.12, r * 0.16) + [gloss(0, 0, r * 0.18, r * 0.18, 0, 80)]

    def sparkle(k):
        # One star in each cell of a four-by-three grid, so the shower covers the box evenly
        x = 37.5 + 75 * (k % 4) + seed.between(-20, 20)
        y = 50 + 100 * (k // 4) + seed.between(-25, 25)
        t0 = round(seed.between(0, 34))
        life = round(seed.between(28, 38))
        art = twinkle(seed.between(9, 20), *tints[k % 3])
        p = keys([(t0, (x, y, 0), "linear"), (t0 + life, (x, y + seed.between(14, 30), 0), "linear")])
        s = keys([(t0, sc(0), "out"), (t0 + round(life * 0.4), sc(100), "in"), (t0 + life, sc(0), "linear")])
        r = keys([(t0, 0, "linear"), (t0 + life, seed.sign() * seed.between(45, 90), "linear")])
        return layer(f"sparkle_{k}", art, transform(p, s, r), t0, t0 + life)

    return animation("sparkle_shower", size, size, end, [sparkle(k) for k in range(12)])


# ------------------------------------------------------------- FLY-UP
def fly_up(name, seed, art, spins):
    """Five rewards pop out at the bottom, hop apart, then fly to the top, as a counter collects them."""
    w, h, end = 240, 360, 72
    start, top = (120, 330, 0), (120, 34, 0)

    def flight(k):
        t0 = 6 * k
        hop_at, top_at = t0 + 12, t0 + 40
        hop = (120 + seed.between(-70, 70), seed.between(240, 285), 0)
        p = keys([(t0, start, "out"), (hop_at, hop, "in"), (top_at, top, "linear")])
        s = keys([
            (t0, sc(0), "out"), (t0 + 9, sc(112), "inout"), (hop_at, sc(100), "in"),
            (top_at, sc(70), "linear"), (top_at + 6, sc(20), "linear"),
        ])
        if spins:
            r = keys([(t0, 0, "linear"), (top_at, seed.sign() * seed.between(200, 360), "linear")])
        else:
            r = keys([(t0, seed.between(-18, 18), "out"), (hop_at, 0, "linear")])
        o = keys([(t0, 100, "linear"), (top_at, 100, "linear"), (top_at + 6, 0, "linear")])
        return layer(f"{name}_{k}", art(k), transform(p, s, r, o), t0, top_at + 6)

    return animation(name, w, h, end, [flight(k) for k in range(5)])


def gem_fly_up():
    return fly_up("gem_fly_up", Lcg(4904), lambda k: gem(46), False)


def chip_fly_up():
    names = ["red", "blue", "green", "gold", "purple"]
    return fly_up("chip_fly_up", Lcg(4905), lambda k: chip(21, *CHIPS[names[k]]), True)


# -------------------------------------------------------------- FLAME
def flame_flicker():
    """The streak flame at its icon's size, 190 by 210, so it can stand where the icon stands."""
    w, h, end = 190, 210, 60
    outer = from_svg(FLAME_PATH)

    def flicker(rows):
        # Every row list starts and ends on one value, so the loop shows no seam
        return keys([(t, v, "inout") for t, v in rows])

    def ember(name, x0, x1, t0, t1):
        p = keys([(t0, (x0, 70, 0), "linear"), (t1, (x1, 12, 0), "linear")])
        s = keys([(t0, sc(100), "linear"), (t1, sc(30), "linear")])
        o = keys([(t0, 0, "linear"), (t0 + 6, 100, "linear"), (t1 - 6, 100, "linear"), (t1, 0, "linear")])
        art = solid(ellipse(10, 10), FLAME_INNER, FLAME_MID, 1, 1.5, 1)
        return layer(name, art, transform(p, s, 0, o), t0, t1)

    sway = {
        "p": FLAME_BASE, "a": FLAME_BASE,
        "s": flicker([(0, (100, 100)), (15, (97, 104)), (30, (102, 97)), (45, (98, 103)), (60, (100, 100))]),
        "r": flicker([(0, 0), (20, -2), (40, 2), (60, 0)]),
    }
    # Eight steps, as the icon's ext() takes: fewer leave a sawtooth along the tip at this size
    body = stack("body", solid(outer, FLAME_FACE, FLAME_DEPTH, 10, 12, 8), **sway)
    # The icon paints its gloss last, over the mid layer (tools/build_icons.py:307); it sways with the body
    shine = group("shine", [gloss(46, 124, 9, 20, 12, 55)], **sway)
    mid = group(
        "mid", [outer, fill(FLAME_MID)], a=FLAME_BASE,
        p=flicker([(0, FLAME_BASE), (20, (78, 182)), (40, (82, 182)), (60, FLAME_BASE)]),
        s=flicker([(0, (76, 76)), (12, (72, 82)), (30, (79, 72)), (48, (73, 80)), (60, (76, 76))]),
    )
    inner = group(
        "inner", [outer, fill(FLAME_INNER)], a=FLAME_BASE,
        p=flicker([(0, FLAME_BASE), (16, (82, 182)), (36, (78, 182)), (60, FLAME_BASE)]),
        s=flicker([(0, (50, 50)), (10, (46, 57)), (25, (53, 46)), (42, (47, 55)), (60, (50, 50))]),
    )
    flame = layer("flame", [body, mid, inner, shine], transform((0, 0, 0)), 0, end)
    embers = [ember("ember_a", 70, 56, 4, 40), ember("ember_b", 92, 110, 26, 58)]
    return animation("flame_flicker", w, h, end, [flame] + embers)


# ------------------------------------------------------------- OUTPUT
EFFECTS = {
    "burst": burst,
    "confetti": confetti,
    "sparkle_shower": sparkle_shower,
    "gem_fly_up": gem_fly_up,
    "chip_fly_up": chip_fly_up,
    "flame_flicker": flame_flicker,
}


def write(name, anim):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        f.write(json.dumps(anim, separators=(",", ":")) + "\n")
    return 1


def checked(name, anim):
    # The gate runs this file, so an effect at or over its ceiling stops the gate here instead of
    # reaching the app, as tools/build_sounds.py:235-242 does for a sound
    seconds = (anim["op"] - anim["ip"]) / anim["fr"]
    if seconds >= CEILING:
        raise SystemExit(f"{name} runs {seconds:.3f} s, not under its ceiling of {CEILING} s")
    return anim


def main():
    n = 0
    for name, fn in EFFECTS.items():
        n += write(name, checked(name, fn()))
    print("wrote", n, "lottie files to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
