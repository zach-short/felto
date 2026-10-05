<!-- personal-config v0.7.0 · 2026-10-04 · config 3b46daed · standard v1.2.0 · adapted -->
# HANDOFF: felto (the ledger)

**What is true.** Read first, every session. Append-only in the step log; standing sections are
edited in place when they go stale. Started 2026-10-04.

## Orientation

felto is, as of 2026-10-04, an asset pipeline with no app code: two Python generators in
`tools/` write the SVG icons and mascots for a game about poker (cards, chips, a lesson path,
streak, XP, lives), and three HTML pages show the art. Zach is the owner and decides everything
here (solo mode). He is interactive: when a decision is his, ask in chat, in one batch, before
building it.

Read in this order: this file, then `PASSOFF.md` (what is next), then `docs/AGENT-PRACTICES.md`
(the working standard), then `CLAUDE.md`.

## Environment

| Fact | Value | Source (verified 2026-10-04) |
|---|---|---|
| Build | `python3 tools/build_icons.py && python3 tools/build_mascots.py` | Run: exit 0; output byte-identical to the files on disk (`diff -rq` against a scratch rebuild) |
| Test | none | No test files or runner (`ls -a`, `find . -type f`) |
| Lint | none | No linter config or manifest at the root (`ls -a`) |
| Typecheck | none | Python only, no type checker configured |
| Well-formed check | `xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg` | Run: exit 0 |
| Whole-repo gate | build, then the well-formed check, as one command (`gateCommand` in `.personal-config.json`) | Run: exit 0 |
| Python | 3.14.6, `/opt/homebrew/bin/python3`; generators import only `math` and `os` | `python3 --version`; `grep -nE '^(import\|from)' tools/*.py` |
| xmllint | libxml 20913, `/usr/bin/xmllint` | `xmllint --version` |
| Git | Initialized 2026-10-04 on branch `main`. First commit `90fc2e8`, "adapt the working standard to felto", 2026-10-04 23:41 -0400. This row said "no commits yet" until step 2: true when step 1 wrote it, wrong once `90fc2e8` landed (`git log --oneline`, 2026-10-04). Remote `origin` is `https://github.com/zach-short/felto.git`, private | `git init -b main`; `gh repo create zach-short/felto --private`; `git log --oneline` |
| CI | none | `ls .github/workflows` finds nothing |
| Ships | Nothing ships. No app, no deploy: merged is not shipped | No app code or deploy config in the tree |

**What an agent cannot verify here.** A generator run proves files were written, not how they
look. An agent can render a single SVG in the browser pane and look at it; do that for every
visual change, and do not use the preview pages for it (see Known facts). Rive import cannot be
checked here at all: end with the exact file to import and what should appear, then wait for
Zach.

## Settled

### 2026-10-04: process files are tracked in git

`HANDOFF.md`, `PASSOFF.md` and `docs/AGENT-PRACTICES.md` are tracked, as `.personal-config.json`
says (`"trackMode": "tracked"`). The global rule that hides them (`~/.config/git/ignore:4-6`) is
overridden by `!` lines in `.gitignore:3-5`. Zach decided this at GATE 0. Defense: a solo repo
loses nothing by tracking them, and git then holds a copy of the ledger before any fold.

### 2026-10-04: the board marker is `DONE: HANDOFF n`

The colon replaced an em dash, which the writing rules ban. `personal-config` reads both forms:
`doctor` and `fold` test `startsWith('DONE')` and then match `HANDOFF <n>`
(`~/Projects/personal-config/src/doctor/rules/board-status.ts:56,94`, `src/lib/fold.ts:66`).
Zach chose to check the tool before aligning, at GATE 0.

### 2026-10-04: the GitHub repo is private

`zach-short/felto` stays private. Zach confirmed at GATE 0.

## Code map

- `tools/common.py`: the helpers both generators use (`svg`, `tf`, `ext`, `sector`, `gloss`,
  `stroke`, `write`) and the constants `SHADOW`, `CREAM`, `INKL`. Imported by plain name (step 3).
- `tools/build_icons.py`: writes `assets/icons/{chips,cards,path,ui}/` (76 SVGs).
- `tools/build_mascots.py`: writes `assets/mascots/{fish,squid,shark}/` (18 SVGs, six poses each).
- `assets/higgsfield/`: the Higgsfield reference art the style was approved from (19 PNG, 13 SVG).
- `assets/gallery.html`: shows the Higgsfield art; links all 32 files by name.
- `assets/icons/preview.html`, `assets/mascots/preview.html`: inline SVG snapshots, written by
  no script.
- `docs/conventions-python.md`: the Python code standard for `tools/`, version 1.1.1 (steps 2 to 4).

## Invariants

- Every SVG under `assets/icons/` and `assets/mascots/` is generator output. A hand edit is lost
  on the next run (`tools/build_icons.py:19`, `tools/build_mascots.py:17`). Change the generator.
- The generators are deterministic: the same source gives byte-identical SVGs. A gate run that
  changes a generated file without a generator change is a bug.
- `assets/higgsfield/` filenames do not change: `assets/gallery.html` links them by name.

## Known facts and quirks

- **The preview pages can be stale.** No script writes them (`grep -n preview tools/*.py` finds
  nothing). On 2026-10-04 a rough comparison matched 0 of 18 inline mascot SVGs and 19 of 33
  inline icon SVGs to the current file bodies. Look at the SVG files, not the previews.
- **Card ranks are live `<text>`.** Convert them to outlines before Rive import, or set the font
  in Rive (`tools/build_icons.py:11-12`).
- **Resolved 2026-10-05 (step 3): the run lines now carry a count.** `build_icons.py` computed a
  count it never printed, and `os.walk` would have given 77 for 76 SVGs because of
  `preview.html`. Both generators now count from `write()` and print 76 and 18 (rule W2).
- **Resolved 2026-10-05 (step 3): the mascot docstring overstated the ids.** It listed `face`,
  `eye_l`, `eye_r`, `pupil_l` and `pupil_r` for every character. It now points at the id table
  in rule I3 of `docs/conventions-python.md`, which was measured from the 18 SVGs.
- **Some numbers reach the art as raw floats**, such as `r="46.800000000000004"` in
  `assets/icons/chips/chip_stack_red.svg` (from `tools/build_icons.py:117`). The output is still
  deterministic. Zach chose on 2026-10-04 to leave these sites, because a fix changes the art
  bytes (rule G3 and its drift register).
- **A global rule gitignores this ledger, the board and the standard** in every repo
  (`~/.config/git/ignore:4-6`). felto overrides it; see Settled.
- **The `DONE` board marker had two spellings, 2026-10-04.** Wrong for part of step 1; resolved
  the same day. See Settled.
- **`PART0-PROMPT.md:4` names the wrong directory**, a scratchpad path under `/private/tmp`. The
  repo is `/Users/zachshort/Projects/felto`. Found 2026-10-04.

## Step log

Numbered, append-only. **Take the next free number by reading this file**, not from a number
written anywhere else: another session may have taken it. **Do not edit a step you did not
write**; append a correction as a new step.

Old steps are folded out to the archive and keep their number, title and date as one line
(`personal-config fold ledger`). A step is addressable forever ("step 24" is how everything
refers to that work), so the line stays even when the body goes. Standing sections above are
never folded; they are edited in place.

**1. Adapt the working standard to felto (Part 0).** Done 2026-10-04, on branch `main` (no
commits yet), on Opus 5.5. Ran the Part 0 inventory: no app code, no manifest, no CI, no tests,
no migrations. Verified the gates by running them (Environment). Cut from
`docs/AGENT-PRACTICES.md`: Part 0, the CI enforcement tag, the migration and parity rules, the
ratchet rules, and the Part 12 cross-references; filled the fresh-checkout recipe and the build
command; swept the file free of em dashes and contractions. Filled `CLAUDE.md` and this file, and
set `gateCommand` in `.personal-config.json`. Also, at Zach's request mid-session, ran
`git init` and created the private GitHub repo `zach-short/felto` with `origin` set; nothing
committed or pushed. GATE 0 answers, 2026-10-04: track the process files, align the board marker after
checking `personal-config` (done, colon form), board item 1 is the Python code standard, the
GitHub repo stays private. Added the `!` lines to `.gitignore`, wrote board item 1, and stamped
`PASSOFF.md` as adapted. **Left owed:** board item 1, and the first commit, which is Zach's.

**2. Write the Python code standard for `tools/` (board item 1).** Done 2026-10-04, on branch
`main`, on Opus 5.5. Wrote `docs/conventions-python.md`, version 1.0.0: 31 rules in nine groups
(M, G, W, L, C, I, H, K, Y), each with an enforcement tag (G1 and G4 are *gate*, the rest
*review*), a provenance label and a correct/incorrect pair from this repo, plus a sanctioned
divergence registry (S1 to S4) and a drift register. Pointed `CLAUDE.md` at it (its first
blockquote and the `docs/` row) and replaced the Style rules section here. Zach's answers,
2026-10-04, every one as recommended: no formatter or linter for now (`command -v ruff black
mypy pyright flake8 pylint` found none); the helpers copied into both generators move to one
shared module in `tools/`, as board item 2, with byte-identical art; helpers at most 15 lines,
functions that return one whole SVG exempt; no type hints until a type checker runs; comments
say why, with one exception for a legend over a tuple table; a new colour gets a name, and the
existing inline values stay; "named exports only" does not apply to scripts; the eight
differences between the two files are settled as rules or as sanctioned divergences, as the
registry records. Found and recorded, not fixed, because both are in generator code this item
does not own: the rig docstring at `tools/build_mascots.py:7-9` overstates the ids, and the
unused count at `tools/build_icons.py:411` would read 77 for 76 SVGs (Known facts). Corrected
the Environment Git row, which still said "no commits yet" after `90fc2e8`. Gate run
2026-10-04: exit 0, and `git diff --stat -- assets` empty, so no art changed. Opened board
item 2. **Left owed:** board item 2, and the commit, which is Zach's.

**3. Move the shared generator code into one module (board item 2).** Done 2026-10-05, on
branch `main`, on Sonnet 5.5. Gate and `git diff --stat -- assets/icons assets/mascots` were clean
before the first edit. Created `tools/common.py` with `svg` (mascots signature), `tf`, `ext`,
`sector`, `gloss`, `stroke`, `write`, `SHADOW` and `CREAM`, plus `INKL`, which the `stroke`
default needs and which the brief did not list. `write(out, sub, name, content)` takes the output
folder and returns 1. `gloss(x, y, rx, ry, rot, op=0.6, ident=True)` writes `id="gloss"` unless
`ident=False`; the three mascot calls pass `ident=False`, and the chip's gloss, the one call that
relied on a default `op`, still gets 0.6. Deleted every copy from both generators, drew
the check glyph with `stroke()`, wrote every file through the shared `write()`, made both `main`
functions print a count taken from the writes (76 and 18), cut icons `main` to 14 lines with a
`UI_ICONS` table, renamed `l` to `light`, and corrected the mascots docstring. Updated
`docs/conventions-python.md` to 1.1.0: H1, M4, W1, W2, L6, H2, Y1 and I3 prose, and the seven
drift rows marked fixed. Proof: the gate exited 0 after the generator switches, the run lines
read 76 and 18, and `git diff --stat -- assets/icons assets/mascots` was empty each time.
**Left owed:** line citations in the other rules of the standard (for example Y3, M2, L1 to L5)
still point at pre-move line numbers in the two generators; no reconcile pass is done. The
commit is Zach's.

**4. Reconcile the line citations in the Python standard (board item 3).** Done 2026-10-05, on
branch `main`, on Sonnet 5.5. `grep -nE 'tools/build_(icons|mascots)\.py:[0-9]'` found 67 lines
before and 59 after; the 8 that left cite `tools/common.py` now, which the grep does not match.
Moved every live citation in `docs/conventions-python.md` to the lines the code holds now (rules
M2 to Y4, registry S1, S2 and S4, drift rows G3, C1 and K1), each read by a scratchpad script that
printed the first cited line (113 citations, none off). Two citations pointed at rewritten code;
Zach chose, 2026-10-05, both as recommended: Y2 now cites `tools/build_mascots.py:127` and `345`
with the current `print` as its example, and Y3 cites `tools/common.py:13-17` with the current
`svg` signature. Rows in the drift register marked fixed keep their 2026-10-04 lines as history,
with a sentence saying so. Bumped the standard to 1.1.1 and removed its stale-citation sentence.
Gate green, and `git diff --stat -- assets tools` empty. Found, not fixed: `HANDOFF.md:75` and
`:94` and `CLAUDE.md:14`, `:38-39` and `:73` cite old lines (`CLAUDE.md:73` also says the count is
never printed, false since step 3); the standard's line 4 names two `.py` files, with the
2026-10-04 date; the C1 counts of 36 and 21 were not recounted. **Left owed:** those stale lines
in `HANDOFF.md` and `CLAUDE.md`. The commit is Zach's.

**5. Fix the stale citations in `HANDOFF.md` and `CLAUDE.md`.** Done 2026-10-05, on branch
`main`, on Sonnet 5.5, closing what step 4 left owed. `HANDOFF.md:75` and `:94` and `CLAUDE.md:14`,
`:38-39` now cite the current lines. `CLAUDE.md` no longer says the icons count is never printed
(false since step 3); it cites the two `print` lines. Left as written: the citations inside steps
2 and 3, which describe the code as it was on 2026-10-04. `git diff --stat -- assets tools` empty.

## Style rules

Python follows `docs/conventions-python.md` (written in step 2, 2026-10-04). Read it in full
before editing anything in `tools/`. No formatter or linter is configured (Zach, 2026-10-04), so
nothing settles style mechanically.
