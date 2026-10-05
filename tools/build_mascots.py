#!/usr/bin/env python3
"""Build rig-ready SVG poses for the three Felto mascots.

Style matches tools/build_icons.py: no outlines, solid fills, a darker
extrusion offset down-right, a hard pale shadow, one gloss highlight.

Every pose of a character uses the same layer ids, so one Rive rig can
swap expressions. The ids shared by all poses of a character differ by
character; the table in rule I3 of docs/conventions-python.md holds them.

Run: python3 tools/build_mascots.py
"""
import os

from common import CREAM, INKL, SHADOW, ext, gloss, sector, stroke, svg, tf, write

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "mascots")
EYE = "#FFFFFF"


def pth(d, extra=""):
    return lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" {extra}/>'


class Part:
    """One extruded piece: silhouette fn, face colour, depth colour."""

    def __init__(self, pid, sil, face, dark, dx=10, dy=14, over=""):
        self.pid, self.sil, self.face, self.dark = pid, sil, face, dark
        self.dx, self.dy, self.over = dx, dy, over

    def draw(self):
        return (
            f'<g id="{self.pid}">'
            + ext(self.sil, self.dark, self.dx, self.dy)
            + self.sil(self.face, 0, 0)
            + self.over
            + "</g>"
        )


def shadow_of(parts, dx=21, dy=27):
    def sil_all(f, x, y):
        return "".join(p.sil(f, x, y) for p in parts)

    return f'<g id="shadow">{ext(sil_all, SHADOW, dx, dy, 10)}</g>'


# ---------------------------------------------------------------- FISH
FISH_RED, FISH_DARK = "#E8252F", "#8E0F1A"
FISH_ORANGE, FISH_ORANGE_D = "#FF6A1A", "#C5440A"
FISH_FIN = "M0 0 C-20 10 -30 45 -12 62 C8 72 28 50 24 20 C22 5 10 -2 0 0Z"
TAIL_D = (
    "M300 185 L352 135 Q382 118 388 150 Q388 180 366 205 "
    "Q388 232 386 262 Q380 290 350 272 L300 228 Z"
)
FCX, FCY, FR = 190, 205, 135


def fin_sil(x, y, a):
    return lambda f, tx, ty: (
        f'<path transform="translate({x + tx:.2f} {y + ty:.2f}) rotate({a})" d="{FISH_FIN}" fill="{f}"/>'
    )


def fish(pose):
    fins = {
        "happy": ((85, 270, 30), (295, 285, -30)),
        "sad": ((85, 270, 15), (295, 285, -15)),
        "cheer": ((75, 255, 150), (305, 255, -150)),
        "think": ((130, 310, -70), (295, 285, -30)),
        "smug": ((85, 270, 30), (295, 285, -30)),
        "sleep": ((85, 270, 30), (295, 285, -30)),
    }[pose]

    tail = Part("tail", pth(TAIL_D), FISH_ORANGE, FISH_ORANGE_D, 8, 8)
    fl = Part("fin_l", fin_sil(*fins[0]), FISH_ORANGE, FISH_ORANGE_D, 7, 8)
    fr = Part("fin_r", fin_sil(*fins[1]), FISH_ORANGE, FISH_ORANGE_D, 7, 8)
    body_sil = lambda f, x, y: f'<circle {tf(x, y)} cx="{FCX}" cy="{FCY}" r="{FR}" fill="{f}"/>'
    wedges = "".join(
        f'<path d="{sector(FCX, FCY, 104, FR, k * 45 - 12, k * 45 + 12)}" fill="{CREAM}"/>'
        for k in range(8)
    )
    body_over = (
        f'<clipPath id="fishClip"><circle cx="{FCX}" cy="{FCY}" r="{FR}"/></clipPath>'
        f'<g id="rim" clip-path="url(#fishClip)">{wedges}</g>'
        f'<circle cx="{FCX}" cy="{FCY}" r="102" fill="{FISH_DARK}" opacity=".18"/>'
        + gloss(FCX - 70, FCY - 92, 26, 12, -38, 0.55, ident=False)
    )
    body = Part("body", body_sil, FISH_RED, FISH_DARK, 22, 10, over=body_over)

    parts = [tail, fl, fr, body]
    if pose == "think":
        parts = [tail, fr, body]
    o = [shadow_of(parts + ([fl] if pose == "think" else []), 30, 20)]
    o += [p.draw() for p in parts]

    ex = (150, 232)
    ey = 170

    def eyes(dx, dy, ry=46, closed=False, lid=False, droop=False):
        s = ""
        for i, x in enumerate(ex):
            nm = "l" if i == 0 else "r"
            s += f'<g id="eye_{nm}"><ellipse cx="{x}" cy="{ey}" rx="36" ry="{ry}" fill="{EYE}"/></g>'
            if closed:
                s += f'<g id="pupil_{nm}">' + stroke(f"M{x - 20} {ey + 4} Q{x} {ey + 22} {x + 20} {ey + 4}", 6) + "</g>"
                continue
            s += (
                f'<g id="pupil_{nm}"><ellipse cx="{x + dx}" cy="{ey + dy}" rx="14" ry="24" fill="{INKL}"/>'
                f'<circle cx="{x + dx - 4}" cy="{ey + dy - 9}" r="5" fill="#fff"/></g>'
            )
            if lid:
                s += (
                    f'<clipPath id="lidClip_{nm}"><ellipse cx="{x}" cy="{ey}" rx="36" ry="{ry}"/></clipPath>'
                    f'<g id="lid_{nm}" clip-path="url(#lidClip_{nm})">'
                    f'<rect x="{x - 40}" y="{ey - ry - 4}" width="80" height="{ry - 2}" fill="{FISH_RED}"/>'
                    f'<rect x="{x - 40}" y="{ey - 6}" width="80" height="5" fill="{FISH_DARK}"/></g>'
                )
        if droop:
            s += stroke(f"M{ex[0] - 38} {ey - 40} Q{ex[0]} {ey - 62} {ex[0] + 34} {ey - 34}", 6, FISH_DARK)
            s += stroke(f"M{ex[1] - 34} {ey - 34} Q{ex[1]} {ey - 62} {ex[1] + 38} {ey - 40}", 6, FISH_DARK)
        return s

    def open_mouth():
        return (
            '<g id="mouth">'
            f'<path d="M146 250 Q190 244 234 250 Q230 296 190 302 Q150 296 146 250Z" fill="#6E1208"/>'
            f'<path d="M158 282 Q190 264 222 282 Q212 299 190 301 Q168 299 158 282Z" fill="{FISH_ORANGE}"/>'
            "</g>"
        )

    if pose in ("happy", "cheer"):
        o.append(eyes(0, 3 if pose == "happy" else 2))
        o.append(open_mouth())
    elif pose == "sad":
        o.append(eyes(0, 10, droop=True))
        o.append(f'<g id="mouth">{stroke("M168 284 Q190 260 212 284", 7, FISH_ORANGE)}</g>')
    elif pose == "think":
        o.append(eyes(-8, -14))
        o.append(f'<g id="mouth">{stroke("M160 282 Q186 272 215 280", 6, FISH_ORANGE)}</g>')
        o.append(fl.draw())
    elif pose == "smug":
        o.append(eyes(8, 14, lid=True))
        o.append(f'<g id="mouth"><path d="M170 292 Q230 292 256 268 Q236 308 190 308 Q178 306 170 292Z" fill="{FISH_ORANGE}"/></g>')
    elif pose == "sleep":
        o.append(eyes(0, 0, closed=True))
        o.append(f'<g id="mouth"><circle cx="190" cy="280" r="11" fill="{FISH_ORANGE}"/></g>')
    return svg(440, 430, "\n".join(o))


# --------------------------------------------------------------- SQUID
SQ_BODY, SQ_BODY_D = "#7B5CF0", "#4B2FB0"
SQ_LIGHT, SQ_LIGHT_D = "#A998FF", "#6F58D9"
SQ_FACE = "#D8D0FF"


def squid(pose):
    body_d = "M110 392 V120 Q110 40 200 40 Q290 40 290 120 V392 Z"
    # legs flare out and down: 5 lobes, 240 wide at the bottom vs 180 at the body
    lobes = "M110 380 C106 408 92 430 80 452"
    x = 80
    for _ in range(5):
        lobes += f" A24 38 0 0 0 {x + 48} 452"
        x += 48
    lobes += " C308 430 294 408 290 380 Z"

    sep = "".join(
        f'<path d="M{top} 396 Q{(top + bot) / 2} 430 {bot} 462" stroke="{SQ_LIGHT_D}" '
        f'stroke-width="5" stroke-linecap="round" fill="none"/>'
        for top, bot in ((146, 128), (182, 176), (218, 224), (254, 272))
    )
    tent = Part("tentacles", pth(lobes), SQ_LIGHT, SQ_LIGHT_D, 8, 10, over=sep)
    body_over = (
        f'<clipPath id="sqClip"><path d="{body_d}"/></clipPath>'
        f'<g clip-path="url(#sqClip)"><rect x="100" y="30" width="30" height="370" fill="#9B82FF" opacity=".55"/>'
        f'<rect x="262" y="30" width="40" height="370" fill="{SQ_BODY_D}" opacity=".35"/></g>'
        + gloss(150, 78, 20, 9, -42, 0.5, ident=False)
    )
    body = Part("body", pth(body_d), SQ_BODY, SQ_BODY_D, 10, 14, over=body_over)

    arm = "M0 0 C-22 -10 -30 -50 -12 -70 C6 -80 26 -60 24 -30 C22 -10 10 0 0 0Z"
    parts = [tent, body]
    arms = []
    if pose == "cheer":
        arms = [
            Part("arm_l", lambda f, x, y: f'<path transform="translate({112 + x} {270 + y}) rotate(-8)" d="{arm}" fill="{f}"/>', SQ_LIGHT, SQ_LIGHT_D, 7, 9),
            Part("arm_r", lambda f, x, y: f'<path transform="translate({288 + x} {270 + y}) rotate(8) scale(-1 1)" d="{arm}" fill="{f}"/>', SQ_LIGHT, SQ_LIGHT_D, 7, 9),
        ]
    chin = None
    if pose == "think":
        chin_d = "M0 0 C-14 -30 -14 -70 -2 -92 C12 -104 30 -92 22 -66 C14 -40 14 -10 0 0Z"
        chin = Part("arm_r", lambda f, x, y: f'<path transform="translate({236 + x} {330 + y}) rotate(-12)" d="{chin_d}" fill="{f}"/>', SQ_LIGHT, SQ_LIGHT_D, 7, 9)
    o = [shadow_of(parts + arms + ([chin] if chin else []), 21, 25)]
    o += [p.draw() for p in parts]

    face_d = "M130 235 V125 Q130 100 155 100 H245 Q270 100 270 125 V235 Q200 252 130 235Z"
    o.append(f'<g id="face"><path d="{face_d}" fill="{SQ_FACE}"/></g>')
    o += [a.draw() for a in arms]

    ex = (170, 230)
    ey = 165

    def eyes(dx, dy, droop=False, lid=False, closed=False):
        s = ""
        for i, x in enumerate(ex):
            nm = "l" if i == 0 else "r"
            if closed:
                s += f'<g id="eye_{nm}"></g><g id="pupil_{nm}">' + stroke(f"M{x - 20} {ey} Q{x} {ey + 16} {x + 20} {ey}", 5) + "</g>"
                continue
            s += f'<g id="eye_{nm}"><circle cx="{x}" cy="{ey}" r="23" fill="{EYE}"/></g>'
            s += (
                f'<g id="pupil_{nm}"><circle cx="{x + dx}" cy="{ey + dy}" r="10" fill="{INKL}"/>'
                f'<circle cx="{x + dx - 3}" cy="{ey + dy - 4}" r="3" fill="#fff"/></g>'
            )
            if lid:
                s += f'<path d="M{x - 23} {ey - 2} H{x + 23} A23 23 0 0 0 {x - 23} {ey - 2}Z" fill="{SQ_FACE}"/>' + stroke(f"M{x - 23} {ey - 2} H{x + 23}", 3, SQ_LIGHT_D)
        if droop:
            s += stroke(f"M{ex[0] - 24} {ey - 24} L{ex[0] + 20} {ey - 32}", 4, SQ_BODY_D)
            s += stroke(f"M{ex[1] - 20} {ey - 32} L{ex[1] + 24} {ey - 24}", 4, SQ_BODY_D)
        return s

    if pose in ("happy", "cheer"):
        o.append(eyes(0, 2))
        o.append(
            '<g id="mouth">'
            '<path d="M170 205 Q200 200 230 205 Q226 238 200 240 Q174 238 170 205Z" fill="#3A1A2A"/>'
            '<path d="M180 226 Q200 216 220 226 Q212 238 200 239 Q188 238 180 226Z" fill="#F78FB3"/></g>'
        )
    elif pose == "sad":
        o.append(eyes(0, 7, droop=True))
        o.append(f'<g id="mouth">{stroke("M184 224 Q200 208 216 224", 5)}</g>')
    elif pose == "think":
        o.append(eyes(-8, -9))
        o.append(f'<g id="mouth">{stroke("M190 220 Q202 212 214 218", 4)}</g>')
        o.append(chin.draw())
    elif pose == "smug":
        o.append(eyes(8, 6, lid=True))
        o.append(f'<g id="mouth">{stroke("M172 220 Q205 234 238 208", 5)}</g>')
    elif pose == "sleep":
        o.append(eyes(0, 0, closed=True))
        o.append(f'<g id="mouth"><ellipse cx="200" cy="216" rx="6" ry="9" fill="#3A1A2A"/></g>')
    return svg(430, 545, "\n".join(o))


# --------------------------------------------------------------- SHARK
SH_BODY, SH_BODY_D = "#3A7BFF", "#1747B8"
SH_FIN, SH_FIN_D = "#2557E0", "#0F2E96"
SH_BELLY = "#F6FAFF"
SH_PINK = "#F7799F"


def shark(pose):
    dorsal = Part("dorsal", pth("M150 112 Q184 52 200 -18 Q214 58 252 114 Z"), SH_BODY, SH_BODY_D, 8, 10)

    fin_down_l = "M96 240 C64 262 34 300 30 330 C66 322 96 306 106 290 Z"
    fin_down_r = "M304 240 C336 262 366 300 370 330 C334 322 304 306 294 290 Z"
    fin_up_l = "M100 215 C64 190 38 140 46 108 C76 122 104 160 110 200 Z"
    fin_up_r = "M300 215 C336 190 362 140 354 108 C324 122 296 160 290 200 Z"
    fin_sad_l = "M96 240 C74 270 52 315 52 345 C80 330 98 306 106 290 Z"
    fin_sad_r = "M304 240 C326 270 348 315 348 345 C320 330 302 306 294 290 Z"
    fl_d, fr_d = {
        "cheer": (fin_up_l, fin_up_r),
        "sad": (fin_sad_l, fin_sad_r),
    }.get(pose, (fin_down_l, fin_down_r))
    fl = Part("fin_l", pth(fl_d), SH_FIN, SH_FIN_D, 7, 9)
    fr = Part("fin_r", pth(fr_d), SH_FIN, SH_FIN_D, 7, 9)

    body_d = (
        "M200 70 C280 70 312 150 316 230 C320 330 300 405 270 418 "
        "L130 418 C100 405 80 330 84 230 C88 150 120 70 200 70Z"
    )
    belly_d = (
        "M200 255 C256 255 280 300 278 350 C276 400 252 418 200 418 "
        "C148 418 124 400 122 350 C120 300 144 255 200 255Z"
    )
    body_over = (
        f'<g id="belly"><path d="{belly_d}" fill="{SH_BELLY}"/></g>'
        + gloss(132, 126, 20, 9, -52, 0.5, ident=False)
    )
    body = Part("body", pth(body_d), SH_BODY, SH_BODY_D, 10, 14, over=body_over)

    parts = [dorsal, fl] + ([] if pose == "think" else [fr]) + [body]
    shadow_parts = parts + ([fr] if pose == "think" else [])
    o = [shadow_of(shadow_parts, 21, 27)]
    o += [p.draw() for p in parts]

    gy = 88 if pose == "sleep" else 135
    glasses = (
        f'<g id="glasses" transform="translate(0 {gy - 135})">'
        '<path d="M96 124 Q200 104 304 124" fill="none" stroke="#14171F" stroke-width="9" stroke-linecap="round"/>'
        '<ellipse cx="148" cy="138" rx="40" ry="28" fill="#14171F"/>'
        '<ellipse cx="252" cy="138" rx="40" ry="28" fill="#14171F"/>'
        '<rect x="180" y="124" width="40" height="9" fill="#14171F"/>'
        '<path d="M122 126 L138 120 L128 142 L114 142Z" fill="#fff" opacity=".28"/>'
        '<path d="M226 126 L242 120 L232 142 L218 142Z" fill="#fff" opacity=".28"/></g>'
    )
    o.append(glasses)

    if pose == "happy":
        o.append(f'<g id="mouth"><path d="M118 184 Q200 270 282 184 Q280 200 272 206 Q200 250 128 206 Q120 200 118 184Z" fill="{SH_BELLY}"/></g>')
    elif pose == "sad":
        o.append(f'<g id="mouth">{stroke("M176 214 Q200 194 224 214", 6, "#0F2E96")}</g>')
    elif pose == "cheer":
        o.append(
            '<g id="mouth">'
            '<path d="M126 184 Q200 190 274 184 Q270 250 200 256 Q130 250 126 184Z" fill="#14171F"/>'
            f'<path d="M150 232 Q200 208 250 232 Q236 254 200 256 Q164 254 150 232Z" fill="{SH_PINK}"/>'
            f'<path d="M126 184 Q200 190 274 184 Q272 196 262 200 Q200 206 138 200 Q128 196 126 184Z" fill="{SH_BELLY}"/></g>'
        )
    elif pose == "think":
        o.append(f'<g id="mouth">{stroke("M178 214 Q198 202 222 212", 5, "#0F2E96")}</g>')
        chin = Part(
            "fin_r",
            pth("M300 300 C330 270 300 235 245 215 C225 210 215 230 232 240 C262 255 268 280 262 306 Z"),
            SH_FIN, SH_FIN_D, 6, 8,
        )
        o.append(chin.draw())
    elif pose == "smug":
        o.append(f'<g id="mouth"><path d="M160 214 Q230 222 282 188 Q268 232 214 236 Q176 234 160 214Z" fill="{SH_BELLY}"/></g>')
        a1 = pth("M96 292 C120 270 160 276 200 296 C240 316 280 318 304 306 C296 336 250 346 200 328 C160 314 120 322 96 292Z")
        a2 = pth("M304 292 C280 270 240 276 200 296 C160 316 120 318 96 306 C104 336 150 346 200 328 C240 314 280 322 304 292Z")
        arms = [Part("arm_a", a1, SH_FIN, SH_FIN_D, 5, 7), Part("arm_b", a2, "#3069F0", SH_FIN_D, 5, 7)]
        o.append('<g id="arms">' + "".join(a.draw() for a in arms) + "</g>")
    elif pose == "sleep":
        o.append(
            '<g id="eyes_closed">'
            + stroke("M138 150 Q158 166 178 150", 5, "#0F2E96")
            + stroke("M222 150 Q242 166 262 150", 5, "#0F2E96")
            + "</g>"
        )
        o.append('<g id="mouth"><ellipse cx="200" cy="208" rx="8" ry="11" fill="#14171F"/></g>')
    return svg(430, 500, "\n".join(o), y0=-30)


POSES = ["happy", "sad", "cheer", "think", "smug", "sleep"]
BUILDERS = {"fish": fish, "squid": squid, "shark": shark}


def main():
    n = 0
    for name, fn in BUILDERS.items():
        for p in POSES:
            n += write(OUT, name, f"{name}_{p}", fn(p))
    print("wrote", n, "svgs to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
