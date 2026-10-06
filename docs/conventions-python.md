# Python code standard: felto

This file is self-contained: it can be applied without reading any other document. It covers
every `.py` file in the repo. On 2026-10-04 those were `tools/build_icons.py` and
`tools/build_mascots.py` (`ls tools`). On 2026-10-05 they are three: those two generators and
`tools/common.py`, the shared module that holds the code both generators use (rule H1). `ls tools`
listed exactly those three, and `find . -name '*.py' -not -path './.git/*'` found no other `.py`
file in the repo. `tools/common.py` imports only `math` and `os`, and each generator imports it by
its plain name (`grep -nE '^(import|from)' tools/*.py`, rule M4). Later on 2026-10-05 board item
17 added a fourth, `tools/build_sounds.py`, the sound generator. It wrote six WAV files to
`assets/sounds/`, and twelve since board item 28 (game-feel `GF-5`, the same day). It imports only
`math`, `os`, `struct` and `wave`; it does not import
`tools/common.py`, because nothing there draws sound. Where a rule below names "the two
generators" or "both files", it means the two SVG generators; each rule that also binds the sound
generator says so. Later on 2026-10-05 board item 35 added the first `.py` file outside `tools/`:
`solver/validate_key.py`, the schema validator of the GTO trainer's strategy key
(`docs/incomplete/gto-trainer/KEY-SPEC.md`, section 7.6). This standard governs `solver/` as it
governs `tools/` (`docs/incomplete/gto-trainer/PLAN.md`, BD-T3). The validator imports only
`hashlib`, `json` and `sys`, so it complies with M4 as written. BD-T3 lets the solver proper
import numpy; the first file that does so (phase 2 of that plan) must bring a dated amendment to
M4 that names `solver/` as the one place a third-party import is allowed, and bump this version.
Rules that speak of "a generator" (M1, M2, G1, W1, W2) do not bind a validator, which generates
nothing; M3, M4, H2, H3, H4, K1 and Y1 to Y3 bind every `.py` file. Later on 2026-10-05 board
item 49 added a fifth file in `tools/`, `tools/build_lottie.py`, the Lottie generator of game-feel
`GF-15`. It writes six Lottie JSON files to `assets/lottie/` and imports `json`, `math`, `os` and
`CREAM` from `tools/common.py` (`tools/build_lottie.py:28-32`). Every rule that binds the sound
generator binds it too; where it does a thing its own way, M1, G1, G3, G4, W1, W2 and H2 say so.
Read this file in full before you write or edit Python here.

Version 1.2.4. Written 2026-10-04 on Opus 5.5 for board item 1 (ledger step 2 in `HANDOFF.md`);
revised 2026-10-05 on Sonnet 5.5 for board item 2 (ledger step 3), which moved the shared code
into `tools/common.py`, for board item 3 (ledger step 4), which reconciled the line citations,
for board item 4 (ledger step 8), which named `tools/common.py` in the scope sentence, and
for board item 21 (ledger step 9), which corrected the import bullet under "What the rules rest on",
and for board item 5 (ledger step 11), which moved the citations that the icon generator change
shifted, and for board item 17 on Opus 5.5, which brought the sound generator under rules M1,
G1, G3, G4, W1, W2, H2 and Y4 and named it in the scope sentence, and for board item 28 on
Opus 5.5, which moved the sound generator citations that its six new effects shifted and set the
count in W2 and the scope sentence to twelve; no rule changed. Version 1.2.2 on 2026-10-05 on
Fable 5.1 for board item 35 (ledger step 41), which named `solver/validate_key.py` in the scope
paragraph and said which rules bind a file that is not a generator; no rule changed. Version 1.2.3
on 2026-10-05, at the merge of board item 59, for board item 47 on Opus 5.5 (ledger step 40),
which moved the sound generator citations in M1, G3, W1, W2 and Y4 that the re-voiced effects
(game-feel `GF-14`) shifted and added the re-voiced files to the determinism fact; no rule
changed. Item 47's branch called its change 1.2.2 because it was made beside item 35's, from the
same 1.2.1. Version 1.2.4 on 2026-10-05, at the merge of board item 59, for board item 49 (ledger step 46):
the Lottie generator in the scope paragraph and in M1, G1, G3, G4, W1, W2 and H2, and
`assets/lottie` in the gate's assets diff; no rule changed.
Zach answered the open questions on 2026-10-04 and took every recommendation. Those answers are
cited below as "owner, 2026-10-04".

## How to read a rule

Every rule has an ID. IDs are never renumbered. A rule that stops applying is marked
`Retired <date>` and keeps its ID, so a citation such as "G3" always resolves.

Every rule carries an enforcement tag:

- *gate*: the whole-repo gate, followed by
  `git diff --stat -- assets/icons assets/mascots assets/sounds assets/lottie`, catches a violation.
- *review*: nothing catches a violation. The rule holds only while each session reads it.

Every rule carries a provenance label:

- *[STANDARD]*: canonical for Python, with the source named.
- *[COMMON]*: widespread, with the alternative named.
- *[OURS]*: a house choice, with its reason given.

Every rule has a correct and an incorrect example, taken from this repo with `file:line`. Where
the repo holds no violation, the incorrect example is marked "written for contrast".

## No formatter or linter settles anything here

The owner decided on 2026-10-04 to adopt no formatter and no linter for now.
`command -v ruff black mypy pyright flake8 pylint` found none of them installed (2026-10-04).
So every layout rule below is prose, and every rule except the gate rules carries the *review*
tag. If a formatter is adopted later, its config replaces rules Y1 to Y3. Those rules are then
retired, not rewritten.

## What the rules rest on

These facts were verified 2026-10-04. A rule that breaks one of them is wrong.

- The generators import the standard library and the sibling module `tools/common.py`, and
  nothing else (`grep -nE '^(import|from)' tools/*.py`, 2026-10-05). Before ledger step 3 they
  imported only `math` and `os`.
- The generators are deterministic. The gate ran with exit 0, and
  `git diff --stat -- assets` was empty afterwards. The sound generator joined on 2026-10-05:
  two runs, one under `PYTHONHASHSEED=7`, gave the same `shasum` for all six WAV files. Board
  item 28 repeated the check for all twelve on 2026-10-05, with the same result, and board item
  47 repeated it for the twelve re-voiced files the same day, again the same. The Lottie
  generator joined the same day: two runs wrote byte-identical files (board item 49, ledger
  step 46), and the gate of board item 59 left `git diff --stat -- assets/lottie` empty.
- Python is 3.14.6 at `/opt/homebrew/bin/python3` (`python3 -c "import sys; print(sys.version)"`).
- The SVGs go into Rive. The mascot layer ids are the rig contract (`tools/build_mascots.py:7-9`).

## Module shape

### M1. A generator opens with a docstring that states the art style and the run command

*review · [OURS]* The style sentence ties the code to the approved Higgsfield reference, and
the run command lets a reader rebuild the art without opening `CLAUDE.md`. The word
"highlight" in the example below is a quote from the source and is kept as written. The sound
generator's docstring states its sound style the same way, and adds a musical note for each
effect: its pitches, its timing and its peak (`tools/build_sounds.py:1-67`). An agent cannot hear,
so those notes are the only description of a sound that a reader can check against the code. The
Lottie generator's docstring states its style the same way, says why it leaves out the hard pale
shadow, and describes each effect: what moves and how long it runs (`tools/build_lottie.py:1-26`).

Correct, `tools/build_icons.py:2-9`:

```python
"""Build the extruded-flat icon set for Felto.

Style (from the approved Higgsfield reference): no outlines, solid fills,
a thick darker extrusion offset down-right, a hard pale shadow behind it,
and one small gloss highlight.

Outputs to assets/icons/{chips,cards,path,ui}.
Run: python3 tools/build_icons.py
```

Incorrect, written for contrast:

```python
#!/usr/bin/env python3
import math
import os
```

### M2. Output paths are built from `__file__`

*review · [COMMON]* The alternative is an output path passed on the command line. This repo
builds the path from the file's own location, so a generator writes to the same place from any
working directory.

Correct, `tools/build_mascots.py:17`:

```python
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "mascots")
```

Incorrect, written for contrast:

```python
OUT = os.path.join("assets", "mascots")
```

### M3. Module level holds constants, tables and definitions; the work runs in one `main()`

*review · [STANDARD]* Python documentation, "`__main__`: top-level code environment". A
generator does nothing at import time. It runs only through `main()` behind the `__name__`
guard.

Correct, `tools/build_mascots.py:340` and `348-349`:

```python
def main():
    ...
if __name__ == "__main__":
    main()
```

Incorrect, written for contrast:

```python
for name, fn in BUILDERS.items():
    ...
```

### M4. Import the standard library only; import a sibling module by its plain name

*review · [OURS]* A third-party import is the owner's call. The fresh-checkout recipe needs only
`python3` and `xmllint` (`docs/AGENT-PRACTICES.md`, Part 6), and a dependency would change it.
A module in `tools/` is imported by its plain name. Running `python3 tools/build_icons.py` puts
`tools/` first on `sys.path`. A scratch import run from `/private/tmp` proved this on
2026-10-04. Never use a relative import and never edit `sys.path`. This is the owner policy
"no parent-relative imports".

Correct, `tools/build_icons.py:14-17`:

```python
import math
import os

from common import CREAM, SHADOW, ext, gloss, sector, stroke, svg, tf, write
```

Incorrect, written for contrast:

```python
import sys
sys.path.insert(0, os.path.dirname(__file__))
from .shared import gloss
```

## Generation and determinism

### G1. Output depends only on the generator source

*gate · [OURS]* A generator reads no clock, no random source, no environment variable, no
command-line argument and no input file. Every value in an SVG or a WAV comes from the source.
The `wave` module writes no date into the header, so a WAV file's bytes depend only on its
samples. The
byte-identical rebuild is the only proof that a change touched only what it meant to touch.
`grep -nE 'set\(|random|time\.|datetime|environ|getenv|argv|listdir|glob|uuid|hash\(|input\(' tools/*.py`
found nothing on 2026-10-04, and found nothing again on 2026-10-05 with `tools/build_lottie.py` in
the folder. The Lottie generator places its pieces with `Lcg`, a 32-bit number stream written in
the file, with one seed per effect in the source (`tools/build_lottie.py:79-90`), so it reads no
random source in the sense of this rule: the same seeds give the same bytes on every run.

Correct, `tools/build_icons.py:34-35`: the data is in the source.

```python
CHIPS = {
    "red": ("#E8252F", "#8E0F1A", "#F0414A"),
```

Incorrect, written for contrast:

```python
import random
rot = random.uniform(-40, -30)
```

### G2. Iterate only over ordered collections

*review · [STANDARD]* A list, a tuple or a dict keeps its order. A dict keeps insertion order
by the language definition since Python 3.7. A set of strings does not keep an order: string
hashing changes per process. On 2026-10-04 one six-colour set printed three different orders
under `PYTHONHASHSEED` 1, 2 and 3. Sort a directory listing before you iterate over it. A
violation shows up only on some runs, so no gate catches it reliably.

Correct, `tools/build_mascots.py:336-337`:

```python
POSES = ["happy", "sad", "cheer", "think", "smug", "sleep"]
BUILDERS = {"fish": fish, "squid": squid, "shark": shark}
```

Incorrect, written for contrast:

```python
POSES = {"happy", "sad", "cheer", "think", "smug", "sleep"}
```

### G3. Write a calculated number with a fixed precision

*review · [OURS]* A number that comes from float arithmetic goes into the SVG through a format
spec: `:.1f` for path points, as in `sector`, and `:.2f` for translations, as in `tf`. Integer
literals and integer arithmetic are written raw. A raw float writes its full representation,
so `72 * 0.65` reaches `assets/icons/chips/chip_stack_red.svg` as `r="46.800000000000004"`. A
harmless reordering of the arithmetic can then change the last digit and the art bytes with it.

In the sound generator the fixed precision is the 16-bit sample: a float becomes an integer in
one place only, `to_frames()`, through `round()` (`tools/build_sounds.py:140-144`). A sample can
still move by one if the float arithmetic before it is reordered, or on a platform whose `math.sin`,
`math.exp` or `math.cos` (`tools/build_sounds.py:123`, `207`) differs in the last bit, so the byte-identical check holds on this Mac and is not proven elsewhere.

In the Lottie generator the fixed precision is `num()`, which rounds a calculated number to two
places, or writes it bare when it is whole, before `json.dumps` writes the file
(`tools/build_lottie.py:93-97`). Every calculated number reaches the JSON through it.

Correct, `tools/common.py:28-29`:

```python
def tf(x, y):
    return f'transform="translate({x:.2f} {y:.2f})"'
```

Incorrect, `tools/build_icons.py:117`:

```python
f'<circle r="{rx * 0.65}" fill="{color}"/>'
```

The existing raw sites stay as they are, because a fix changes the art bytes. They are listed
in the drift register.

### G4. A change that should not change the art proves it with an empty diff

*gate · [OURS]* A refactor, a move or a rename in a generator runs the gate, then
`git diff --stat -- assets/icons assets/mascots assets/sounds assets/lottie`. Any line in that
output is a change in the art, the sound or an effect. A change there is allowed only when it was meant. Until
`assets/sounds/` is committed, compare `shasum assets/sounds/*.wav` before and after the run
instead, because `git diff` does not see an untracked file.

Correct: the gate on 2026-10-04, followed by an empty `git diff --stat -- assets`.

Incorrect, written for contrast: a hand-back that reports the gate green and does not run the
diff. The gate rewrites every SVG in place, so a green gate alone cannot show what changed.

## Output

### W1. All files are written through one write path, inside `OUT`

*review · [OURS]* One function takes a subfolder, a name and the content, creates the folder
and writes `<OUT>/<sub>/<name>.svg`. No other code opens a file for writing. One path gives one
place to count files and one place that keeps output inside `OUT`.

The sound generator has its own `write(name, frames)`, which writes `<OUT>/<name>.wav` through
the `wave` module and returns 1 (`tools/build_sounds.py:272-279`). It does not use the shared
`write()`, because that one opens a text file and adds `.svg`. It is the one write path of its
file, so the rule holds there too. The Lottie generator has its own `write(name, anim)` in the
same way: it writes `<OUT>/<name>.json` through `json.dumps` and returns 1
(`tools/build_lottie.py:478-482`).

Correct, `tools/common.py:20-25`. It takes the output folder as its first argument and returns
1, so `main()` can count (W2):

```python
def write(out, sub, name, content):
    d = os.path.join(out, sub)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name + ".svg"), "w") as f:
        f.write(content)
    return 1
```

Incorrect, the inline write that `tools/build_mascots.py` held before 2026-10-05, in `main()`:

```python
            with open(os.path.join(d, f"{name}_{p}.svg"), "w") as f:
                f.write(fn(p))
```

### W2. `main()` prints the number of files it wrote, counted from the writes

*review · [OURS]* The run line is the quick check that no asset went missing. Both
files comply since 2026-10-05: icons print 78 (76 when ledger step 3 made the fix, 78 since board item 5) and mascots print 18. The sound generator, added by board item 17, prints 12 (6 until board item 28; `tools/build_sounds.py:296`). The Lottie generator, added by board item 49, prints 6 (`tools/build_lottie.py:498`). The two wrong ways were both
in the repo before then. `tools/build_icons.py` counted with `os.walk` over `OUT`, which also
counts `assets/icons/preview.html` (77 for 76 SVGs), and never printed it.
`tools/build_mascots.py` printed a count computed from the tables, so it printed 18 even if a
write was skipped.

Correct, `tools/build_mascots.py`, `main()`:

```python
    n = 0
    for name, fn in BUILDERS.items():
        for p in POSES:
            n += write(OUT, name, f"{name}_{p}", fn(p))
    print("wrote", n, "svgs to", os.path.abspath(OUT))
```

Incorrect, the mascots line before 2026-10-05:

```python
    print("wrote", sum(len(POSES) for _ in BUILDERS), "svgs to", os.path.abspath(OUT))
```

## Drawing and layers

### L1. An extruded shape is a silhouette callable, `sil(fill, dx, dy)`, that returns markup

*review · [OURS]* A shape that gets a shadow and a stepped extrusion is described once, as a
function of a fill colour and an offset. The shadow, the depth and the face all come from
calls to it (`tools/build_icons.py:23-30`, `tools/build_mascots.py:25-46`). How the callable is
built is free: a lambda, a `def` or the `pth()` factory (sanctioned divergence S3). Details
drawn on a face are not silhouettes. A detail with a one-step darker copy under it, such as
the card-back emblem (`tools/build_icons.py:196-197`) or the chest lock (`355-356`), is
outside this rule.

Correct, `tools/build_icons.py:163-164`:

```python
def card_sil(f, x, y):
    return f'<rect {tf(x, y)} x="10" y="8" width="{CW - 30}" height="{CH - 30}" rx="18" fill="{f}"/>'
```

Incorrect, written for contrast: a shadow drawn as a second, hand-offset copy of the path.

```python
o.append('<path d="M98 20 L24 122 H72 L58 198 L140 84 H92 Z" fill="#C9CDE2"/>')
```

### L2. An icon gets its shadow, depth and face from `solid()`

*review · [OURS]* `solid()` paints the shadow, then the depth, then the face
(`tools/build_icons.py:23-30`). The caller adds the details after it. Two icons are sanctioned
exceptions. The current path node draws a flat face with no depth and no shadow, because the
progress ring would otherwise sit under the shadow (`tools/build_icons.py:258-262`, `281-282`).
The chip stack is a three-quarter view with its own geometry, and it builds its shadow with
`ext()` directly (`tools/build_icons.py:61-65`, `93`).

Correct, `tools/build_icons.py:326`:

```python
    o = [solid(sil, "#E8252F", "#8E0F1A", 9, 12)]
```

Incorrect, written for contrast:

```python
    o = [ext(sil, SHADOW, 18, 22), ext(sil, "#C5360E", 10, 12), sil("#FF6A1A", 0, 0)]
```

### L3. A mascot is a list of `Part`s with one shared shadow from `shadow_of()`

*review · [OURS]* Each part is a `<g id="...">` that holds its own depth and face, so the Rive
rig can move it (`tools/build_mascots.py:25-39`). The figure has one shadow, drawn first, from
every part, including a part that is drawn later in the pose. The fish think pose draws `fin_l`
last but puts it in the shadow (`tools/build_mascots.py:92-95`, `142`).

Correct, `tools/build_mascots.py:283-286`:

```python
    parts = [dorsal, fl] + ([] if pose == "think" else [fr]) + [body]
    shadow_parts = parts + ([fr] if pose == "think" else [])
    o = [shadow_of(shadow_parts, 21, 27)]
    o += [p.draw() for p in parts]
```

Incorrect, written for contrast: a shadow for each part, which paints one part's shadow over
the parts drawn before it.

```python
    o = [shadow_of([p]) + p.draw() for p in parts]
```

### L4. A function that returns a whole SVG collects layers in a list `o`, back to front

*review · [OURS]* Both files do this in every function that returns a whole SVG. The list
order is the paint order, and `"\n".join(o)` puts one layer on each line of the output.
Helpers that return a fragment, such as `solid()` and the nested `eyes()`, may build a string.

Correct, `tools/build_icons.py:323-328`:

```python
def ui_heart():
    d = "M90 156 C20 100 10 56 38 34 C60 18 82 30 90 48 C98 30 120 18 142 34 C170 56 160 100 90 156Z"
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" stroke="{f}" stroke-width="6" stroke-linejoin="round"/>'
    o = [solid(sil, "#E8252F", "#8E0F1A", 9, 12)]
    o.append(gloss(54, 54, 16, 8, -40, 0.6))
    return svg(200, 190, "\n".join(o))
```

Incorrect, written for contrast:

```python
    s = solid(sil, "#E8252F", "#8E0F1A", 9, 12)
    s += gloss(54, 54, 16, 8, -40, 0.6)
    return svg(200, 190, s)
```

### L5. No outline around a silhouette

*review · [OURS]* The style has no outlines (`tools/build_icons.py:4`,
`tools/build_mascots.py:4`). A stroke on a silhouette has the same colour as its fill and only
rounds the corners. A stroke in another colour is a feature line or a glyph drawn on the face:
a pupil, a mouth, a brow (`tools/common.py:10`), a node glyph, the card-back lattice.

Correct, `tools/build_icons.py:317`:

```python
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" stroke="{f}" stroke-width="10" stroke-linejoin="round"/>'
```

Incorrect, written for contrast:

```python
    sil = lambda f, x, y: f'<path {tf(x, y)} d="{d}" fill="{f}" stroke="{INKL}" stroke-width="4"/>'
```

### L6. An open line with round caps and joins is drawn with `stroke()`

*review · [OURS]* `stroke()` writes `fill="none"`, a round cap and a round join
(`tools/common.py:32-36`). Any line with exactly those attributes uses it. `stroke()`
lives in `tools/common.py` (H1). The one inline copy in the icons file, the check glyph, now
calls it (2026-10-05).

Correct, `tools/build_mascots.py:138`:

```python
        o.append(f'<g id="mouth">{stroke("M168 284 Q190 260 212 284", 7, FISH_ORANGE)}</g>')
```

Incorrect, the check glyph in `tools/build_icons.py` before 2026-10-05:

```python
    return f'<path d="M-26 2 L-8 20 L27 -18" fill="none" stroke="{c}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'
```

## Colour

### C1. A new colour is a named constant or a row in a colour table

*review · [OURS]* This is the owner policy "tokens only", applied on 2026-10-04 to new code. A
diff that adds a hex value outside a module-level assignment breaks this rule. The inline
values that exist on 2026-10-04 stay (owner, 2026-10-04): 36 values on 30 lines in
`build_icons.py` (28 lines since board item 5 folded the flame colours into parameters; the audit's own count read one lower on both dates) and 21 values on 15 lines in `build_mascots.py`, counted with Python's `ast`
module. The one inline colour allowed in new code is shine white (C2).

Correct, `tools/build_mascots.py:247-250`:

```python
SH_BODY, SH_BODY_D = "#3A7BFF", "#1747B8"
SH_FIN, SH_FIN_D = "#2557E0", "#0F2E96"
SH_BELLY = "#F6FAFF"
SH_PINK = "#F7799F"
```

Incorrect, `tools/build_mascots.py:303`. `SH_FIN_D` already holds this value:

```python
        o.append(f'<g id="mouth">{stroke("M176 214 Q200 194 224 214", 6, "#0F2E96")}</g>')
```

### C2. Write colours as six-digit uppercase hex; write shine white as `#fff`

*review · [OURS]* This is what both files do. `#fff` appears only on shine marks: the gloss
(`tools/common.py:49`), the chip-stack glint
(`tools/build_icons.py:122`), the bolt streak (`319`), the pupil glints
(`tools/build_mascots.py:111`, `214`) and the glasses glints (`295-296`). Eye whites use the
named constant `EYE = "#FFFFFF"` (`tools/build_mascots.py:18`).

Correct, `tools/common.py:8-9`:

```python
SHADOW = "#C9CDE2"
CREAM = "#FBF4EA"
```

Incorrect, written for contrast:

```python
SHADOW = "#c9cde2"
```

### C3. Colour order is the face colour, then the depth colour

*review · [OURS]* Every colour pair and every colour table in both files puts the face first
and the darker depth colour (`dark`) second, with any light accent after them: `CHIPS`
(`tools/build_icons.py:34-41`), `NODE_STATES` (`247-253`), `solid(sil, face, dark)` (`23`),
`Part(pid, sil, face, dark)` (`tools/build_mascots.py:28`) and the character pairs (`50-51`,
`153-155`, `247-248`).

Correct, `tools/build_mascots.py:50`:

```python
FISH_RED, FISH_DARK = "#E8252F", "#8E0F1A"
```

Incorrect, written for contrast:

```python
FISH_DARK, FISH_RED = "#8E0F1A", "#E8252F"
```

## Ids

### I1. Group ids are snake_case; clipPath ids are camelCase and end in `Clip`

*review · [OURS]* This is what both files do. Group ids: `ring_track` (`tools/build_icons.py:272`),
`pupil_l` (`tools/build_mascots.py:110`). ClipPath ids: `backClip` (`tools/build_icons.py:188`),
`fishClip` (`tools/build_mascots.py:85`), `sqClip` (`175`), `lidClip_l` and `lidClip_r`
(`115`). The suffixes `_l` and `_r` mean left and right.

Correct, `tools/build_icons.py:272`:

```python
        o.append(f'<circle id="ring_track" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#DDE1EC" stroke-width="12"/>')
```

Incorrect, written for contrast:

```python
        o.append(f'<circle id="ringTrack" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#DDE1EC" stroke-width="12"/>')
```

### I2. An id appears at most once in a file

*review · [STANDARD]* XML 1.0, validity constraint "ID": an ID value identifies one element.
`xmllint --noout` checks only well-formedness, so it does not catch a duplicate. On 2026-10-04
no file under `assets/icons/` or `assets/mascots/` held a duplicate id. This command checked it:

```bash
python3 -c "import glob,re,collections;[print(f,d) for f in glob.glob('assets/*/*/*.svg') for d in [[k for k,v in collections.Counter(re.findall(r'\bid=\"([^\"]+)\"',open(f).read())).items() if v>1]] if d]"
```

Correct, `tools/build_mascots.py:115`: the id inside the per-eye loop carries the eye.

```python
                    f'<clipPath id="lidClip_{nm}"><ellipse cx="{x}" cy="{ey}" rx="36" ry="{ry}"/></clipPath>'
```

Incorrect, written for contrast:

```python
                    f'<clipPath id="lidClip"><ellipse cx="{x}" cy="{ey}" rx="36" ry="{ry}"/></clipPath>'
```

### I3. Within one mascot, an id names the same part in every pose

*review · [OURS]* This is the Rive rig contract. A pose may add an id. A pose never drops an id
that the other poses carry, and never uses an id for a different part. A part that changes
shape keeps its id: the squid's chin arm in the think pose is `arm_r`
(`tools/build_mascots.py:193`), like its right arm in the cheer pose (`188`), and the shark's
chin fin is `fin_r` (`314`). A feature that a pose hides keeps an empty group, so the id
survives (`209`).

Before 2026-10-05 the docstring at `tools/build_mascots.py:7-9` listed `face`, `eye_l`,
`eye_r`, `pupil_l` and `pupil_r` for every character. That was wrong for two of the three: no
fish pose has `face`, and no shark pose has an eye or pupil id. The docstring now points here.
This table is the contract as measured from the 18 SVGs on 2026-10-04:

| Character | Ids in every pose | Ids one pose adds |
|---|---|---|
| fish | `body`, `eye_l`, `eye_r`, `fin_l`, `fin_r`, `fishClip`, `mouth`, `pupil_l`, `pupil_r`, `rim`, `shadow`, `tail` | smug: `lid_l`, `lid_r`, `lidClip_l`, `lidClip_r` |
| squid | `body`, `eye_l`, `eye_r`, `face`, `mouth`, `pupil_l`, `pupil_r`, `shadow`, `sqClip`, `tentacles` | cheer: `arm_l`, `arm_r`; think: `arm_r` |
| shark | `belly`, `body`, `dorsal`, `fin_l`, `fin_r`, `glasses`, `mouth`, `shadow` | sleep: `eyes_closed`; smug: `arms`, `arm_a`, `arm_b` |

Correct, `tools/build_mascots.py:209`: the sleeping squid keeps an empty `eye_l` and `eye_r`.

```python
                s += f'<g id="eye_{nm}"></g><g id="pupil_{nm}">' + stroke(f"M{x - 20} {ey} Q{x} {ey + 16} {x + 20} {ey}", 5) + "</g>"
```

Incorrect, written for contrast:

```python
                s += stroke(f"M{x - 20} {ey} Q{x} {ey + 16} {x + 20} {ey}", 5)
```

## Functions

### H1. Code that both generators use lives in one shared module in `tools/`

*review · [OURS]* Owner, 2026-10-04. Both files hold copies of `svg`, `tf`, `ext`, `gloss`,
`sector`, `SHADOW` and `CREAM`, and two of the copies already differ. `gloss` has different
defaults, and only the icons copy writes `id="gloss"`. `svg` in the mascots file also takes a
viewBox origin. `stroke()` joins the shared module too (L6). Board item 2 made the move on 2026-10-05. The module is
`tools/common.py`. It holds `svg`, `tf`, `ext`, `sector`, `gloss`, `stroke`, `write`, `SHADOW`,
`CREAM` and `INKL` (which the `stroke` default needs). Every caller keeps the output it had on
2026-10-04 (G4). `gloss` takes `ident=True` to write `id="gloss"`; the three mascot calls pass
`ident=False`. A helper that both generators need goes there and nowhere else.

Correct, `tools/build_mascots.py:15`:

```python
from common import CREAM, INKL, SHADOW, ext, gloss, sector, stroke, svg, tf, write
```

Incorrect, the two `gloss` copies that existed before 2026-10-05, which already differed:

```python
def gloss(x, y, rx=18, ry=9, rot=-35, op=0.6):
    return (
        f'<ellipse id="gloss" cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" '
```

```python
def gloss(x, y, rx=16, ry=8, rot=-35, op=0.55):
    return (
        f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" transform="rotate({rot} {x} {y})" '
```

### H2. A helper is at most 15 lines; a function that returns one whole SVG is exempt

*review · [OURS]* This is the owner policy "functions of roughly 6 to 15 lines", applied on
2026-10-04. Count from the `def` line to the last line. A function that returns one whole SVG
(`chip`, `chip_stack`, `card_face`, `card_back`, `node`, the `ui_*` functions, `fish`, `squid`,
`shark`) is exempt, and so are the helpers nested inside it. In the sound generator a function
that returns one whole effect (`answer_right` to `sparkle`) is exempt in the same way, and so are the
five functions of the Lottie generator that return one whole effect: `burst`, `confetti`,
`sparkle_shower`, `fly_up` and `flame_flicker` (24 to 46 lines, measured with `ast` on
2026-10-05). The 6 in the policy guides against
splitting a line or two into a function of its own. The two-line helpers that exist, such as
`tf` and `ext`, comply. On 2026-10-04 one function broke the 15-line limit: `main` in
`tools/build_icons.py`, at 19 lines (measured with `ast`). Since 2026-10-05 it is 14, and 15 since board item 5 added one write.

Correct, `tools/common.py:53-62`: `sector`, 10 lines.

Incorrect, `main` in `tools/build_icons.py` before 2026-10-05: 19 lines.

### H3. No type hints

*review · [OURS]* Owner, 2026-10-04. No type checker is installed, so a hint is never checked
and can be wrong with no signal. Retire this rule when a checker is adopted. Neither file has a
hint on 2026-10-04 (`grep -nE '\) *->' tools/*.py` finds nothing).

Correct, `tools/common.py:32`:

```python
def stroke(d, w=5, color=INKL):
```

Incorrect, written for contrast:

```python
def stroke(d: str, w: int = 5, color: str = INKL) -> str:
```

### H4. A helper that one function uses is nested inside that function

*review · [OURS]* This is what both files do: `curve`, `band`, `strip` and `sil_all` inside
`chip_stack` (`tools/build_icons.py:69-91`), and `eyes` and `open_mouth` inside `fish`
(`tools/build_mascots.py:101-131`). A helper that two functions in one file use goes to module
level. A helper that both files use goes to the shared module (H1).

Correct, `tools/build_icons.py:72-76`:

```python
    def band(y):
        return (
            f"M{cx - rx} {y} L{cx - rx} {y + t} A{rx} {ry} 0 0 0 {cx + rx} {y + t} "
            f"L{cx + rx} {y} Z"
        )
```

Incorrect, written for contrast: `band` at module level with `cx`, `rx`, `ry` and `t` passed in,
used only by `chip_stack`.

## Comments

### K1. A comment says why; the one exception is a legend over a table of positional tuples

*review · [OURS]* This is the owner policy "comments explain why only". The exception covers a
table whose rows are unnamed tuples, where the legend is the only place the field order is
written (`tools/build_icons.py:246`). The comments that say what exist on 2026-10-04 stay
(owner, 2026-10-04) and are listed in the drift register.

Correct, `tools/build_icons.py:136-137`:

```python
# spades = the heart flipped, plus a flared stem. Drawn in two paths so the
# stem overlaps the lobes without a seam.
```

Incorrect, `tools/build_icons.py:281`:

```python
    else:  # current node: flat disc inside the ring, no depth edge, no shadows
```

## Layout

No formatter runs, so these rules are prose only.

### Y1. Follow PEP 8 for names and indentation

*review · [STANDARD]* PEP 8: four-space indentation, `snake_case` functions and modules,
`UPPER_SNAKE` module constants, `CapWords` classes. Never use `l`, `O` or `I` as a one-letter
name. Short local names are normal here: `o` for the layer list, `s` for a fragment, `d` for
path data or a folder, `f` for a fill or a file.

Correct, `tools/build_mascots.py:25`:

```python
class Part:
```

Incorrect, `tools/build_icons.py` before 2026-10-05:

```python
    for name, (c, d, l) in CHIPS.items():
```

### Y2. Use double quotes; use single quotes around SVG markup

*review · [COMMON]* Double quotes are the default of Black and of `ruff format`. Both switch to
single quotes when that avoids escaping a double quote (ruff settings, `quote-style`, read
through Context7 on 2026-10-04). SVG attributes use double quotes, so a Python string that holds
markup uses single quotes.

Correct, `tools/build_mascots.py:127` and `345`:

```python
            '<g id="mouth">'
    print("wrote", n, "svgs to", os.path.abspath(OUT))
```

Incorrect, written for contrast:

```python
            "<g id=\"mouth\">"
```

### Y3. Split a long string between attributes or between path commands, inside parentheses

*review · [OURS]* No line limit applies. On 2026-10-04, 89 lines were longer than 88 characters
(`awk 'length>88' tools/*.py`). When a string is split, it is split into adjacent literals inside
parentheses, at a break between attributes or between path commands.

Correct, `tools/common.py:13-17`:

```python
def svg(w, h, body, x0=0, y0=0):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}" '
        f'width="{w}" height="{h}">\n{body}\n</svg>\n'
    )
```

Incorrect, written for contrast: a split inside an attribute value, with a backslash.

```python
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \
{w} {h}" width="{w}" height="{h}">\n{body}\n</svg>\n'
```

### Y4. A section banner divides each family of assets

*review · [OURS]* A banner is a comment of dashes that ends in the family name in capitals, 70
to 72 characters long (`tools/build_icons.py:33`, `127`, `204`, `290`;
`tools/build_mascots.py:49`, `152`, `246`; `tools/build_sounds.py:108`, `147`, `271`). In the
sound generator a banner divides the synth helpers, the effects and the output.

Correct, `tools/build_icons.py:33`:

```python
# ---------------------------------------------------------------- CHIPS
```

Incorrect, written for contrast:

```python
### chips ###
```

## Sanctioned divergence registry

The two SVG generators mirror each other. The sound generator mirrors neither, so it is not in
this registry. These are the only sanctioned differences between the two SVG generators.
Any other difference is drift. Drift is fixed by a board item, not in passing. A new entry here
needs a recorded reason and the owner's agreement.

| # | Difference | `build_icons.py` | `build_mascots.py` | Reason |
|---|---|---|---|---|
| S1 | How layers are built | `solid()`, lines 23-30 | `Part` and `shadow_of()`, lines 25-46 | An icon is one silhouette. A mascot is a rig of parts that Rive moves one by one. |
| S2 | Shadow offset | Calculated from the depth offset, `(dx * 2.1, dy * 1.9)`, line 27 | Set once for each character, lines 95, 194, 285 | One shadow covers every part of a figure, so it is set once for the figure. |
| S3 | How a silhouette is built | Lambdas and `card_sil` | `pth()`, `fin_sil` and lambdas | L1 fixes the call signature. The construction does not change the output. |
| S4 | How variants are chosen | Data tables iterated in `main()`, lines 34-41, 247-253, 362-369 | `if` and `elif` for each pose inside the drawing function, lines 133-148, 223-242, 300-332 | Icon variants differ in data. Poses differ in shape. |

## Drift register

These sites break a rule above on 2026-10-04. A session that edits one of these lines does not
fix the drift in passing (owner policy: note and raise). Each row says what happens to it. Line numbers in a row marked fixed are the 2026-10-04 lines of
code that has since moved or changed, so they do not match the files now.

| Rule | Sites | What happens |
|---|---|---|
| H1 | `svg` (icons 23-27, mascots 23-27, differ), `tf` (icons 59-60, mascots 30-31), `ext` (icons 37-39, mascots 41-42), `gloss` (icons 52-56, mascots 49-53, differ), `sector` (icons 74-83, mascots 91-100), `SHADOW` and `CREAM` (icons 18-19, mascots 17-18) | Fixed 2026-10-05, ledger step 3: all moved to `tools/common.py` |
| L6 | `tools/build_icons.py:261` | Fixed 2026-10-05, ledger step 3 |
| W1 | `tools/build_mascots.py:385-389` | Fixed 2026-10-05, ledger step 3 |
| W2 | `tools/build_icons.py:411-412`, `tools/build_mascots.py:390` | Fixed 2026-10-05, ledger step 3: icons print 76, mascots print 18 |
| H2 | `tools/build_icons.py:394-412`, `main` at 19 lines | Fixed 2026-10-05, ledger step 3: `main` is 14 lines |
| Y1 | `tools/build_icons.py:395`, the name `l` | Fixed 2026-10-05, ledger step 3: `l` renamed `light` |
| I3 | The docstring at `tools/build_mascots.py:7-9` | Fixed 2026-10-05, ledger step 3: the docstring points at the I3 table |
| G3 | `tools/common.py:60-61` when called with float radii from `tools/build_icons.py:110`; `116-118`; `171-172` (centre written as `70.0 98.0`); `tools/build_mascots.py:169` (written as `137.0`); `187-188`; `193` | Stays (owner, 2026-10-04): a fix changes the art bytes. Found by reading the code; the list is not proven complete. |
| C1 | 36 inline values in `build_icons.py` and 21 in `build_mascots.py`, including `"#0F2E96"` at mascots 303, 312, 328 and 329 | Stays (owner, 2026-10-04) |
| K1 | `tools/build_icons.py:69`, `106-107`, `281`; `tools/build_mascots.py:160` | Stays (owner, 2026-10-04) |

## Owner policy, as it applies to these scripts

Zach answered these policies for the whole of his work in `.personal-config.json`. This table
says how each one applies to the scripts in `tools/` (owner, 2026-10-04).

| Policy | How it applies here | Rule |
|---|---|---|
| Comments explain why only | Why only, plus a legend over a table of positional tuples | K1 |
| Functions of roughly 6 to 15 lines | Helpers at most 15 lines; a function that returns one whole SVG, one whole sound effect or one whole Lottie effect is exempt | H2 |
| Strict types | No hints until a type checker runs | H3 |
| Tokens only for design values | A new colour is named; the existing inline values stay | C1 |
| Named exports only | Does not apply: a script exports nothing | none |
| No parent-relative imports | Sibling modules by plain name; no relative import, no `sys.path` edit | M4 |
| Ecosystem-default file names | PEP 8 module names | Y1 |
| Extract by concept | A helper for one function is nested; a helper for both files is shared | H1, H4 |
| Note and raise, no drive-by fixes | Drift is fixed by a board item | Drift register |
| All three states, one data client, copy registers, a test file for each feature | Does not apply: `tools/` has no UI, no data layer, no user-facing copy and no test runner | none |

## Outside this file

These rules govern the same files but live in `CLAUDE.md`, because they are about the generated
art and not the Python: never hand-edit a generated SVG, never touch `assets/higgsfield/`, never
trust the preview pages as a picture of the current SVGs, and never ship card SVGs into Rive
with live `<text>`.
