"""Import the painted celebration art for Felto.

Style: each hero is painted by Higgsfield (gpt_image_2_5, quality high, transparent background) in
finish A, extruded flat: the style of the approved Higgsfield reference, no outlines, solid fills,
a darker extrusion down and right and one gloss highlight (game-feel DESIGN.md, GF-20 and 10.3).
This tool paints nothing. It readies those paintings for tools/build_celebrations.py.

For each celebration in ART it reads one PNG from assets/higgsfield-celebrations/, which it never
writes (the files are kept as received), and decodes it: 8-bit RGBA (colour type 6), not
interlaced, all five row filters; any other PNG stops the run. It crops the picture to the box of
pixels whose alpha is above ALPHA_FLOOR, plus a margin of MARGIN of that box's longer side, then
shrinks it by an area average in premultiplied alpha so its longer side is LONG_SIDE px (a smaller
picture is never enlarged). It writes a PNG with one fixed row filter, a fixed zlib level and no
chunk but IHDR, IDAT and IEND, so a second run writes the same bytes.

It is not in the gate: a pure-Python decode of one 1024 px painting took 1.1 to 3.7 s on
2026-10-15, and a run of all 18 took 2 min 38 s, so the tool runs by hand when new art arrives, and
its output is committed.

Outputs to assets/celebrations/art.
Run: python3 tools/import_celebrations.py
"""
import math
import os
import struct
import zlib

SRC = os.path.join(os.path.dirname(__file__), "..", "assets", "higgsfield-celebrations")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "celebrations", "art")
# The hero fills about 70% of a 400 px animation, drawn at most a phone's column wide at 3x, so 512
# px keeps it sharp without carrying the painting's full 1024 px into every file
LONG_SIDE = 512
# Above the faint noise a transparent background can carry, so the crop follows the painted shape
ALPHA_FLOOR = 8
MARGIN = 0.04
# Sub (1) on every row: the cheapest filter to write in pure Python that still compresses flat fills
FILTER = 1
ZLIB_LEVEL = 9
SIGNATURE = b"\x89PNG\r\n\x1a\n"

# celebration: its painting in assets/higgsfield-celebrations/ (GF-21; board item 61)
ART = {
    "lesson_complete": "style-a-extruded.png",
    "perfect_lesson": "flop-crown.png",
    "boss_beaten": "ace-dizzy.png",
    "review_done": "kicker-thumbs.png",
    "practice_done": "kicker-medal.png",
    "unit_complete": "trophy.png",
    "streak_extended": "flame-hero.png",
    "streak_milestone": "streak-badge.png",
    "xp_milestone": "xp-badge.png",
    "achievement": "rosette.png",
    "royal_flush": "royal-flush.png",
    "chip_jackpot": "chip-pile.png",
    "all_in_win": "flop-all-in.png",
    "hot_streak": "kicker-juggle.png",
    "hearts_refilled": "heart-hero.png",
    "gems_earned": "gem-pile.png",
    "daily_goal": "goal-target.png",
    "welcome": "cast-wave.png",
}


# -------------------------------------------------------------- DECODE
def chunks(data):
    """The (type, body) pairs of a PNG, in file order, after its signature."""
    i = len(SIGNATURE)
    while i < len(data):
        n = struct.unpack(">I", data[i:i + 4])[0]
        yield data[i + 4:i + 8], data[i + 8:i + 8 + n]
        i += 12 + n


def header(path, data):
    if data[:8] != SIGNATURE:
        raise SystemExit(f"{path} is not a PNG")
    w, h, depth, colour, _, _, interlace = struct.unpack(">IIBBBBB", data[16:29])
    if (depth, colour, interlace) != (8, 6, 0):
        raise SystemExit(
            f"{path}: bit depth {depth}, colour type {colour}, interlace {interlace}; "
            "this tool reads only 8-bit RGBA (colour type 6) that is not interlaced"
        )
    return w, h


# The five row filters of the PNG specification (section 9.2), undone one row at a time; each
# takes the filtered row and the row above it, already undone, and four bytes to a pixel
def unsub(line, above):
    out = bytearray(line)
    for i in range(4, len(out)):
        out[i] = (out[i] + out[i - 4]) & 255
    return out


def unup(line, above):
    return bytearray((a + b) & 255 for a, b in zip(line, above))


def unaverage(line, above):
    out = bytearray(line)
    for i in range(len(out)):
        left = out[i - 4] if i >= 4 else 0
        out[i] = (out[i] + (left + above[i]) // 2) & 255
    return out


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def unpaeth(line, above):
    out = bytearray(line)
    for i in range(len(out)):
        left, corner = (out[i - 4], above[i - 4]) if i >= 4 else (0, 0)
        out[i] = (out[i] + paeth(left, above[i], corner)) & 255
    return out


UNFILTERS = {0: lambda line, above: bytearray(line), 1: unsub, 2: unup, 3: unaverage, 4: unpaeth}


def decode(path):
    """The picture as (width, height, rows), each row w * 4 bytes of straight RGBA."""
    with open(path, "rb") as f:
        data = f.read()
    w, h = header(path, data)
    raw = zlib.decompress(b"".join(body for kind, body in chunks(data) if kind == b"IDAT"))
    rows, above, stride = [], bytes(w * 4), w * 4 + 1
    for y in range(h):
        kind = raw[y * stride]
        if kind not in UNFILTERS:
            raise SystemExit(f"{path}: row {y} has filter {kind}, which PNG does not define")
        above = UNFILTERS[kind](raw[y * stride + 1:(y + 1) * stride], above)
        rows.append(above)
    return w, h, rows


# ---------------------------------------------------------------- CROP
OPAQUE = bytes(1 if a > ALPHA_FLOOR else 0 for a in range(256))


def opaque_box(w, h, rows):
    """The (left, top, right, bottom) box, right and bottom exclusive, of pixels above ALPHA_FLOOR."""
    left, right, top, bottom = w, 0, h, 0
    for y, row in enumerate(rows):
        mask = bytes(row[3::4]).translate(OPAQUE)
        if 1 in mask:
            left, right = min(left, mask.find(1)), max(right, mask.rfind(1) + 1)
            top, bottom = min(top, y), y + 1
    if right <= left:
        raise SystemExit("a painting has no pixel above ALPHA_FLOOR")
    return left, top, right, bottom


def crop(w, h, rows):
    left, top, right, bottom = opaque_box(w, h, rows)
    m = round(MARGIN * max(right - left, bottom - top))
    left, top, right, bottom = max(0, left - m), max(0, top - m), min(w, right + m), min(h, bottom + m)
    return right - left, bottom - top, [row[left * 4:right * 4] for row in rows[top:bottom]]


# -------------------------------------------------------------- SHRINK
def taps(n_in, n_out):
    """For each output pixel on one axis, the (source pixel, weight) pairs it averages, summing to 1."""
    step = n_in / n_out
    out = []
    for j in range(n_out):
        lo, hi = j * step, (j + 1) * step
        span = range(int(lo), min(n_in, math.ceil(hi)))
        out.append([(i, (min(i + 1, hi) - max(i, lo)) / step) for i in span if min(i + 1, hi) > max(i, lo)])
    return out


def premultiplied(row):
    # Rule G3 holds by staying in integers here: colour times alpha is exact
    alpha = row[3::4]
    return [[c * a for c, a in zip(row[k::4], alpha)] for k in range(3)] + [list(alpha)]


def blend(planes_and_weights):
    """The weighted sum of several rows of channel planes, channel by channel."""
    acc = None
    for planes, wt in planes_and_weights:
        scaled = [[v * wt for v in plane] for plane in planes]
        acc = scaled if acc is None else [[s + v for s, v in zip(a, b)] for a, b in zip(acc, scaled)]
    return acc


def straight(planes):
    """One output row of straight RGBA bytes from its premultiplied channel planes."""
    out = bytearray()
    for r, g, b, a in zip(*planes):
        alpha = round(a)
        if alpha == 0:
            out += bytes(4)
        else:
            out += bytes([min(255, round(c / a)) for c in (r, g, b)] + [min(255, alpha)])
    return out


def shrink(w, h, rows):
    k = min(1, LONG_SIDE / max(w, h))
    out_w, out_h = max(1, round(w * k)), max(1, round(h * k))
    across, down = taps(w, out_w), taps(h, out_h)
    out = []
    for row_taps in down:
        planes = blend([(premultiplied(rows[y]), wt) for y, wt in row_taps])
        out.append(straight([[sum(plane[i] * wt for i, wt in t) for t in across] for plane in planes]))
    return out_w, out_h, out


# -------------------------------------------------------------- ENCODE
def chunk(kind, body):
    return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))


def encode(w, h, rows):
    raw = bytearray()
    for row in rows:
        left = bytes(4) + row[:-4]
        raw += bytes([FILTER]) + bytes((a - b) & 255 for a, b in zip(row, left))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    return SIGNATURE + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), ZLIB_LEVEL)) + chunk(b"IEND", b"")


# -------------------------------------------------------------- OUTPUT
def write(name, png):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".png"), "wb") as f:
        f.write(png)
    return 1


def main():
    n = 0
    for name, file in ART.items():
        n += write(name, encode(*shrink(*crop(*decode(os.path.join(SRC, file))))))
    print("wrote", n, "pngs to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
