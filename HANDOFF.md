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
| Git | Initialized 2026-10-04 on branch `main`, no commits yet. Remote `origin` is `https://github.com/zach-short/felto.git`, private | `git init -b main`; `gh repo create zach-short/felto --private` |
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

- `tools/build_icons.py`: writes `assets/icons/{chips,cards,path,ui}/` (76 SVGs).
- `tools/build_mascots.py`: writes `assets/mascots/{fish,squid,shark}/` (18 SVGs, six poses each).
- `assets/higgsfield/`: the Higgsfield reference art the style was approved from (19 PNG, 13 SVG).
- `assets/gallery.html`: shows the Higgsfield art; links all 32 files by name.
- `assets/icons/preview.html`, `assets/mascots/preview.html`: inline SVG snapshots, written by
  no script.

## Invariants

- Every SVG under `assets/icons/` and `assets/mascots/` is generator output. A hand edit is lost
  on the next run (`tools/build_icons.py:17`, `tools/build_mascots.py:16`). Change the generator.
- The generators are deterministic: the same source gives byte-identical SVGs. A gate run that
  changes a generated file without a generator change is a bug.
- `assets/higgsfield/` filenames do not change: `assets/gallery.html` links them by name.

## Known facts and quirks

- **The preview pages can be stale.** No script writes them (`grep -n preview tools/*.py` finds
  nothing). On 2026-10-04 a rough comparison matched 0 of 18 inline mascot SVGs and 19 of 33
  inline icon SVGs to the current file bodies. Look at the SVG files, not the previews.
- **Card ranks are live `<text>`.** Convert them to outlines before Rive import, or set the font
  in Rive (`tools/build_icons.py:11-12`).
- **`build_icons.py` computes a file count and never prints it** (`tools/build_icons.py:411`). Its
  `wrote files to ...` line carries no count, so it cannot show a missing file.
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

## Style rules

No per-language code standard exists yet. Python in `tools/` follows the style already there:
module docstring stating the style and the run command, small pure functions returning SVG
strings, one `main()`. No formatter or linter is configured, so nothing settles style
mechanically.
