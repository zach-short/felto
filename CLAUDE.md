<!-- personal-config v0.7.0 · 2026-10-04 · config 3b46daed · standard v1.2.0 · adapted -->
# felto

> **Before writing or editing any code, read the matching code standard in full:
> `docs/conventions-python.md` for every `.py` file, `docs/conventions-typescript.md` for every
> `.ts` and `.tsx` file under `app/`. Not optional, not conditional on task size.
> If you have not read it this session, read it now.**

> **Before scoping, planning or building a feature, read `docs/AGENT-PRACTICES.md`.** It is the
> process standard. Do not ask how the flow works; it is written down.

## The rules that get broken

- **Never hand-edit an SVG under `assets/icons/` or `assets/mascots/`.** The generators
  overwrite every one of them on each run (`tools/build_icons.py:19`, `tools/build_mascots.py:17`).
  Change the generator, then run it.
- **Never regenerate, rename or move a file in `assets/higgsfield/`.** They came from a paid,
  non-deterministic external service, and `assets/gallery.html` links all 32 by filename.
  The same holds for `assets/higgsfield-chest/` (six chest references, 2026-10-05,
  `docs/incomplete/game-feel/DESIGN.md` section 9.2).
- **Never trust a preview page as a picture of the current SVGs.** `assets/icons/preview.html`
  and `assets/mascots/preview.html` hold inline copies, and no script rebuilds them
  (`grep -n preview tools/*.py` finds nothing, 2026-10-04).
- **Never regenerate, rename or move `app/assets/rive/flop.riv`, and never hand-edit it.** It is
  exported from the Rive file in Zach's account (file 2632317), the only editable source of the
  rig. The repo cannot rebuild it, so a lost or damaged copy is re-exported from that file
  (`HANDOFF.md` step 34), never recreated here. Only `app/src/art/` imports it (rule U6).
- **Never run `git commit`, `git push`, `git add -A` or `git add .`.** Print the two blocks
  that Part 11 of the standard describes.

## Stack

- Python 3, standard library only (`math`, `os`; the sound generator adds `struct` and `wave`,
  2026-10-05). Verified on Python 3.14.6 at `/opt/homebrew/bin/python3`, 2026-10-04.
- `xmllint` (libxml 20913, `/usr/bin/xmllint`) to check SVG well-formedness.
- The app in `app/` (2026-10-05, board item 7): Expo SDK 57 (`expo` 57.0.26, React Native
  0.86.3, React 19.2.3), expo-router with routes in `app/src/app/`, a development build
  (`expo-dev-client`), TypeScript ~6.0.3 strict, bun 1.2.9 with `app/package.json` and
  `app/bun.lock` (no manifest at the root), vitest 4.1 in a node environment, `expo lint` with
  `eslint-config-expo/flat` and no formatter. SVG files are components through
  `app/svg-transformer.js` (SVGr, SVGO off). Versions: `app/bun.lock`.
- No CI. The Python side has no linter. `solver/` has `unittest` tests, in the whole-repo gate
  since board item 38 (2026-10-06); `tools/` has no tests.
- Rive is the intended animation tool for these assets (`tools/build_icons.py:12`). Flop has a rig,
  played by `rive-react-native` 9.8.5 (`app/package.json`, board item 34).

## Architecture

- The repo is an asset pipeline and an app. Two generators write SVGs, one writes sounds, three
  HTML pages display the art, and the Expo app in `app/` draws and plays the same files from
  `../assets` through the `@art/*` alias (BD-6, BD-7 in `docs/incomplete/app/PLAN.md`). Only
  `app/src/art/` imports an SVG or a WAV (rule U6).
- The app, built 2026-10-05 (board items 7 to 20): three native tabs (Learn, Practice, Profile)
  and full-screen session routes under `app/src/app/` (lesson, boss, review, chest, practice set,
  onboarding with a placement check), each route a thin render of a screen in `app/src/screens/`.
  Pure game rules are in `app/src/game/`, the evaluator in `app/src/cards/`, the four units and
  the preflop chart in `app/src/content/`, the random dealers in `app/src/drills/`, the one data
  module in `app/src/storage/` and the reminder in `app/src/reminder/`. The development routes
  `/dev/art`, `/dev/fixture/<name>` and `/dev/reminders` also exist. It runs as a development
  build only. `HANDOFF.md` has the code map.
- The assets point at a game about poker: playing cards, chips, a lesson path with locked,
  current and boss nodes, a streak flame, XP, lives, gems and a chest
  (`tools/build_icons.py:372-385`, `main()`), and three mascots, fish, squid and shark, each in six poses
  (`tools/build_mascots.py:336-337`).
- The generated SVGs are deterministic. A rebuild in a scratch copy on 2026-10-04 was
  byte-identical to the files on disk (`diff -rq`).
- The style comes from the approved Higgsfield reference: no outlines, solid fills, a darker
  extrusion down and right, a hard pale shadow, one gloss highlight (`tools/build_icons.py:4-6`).

## Directory map

| Path | Belongs here | Does not |
|---|---|---|
| `tools/` | The SVG generators, the sound generator and their shared module | Generated output |
| `assets/icons/{cards,chips,path,ui}/` | Output of `build_icons.py` (78 SVGs) | Hand edits |
| `assets/mascots/{fish,squid,shark}/` | Output of `build_mascots.py` (18 SVGs) | Hand edits |
| `assets/sounds/` | Output of `build_sounds.py` (12 WAV files, 16-bit mono, 44,100 Hz) | Hand edits, recorded audio |
| `assets/higgsfield/` | Reference art from Higgsfield (19 PNG, 13 SVG), kept as received | Renamed or regenerated files |
| `assets/higgsfield-chest/` | Chest reference art from Higgsfield (6 PNG, 2026-10-05), kept as received | Renamed or regenerated files, anything a script reads |
| `assets/gallery.html`, `assets/*/preview.html` | Pages to view the art in a browser | Anything a script reads |
| `app/` | The Expo app: config at its root, code in `app/src/` (198 source files, 63 test files), the rank font in `app/assets/fonts/` | A copy of any SVG or WAV; generated `ios/`, `android/`, `.expo/` (gitignored) |
| `docs/` | The docs index (`docs/README.md`), the process standard, the Python and TypeScript code standards, and the effort folders `docs/incomplete/app/` (design, plan, runtime pass) and `docs/incomplete/autopilot-2026-10-05/` (that run's record) | Generated assets |

## Commands

The whole-repo gate, also `gateCommand` in `.personal-config.json`: the Python gate, then the
solver tests (`unittest`, 33 tests, board item 38), then the app gate (typecheck, lint, vitest:
86 test files, 629 tests on branch `gto-equity`; `main` has more since board item 59). Run
2026-10-06 from the worktree root as one command, exit 0:

```bash
python3 tools/build_icons.py && python3 tools/build_mascots.py && python3 tools/build_sounds.py && xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg && python3 -m unittest discover -s solver -p '*_test.py' && bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test
```

A fresh checkout runs `bun install --cwd app` first. To build and open the app (a development
build; Android needs `ANDROID_HOME=~/Library/Android/sdk` and Java 17):

```bash
bun run --cwd app ios
JAVA_HOME=$(/usr/libexec/java_home -v 17) ANDROID_HOME=~/Library/Android/sdk bun run --cwd app android
```

To view the art, open a page in a browser:

```bash
open assets/gallery.html
```

**What the gates do not prove.**

- A generator that exits 0 and prints its `wrote ...` line proves only that files were written.
  Nothing checks how they look. Each generator prints a count taken from its writes
  (`tools/build_icons.py:386`, `tools/build_mascots.py:345`, `tools/build_sounds.py:249`), so a
  skipped write shows as a short count.
- The sound generator's run line (12) proves only that twelve WAV files were written, none longer
  than its ceiling: one second for the six of `D15`, 0.6 s for the six of `GF-5`
  (`tools/build_sounds.py:235-242` stops the run otherwise). An agent cannot hear them: a sound
  is proven only when Zach plays it (`afplay assets/sounds/<name>.wav`) and approves it.
- `xmllint --noout` proves the SVG is well-formed XML, not that it draws the right shape.
- The solver tests (`python3 -m unittest discover -s solver -p '*_test.py'`, 33 tests, about
  25 s, most of it the Monte Carlo check of the equity table) prove hand-worked leaf payoffs, the
  node ids, the spec hash, a toy tree with a known equilibrium, the fold chain on hand-made parts
  and the key file's shape. They do not prove the acceptance bands of
  `docs/incomplete/gto-trainer/KEY-SPEC.md` 8.2: those are proven by `python3 solver/cfr.py`
  (about 105 s on a quiet Mac), which the gate does not run, and recorded in `KEY-SPEC.md` 8.5.
  The gate does not rewrite `solver/data/key.json` either: after a solver change, run
  `python3 solver/cfr.py` and read `git diff --stat -- solver/data`; a line there is a change in
  the key, and it must be one you meant. The suite needs numpy (2.4.3 at
  `/opt/homebrew/bin/python3`, rule M4 of `docs/conventions-python.md`); the fresh-checkout
  recipe in `docs/AGENT-PRACTICES.md` Part 6 checks for it.
- The gate rewrites the generated SVGs and WAVs in place. After the first commit, run
  `git diff --stat -- assets/icons assets/mascots assets/sounds` after the gate: any line there
  is a change in the art or the sound, and it must be one you meant.
- A visual change is proven only by looking at it. Render the SVG files themselves, not the
  preview pages.
- Write `bun run --cwd app <script>`, never `bun --cwd app run <script>`. With bun 1.2.9 the
  second form prints bun's usage and exits 0 without running the script, so a gate written
  that way passes while checking nothing (found 2026-10-05).
- The app gate proves types, lint and the pure-logic tests. It cannot see a screen: a screen
  is proven by a screenshot on the iOS simulator and the Android emulator.

## Never do this

- Never ship card SVGs into Rive with live `<text>`: convert the rank text to outlines first,
  or set the font in Rive (`tools/build_icons.py:11-12`).
- Never call merged work shipped. Nothing ships from this repo: the app runs as a development
  build on simulators only, and there is no store release and no deploy (`D13`).
- Never copy an SVG under `app/`, and never let app tooling write under `assets/`. The app
  draws the generated files where they are (`D5`).

## Where work is written down

- `HANDOFF.md`: what is true. Environment, settled decisions, the step log. Read first.
- `PASSOFF.md`: what is next, one standalone prompt per item.
