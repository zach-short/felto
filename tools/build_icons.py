#!/usr/bin/env python3
"""Build the extruded-flat icon set for Felto.

Style (from the approved Higgsfield reference): no outlines, solid fills,
a thick darker extrusion offset down-right, a hard pale shadow behind it,
and one small gloss highlight.

Outputs to assets/icons/{chips,cards,path,ui}.
Run: python3 tools/build_icons.py

Note: card ranks use <text>. Convert text to outlines before importing
into Rive, or set the font in Rive.
"""
import math
import os

from common import CREAM, SHADOW, ext, gloss, sector, stroke, svg, tf, write

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "icons")
FONT = "'FeltoRank','Arial Rounded MT Bold','Helvetica Neue',Arial,sans-serif"


def solid(sil, face, dark, dx=10, dy=14, shadow=True):
    """Shadow, then extrusion, then the face (face drawn by caller via sil)."""
    s = ""
    if shadow:
        s += f'<g id="shadow">{ext(sil, SHADOW, dx * 2.1, dy * 1.9, 10)}</g>'
    s += f'<g id="depth">{ext(sil, dark, dx, dy)}</g>'
    s += f'<g id="face">{sil(face, 0, 0)}</g>'
    return s


# ---------------------------------------------------------------- CHIPS
CHIPS = {
    "red": ("#E8252F", "#8E0F1A", "#F0414A"),
    "blue": ("#2F7BF0", "#0F47B8", "#5A98F5"),
    "green": ("#22B573", "#0E7A4B", "#45CC8F"),
    "black": ("#3A4152", "#1B1F2B", "#5A6277"),
    "gold": ("#FFC83A", "#C98F00", "#FFD968"),
    "purple": ("#8A5BFF", "#4F2FC4", "#A583FF"),
}


def chip(color, dark, light):
    cx, cy, r = 100, 96, 86
    sil = lambda f, x, y: f'<circle {tf(x, y)} cx="{cx}" cy="{cy}" r="{r}" fill="{f}"/>'
    o = [solid(sil, color, dark, 12, 14)]
    wedges = "".join(
        f'<path d="{sector(cx, cy, 58, r, k * 45 - 11, k * 45 + 11)}" fill="{CREAM}"/>'
        for k in range(8)
    )
    o.append(f'<g id="notches">{wedges}</g>')
    o.append(f'<circle id="ring" cx="{cx}" cy="{cy}" r="60" fill="{dark}" opacity=".55"/>')
    o.append(f'<circle id="disc" cx="{cx}" cy="{cy}" r="55" fill="{color}"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="44" fill="{light}" opacity=".35"/>')
    o.append(gloss(cx - 22, cy - 26, 18, 10, -40))
    return svg(230, 230, "\n".join(o))


def chip_stack(color, dark, light, n=3):
    """3/4 view stack. Each chip is a side band plus a top face. Chips are
    drawn bottom to top; the lower edge of each band lies exactly on the top
    ellipse of the chip below. Stripes and the shaded lower edge follow the
    curve of the band, so nothing is cut off or sticks out."""
    cx, rx, ry, t = 100, 72, 22, 26
    base_y = 150
    ys = [base_y - i * t for i in range(n)]

    def curve(u):  # vertical drop of the ellipse front edge at x = cx + u*rx
        return ry * math.sqrt(max(0.0, 1 - u * u))

    def band(y):
        return (
            f"M{cx - rx} {y} L{cx - rx} {y + t} A{rx} {ry} 0 0 0 {cx + rx} {y + t} "
            f"L{cx + rx} {y} Z"
        )

    def strip(y, top_off, bot_off, u0, u1, steps=8):
        """Closed polygon between two curved edges (offsets from the band top)."""
        us = [u0 + (u1 - u0) * i / steps for i in range(steps + 1)]
        upper = [(cx + u * rx, y + top_off + curve(u)) for u in us]
        lower = [(cx + u * rx, y + bot_off + curve(u)) for u in reversed(us)]
        pts = upper + lower
        return "M" + " L".join(f"{a:.1f} {b:.1f}" for a, b in pts) + "Z"

    def sil_all(f, tx, ty):
        s = ""
        for y in ys:
            s += f'<path transform="translate({tx:.2f} {ty:.2f})" d="{band(y)}" fill="{f}"/>'
            s += f'<ellipse transform="translate({tx:.2f} {ty:.2f})" cx="{cx}" cy="{y}" rx="{rx}" ry="{ry}" fill="{f}"/>'
        return s

    o = [f'<g id="shadow">{ext(sil_all, SHADOW, 20, 14, 10)}</g>']
    for i, y in enumerate(ys):
        o.append(f'<g id="chip_{i}">')
        o.append(f'<path d="{band(y)}" fill="{color}"/>')
        o.append(f'<path d="{strip(y, t - 8, t, -1, 1, 24)}" fill="{dark}"/>')
        for k in range(-2, 3):
            th = math.radians(k * 31)
            u = math.sin(th)
            half = 9 * math.cos(th) / rx
            o.append(f'<path d="{strip(y, 7, t - 11, u - half, u + half, 4)}" fill="{CREAM}"/>')
        o.append(f'<ellipse cx="{cx}" cy="{y}" rx="{rx}" ry="{ry}" fill="{color}"/>')
        o.append("</g>")
    ty = ys[-1]
    # top face: the same rim wedges and raised disc as the top-view chip,
    # squashed into the ellipse
    k = ry / rx
    wedges = "".join(
        f'<path d="{sector(0, 0, rx * 0.74, rx, a * 45 - 11, a * 45 + 11)}" fill="{CREAM}"/>'
        for a in range(8)
    )
    o.append(
        f'<g id="top_face" transform="translate({cx} {ty}) scale(1 {k:.4f})">'
        f'<circle r="{rx}" fill="{color}"/>{wedges}'
        f'<circle r="{rx * 0.7}" fill="{dark}" opacity=".5"/>'
        f'<circle r="{rx * 0.65}" fill="{color}"/>'
        f'<circle r="{rx * 0.5}" fill="{light}" opacity=".35"/></g>'
    )
    o.append(
        f'<ellipse cx="{cx - 28}" cy="{ty - 4}" rx="11" ry="3.5" '
        f'transform="rotate(-8 {cx - 28} {ty - 4})" fill="#fff" opacity=".65"/>'
    )
    return svg(230, 230, "\n".join(o))


# --------------------------------------------------------------- CARDS
RED = "#E0283A"
NAVY = "#2B3347"
CARD_DEPTH = "#3B4560"

SUIT_PATHS = {
    "hearts": "M0 30 C-44 -2 -40 -38 -14 -38 C-4 -38 0 -30 0 -26 C0 -30 4 -38 14 -38 C40 -38 44 -2 0 30Z",
    "diamonds": "M0 -40 Q4 -36 32 -4 Q36 0 32 4 Q4 36 0 40 Q-4 36 -32 4 Q-36 0 -32 -4 Q-4 -36 0 -40Z",
}
# spades = the heart flipped, plus a flared stem. Drawn in two paths so the
# stem overlaps the lobes without a seam.
SPADE_BODY = "M0 -30 C-44 2 -40 38 -14 38 C-4 38 0 30 0 26 C0 30 4 38 14 38 C40 38 44 2 0 -30Z"
SPADE_STEM = "M0 14 C0 28 -4 38 -16 46 H16 C4 38 0 28 0 14Z"
CLUB_CIRCLES = [(0, -18, 18), (-20, 10, 18), (20, 10, 18), (0, 2, 14)]
CLUB_STEM = "M0 6 C0 24 -4 34 -14 42 H14 C4 34 0 24 0 6Z"
SUIT_COLOR = {"hearts": RED, "diamonds": RED, "spades": NAVY, "clubs": NAVY}
SUIT_ORDER = ["spades", "hearts", "diamonds", "clubs"]
RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]


def suit_shape(suit, color, scale=1.0, x=0, y=0):
    t = f'transform="translate({x} {y}) scale({scale})"'
    if suit == "clubs":
        circles = "".join(f'<circle cx="{a}" cy="{b}" r="{c}"/>' for a, b, c in CLUB_CIRCLES)
        return f'<g {t} fill="{color}"><g transform="translate(0 -3)">{circles}<path d="{CLUB_STEM}"/></g></g>'
    if suit == "spades":
        return (
            f'<g {t} fill="{color}"><g transform="translate(0 -8)">'
            f'<path d="{SPADE_BODY}"/><path d="{SPADE_STEM}"/></g></g>'
        )
    return f'<g {t}><path d="{SUIT_PATHS[suit]}" fill="{color}"/></g>'


CW, CH = 150, 210


def card_sil(f, x, y):
    return f'<rect {tf(x, y)} x="10" y="8" width="{CW - 30}" height="{CH - 30}" rx="18" fill="{f}"/>'


def card_face(rank, suit):
    col = SUIT_COLOR[suit]
    o = [solid(card_sil, CREAM, CARD_DEPTH, 11, 13)]
    fs = 30 if rank != "10" else 25
    cxm = 10 + (CW - 30) / 2
    cym = 8 + (CH - 30) / 2
    o.append(
        f'<text id="rank_tl" x="34" y="48" font-family="{FONT}" font-weight="800" '
        f'font-size="{fs}" fill="{col}" text-anchor="middle">{rank}</text>'
    )
    o.append(
        f'<g transform="rotate(180 {cxm} {cym})"><text x="34" y="48" font-family="{FONT}" '
        f'font-weight="800" font-size="{fs}" fill="{col}" text-anchor="middle">{rank}</text></g>'
    )
    o.append(f'<g id="pip">{suit_shape(suit, col, 1.1, cxm + 4, cym + 2)}</g>')
    o.append(gloss(CW - 46, 28, 16, 8, 35, 0.8))
    return svg(CW + 12, CH, "\n".join(o))


def card_back():
    o = [solid(card_sil, "#2F7BF0", "#0F47B8", 11, 13)]
    o.append('<clipPath id="backClip"><rect x="24" y="22" width="102" height="148" rx="10"/></clipPath>')
    o.append(f'<rect x="24" y="22" width="102" height="148" rx="10" fill="#2468D8"/>')
    lat = ""
    for i in range(-6, 12):
        lat += f'<path d="M{24 + i * 22} 22 L{24 + i * 22 + 150} 172" stroke="#5A98F5" stroke-width="3" fill="none"/>'
        lat += f'<path d="M{24 + i * 22 + 150} 22 L{24 + i * 22} 172" stroke="#5A98F5" stroke-width="3" fill="none"/>'
    o.append(f'<g clip-path="url(#backClip)">{lat}</g>')
    o.append(f'<rect x="24" y="22" width="102" height="148" rx="10" fill="none" stroke="{CREAM}" stroke-width="4"/>')
    o.append(f'<circle cx="77" cy="96" r="30" fill="#8E0F1A"/>')
    o.append(f'<circle cx="75" cy="93" r="30" fill="#E8252F"/>')
    o.append(f'<circle cx="75" cy="93" r="19" fill="none" stroke="{CREAM}" stroke-width="4"/>')
    o.append(f'<path d="M75 80 L87 93 L75 106 L63 93Z" fill="{CREAM}"/>')
    o.append(gloss(CW - 46, 28, 16, 8, 35, 0.35))
    return svg(CW + 12, CH, "\n".join(o))


# ----------------------------------------------------- PATH NODE GLYPHS
def star_path(r_out=34, r_in=15):
    pts = []
    for i in range(10):
        r = r_out if i % 2 == 0 else r_in
        a = -math.pi / 2 + i * math.pi / 5
        pts.append(f"{r * math.cos(a):.1f} {r * math.sin(a):.1f}")
    return "M" + " L".join(pts) + "Z"


def g_star(c):
    return f'<path d="{star_path()}" fill="{c}" stroke="{c}" stroke-width="8" stroke-linejoin="round"/>'


def g_check(c):
    return stroke("M-26 2 L-8 20 L27 -18", 15, c)


def g_lock(c):
    return (
        f'<path d="M-13 -2 V-15 A13 13 0 0 1 13 -15 V-2" fill="none" stroke="{c}" stroke-width="9" stroke-linecap="round"/>'
        f'<rect x="-23" y="-4" width="46" height="36" rx="8" fill="{c}"/>'
    )


def g_trophy(c):
    return (
        f'<path d="M-24 -18 H-35 Q-35 7 -15 9" fill="none" stroke="{c}" stroke-width="8" stroke-linecap="round"/>'
        f'<path d="M24 -18 H35 Q35 7 15 9" fill="none" stroke="{c}" stroke-width="8" stroke-linecap="round"/>'
        f'<path d="M-24 -32 H24 V-8 A24 24 0 0 1 -24 -8Z" fill="{c}"/>'
        f'<rect x="-6" y="13" width="12" height="13" fill="{c}"/>'
        f'<rect x="-18" y="25" width="36" height="9" rx="3" fill="{c}"/>'
    )


def g_cards(c):
    return (
        f'<g transform="rotate(-14 -8 4)"><rect x="-32" y="-28" width="36" height="52" rx="7" fill="{c}" opacity=".75"/></g>'
        f'<g transform="rotate(12 8 4)"><rect x="-6" y="-26" width="38" height="54" rx="7" fill="{c}"/></g>'
    )


# state: face, dark, light-glyph colour, glyph shadow, glyph fn
NODE_STATES = {
    "available": ("#2F7BF0", "#0F47B8", CREAM, "#0F47B8", g_star),
    "complete": ("#FFC83A", "#C98F00", CREAM, "#C98F00", g_check),
    "locked": ("#DADFEA", "#A4ACC0", "#8D96AB", "#F4F6FA", g_lock),
    "boss": ("#8A5BFF", "#4F2FC4", CREAM, "#4F2FC4", g_trophy),
    "review": ("#22B573", "#0E7A4B", CREAM, "#0E7A4B", g_cards),
}

NR = 80


def node(face, dark, gcol, gshadow, glyph, ring=None, arc=True):
    """Same node size in every state. The current node has a progress ring
    around it, so it gets a larger canvas and no hard shadow (the ring
    would otherwise sit under the shadow). arc=False leaves the progress arc
    out, so the app can draw it from the player's real progress."""
    if ring is None:
        size, cx, cy = 230, 106, 98
    else:
        size, cx, cy = 270, 130, 128
    sil = lambda f, x, y: f'<circle {tf(x, y)} cx="{cx}" cy="{cy}" r="{NR}" fill="{f}"/>'
    o = []
    if ring is not None:
        r = 108
        circ = 2 * math.pi * r
        o.append(f'<circle id="ring_track" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#DDE1EC" stroke-width="12"/>')
        if arc:
            o.append(
                f'<circle id="ring_progress" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#FFC83A" stroke-width="12" '
                f'stroke-linecap="round" stroke-dasharray="{circ * ring:.1f} {circ:.1f}" '
                f'transform="rotate(-90 {cx} {cy})"/>'
            )
    if ring is None:
        o.append(solid(sil, face, dark, 9, 15))
    else:  # current node: flat disc inside the ring, no depth edge, no shadows
        o.append(f'<g id="face">{sil(face, 0, 0)}</g>')
    o.append(gloss(cx - 34, cy - 46, 22, 11, -38, 0.55))
    g = f'<g id="glyph" transform="translate({cx} {cy + 2})">'
    g += (f'<g transform="translate(3 5)">{glyph(gshadow)}</g>' if ring is None else "") + f"{glyph(gcol)}</g>"
    o.append(g)
    return svg(size, size, "\n".join(o))


# ----------------------------------------------------------------- UI
ICE, ICE_DEPTH = "#38B6F5", "#0E6FB0"
ICE_LIGHT, ICE_PALE = "#7FD3FF", "#A6E3FF"


def ui_flame(face="#FF6A1A", dark="#C5360E", mid="#FFA81E", inner="#FFE066"):
    outer = "M80 8 C100 42 140 64 140 114 C140 152 114 182 80 182 C46 182 20 152 20 114 C20 86 40 70 48 46 C56 62 64 66 72 66 C64 44 68 26 80 8Z"
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{outer}" fill="{f}"/>'
    o = [solid(sil, face, dark, 10, 12)]
    o.append(
        '<g transform="translate(80 182) scale(.76) translate(-80 -182)">'
        f'<path d="{outer}" fill="{mid}"/></g>'
    )
    o.append(
        '<g transform="translate(80 182) scale(.5) translate(-80 -182)">'
        f'<path d="{outer}" fill="{inner}"/></g>'
    )
    o.append(gloss(46, 124, 9, 20, 12, 0.55))
    return svg(190, 210, "\n".join(o))


def ui_freeze():
    return ui_flame(ICE, ICE_DEPTH, ICE_LIGHT, ICE_PALE)


def ui_bolt():
    d = "M96 6 L22 108 H70 L56 184 L138 70 H90 Z"
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" stroke="{f}" stroke-width="10" stroke-linejoin="round"/>'
    o = [solid(sil, "#FFC83A", "#C98F00", 9, 12)]
    o.append('<path d="M92 24 L52 90 H74" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"/>')
    return svg(190, 210, "\n".join(o))


def ui_heart():
    d = "M90 156 C20 100 10 56 38 34 C60 18 82 30 90 48 C98 30 120 18 142 34 C170 56 160 100 90 156Z"
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" stroke="{f}" stroke-width="6" stroke-linejoin="round"/>'
    o = [solid(sil, "#E8252F", "#8E0F1A", 9, 12)]
    o.append(gloss(54, 54, 16, 8, -40, 0.6))
    return svg(200, 190, "\n".join(o))


GEM = "M50 26 H130 L164 66 L90 156 L16 66Z"
GEM_FACETS = ["M50 26 L68 66 H16Z", "M130 26 L112 66 H164Z", "M68 66 H112 L90 156Z", "M50 26 H130 L112 66 H68Z"]
GEM_MID = "#1E96DA"
# gem palettes: face, dark, light facet, mid facet, pale table
GEM_BLUE = (ICE, ICE_DEPTH, ICE_LIGHT, GEM_MID, ICE_PALE)
GEM_WHITE = ("#EEF3FC", "#9AA9C6", "#FFFFFF", "#CBD6EA", "#F9FBFF")
GEM_RED = ("#E8252F", "#8E0F1A", "#FF6B72", "#B8121D", "#FF9BA0")


def gem_sil(f, x, y):
    return f'<path {tf(x, y)} d="{GEM}" fill="{f}" stroke="{f}" stroke-width="6" stroke-linejoin="round"/>'


def gem_facets(light, mid, pale):
    return [
        f'<path d="{GEM_FACETS[0]}" fill="{light}"/>',
        f'<path d="{GEM_FACETS[1]}" fill="{mid}"/>',
        f'<path d="{GEM_FACETS[2]}" fill="{mid}" opacity=".55"/>',
        f'<path d="{GEM_FACETS[3]}" fill="{pale}"/>',
    ]


def ui_gem():
    face, dark, light, mid, pale = GEM_BLUE
    o = [solid(gem_sil, face, dark, 9, 12)]
    o += gem_facets(light, mid, pale)
    o.append(gloss(72, 44, 12, 5, -10, 0.7))
    return svg(200, 190, "\n".join(o))


UI_ICONS = {
    "streak_flame": ui_flame,
    "streak_freeze": ui_freeze,
    "xp_bolt": ui_bolt,
    "lives_heart": ui_heart,
    "gem": ui_gem,
}


# --------------------------------------------------------------- CHESTS
# The chest in four tiers (GF-13), drawn after the Higgsfield references in
# assets/higgsfield-chest/. A point is (x along the front, y up, z back), and
# depth draws up and to the right, so the right side and the lid's top show
# and the hard shadow still falls down and to the right. Each part is a named
# group so the Rive rig can move it. The open canvas shares the closed one's
# origin and bottom edge, so drawn at one scale the two swap in place.
CHEST_FRONT = 118
CHEST_HEIGHT = 92
CHEST_DEPTH = 110
CHEST_RISE = 60
CHEST_KX, CHEST_KY = 0.6, 0.236
CHEST_BAND = 22
CHEST_BAND_T = 5
CHEST_RIM = 20
CHEST_WALL = 7
CHEST_SWING = 104
CHEST_ORIGIN = (16, 186)
CHEST_STEPS = 18
CHEST_SIZE = (236, 204)
CHEST_OPEN_SIZE = (268, 260)
# the lock plate's corners around its centre
LOCK_PLATE = [(-11, -19), (11, -19), (17, -13), (17, 13), (11, 19), (-11, 19), (-17, 13), (-17, -13)]
GOLD, GOLD_DARK, GOLD_LIGHT = CHIPS["gold"]
STUD, STUD_SHADE = "#F7FAFF", "#C3CDE4"
WOOD = {"body": "#D2601C", "lid": "#DE6D26", "groove": "#A4420F", "side": "#7A2D09", "inside": "#4A1A05"}
GOLD_BANDS = {"band": GOLD, "band_dark": GOLD_DARK, "band_light": GOLD_LIGHT, "plate": GOLD_LIGHT, "plate_dark": GOLD_DARK}
CHEST_TIERS = {
    "chest": {**WOOD, **GOLD_BANDS, "glow": "#FFE58A", "lock": "keyhole", "studs": False},
    "chest_rare": {
        "body": "#2F7BF0", "lid": "#3D88F5", "groove": "#1C5FCF", "side": "#0F47B8", "inside": "#0A2A6B",
        **GOLD_BANDS, "glow": "#BFE3FF", "lock": "keyhole", "studs": False,
    },
    "chest_mythic": {
        "body": "#E8252F", "lid": "#EE3540", "groove": "#B8121D", "side": "#8E0F1A", "inside": "#4D070D",
        **GOLD_BANDS, "glow": "#FFD9B8", "lock": GEM_WHITE, "studs": False,
    },
    "chest_legendary": {
        "body": GOLD, "lid": "#FFD65A", "groove": "#E8A50E", "side": "#C96A00", "inside": "#6E3300",
        "band": "#FA9214", "band_dark": "#D05A00", "band_light": "#FFB04A", "plate": "#FFD65A",
        "plate_dark": "#D05A00", "glow": "#FFF1A6", "lock": GEM_RED, "studs": True,
    },
}
# what each tier holds when open, in canvas units: kind, x, y, scale, turn
CHEST_LOOT = {
    "chest": [("gem", 62, 66, 0.3, -12), ("gem", 108, 60, 0.32, 8), ("gem", 150, 70, 0.28, 18)],
    "chest_rare": [
        ("gem", 52, 70, 0.27, -14), ("gem", 92, 58, 0.3, 6), ("gem", 136, 56, 0.29, -6),
        ("gem", 172, 68, 0.26, 16), ("gem", 74, 78, 0.28, 10), ("gem", 120, 76, 0.3, -4),
    ],
    "chest_mythic": [
        ("gem", 60, 58, 0.27, -10), ("chip", 98, 52, 0.2, -18), ("gem", 140, 50, 0.29, 8),
        ("chip", 176, 64, 0.19, 14), ("gem", 48, 76, 0.26, 12), ("chip", 86, 78, 0.21, 8),
        ("gem", 124, 74, 0.3, -8), ("chip", 160, 82, 0.2, -12),
    ],
    "chest_legendary": [
        ("gem", 62, 46, 0.27, -12), ("chip", 100, 36, 0.2, -16), ("gem", 140, 38, 0.3, 10),
        ("chip", 178, 52, 0.19, 18), ("gem", 46, 66, 0.26, 8), ("chip", 82, 62, 0.21, 10),
        ("gem", 116, 58, 0.31, -6), ("chip", 158, 70, 0.2, -10), ("gem", 186, 78, 0.24, 20),
        ("gem", 64, 82, 0.28, -4), ("chip", 108, 84, 0.21, 6), ("gem", 146, 86, 0.27, 12),
    ],
}
CHEST_SPILL = [("chip", 112, 102, 0.2, -24), ("gem", 146, 96, 0.25, 14)]
# legendary sparkles: x, y, radius
CHEST_SPARKLES = [(208, 28, 11), (224, 150, 8)]
CHEST_OPEN_SPARKLES = [(28, 4, 11), (60, -30, 8), (14, 52, 7), (240, 150, 10)]


def cpt(x, y, z):
    ox, oy = CHEST_ORIGIN
    return (ox + x + CHEST_KX * z, oy - y - CHEST_KY * z)


def quad(*corners):
    return [cpt(*c) for c in corners]


def shape(pts, fill):
    return f'<path d="M{" L".join(f"{a:.1f} {b:.1f}" for a, b in pts)}Z" fill="{fill}"/>'


def hull(pts):
    """Convex hull by the monotone chain. A lid slab's outline is the hull of its two end
    sections, because the slab sweeps one convex section straight along x."""
    pts = sorted(pts)

    def chain(seq):
        out = []
        for p in seq:
            while len(out) > 1 and (out[-1][0] - out[-2][0]) * (p[1] - out[-2][1]) <= (out[-1][1] - out[-2][1]) * (p[0] - out[-2][0]):
                out.pop()
            out.append(p)
        return out[:-1]

    return chain(pts) + chain(pts[::-1])


def lid_point(a, grow=0, lift=0, swing=0):
    """(y, z) of the lid's curve at angle a (0 at the front edge, pi at the hinge), grown by
    grow, its ends raised by lift, and swung back by swing degrees about the hinge."""
    half = CHEST_DEPTH / 2
    dz = half - (half + grow) * math.cos(a) - CHEST_DEPTH
    dy = lift + (CHEST_RISE + grow - lift) * math.sin(a)
    c, s = math.cos(math.radians(swing)), math.sin(math.radians(swing))
    return (CHEST_HEIGHT - dz * s + dy * c, CHEST_DEPTH + dz * c + dy * s)


def lid_section(grow=0, lift=0, swing=0):
    return [lid_point(math.pi * i / CHEST_STEPS, grow, lift, swing) for i in range(CHEST_STEPS + 1)]


def chest_lid(pal, swing):
    """Three slabs, left to right, so each covers the one before it. The two end slabs are the
    bands, grown by their thickness; the right one frames the inset end panel."""
    w, b, t = CHEST_FRONT, CHEST_BAND, CHEST_BAND_T
    slabs = [(0, b, t, "band", "band_dark"), (b, w - b, 0, "lid", "side"), (w - b, w, t, "band", "band_dark")]
    o = []
    for x0, x1, grow, face, end in slabs:
        sec = lid_section(grow, 0, swing)
        o.append(shape(hull([cpt(x0, *p) for p in sec] + [cpt(x1, *p) for p in sec]), pal[face]))
        o.append(shape([cpt(x1, *p) for p in sec], pal[end]))
    o.append(shape([cpt(w, *p) for p in lid_section(-10, 8, swing)], pal["side"]))
    return "".join(o)


def chest_box(pal):
    """The right side goes first, so the front and its upright bands cover its near edge."""
    w, h, d, b, t = CHEST_FRONT, CHEST_HEIGHT, CHEST_DEPTH, CHEST_BAND, CHEST_BAND_T
    top = h - CHEST_RIM - 7
    o = [shape(quad((w, 0, 0), (w, h, 0), (w, h, d), (w, 0, d)), pal["band_dark"])]
    o.append(shape(quad((w, 9, b), (w, top, b), (w, top, d - 10), (w, 9, d - 10)), pal["side"]))
    o.append(shape(quad((0, 0, 0), (w, 0, 0), (w, h, 0), (0, h, 0)), pal["body"]))
    for y in (22, 46):
        o.append(shape(quad((b, y, 0), (w - b, y, 0), (w - b, y + 3, 0), (b, y + 3, 0)), pal["groove"]))
    for x in (0, w - b):
        o.append(shape(quad((x, 0, -t), (x + b, 0, -t), (x + b, h, -t), (x, h, -t)), pal["band"]))
        o.append(shape(quad((x + b, 0, -t), (x + b, 0, 0), (x + b, h, 0), (x + b, h, -t)), pal["band_dark"]))
    return "".join(o)


def chest_rim(pal):
    """The rim stands proud of the upright bands, as in the reference, so it sits nearer than they do."""
    w, h, z = CHEST_FRONT, CHEST_HEIGHT, -CHEST_BAND_T - 2
    lo = h - CHEST_RIM
    o = [shape(quad((0, lo, z), (w, lo, z), (w, h, z), (0, h, z)), pal["band"])]
    o.append(shape(quad((0, lo, z), (w, lo, z), (w, lo + 5, z), (0, lo + 5, z)), pal["band_dark"]))
    o.append(shape(quad((w, lo, z), (w, lo, 0), (w, h, 0), (w, h, z)), pal["band_dark"]))
    return "".join(o)


def chest_lock(pal):
    """The plate takes the one-step darker copy of a face detail, not a full extrusion."""
    cx, cy = cpt(CHEST_FRONT / 2, CHEST_HEIGHT - CHEST_RIM / 2, -CHEST_BAND_T - 6)
    d = "M" + " L".join(f"{cx + a:.1f} {cy + b:.1f}" for a, b in LOCK_PLATE) + "Z"
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}"/>'
    o = [ext(sil, pal["plate_dark"], 3, 4, 4), sil(pal["plate"], 0, 0)]
    if pal["lock"] == "keyhole":
        o.append(f'<circle cx="{cx:.1f}" cy="{cy - 4:.1f}" r="5" fill="{pal["inside"]}"/>')
        o.append(shape([(cx - 3, cy - 2), (cx + 3, cy - 2), (cx + 5, cy + 10), (cx - 5, cy + 10)], pal["inside"]))
    else:
        o.append(loot_gem(cx, cy + 1, 0.17, 0, pal["lock"]))
    return f'<g id="lock">{"".join(o)}</g>'


def chest_studs(swing):
    def stud(x, y):
        return shape([(x, y - 6), (x + 4.5, y), (x, y + 6), (x - 4.5, y)], STUD) + shape(
            [(x, y - 6), (x + 4.5, y), (x, y + 6)], STUD_SHADE
        )

    o = []
    for x in (CHEST_BAND / 2, CHEST_FRONT - CHEST_BAND / 2):
        o += [stud(*cpt(x, y, -CHEST_BAND_T)) for y in (14, 46)]
        o += [stud(*cpt(x, *lid_point(a, CHEST_BAND_T, 0, swing))) for a in (0.5, 1.25)]
    return f'<g id="studs">{"".join(o)}</g>'


def sparkles(spots):
    def sparkle(x, y, r, fill):
        a = r * 0.22
        return (
            f'<path d="M{x:.1f} {y - r:.1f} Q{x + a:.1f} {y - a:.1f} {x + r:.1f} {y:.1f} '
            f'Q{x + a:.1f} {y + a:.1f} {x:.1f} {y + r:.1f} Q{x - a:.1f} {y + a:.1f} {x - r:.1f} {y:.1f} '
            f'Q{x - a:.1f} {y - a:.1f} {x:.1f} {y - r:.1f}Z" fill="{fill}"/>'
        )

    s = "".join(sparkle(x + 1.5, y + 2, r, GOLD_DARK) + sparkle(x, y, r, GOLD) for x, y, r in spots)
    return f'<g id="sparkles">{s}</g>'


def loot_gem(x, y, s, turn, pal):
    face, dark, light, mid, pale = pal
    body = [ext(gem_sil, dark, 9, 12, 4), gem_sil(face, 0, 0)] + gem_facets(light, mid, pale)
    body.append(gloss(72, 44, 12, 5, -10, 0.7, ident=False))
    return f'<g transform="translate({x:.1f} {y:.1f}) rotate({turn}) scale({s}) translate(-90 -91)">{"".join(body)}</g>'


def chest_shadow(swing):
    """One shadow from the box and the lid together, as a mascot has one from all its parts."""
    w, h, d, t = CHEST_FRONT, CHEST_HEIGHT, CHEST_DEPTH, CHEST_BAND_T
    sec = lid_section(t, 0, swing)
    box = hull(quad((0, 0, -t), (w, 0, -t), (w, 0, d), (w, h, d), (w, h, -t), (0, h, -t)))
    lid = hull([cpt(0, *p) for p in sec] + [cpt(w, *p) for p in sec])
    paths = [f'M{" L".join(f"{a:.1f} {b:.1f}" for a, b in pts)}Z' for pts in (box, lid)]
    sil = lambda f, x, y: "".join(f'<path {tf(x, y)} d="{p}" fill="{f}"/>' for p in paths)
    return f'<g id="shadow">{ext(sil, SHADOW, 16, 12, 10)}</g>'


def chest(name):
    def lid_grooves():
        x0, x1 = CHEST_BAND, CHEST_FRONT - CHEST_BAND
        o = []
        for a in (0.55, 1.1, 1.62):
            p, q = lid_point(a), lid_point(a + 0.07)
            o.append(shape([cpt(x0, *p), cpt(x1, *p), cpt(x1, *q), cpt(x0, *q)], pal["groove"]))
        return "".join(o)

    pal = CHEST_TIERS[name]
    o = [chest_shadow(0), f'<g id="box">{chest_box(pal)}</g>']
    o.append(f'<g id="lid">{chest_lid(pal, 0)}{lid_grooves()}</g>')
    o.append(f'<g id="rim">{chest_rim(pal)}</g>')
    o.append(chest_lock(pal))
    if pal["studs"]:
        o.append(chest_studs(0))
        o.append(sparkles(CHEST_SPARKLES))
    gx, gy = cpt(CHEST_BAND + 22, *lid_point(1.2))
    o.append(gloss(round(gx), round(gy), 14, 5, -8, 0.5))
    return svg(*CHEST_SIZE, "\n".join(o))


def chest_open(name):
    w, h, d, b, k = CHEST_FRONT, CHEST_HEIGHT, CHEST_DEPTH, CHEST_BAND, CHEST_WALL

    def lid_inside():
        o = []
        for x0, x1, grow, fill in ((0, w, CHEST_BAND_T, "band_dark"), (b, w - b, 0, "lid"), (b + 3, w - b - 3, -7, "inside")):
            p, q = lid_point(0, grow, 0, CHEST_SWING), lid_point(math.pi, grow, 0, CHEST_SWING)
            o.append(shape([cpt(x0, *p), cpt(x1, *p), cpt(x1, *q), cpt(x0, *q)], pal[fill]))
        return "".join(o)

    def box_top():
        return shape(quad((0, h, 0), (w, h, 0), (w, h, d), (0, h, d)), pal["band"]) + shape(
            quad((k, h, k), (w - k, h, k), (w - k, h, d - k), (k, h, d - k)), pal["inside"]
        )

    # the tops of the front and right walls are nearer than the loot, so they go over it
    def box_lip():
        z = -CHEST_BAND_T - 2
        return shape(quad((0, h, z), (w, h, z), (w, h, k), (0, h, k)), pal["band_light"]) + shape(
            quad((w - k, h, k), (w, h, 0), (w, h, d), (w - k, h, d - k)), pal["band"]
        )

    # a chip in the heap is the top-view chip squashed, so it stays one family with the chip icons
    def loot_chip(x, y, s, turn):
        color, dark, light = CHIPS["red"]
        wedges = "".join(f'<path d="{sector(0, 0, 58, 86, i * 45 - 11, i * 45 + 11)}" fill="{CREAM}"/>' for i in range(8))
        return (
            f'<g transform="translate({x} {y}) rotate({turn}) scale({s} {s * 0.62:.3f})">'
            f'<circle cy="26" r="86" fill="{dark}"/><circle r="86" fill="{color}"/>{wedges}'
            f'<circle r="60" fill="{dark}" opacity=".55"/><circle r="55" fill="{color}"/>'
            f'<circle r="44" fill="{light}" opacity=".35"/></g>'
        )

    def loot(items):
        return "".join(
            loot_gem(x, y, s, turn, GEM_BLUE) if kind == "gem" else loot_chip(x, y, s, turn)
            for kind, x, y, s, turn in items
        )

    pal, cw, ch = CHEST_TIERS[name], *CHEST_OPEN_SIZE
    gx, gy = cpt(w / 2, h + 18, d * 0.6)
    glow = "".join(
        f'<ellipse cx="{gx:.1f}" cy="{gy:.1f}" rx="{rx}" ry="{ry}" fill="{pal["glow"]}" opacity="{op}"/>'
        for rx, ry, op in ((80, 62, ".22"), (58, 46, ".28"), (36, 29, ".4"))
    )
    o = [chest_shadow(CHEST_SWING)]
    o.append(f'<g id="lid">{chest_lid(pal, CHEST_SWING)}{lid_inside()}</g>')
    o.append(f'<g id="glow">{glow}</g>')
    o.append(f'<g id="loot">{box_top()}{loot(CHEST_LOOT[name])}</g>')
    o.append(f'<g id="box">{chest_box(pal)}</g>')
    o.append(f'<g id="rim">{chest_rim(pal)}{box_lip()}</g>')
    o.append(chest_lock(pal))
    if pal["studs"]:
        o.append(chest_studs(CHEST_SWING))
        o.append(f'<g id="spill">{loot(CHEST_SPILL)}</g>')
        o.append(sparkles(CHEST_OPEN_SPARKLES))
    return svg(cw, ch, "\n".join(o), 0, CHEST_SIZE[1] - ch)


def main():
    n = 0
    for name, (c, d, light) in CHIPS.items():
        n += write(OUT, "chips", f"chip_{name}", chip(c, d, light))
        n += write(OUT, "chips", f"chip_stack_{name}", chip_stack(c, d, light))
    n += write(OUT, "cards", "card_back", card_back())
    for suit in SUIT_ORDER:
        for rank in RANKS:
            n += write(OUT, "cards", f"card_{rank}_{suit}", card_face(rank, suit))
    n += sum(write(OUT, "path", f"node_{k}", node(*v)) for k, v in NODE_STATES.items())
    n += write(OUT, "path", "node_current", node(*NODE_STATES["available"], ring=0.6))
    n += write(OUT, "path", "node_current_base", node(*NODE_STATES["available"], ring=0.6, arc=False))
    n += sum(write(OUT, "ui", name, fn()) for name, fn in UI_ICONS.items())
    n += sum(write(OUT, "ui", t, chest(t)) + write(OUT, "ui", t + "_open", chest_open(t)) for t in CHEST_TIERS)
    print("wrote", n, "svgs to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
