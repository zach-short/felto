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


def ui_gem():
    d = "M50 26 H130 L164 66 L90 156 L16 66Z"
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" stroke="{f}" stroke-width="6" stroke-linejoin="round"/>'
    o = [solid(sil, "#38B6F5", "#0E6FB0", 9, 12)]
    o.append('<path d="M50 26 L68 66 H16Z" fill="#7FD3FF"/>')
    o.append('<path d="M130 26 L112 66 H164Z" fill="#1E96DA"/>')
    o.append('<path d="M68 66 H112 L90 156Z" fill="#1E96DA" opacity=".55"/>')
    o.append('<path d="M50 26 H130 L112 66 H68Z" fill="#A6E3FF"/>')
    o.append(gloss(72, 44, 12, 5, -10, 0.7))
    return svg(200, 190, "\n".join(o))


def ui_chest():
    body = "M24 84 V150 Q24 160 34 160 H166 Q176 160 176 150 V84Z"
    lid = "M24 84 V64 Q24 26 100 26 Q176 26 176 64 V84Z"
    sil = lambda f, x, y: (
        f'<g {tf(x, y)} fill="{f}"><path d="{body}"/><path d="{lid}"/></g>'
    )
    o = [solid(sil, "#C97A32", "#7A4318", 10, 12)]
    o.append(f'<path d="{body}" fill="#B96A2B"/>')
    o.append(f'<path d="{lid}" fill="#E69A4A"/>')
    o.append('<rect x="24" y="78" width="152" height="10" fill="#8A4A1B"/>')
    o.append('<rect x="48" y="30" width="14" height="130" fill="#FFC83A" opacity=".9"/>')
    o.append('<rect x="138" y="30" width="14" height="130" fill="#FFC83A" opacity=".9"/>')
    o.append('<rect x="84" y="66" width="32" height="40" rx="7" fill="#C98F00"/>')
    o.append('<rect x="84" y="62" width="32" height="40" rx="7" fill="#FFC83A"/>')
    o.append('<circle cx="100" cy="80" r="5" fill="#7A4318"/>')
    o.append(gloss(58, 50, 20, 7, -20, 0.5))
    return svg(210, 190, "\n".join(o))


UI_ICONS = {
    "streak_flame": ui_flame,
    "streak_freeze": ui_freeze,
    "xp_bolt": ui_bolt,
    "lives_heart": ui_heart,
    "gem": ui_gem,
    "chest": ui_chest,
}


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
    for name, fn in UI_ICONS.items():
        n += write(OUT, "ui", name, fn())
    print("wrote", n, "svgs to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
