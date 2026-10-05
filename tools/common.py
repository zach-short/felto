"""Helpers that both generators use: the SVG wrapper, the house palette and the draw primitives.

Imported by tools/build_icons.py and tools/build_mascots.py by its plain name.
"""
import math
import os

SHADOW = "#C9CDE2"
CREAM = "#FBF4EA"
INKL = "#1B1B24"  # feature lines (pupils, mouths); never used as an outline


def svg(w, h, body, x0=0, y0=0):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}" '
        f'width="{w}" height="{h}">\n{body}\n</svg>\n'
    )


def write(out, sub, name, content):
    d = os.path.join(out, sub)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name + ".svg"), "w") as f:
        f.write(content)
    return 1


def tf(x, y):
    return f'transform="translate({x:.2f} {y:.2f})"'


def stroke(d, w=5, color=INKL):
    return (
        f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
    )


def ext(sil, color, dx, dy, steps=8):
    """Solid extrusion: copies of the silhouette stepped from 0 to (dx, dy)."""
    return "".join(sil(color, dx * i / steps, dy * i / steps) for i in range(1, steps + 1))


def gloss(x, y, rx, ry, rot, op=0.6, ident=True):
    # The icons name the highlight for the rig; the mascot parts carry their own ids.
    tag = 'id="gloss" ' if ident else ""
    return (
        f'<ellipse {tag}cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" '
        f'transform="rotate({rot} {x} {y})" fill="#fff" opacity="{op}"/>'
    )


def sector(cx, cy, r0, r1, a0, a1):
    p = lambda r, a: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    x0, y0 = p(r1, a0)
    x1, y1 = p(r1, a1)
    x2, y2 = p(r0, a1)
    x3, y3 = p(r0, a0)
    return (
        f"M{x0:.1f} {y0:.1f} A{r1} {r1} 0 0 1 {x1:.1f} {y1:.1f} "
        f"L{x2:.1f} {y2:.1f} A{r0} {r0} 0 0 0 {x3:.1f} {y3:.1f}Z"
    )
