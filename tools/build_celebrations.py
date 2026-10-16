"""Build the celebration animations for Felto.

Style: the hero of each celebration is a painting by Higgsfield in finish A, extruded flat, the style
of the approved Higgsfield reference (game-feel DESIGN.md, GF-20). Around it, the rays and the
particles are vector shapes in the style of tools/build_lottie.py: no outlines, solid fills, a
darker extrusion offset down-right and one small gloss highlight, with no hard pale shadow, for
the reason that file's docstring gives.

Every celebration is one Lottie animation, 400 by 400 at 60 frames a second, that plays once in
2.4 s, under its 2.5 s ceiling (GF-22, checked()), and ends on a held pose: the hero at scale 100
and rotation 0, the rays still showing, every particle gone. Back to front:
- rays: twelve thin wedges in a tint of the celebration's colour, a quarter white, at 65% opacity,
  which grow in over 0.3 s and turn 30 degrees over the whole animation.
- the hero: the painted PNG from assets/celebrations/art/ (tools/import_celebrations.py) as an
  image layer. A null parent fits its longer side to 70% of the canvas, so the hero's own scale
  keyframes are the motion alone and end at 100. Its anchor is its centre, or its top edge for
  the pendulum.
- particles: stars, dots and twinkles from tools/build_lottie.py, chips and gems, confetti and
  embers, each gone before the last frame.

The eighteen (GF-21), each as hero motion; particles; ray colour:
- lesson_complete: jump; confetti, and a burst as it lands; gold.
- perfect_lesson: jump; twinkles all around, and a gold star burst as it lands; gold.
- boss_beaten: drop from above, squash, bounce, then a small wobble that dies away; a gold star
  burst on impact; blue.
- review_done: pop (0, 118, 96, 100) with a tilt wobble; a burst of green dots; green.
- practice_done: rise from below, easing out, then a small float; confetti; purple.
- unit_complete: drop, squash, bounce; confetti, a burst on impact and twinkles; gold.
- streak_extended: jump; embers rising in the flame colours, and a burst as it lands; orange.
- streak_milestone: spin in like a tossed coin (x scale through 0), then pop; a burst and
  twinkles; gold.
- xp_milestone: the coin spin, then pop; twinkles and a burst; purple.
- achievement: swing in from above like a pendulum hung from its top edge, swinging less and
  less; confetti; blue.
- royal_flush: pop with a short rise; a gold burst and a shower of twinkles; gold.
- chip_jackpot: drop, squash, bounce; chips thrown out; gold.
- all_in_win: jump; chips thrown out as it lands, and confetti; gold.
- hot_streak: pop, then bob up and down twice; embers and a burst; orange.
- hearts_refilled: a heartbeat pop (0, 120, 95, 110, 100); a burst of red and pink dots; red.
- gems_earned: drop, squash, bounce; gems thrown out, and twinkles; ice blue.
- daily_goal: pop with the quick wobble of a struck target; a burst and twinkles; red.
- welcome: rise from below, overshoot, land in a squash and bounce; confetti; gold.

It reads only the PNGs in assets/celebrations/art/ that CELEBRATIONS names: each one's width and
height from its IHDR chunk, with no decode, and its bytes, copied whole into the archive (rule G1
as amended in version 1.4.0 of docs/conventions-python.md). Placement comes from build_lottie's
Lcg, one seed per celebration, so every run writes the same bytes.

Each file is a dotLottie archive (version 1): manifest.json, animations/<name>.json and
images/<name>.png, stored uncompressed with fixed dates and modes.

Outputs to assets/celebrations.
Run: python3 tools/build_celebrations.py
"""
import json
import math
import os
import struct
import zipfile

from build_lottie import (
    CHIPS,
    FLAME_FACE,
    FLAME_INNER,
    FLAME_MID,
    GEM_FACE,
    GEM_LIGHT,
    Lcg,
    bezier,
    chip,
    dot,
    fill,
    gem,
    group,
    keys,
    layer,
    prop,
    rect,
    sc,
    solid,
    star,
    transform,
    twinkle,
)
from common import CREAM

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "celebrations")
ART = os.path.join(OUT, "art")
GENERATOR = "felto tools/build_celebrations.py"
FPS = 60
SIZE = 400
CENTRE = (200, 200)
# GF-22: a celebration plays once in under 2.5 s, then holds its last frame
CEILING = 2.5
# 2.4 s for every celebration: the slowest hero settles by frame 96, which leaves the particles
# time to clear before the held pose
END = 144
# The hero's longer side on the canvas, so a 118% pop or a squash still fits inside it
HERO_SHARE = 0.7

RAY_COUNT = 12
RAY_SPAN = 9  # degrees each wedge covers
RAY_REACH = 290  # past the canvas corners, 283 from the centre
# A pale tint at a low opacity blends to khaki on the app's dark page (#141824): the rays of board
# item 61, 45% white at 35%, did. Board item 62 compared five pairs on both pages in lottie-web and
# kept this one, which stays a light colour on the dark page and does not crowd the hero on the
# light one (game-feel DESIGN.md, GF-27, the rays)
RAY_WHITE = 0.25  # the share of white in a ray's tint
RAY_OPACITY = 65
RAY_GROW = 18  # 0.3 s
RAY_TURN = 30

# The ray colour of each celebration, from the named colours of tools/build_lottie.py (rule C1)
RAYS = {
    "gold": CHIPS["gold"][0],
    "blue": CHIPS["blue"][0],
    "green": CHIPS["green"][0],
    "purple": CHIPS["purple"][0],
    "red": CHIPS["red"][0],
    "orange": FLAME_FACE,
    "ice": GEM_FACE,
}
# The pink of the hearts burst: the shark's tongue (tools/build_mascots.py:250), and a darker
# depth for it in the way CHIPS pairs a face with its depth (rule C3)
HEART_PINK, HEART_PINK_DEPTH = "#F7799F", "#B8456A"
DOT_COLOURS = [CHIPS[c][:2] for c in ("red", "blue", "green", "purple")]
TWINKLE_TINTS = [CHIPS["gold"][:2], (CREAM, CHIPS["gold"][1]), (GEM_LIGHT, GEM_FACE)]
ICE_TINTS = [(GEM_LIGHT, GEM_FACE), (CREAM, GEM_FACE)]
PAPER_COLOURS = list(CHIPS)
# Confetti cut as tools/build_lottie.py's confetti() cuts it
PAPER = [rect(10, 20, 3), rect(14, 14, 3), rect(8, 16, 2)]

# In image pixels, as a share of the hero's height: how far each motion carries it
JUMP_LIFT = 0.16
DROP_FROM = 1.6
RISE_FROM = 1.4
SWING_FROM = 1.5
BOB = 0.06


# ------------------------------------------------------------- NUMBERS
def toward(a, reach):
    return (CENTRE[0] + reach * math.cos(a), CENTRE[1] + reach * math.sin(a), 0)


def tint(colour, share):
    """The colour mixed with white; share is the part that is white."""
    h = colour.lstrip("#")
    return "#" + "".join(f"{round(int(h[i:i + 2], 16) * (1 - share) + 255 * share):02X}" for i in (0, 2, 4))


def track(rows, shape):
    """An animated property from (frame, value, ease) rows, or a still one from a single row."""
    rows = [(t, shape(v), ease) for t, v, ease in rows]
    return keys(rows) if len(rows) > 1 else prop(rows[0][1])


# ---------------------------------------------------------------- RAYS
def rays(colour):
    half = math.radians(RAY_SPAN / 2)
    wedges = []
    for k in range(RAY_COUNT):
        a = math.radians(k * 360 / RAY_COUNT - 90)
        tip = [(RAY_REACH * math.cos(a + d), RAY_REACH * math.sin(a + d)) for d in (-half, half)]
        wedges.append(bezier([(0, 0)] + tip))
    art = [group("rays", wedges + [fill(tint(RAYS[colour], RAY_WHITE))])]
    s = keys([(0, sc(0), "out"), (RAY_GROW, sc(100), "linear")])
    r = keys([(0, 0, "linear"), (END, RAY_TURN, "linear")])
    return layer("rays", art, transform(CENTRE + (0,), s, r, RAY_OPACITY), 0, END)


# -------------------------------------------------------------- MOTION
# A motion is the hero's three tracks, each a list of (frame, value, ease) rows: "p" an offset
# from its resting place in image pixels, "s" its (x, y) scale, "r" its rotation. Every track ends
# on the held pose: offset 0, scale 100, rotation 0.
def still_motion(**tracks):
    return {"p": [(0, (0, 0), "linear")], "s": [(0, (100, 100), "linear")], "r": [(0, 0, "linear")]} | tracks


def grounded(h, rows):
    """Rows of (frame, (sx, sy), lift, ease): the anchor is the hero's centre, so its centre drops
    by half the height a squash takes away, and its bottom edge stays on the ground."""
    p = [(t, (0, h / 2 * (1 - sy / 100) - lift), ease) for t, (sx, sy), lift, ease in rows]
    s = [(t, (sx, sy), ease) for t, (sx, sy), lift, ease in rows]
    return still_motion(p=p, s=s)


def jump(h, t0=0):
    """Pop up from the ground, crouch, leap with a stretch, land in a squash and settle; lands at t0 + 52."""
    up = JUMP_LIFT * h
    return grounded(h, [
        (t0, (0, 0), 0, "out"), (t0 + 10, (100, 100), 0, "inout"),
        (t0 + 18, (112, 88), 0, "out"), (t0 + 26, (92, 110), up / 2, "out"),
        (t0 + 40, (98, 103), up, "in"), (t0 + 52, (118, 82), 0, "out"),
        (t0 + 62, (95, 106), 0, "inout"), (t0 + 72, (100, 100), 0, "linear"),
    ])


def drop(h, t0=0):
    """Fall in from above the canvas, land at t0 + 20, squash, bounce once and settle."""
    return grounded(h, [
        (t0, (100, 100), DROP_FROM * h, "in"), (t0 + 20, (100, 100), 0, "out"),
        (t0 + 26, (122, 78), 0, "out"), (t0 + 36, (94, 108), 0.08 * h, "in"),
        (t0 + 46, (104, 96), 0, "out"), (t0 + 56, (100, 100), 0, "linear"),
    ])


def scaled(rows):
    return still_motion(s=[(t, (v, v), ease) for t, v, ease in rows])


def pop(t0=0):
    """Grow from nothing past full size, dip under it and settle: 0, 118, 96, 100."""
    return scaled([(t0, 0, "out"), (t0 + 12, 118, "inout"), (t0 + 20, 96, "inout"), (t0 + 28, 100, "linear")])


def beat(t0=0):
    """A heartbeat: 0, 120, 95, 110, 100."""
    return scaled([
        (t0, 0, "out"), (t0 + 10, 120, "inout"), (t0 + 18, 95, "inout"),
        (t0 + 26, 110, "inout"), (t0 + 36, 100, "linear"),
    ])


def flip(t0=0):
    """Spin in like a tossed coin, the x scale through 0 twice as it grows, then pop."""
    return still_motion(s=[
        (t0, (0, 60), "out"), (t0 + 9, (100, 80), "in"), (t0 + 17, (0, 92), "out"),
        (t0 + 26, (100, 100), "inout"), (t0 + 36, (118, 118), "inout"),
        (t0 + 44, (96, 96), "inout"), (t0 + 52, (100, 100), "linear"),
    ])


def swing(h, t0=0):
    """Drop in from above hung by the top edge, and swing less and less; use with hero(top=True)."""
    angles = [28, -20, 14, -9, 5, -2, 0]
    times = [t0, t0 + 18, t0 + 34, t0 + 50, t0 + 64, t0 + 76, t0 + 86]
    return still_motion(
        p=[(t0, (0, -SWING_FROM * h), "out"), (t0 + 18, (0, 0), "linear")],
        r=[(t, a, "inout") for t, a in zip(times, angles)],
    )


def rise(h, t0=0):
    """Rise from below the canvas, easing out, then float up a little and back."""
    return still_motion(p=[
        (t0, (0, RISE_FROM * h), "out"), (t0 + 30, (0, 0), "inout"),
        (t0 + 50, (0, -0.04 * h), "inout"), (t0 + 70, (0, 0), "linear"),
    ])


def bob(h, t0, times=2):
    """A position track that lifts the hero by BOB of its height and back, times over."""
    rows = [(t0, (0, 0), "inout")]
    for k in range(times):
        rows += [(t0 + 24 * k + 12, (0, -BOB * h), "inout"), (t0 + 24 * k + 24, (0, 0), "inout")]
    return rows


def wobble(t0, angles, step):
    """A rotation track that tilts to each angle in turn, step frames apart, and ends upright."""
    rows = [(t0, 0, "inout")] + [(t0 + step * (k + 1), a, "inout") for k, a in enumerate(angles)]
    return rows + [(t0 + step * (len(angles) + 1), 0, "linear")]


# ---------------------------------------------------------------- HERO
def hero(w, h, motion, top=False):
    """The fit null and the painted hero; the null scales the hero so its own scale ends at 100."""
    fit = HERO_SHARE * SIZE / max(w, h) * 100
    rest = (0, -h / 2) if top else (0, 0)
    p = track(motion["p"], lambda v: (rest[0] + v[0], rest[1] + v[1], 0))
    s = track(motion["s"], lambda v: (v[0], v[1], 100))
    r = track(motion["r"], lambda v: v)
    ks = transform(p, s, r) | {"a": prop((w / 2, 0 if top else h / 2, 0))}
    timing = {"ip": 0, "op": END, "st": 0, "bm": 0}
    null = {"ddd": 0, "ty": 3, "nm": "fit", "sr": 1, "ks": transform(CENTRE + (0,), sc(fit)), "ao": 0} | timing
    image = {"ddd": 0, "ty": 2, "nm": "hero", "refId": "hero", "sr": 1, "ks": ks, "ao": 0, "parent": "fit"}
    return [null, image | timing]


# ----------------------------------------------------------- PARTICLES
def fly_out(name, art, a, seed, t0):
    """One piece of a burst: it pops in at the hero's edge, flies out, shrinks and fades."""
    reach, t1 = seed.between(140, 180), t0 + round(seed.between(30, 40))
    p = keys([(t0, toward(a, 90), "out"), (t1, toward(a, reach), "linear")])
    s = keys([(t0, sc(0), "out"), (t0 + 8, sc(115), "inout"), (t0 + 14, sc(100), "linear"), (t1 + 6, sc(55), "linear")])
    r = keys([(t0, 0, "out"), (t1, seed.sign() * seed.between(40, 120), "linear")])
    o = keys([(t0, 100, "linear"), (t1 - 6, 100, "linear"), (t1 + 6, 0, "linear")])
    return layer(name, art, transform(p, s, r, o), t0, t1 + 6)


def burst_ring(seed, t0, arts):
    """The pieces fly out on evenly spread headings, as tools/build_lottie.py's burst() throws them."""
    n = len(arts)
    return [
        fly_out(f"burst_{k}", art, math.radians(k * 360 / n + seed.between(-8, 8)), seed, t0 + round(seed.between(0, 4)))
        for k, art in enumerate(arts)
    ]


def star_and_dots(seed, n, colours=DOT_COLOURS):
    """Gold stars between dots, as build_lottie's burst() alternates them."""
    return [
        star(seed.between(13, 18), *CHIPS["gold"][:2]) if k % 2 == 0 else dot(seed.between(7, 10), *colours[k // 2 % len(colours)])
        for k in range(n)
    ]


def gold_stars(seed, n):
    return [star(seed.between(13, 18), *CHIPS["gold"][:2]) for _ in range(n)]


def dots(seed, n, colours):
    return [dot(seed.between(7, 11), *colours[k % len(colours)]) for k in range(n)]


def twinkle_ring(seed, t0, n, span, tints):
    """Twinkles that blink in turn on a ring outside the hero, starting within span frames of t0."""
    o = []
    for k in range(n):
        at = toward(math.radians(k * 360 / n + seed.between(-12, 12)), seed.between(145, 175))
        start, life = t0 + round(seed.between(0, span)), round(seed.between(24, 34))
        art = twinkle(seed.between(9, 15), *tints[k % len(tints)])
        s = keys([(start, sc(0), "out"), (start + round(life * 0.4), sc(100), "in"), (start + life, sc(0), "linear")])
        r = keys([(start, 0, "linear"), (start + life, seed.sign() * seed.between(45, 90), "linear")])
        o.append(layer(f"twinkle_{k}", art, transform(at, s, r), start, start + life))
    return o


def twinkle_shower(seed, t0, n, tints):
    """Twinkles that drift down over the whole canvas, one in each cell of a grid four across."""
    o = []
    for k in range(n):
        x, y = 50 + 100 * (k % 4) + seed.between(-25, 25), 45 + 105 * (k // 4) + seed.between(-20, 20)
        start, life = t0 + round(seed.between(0, 50)), round(seed.between(28, 38))
        art = twinkle(seed.between(9, 16), *tints[k % len(tints)])
        p = keys([(start, (x, y, 0), "linear"), (start + life, (x, y + seed.between(16, 34), 0), "linear")])
        s = keys([(start, sc(0), "out"), (start + round(life * 0.4), sc(100), "in"), (start + life, sc(0), "linear")])
        o.append(layer(f"shower_{k}", art, transform(p, s), start, start + life))
    return o


def embers(seed, t0, n):
    """Flame-coloured sparks that rise from the hero's lower half, drift and burn out."""
    o = []
    for k in range(n):
        x0, start, life = seed.between(110, 290), t0 + round(seed.between(0, 50)), round(seed.between(36, 52))
        art = dot(seed.between(5, 8), *[(FLAME_INNER, FLAME_MID), (FLAME_MID, FLAME_FACE)][k % 2])
        rise_to = (x0 + seed.between(-30, 30), seed.between(30, 90), 0)
        p = keys([(start, (x0, seed.between(250, 320), 0), "out"), (start + life, rise_to, "linear")])
        s = keys([(start, sc(0), "out"), (start + 8, sc(110), "linear"), (start + life, sc(30), "linear")])
        fade = keys([(start, 100, "linear"), (start + life - 8, 100, "linear"), (start + life, 0, "linear")])
        o.append(layer(f"ember_{k}", art, transform(p, s, 0, fade), start, start + life))
    return o


def thrown(u, x_reach, rise):
    """Where a thrown piece is a share u through its flight: out at a steady pace, up to its peak
    at 0.4, then down past where it started as gravity pulls."""
    return (CENTRE[0] + x_reach * u, CENTRE[1] + 20 - rise * (5 * u - 6.25 * u * u), 0)


def fling(seed, t0, arts, name):
    """The pieces are thrown up and out from the hero, fall back under gravity, spin and fade."""
    o = []
    for k, art in enumerate(arts):
        start, life = t0 + round(seed.between(0, 10)), round(seed.between(50, 62))
        x_reach, rise = seed.sign() * seed.between(60, 180), seed.between(130, 180)
        frames = list(range(start, start + life, 4)) + [start + life]
        p = keys([(t, thrown((t - start) / life, x_reach, rise), "linear") for t in frames])
        s = keys([(start, sc(0), "out"), (start + 8, sc(100), "linear")])
        r = keys([(start, 0, "linear"), (start + life, seed.sign() * seed.between(180, 400), "linear")])
        fade = keys([(start, 100, "linear"), (start + life - 10, 100, "linear"), (start + life, 0, "linear")])
        o.append(layer(f"{name}_{k}", art, transform(p, s, r, fade), start, start + life))
    return o


def chips(seed, n):
    return [chip(seed.between(17, 21), *CHIPS[PAPER_COLOURS[k % len(PAPER_COLOURS)]]) for k in range(n)]


def gems(seed, n):
    return [gem(seed.between(34, 42)) for _ in range(n)]


def falling(dt, life, x0, y0, sway, hz, phase):
    u = dt / life
    return (x0 + sway * math.sin(2 * math.pi * hz * dt / FPS + phase), y0 + (SIZE + 30 - y0) * u * (0.4 + 0.6 * u), 0)


def flipping(dt, flip_hz):
    # Grows in over 0.1 s, then narrows to an edge and back as the piece flips
    grow = min(1, dt / 6)
    return (100 * grow * max(0.15, abs(math.cos(2 * math.pi * flip_hz * dt / FPS))), 100 * grow, 100)


def paper(seed, k, t0):
    """One piece of confetti: it drops from above the canvas, sways, spins and flips edge-on, then fades."""
    face, dark = CHIPS[PAPER_COLOURS[k % len(PAPER_COLOURS)]][:2]
    x0, y0, start = seed.between(20, SIZE - 20), seed.between(-50, 0), t0 + round(seed.between(0, 24))
    end = min(start + round(seed.between(80, 100)), END - 6)
    sway, hz, phase, flip_hz = seed.between(8, 20), seed.between(0.7, 1.3), seed.between(0, 2 * math.pi), seed.between(0.8, 1.4)
    spin, turn = seed.between(0, 180), seed.sign() * seed.between(240, 520)
    frames = list(range(start, end, 4)) + [end]
    p = keys([(t, falling(t - start, end - start, x0, y0, sway, hz, phase), "linear") for t in frames])
    s = keys([(t, flipping(t - start, flip_hz), "linear") for t in frames])
    r = keys([(start, spin, "linear"), (end, spin + turn, "linear")])
    o = keys([(start, 100, "linear"), (end - 12, 100, "linear"), (end, 0, "linear")])
    return layer(f"paper_{k}", solid(PAPER[k % 3], face, dark, 1.5, 2, 1), transform(p, s, r, o), start, end)


def confetti(seed, t0, n):
    return [paper(seed, k, t0) for k in range(n)]


# -------------------------------------------------------- CELEBRATIONS
# Each returns its layers back to front; the seed is the celebration's own (rule G1)
def lesson_complete(w, h):
    seed = Lcg(6101)
    return [rays("gold")] + hero(w, h, jump(h)) + confetti(seed, 0, 22) + burst_ring(seed, 52, star_and_dots(seed, 12))


def perfect_lesson(w, h):
    seed = Lcg(6102)
    o = [rays("gold")] + hero(w, h, jump(h))
    return o + twinkle_ring(seed, 8, 12, 90, TWINKLE_TINTS) + burst_ring(seed, 52, gold_stars(seed, 10))


def boss_beaten(w, h):
    seed = Lcg(6103)
    motion = drop(h) | {"r": wobble(56, [8, -6, 4, -2], 8)}
    return [rays("blue")] + hero(w, h, motion) + burst_ring(seed, 20, gold_stars(seed, 10))


def review_done(w, h):
    seed = Lcg(6104)
    motion = pop() | {"r": wobble(4, [-12, 9, -5, 2], 8)}
    return [rays("green")] + hero(w, h, motion) + burst_ring(seed, 8, dots(seed, 12, [CHIPS["green"][:2]]))


def practice_done(w, h):
    seed = Lcg(6105)
    return [rays("purple")] + hero(w, h, rise(h)) + confetti(seed, 18, 22)


def unit_complete(w, h):
    seed = Lcg(6106)
    o = [rays("gold")] + hero(w, h, drop(h)) + confetti(seed, 14, 22)
    return o + burst_ring(seed, 20, star_and_dots(seed, 12)) + twinkle_ring(seed, 40, 8, 70, TWINKLE_TINTS)


def streak_extended(w, h):
    seed = Lcg(6107)
    return [rays("orange")] + hero(w, h, jump(h)) + embers(seed, 6, 12) + burst_ring(seed, 52, star_and_dots(seed, 12))


def streak_milestone(w, h):
    seed = Lcg(6108)
    o = [rays("gold")] + hero(w, h, flip())
    return o + burst_ring(seed, 28, star_and_dots(seed, 12)) + twinkle_ring(seed, 30, 10, 70, TWINKLE_TINTS)


def xp_milestone(w, h):
    seed = Lcg(6109)
    o = [rays("purple")] + hero(w, h, flip())
    return o + twinkle_ring(seed, 20, 10, 70, TWINKLE_TINTS) + burst_ring(seed, 28, star_and_dots(seed, 12))


def achievement(w, h):
    seed = Lcg(6110)
    return [rays("blue")] + hero(w, h, swing(h), top=True) + confetti(seed, 10, 22)


def royal_flush(w, h):
    seed = Lcg(6111)
    motion = pop() | {"p": [(0, (0, 0.18 * h), "out"), (24, (0, 0), "linear")]}
    gold = [CHIPS["gold"][:2]]
    o = [rays("gold")] + hero(w, h, motion) + burst_ring(seed, 8, star_and_dots(seed, 12, gold))
    return o + twinkle_shower(seed, 20, 16, TWINKLE_TINTS)


def chip_jackpot(w, h):
    seed = Lcg(6112)
    return [rays("gold")] + hero(w, h, drop(h)) + fling(seed, 20, chips(seed, 10), "chip")


def all_in_win(w, h):
    seed = Lcg(6113)
    return [rays("gold")] + hero(w, h, jump(h)) + confetti(seed, 0, 18) + fling(seed, 52, chips(seed, 8), "chip")


def hot_streak(w, h):
    seed = Lcg(6114)
    motion = pop() | {"p": bob(h, 30)}
    return [rays("orange")] + hero(w, h, motion) + embers(seed, 6, 14) + burst_ring(seed, 8, star_and_dots(seed, 10))


def hearts_refilled(w, h):
    seed = Lcg(6115)
    hearts = [CHIPS["red"][:2], (HEART_PINK, HEART_PINK_DEPTH)]
    return [rays("red")] + hero(w, h, beat()) + burst_ring(seed, 6, dots(seed, 12, hearts))


def gems_earned(w, h):
    seed = Lcg(6116)
    o = [rays("ice")] + hero(w, h, drop(h)) + fling(seed, 20, gems(seed, 8), "gem")
    return o + twinkle_ring(seed, 30, 8, 60, ICE_TINTS)


def daily_goal(w, h):
    seed = Lcg(6117)
    motion = pop() | {"r": wobble(8, [14, -10, 7, -4, 2], 5)}
    o = [rays("red")] + hero(w, h, motion) + burst_ring(seed, 8, star_and_dots(seed, 12))
    return o + twinkle_ring(seed, 24, 8, 60, TWINKLE_TINTS)


def welcome(w, h):
    seed = Lcg(6118)
    motion = grounded(h, [
        (0, (100, 100), -RISE_FROM * h, "out"), (24, (96, 106), 0.1 * h, "in"),
        (34, (110, 90), 0, "out"), (44, (98, 103), 0.03 * h, "in"), (52, (100, 100), 0, "linear"),
    ])
    return [rays("gold")] + hero(w, h, motion) + confetti(seed, 16, 22)


CELEBRATIONS = {
    "lesson_complete": lesson_complete,
    "perfect_lesson": perfect_lesson,
    "boss_beaten": boss_beaten,
    "review_done": review_done,
    "practice_done": practice_done,
    "unit_complete": unit_complete,
    "streak_extended": streak_extended,
    "streak_milestone": streak_milestone,
    "xp_milestone": xp_milestone,
    "achievement": achievement,
    "royal_flush": royal_flush,
    "chip_jackpot": chip_jackpot,
    "all_in_win": all_in_win,
    "hot_streak": hot_streak,
    "hearts_refilled": hearts_refilled,
    "gems_earned": gems_earned,
    "daily_goal": daily_goal,
    "welcome": welcome,
}


# -------------------------------------------------------------- OUTPUT
def art_size(name):
    """The painted hero's width and height, read from its PNG's IHDR chunk with no decode."""
    with open(os.path.join(ART, name + ".png"), "rb") as f:
        head = f.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n" or head[12:16] != b"IHDR":
        raise SystemExit(f"{name}.png is not a PNG; run python3 tools/import_celebrations.py")
    return struct.unpack(">II", head[16:24])


def animation(name, w, h, back_to_front):
    # Lottie paints the first layer on top, so the list is reversed (rule L4); the hero's parent is
    # written by name in hero() and becomes the fit null's index here
    layers = [dict(ly, ind=i + 1) for i, ly in enumerate(back_to_front[::-1])]
    fit = next(ly["ind"] for ly in layers if ly["nm"] == "fit")
    layers = [ly | {"parent": fit} if "parent" in ly else ly for ly in layers]
    asset = {"id": "hero", "w": w, "h": h, "u": "/images/", "p": f"{name}.png", "e": 0}
    return {
        "v": "5.7.4", "fr": FPS, "ip": 0, "op": END, "w": SIZE, "h": SIZE,
        "nm": name, "ddd": 0, "assets": [asset], "layers": layers,
    }


def checked(name, anim):
    # The gate runs this file, so a celebration at or over its ceiling stops the gate here instead
    # of reaching the app, as tools/build_lottie.py does for an effect
    seconds = (anim["op"] - anim["ip"]) / anim["fr"]
    if seconds >= CEILING:
        raise SystemExit(f"{name} runs {seconds:.3f} s, not under its ceiling of {CEILING} s")
    return anim


def entry(path):
    # A fixed date, system and mode for every entry, so the archive's bytes depend only on what it holds
    info = zipfile.ZipInfo(path, date_time=(1980, 1, 1, 0, 0, 0))
    info.compress_type = zipfile.ZIP_STORED
    info.create_system = 3
    info.external_attr = 0o644 << 16
    return info


def write(name, anim):
    """The dotLottie archive: the manifest, the animation, then the hero's PNG, copied byte for byte."""
    manifest = {"version": "1", "generator": GENERATOR, "animations": [{"id": name, "speed": 1, "loop": False, "direction": 1}]}
    with open(os.path.join(ART, name + ".png"), "rb") as f:
        png = f.read()
    parts = [("manifest.json", manifest), (f"animations/{name}.json", anim)]
    os.makedirs(OUT, exist_ok=True)
    with zipfile.ZipFile(os.path.join(OUT, name + ".lottie"), "w", zipfile.ZIP_STORED) as z:
        for path, data in parts:
            z.writestr(entry(path), json.dumps(data, separators=(",", ":")))
        z.writestr(entry(f"images/{name}.png"), png)
    return 1


def main():
    n = 0
    for name, fn in CELEBRATIONS.items():
        w, h = art_size(name)
        n += write(name, checked(name, animation(name, w, h, fn(w, h))))
    print("wrote", n, "celebrations to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
