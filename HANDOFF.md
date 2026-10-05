<!-- personal-config v0.7.0 · 2026-10-04 · config 3b46daed · standard v1.2.0 · adapted -->
# HANDOFF: felto (the ledger)

**What is true.** Read first, every session. Append-only in the step log; standing sections are
edited in place when they go stale. Started 2026-10-04.

## Orientation

felto is a game about poker (cards, chips, a lesson path, streak, XP, lives, gems). It began on
2026-10-04 as an asset pipeline: three Python generators in `tools/` write the SVG icons and
mascots and the WAV sound effects, and three HTML pages show the art. Since 2026-10-05 it is
also an Expo app in `app/` that draws and plays that art, built end to end by the `/autopilot`
run (board items 5 to 20, MVP of `docs/incomplete/app/PLAN.md` phases 1 to 16). The app runs
as a development build only; Zach has not yet walked it on a device
(`docs/incomplete/app/RUNTIME-PASS.md`). Zach is the owner and decides everything here (solo
mode). He is interactive: when a decision is his, ask in chat, in one batch, before building it.

Read in this order: this file, then `PASSOFF.md` (what is next), then `docs/AGENT-PRACTICES.md`
(the working standard), then `CLAUDE.md`.

## Environment

| Fact | Value | Source (verified 2026-10-04) |
|---|---|---|
| Build | `python3 tools/build_icons.py && python3 tools/build_mascots.py && python3 tools/build_sounds.py` | Run: exit 0, 78 icons, 18 mascots, 6 sounds; output byte-identical to the files on disk (`diff -rq` against a scratch rebuild; for the WAVs, `shasum` over two runs, 2026-10-05) |
| Test | `bun run --cwd app test` (vitest 4.1, node environment, `TZ=America/New_York`); none for `tools/` | Run 2026-10-05 (board item 16): 63 files, 490 tests passed |
| Lint | `bun run --cwd app lint` (`expo lint`, `eslint-config-expo/flat`); none for `tools/` | Run 2026-10-05 (board item 16): exit 0, no findings |
| Typecheck | `bun run --cwd app typecheck` (`tsc --noEmit`, strict); none for `tools/` | Run 2026-10-05 (board item 16): exit 0 |
| App install | `bun install --cwd app --frozen-lockfile`; manifest and lockfile in `app/`, none at the root | Run 2026-10-05: no changes |
| App native build | `bun run --cwd app ios`; `JAVA_HOME=$(/usr/libexec/java_home -v 17) ANDROID_HOME=~/Library/Android/sdk bun run --cwd app android`. CocoaPods needs `LANG=en_US.UTF-8` (without it `pod install` dies in Ruby's Unicode normalizer). The Android emulator reaches Metro only after `adb reverse tcp:8081 tcp:8081` | Built and run 2026-10-05 on the iPhone 17 Pro simulator (iOS 26.5) and the `Pixel_9` emulator |
| Bun trap | Write `bun run --cwd app <script>`. `bun --cwd app run <script>` prints bun's usage and exits 0 without running anything | bun 1.2.9, seen 2026-10-05 |
| Well-formed check | `xmllint --noout assets/icons/*/*.svg assets/mascots/*/*.svg` | Run: exit 0 |
| Whole-repo gate | the Python gate (build, then the well-formed check), then the app gate (typecheck, lint, test), as one command (`gateCommand` in `.personal-config.json`, `CLAUDE.md` Commands) | Run 2026-10-05 (board item 16), each step alone: exit 0; run lines 78, 18 and 6; 63 test files, 490 tests |
| Python | 3.14.6, `/opt/homebrew/bin/python3`; the SVG generators import `math`, `os` and `common`; the sound generator imports `math`, `os`, `struct` and `wave` | `python3 --version`; `grep -nE '^(import\|from)' tools/*.py` |
| xmllint | libxml 20913, `/usr/bin/xmllint` | `xmllint --version` |
| Git | Initialized 2026-10-04 on branch `main`. First commit `90fc2e8`, "adapt the working standard to felto", 2026-10-04 23:41 -0400. This row said "no commits yet" until step 2: true when step 1 wrote it, wrong once `90fc2e8` landed (`git log --oneline`, 2026-10-04). Remote `origin` is `https://github.com/zach-short/felto.git`, private | `git init -b main`; `gh repo create zach-short/felto --private`; `git log --oneline` |
| CI | none | `ls .github/workflows` finds nothing |
| Ships | Nothing ships. The app runs as a development build on simulators; no store release (`D13`), no deploy: merged is not shipped | No deploy or store config in the tree |

**What an agent cannot verify here.** A generator run proves files were written, not how they
look. An agent can render a single SVG in the browser pane and look at it; do that for every
visual change, and do not use the preview pages for it (see Known facts). Rive import cannot be
checked here at all: end with the exact file to import and what should appear, then wait for
Zach.

Since 2026-10-05 (board item 7) an agent can build the app and see it on the iPhone 17 Pro
simulator and the `Pixel_9` emulator, light and dark (`xcrun simctl ui <id> appearance dark`,
`adb shell cmd uimode night yes`), and a tablet in landscape on Android through
`adb shell wm size 2560x1600` and `wm density 320`. It cannot see the app on Zach's phone. It
cannot rotate an iOS simulator: `simctl` has no rotate command, and the Simulator menu needs
assistive access that this Mac does not grant to `osascript`. The simulator tool also needs
Zach's grant per device before it can tap one; the iPad simulators had none on 2026-10-05.

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

### 2026-10-05: the app's first version

Ratified at GATE 1 of the app scope, which is `docs/incomplete/app/DESIGN.md` since step 7
renamed it from `SCOPE.md` on 2026-10-05 (section 7 holds the answers, section 3 the defenses,
section 8 the decisions `D1` to `D6`). A lesson path with drills; Expo for iOS and Android, with native UI components
(`@expo/ui`) where they exist; progress on the device only; static mascot poses, Rive later; the
app in `app/` in this repo; no money. The non-scope list and dials in that file are ratified too.
Do not re-ask these; a change is a dated supersession.

### 2026-10-05: the app's design and plan (GATE 2)

Zach's reply in chat, in his words: "all recs except i want sound dark mode ipad and landscape,
mascot names, streak freeze onboarding, and randomly dealt hands". Settled from it, in
`docs/incomplete/app/DESIGN.md` section 8: four units of 6-max cash hold'em at 100 big blinds
(`D7`); the game rules (`D8`); the fish guides lessons, the shark is the boss, the squid runs
the review and the chest (`D9`); the warm copy register (`D10`); a 19:00 streak reminder asked
for after the first lesson (`D11`); the name Felto and the identifier `com.zachshort.felto`
(`D12`); card ranks in a bundled Nunito ExtraBold named `FeltoRank` (`D14`); and the plan in
`docs/incomplete/app/PLAN.md`. Only the store release stays out of the first version (`D13`).
How the seven returned items work is `D15` to `D21`, proposed the same day. Zach answered all
seven in chat on 2026-10-05 (the `/autopilot` opening round): D15 to D17 and D19 to D21 yes, and
D18 names the three mascots with poker words (Flop, Kicker, Ace). `DESIGN.md` records each
answer in place.

## Code map

- `tools/common.py`: the helpers both generators use (`svg`, `tf`, `ext`, `sector`, `gloss`,
  `stroke`, `write`) and the constants `SHADOW`, `CREAM`, `INKL`. Imported by plain name (step 3).
- `tools/build_icons.py`: writes `assets/icons/{chips,cards,path,ui}/` (78 SVGs).
- `tools/build_mascots.py`: writes `assets/mascots/{fish,squid,shark}/` (18 SVGs, six poses each).
- `tools/build_sounds.py`: writes `assets/sounds/` (6 WAV files: `answer_right`, `answer_wrong`,
  `lesson_finish`, `boss_pass`, `boss_fail`, `chest_open`; 16-bit mono, 44,100 Hz, each under one
  second). Standard library only (`math`, `os`, `struct`, `wave`); does not import `common` (board
  item 17, `D15`, BD-23). The app plays them through `expo-audio` (BD-24).
- `assets/higgsfield/`: the Higgsfield reference art the style was approved from (19 PNG, 13 SVG).
- `assets/gallery.html`: shows the Higgsfield art; links all 32 files by name.
- `assets/icons/preview.html`, `assets/mascots/preview.html`: inline SVG snapshots, written by
  no script.
- `docs/conventions-python.md`: the Python code standard for `tools/`, version 1.2.0 (steps 2 to 4, 8, 9 and 11, and board item 17).
- `docs/conventions-typescript.md`: the TypeScript code standard for `app/`, version 1.1.0, 21
  rules, four sanctioned divergences (Z1 to Z4) and a Known gaps list (board item 6, app phase 2;
  U6 widened to sound, item 14; real examples and the registry, item 16).
- `app/`: the Expo app (board item 7). `app/svg-transformer.js` turns each SVG into a
  component with SVGO off and swaps the two light-page colours for props (BD-25, map in
  `app/src/art/colour-swap.json`); `app/metro.config.js` reaches `../assets` (BD-7);
  `app/src/art/` is the only importer of SVGs; `app/src/theme/` holds the tokens, `useTheme`
  and `useColumnWidth`; `app/src/config/dials.ts` holds every dial; `app/src/components/screen.tsx`
  is the screen wrapper (BD-27); `app/src/app/dev/art.tsx` is the art check route;
  `app/assets/fonts/FeltoRank.ttf` is the rank font with its licence beside it.
- `app/src/app/`: the routes (board item 12). `_layout.tsx` renders `RootProviders` (which mounts
  `PlayerProvider` and `ReminderSync`) around `RootStack`; `(tabs)/` holds Learn (`index.tsx`,
  which is `/`), Practice and Profile in native tabs; `dev/fixture/[name].tsx` is the BD-13
  fixture link; `dev/art.tsx` is the art check; `dev/reminders.tsx` lists the scheduled
  reminders. Every route renders one screen from `app/src/screens/`. `app/src/art/` names all 84 SVGs the app draws
  (`sizes.ts` holds the viewBoxes, checked against the files by `sizes.test.ts`; `registry.ts`
  is the only SVG importer) and gives `Art`, `Mascot`, `CardArt` and `PathNodeArt`, which draws
  the progress arc over `node_current_base` (BD-9). `app/src/components/path/` is the Learn path
  (`path-outline.ts` maps the content `OUTLINE` to the game `PathOutline`); `stat-bar.tsx` is
  the stat bar.
- Sessions (board items 13 and 14): `app/src/app/lesson/[id].tsx`, `boss/[unit].tsx`,
  `review/[unit].tsx` and `chest/[unit].tsx` are full-screen modals; `out-of-lives.tsx` is a
  transparent modal holding the out-of-lives sheet. A lesson, a boss and a review are one loop:
  `components/lesson/lesson-run.ts` (the `Session` type and the pure reducer), `session-steps.ts`
  (the order of each step's effects), `use-lesson-run.ts` and `lesson-run-view.tsx`.
  `components/boss/` and `components/review/` build the sessions from `drawBoss` and `reviewSet`;
  `components/chest/` and `components/lives/` are the chest and the sheet;
  `components/path/stop-route.ts` decides where a path tap goes. `app/src/feedback/` plays the
  effects, every call through `safely.ts`; `app/src/art/sounds.ts` is the only WAV importer.
- Practice (board item 19, `D21`): the tab is `screens/practice-screen.tsx`; a set is the
  full-screen modal `app/src/app/practice-set.tsx`, the same loop with a `Session` of kind
  `practice`. `components/practice/practice-menu.ts` lists the kinds open and locked and deals
  the set through `dealSet` (`app/src/drills/`).
- Onboarding (board item 20, `D20`): `components/root-stack.tsx` is the root navigator; it opens
  only `app/src/app/onboarding/` (welcome, cast, the question, the placement check) while
  `onboarded` is false and only the tabs and sessions after. The check is the same loop with a
  `Session` of kind `placement` (`components/onboarding/placement-session.ts` draws it;
  `components/lesson/session-end.ts` routes its end to `finishPlacement`). The fixture `fresh`
  opens onboarding; `placed` and `all-done` show the path after a pass and every Practice kind.
- Pure copy helpers (board item 16): `components/lesson/closed-copy.ts` (`OUT_OF_HEARTS`,
  `nextLifeLine`, which formats the time with `formatClockTime`), `components/stat-values.ts`
  (`statLabel`, the singular and plural stat words), `components/path/path-view-model.ts`
  (`stopLabel`, a stop's spoken label with the current lesson's progress) and
  `components/route-error-copy.ts` (the warm error line). Each is outside React Native so
  vitest can read it.
- Unit stories (board item 23, `docs/incomplete/unit-stories/` US-4 to US-7): the route
  `app/src/app/story/[unit].tsx` renders `screens/story-screen.tsx`, a full-screen modal with the
  session options. `components/story/` holds the pure tap split (`story-tap.ts`), the slide
  reducer (`story-step.ts`) and the copy (`story-copy.ts`), each with its test, the hook
  `use-story-run.ts`, and the views `story-frame.tsx` (the tap layer), `story-header.tsx`,
  `story-slide.tsx`, `story-missing.tsx` and `story-button.tsx` (the header button).
  `app/src/content/stories/` holds the schema, the validator `validate-story.ts`, the list
  `catalog.ts` (`STORIES`, `storyFor`) with its key test `story-catalog.test.ts`, and the hands
  story `hands.ts` (eight slides since board item 24, step 33; a placeholder before) with its own
  test `hands-story.test.ts`. `PathUnit.hasStory` is tested in
  `components/path/unit-story.test.ts`.
- `app/src/game/`: the game rules of `D8`, `D19` to `D21` as pure functions of the state, a
  path outline and the time (board item 8): lives, streak and freeze, sessions and XP, the path
  node states, the seeded boss draw, the review set, the chest, placement, and the named
  fixtures of BD-13. `PlayerState` is in `player-state.ts`.
- `app/src/storage/`: the one data module (`D3`, BD-8, board item 8). `player-store.ts` is the
  pure core (load, check, migrate, save, back up); `migrations.ts` holds `STATE_VERSION`;
  `kv-store-adapter.ts` is the only importer of `expo-sqlite`; `player-provider.tsx` and
  `use-player.ts` give screens the state and its actions. `STATE_VERSION` is 2 since board item
  15 (settings gained the reminder; migration and tests in `migrations.ts` and `migrations.test.ts`).
- Profile and the reminder (board item 15): `app/src/components/profile/` is the Profile form
  (`FieldGroup`, the freeze shop, the settings, reset); `app/src/reminder/` plans the week of
  reminders (`plan.ts`, pure and tested) and keeps the phone in step (`use-reminder-sync.ts`,
  mounted at the root as `ReminderSync` inside `components/root-providers.tsx`; the clock is
  read in `replan.ts` when a replan runs); `clock-format.ts` is the one time-of-day format; `reminder-device.ts` is the only importer of
  `expo-notifications`; `felto://dev/reminders` lists what the phone holds.
- `docs/README.md`: the docs index of `docs/AGENT-PRACTICES.md` Part 8.2 (board items 6 and 16).
- `docs/incomplete/app/`: the app effort (Profile P). `DESIGN.md` is what the app is and why
  (`D1` to `D21`); `PLAN.md` is the order of work, 16 phases on board items 5 to 20 (step 7);
  `RUNTIME-PASS.md` is the final, ordered list of what only a person on a device can still check
  (board item 16).
- `docs/incomplete/autopilot-2026-10-05/`: `STATE.md` and `RUNDOWN.md`, the record of the
  `/autopilot` run that built the app. Not kept current.
- App size, 2026-10-05 (`find app/src`, board item 16): 198 source `.ts` and `.tsx` files (9,869
  lines) and 63 test files (3,728 lines); 78 icons, 18 mascots and 6 sounds under `assets/`;
  `app/src/art/registry.ts` imports 84 of the 96 SVGs (66 icons and all 18 mascots).

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
- **Frozen documents cite moved generator lines (2026-10-05, board item 16).** The design and the
  plan are not edited in place, so these stay as written: `PLAN.md:40` and `DESIGN.md:823` cite
  `tools/build_icons.py:368` for `ring=0.6` (now `:382`); `PLAN.md:49` and `DESIGN.md:573` cite
  `:271` for the ring track colour (now `:272`); `PLAN.md:220` cites `:289`, `:324`, `:325`
  and `:328` for the freeze flame (now `:295`, `:291` and `:292`); `DESIGN.md:618` cites `:324`
  for the freeze palette (now `:291`); `PLAN.md:88` cites `:268-276` for the arc geometry (now
  about `:269-278`). `CLAUDE.md`, this file's standing sections and the Python standard were
  checked by script on the same date: every first cited line shows what it claims.
- **`app/src/theme/tokens.ts` cites generator lines in comments** (`tools/common.py:8`, `:9`,
  `:10`, `tools/build_icons.py:248`, `:272`, `:275`; all correct on 2026-10-05). Nothing checks
  them, so a generator change can make them stale.
- **The dev routes exist in a release build.** `/dev/art`, `/dev/reminders` and the fixture link
  only show a page; a fixture is refused unless `__DEV__` (`use-load-fixture.ts`).
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

**6. Scope the app.** Done 2026-10-05, on branch `main`, on Opus 5.5, with `/scope the app`. Wrote
`docs/incomplete/app/SCOPE.md`: 26 verified facts, six decisions with options and defenses, the
non-scope list, dials and nine hazards. Found that no asset is in any commit: HEAD holds 0 files
under `assets/`, 129 are staged, and `origin/main` matches local `main` at `5da0bca`, so the
Higgsfield art exists only on this disk. Corrected one claim the same day: the first survey read
only `package.json` files and missed `furlough` (SwiftUI) and `drunktion` (Kotlin), which
Zach's question "why not native Kotlin and Swift?" brought out; option 2D was added. GATE 1
answers, 2026-10-05: every recommendation, with Expo using native UI components where they exist
(Settled). No code written. **Left owed:** commit the staged assets; a TypeScript standard; the
design and plan stages. The commit is Zach's.

**7. Design and plan the app.** Done 2026-10-05, on branch `main`, on Opus 5.5 (Stages 3 and 4
of Part 2.2). Renamed `docs/incomplete/app/SCOPE.md` to `DESIGN.md` with a plain `mv`, so Zach's
commit records the rename, and wrote in: `D1` to `D6` from GATE 1 with their defenses; `D7` to
`D14` proposed (four units, the game rules, the mascot roles, the copy register with variants,
the streak reminder, the name and identifiers, more non-scope items, the card rank font); the
rules that survive unchanged; and the product screen by screen. Wrote
`docs/incomplete/app/PLAN.md`: 28 facts checked, 22 build decisions (BD-1 to BD-22), 12 phases
in three lanes, dials, seams and hazards. Three read-only sweeps on Sonnet 5, each in its own
worktree, collected Zach's Expo house precedent (`lore`, `ezhomesteading`) and the SDK 57 facts
from installed packages and Context7; one stopped at its budget point and was relayed once.
None changed a file: felto's `git status` showed only the staged art, and no changed file in
`lore` or `ezhomesteading` was newer than 30 minutes (`find -newermt '-30 minutes'`). Found:
`react-native-svg` reads only the first font name, so Android would draw the card ranks in its
default face (`D14`); the current node's ring is fixed at 60% (`tools/build_icons.py:368`,
BD-9); an agent worktree starts at `origin/main`, one commit behind local `main`; agent
worktrees leave an untracked `.claude/`; and both simulators run on this Mac, so an agent can
see the app on iOS and Android. Corrected one claim of this session before hand-back: plan row
26 first said the limits section above denies seeing a phone, which it does not say. Added
board items 5 to 16, one per phase, `HELD` on GATE 2. GATE 2 answers, 2026-10-05: every
recommendation and the plan, except `D13`: Zach wants sound, dark mode, iPad and landscape,
mascot names, a streak freeze, onboarding and randomly dealt hands in the first version
(Settled). So the same session wrote `D15` to `D21` to shape those items, amended the plan (rows
29 to 33, BD-23 to BD-28, phases 13 to 16, and additions to phases 1, 3, 4, 8, 9, 11 and 12),
and added board items 17 to 20. No code written; the gate exited 0 and
`git diff --stat -- assets tools` was empty. **Left owed:** Zach's answers to `D15` to `D21`;
the commit of the 129 staged art files and of this folder, which is Zach's; board item 4.

**8. Name `tools/common.py` in the standard's scope sentence (board item 4).** Done 2026-10-05, on
branch `main`, on Sonnet 5.5. The standard opened by saying it covers every `.py` file and then
listed two, dated 2026-10-04 (`docs/conventions-python.md:3-5` before this step). That sentence
stays as history, in the past tense, and a new one gives the state on 2026-10-05: three files, the
two generators and `tools/common.py`, the shared module of rule H1. Checked 2026-10-05: `ls tools`
lists `build_icons.py`, `build_mascots.py` and `common.py`; `find . -name '*.py' -not -path
'./.git/*'` finds those three and no other; `grep -nE '^(import|from)' tools/*.py` shows that
`common.py` imports `math` and `os` and that each generator imports `common` by its plain name.
Bumped the standard to 1.1.2 and its code map entry to "steps 2 to 4 and 8". The item prompt said
the entry read "steps 2 to 5". It read "steps 2 to 4", which was right: step 5 did not touch the
standard. No rule's text changed. Read the nine lines that say "both files", "both generators" or
"the two generators" (`grep -nE 'both (files|generators)|two generators'`, 2026-10-05): none is
wrong, because each means the two generators, and `common.py` is not a generator. Rule C2 cites
`tools/common.py:49` as a `#fff` site under "both files do"; `common.py` also follows C2 (its
three colours are uppercase six-digit hex), so the sentence is right and only wider than it
says. Found, not fixed: `docs/conventions-python.md:51` says the generators import only `math`
and `os`, which the grep it cites no longer shows since step 3; and `docs/incomplete/app/DESIGN.md:30`
cites `docs/conventions-python.md:519-537` for rule I3, which now sits at lines 525-543 because
this step added six lines above it. Gate exit 0 (run lines 76 and 18) and
`git diff --stat -- assets tools` empty. **Left owed:** those two stale lines, and the commit,
which is Zach's.

**9. Fix the two stale lines that step 8 found (board item 21).** Done 2026-10-05 under
`/autopilot`, not yet committed. Built by Sonnet 5.5, audited by Opus in a second worktree
(verdict: non-blocking findings); no relay passes. The change sits in the builder's worktree
`.claude/worktrees/agent-a1cb91d6981ab219e`, branch `worktree-agent-a1cb91d6981ab219e`, not in
`main`. Two files changed: `docs/conventions-python.md:52-54` now says the generators import the
standard library and `tools/common.py` and nothing else (`grep -nE '^(import|from)' tools/*.py`,
2026-10-05), with the old fact kept as history; row 5 of `docs/incomplete/app/DESIGN.md:30` cites
rule I3 by ID and keeps the old lines 519-537 findable with date and reason. The standard is
1.1.3. All 32 rule headings are unchanged. Gate exit 0, run lines 76 and 18, in both worktrees.
Findings, each `open`: (1) the builder reported the standard's diff as +5/-2; `git diff
--numstat` shows +6/-3, so the report was wrong and the content is right; (2)
`docs/conventions-python.md:50` still says "These facts were verified 2026-10-04" above a bullet
dated 2026-10-05; (3) the revision sentence at `:12` says "on Sonnet 5.5". The check of the other
three bullets in that section found none wrong. Step 8's "Found, not fixed" lines are resolved.
`git diff --stat -- assets` proves little in a worktree, because `assets/` is staged but not
committed in `main`, so it is untracked there; it proves only that `tools/` is unchanged.

**10. Autopilot run of 2026-10-05.** Ran 01:26 to about 01:40 EDT. Built board item 21 only (step 9);
every other row was `HELD` on a commit, an unwritten prompt or a push. The rundown is
`docs/incomplete/autopilot-2026-10-05/RUNDOWN.md`. Zach's answers to `D15` to `D21` are in its
`STATE.md` and not yet in `DESIGN.md`. Not committed.

**11. Change the icon generator for the app (board item 5, app phase 1).** Done 2026-10-05, on
branch `main`, in the main checkout because the art is staged but not committed. Built by Sonnet
5.5, audited by Opus in a scratch copy (verdict: non-blocking findings); no relay passes. Gate and
`git diff --stat -- assets/icons assets/mascots` were clean before the first edit.
`tools/build_icons.py` changed in four ways: `node()` takes `arc=True` and `main()` writes
`path/node_current_base.svg` with `arc=False` (track, disc and glyph, no `ring_progress`; BD-9);
`FONT` starts with `'FeltoRank'` (`D14`, accepted); `ui_flame()` is parameterised and
`ui_freeze()` draws `ui/streak_freeze.svg` in the gem palette (`D19`, accepted). Gate exit 0, run
lines 78 and 18, and a rebuild in a scratch copy is byte-identical. The art diff is the 52 card
faces (font-family only; the step 4 grep is empty); `node_current.svg` and `streak_flame.svg` are
byte-identical; the two new files are untracked. The three files were rasterised and looked at:
the node shows track and disc with no arc, the ace of spades reads in the fallback face, the
freeze is the flame in ice blue. The standard is 1.1.4 and the moved citations in it and in
`CLAUDE.md` were fixed. The orchestrator then fixed three audit findings in the standard: the L2
example now quotes `tools/build_icons.py:326`, the L2 range is `258-262`, and the C1 count notes
28 lines since this item. Findings, each `open`: `PLAN.md:40,49` and `DESIGN.md:555,600,765` cite
`tools/build_icons.py:368`, `:271` and `:324`, which moved (`:382`, `:272`, about `:334`); the
design is frozen, so they stay as written until an amendment. **Left owed:** Zach's approval of
the freeze icon (look at `assets/icons/ui/streak_freeze.svg`); Rive import is unchecked; the
commit, which is Zach's.

**12. Write the TypeScript standard and re-add the app rules (board item 6, app phase 2).** Done
2026-10-05 under `/autopilot`, on branch `main` in the main checkout, not committed. Built by
Opus 5.5, audited by Opus (verdict: non-blocking findings); no relay passes. Gate exit 0, run
lines 78 and 18, and this item changed nothing under `assets/` or `tools/`. Wrote
`docs/conventions-typescript.md`, version 1.0.0: 21 rules in groups N, B, V, O, U and Q, each
tagged *review* with a provenance label and an example pair, plus registry entry Z1 for BD-16.
A read-only Sonnet inventory of `ezhomesteading/docs/conventions.md` fed it; no rule id is
copied. Lint is `eslint-config-expo/flat`. Re-added the migration rule and the parity rule to
`docs/AGENT-PRACTICES.md` Part 6, pointed `CLAUDE.md` at the standard, wrote `docs/README.md`, and
added `.claude/worktrees/` to `.gitignore`. Judgment calls, each reversible: B2 also covers
`src/drills/`; the re-added rules sit in Part 6, not Part 1; Z1 also covers config files that a
tool loads by default export; V1 and the Python rule H3 do not conflict. Findings, each `open`:
the citation at `docs/conventions-typescript.md:424-425` shows the platform list, not the
`.ios.tsx` resolution order; the file's "61 rules" for the `ezhomesteading` standard counts 59
by the auditor's script; `PLAN.md:275-276` asks for an empty `git diff --stat -- assets tools`,
which holds only after item 5 is committed; `docs/README.md:7` has a bad line wrap;
`PLAN.md` hazard 2 still says `.claude/` is untracked. **Left owed:** Zach reads the rule list
(in the builder's report, STATE.md); phase 12 replaces the `ezhomesteading` examples; the commit.

**13. Scaffold the app and draw the art on both platforms (board item 7, app phase 3).** Done
2026-10-05 under `/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus
5.5, audited by Opus in a snapshot copy (verdict: non-blocking findings); no relay passes. Created
the Expo SDK 57 app in `app/` with bun (`expo` 57.0.26, React Native 0.86.3, React 19.2.3) with
every dependency BD-15 names plus `expo-audio` and `expo-system-ui`; config: `app.json`, tsconfig
with `@art/*`, `metro.config.js`, the SVGr transformer `app/svg-transformer.js` (SVGO off, BD-25
colour swap), `eslint-config-expo/flat`, vitest with `TZ=America/New_York`. Code: `dials.ts`,
`tokens.ts` (light and dark), the screen wrapper (BD-27), the art module `app/src/art/`, the
route `/dev/art`. `FeltoRank.ttf` is Nunito ExtraBold renamed with fontTools and embedded by the
`expo-font` plugin. Gate: the Python gate, then `bun run --cwd app typecheck`, `lint` and `test`,
exit 0, 78 and 18, 5 tests; the auditor also proved that a failing test and a changed swap hex
each fail the gate. Seen on the iPhone 17 Pro and `Pixel_9` in light and dark, Android as a tablet
in landscape and the iPad Pro 13-inch in portrait: ranks rounded and the same shape, no gold arc
on the node, a native button. Found: `bun --cwd app run <script>` exits 0 and runs nothing (bun
1.2.9), so the gate uses `bun run --cwd app <script>`; CocoaPods needs a UTF-8 `LANG`; the
emulator needs `adb reverse tcp:8081 tcp:8081`; `expo-splash-screen` with no image breaks the
Android build. Judgment calls (reversals in the builder's report, `STATE.md`): svgr config in
`app/svg-transformer.js`; `nodeModulesPaths`; the font built by a one-off fontTools command;
`src/screens` and `src/components` added; splash config dropped; `expo-notifications` plugin
added; the dark token values; TypeScript and eslint pinned to the house versions; `/` redirects
to `/dev/art`. Findings, each `open`: iPad landscape and dark mode on tablets not seen (owed);
`app/src/app/index.tsx:4-5` breaks U1 until phase 8; `react-native-svg-transformer` is installed
and unused; `bossPassRight: 8` in `dials.ts:16` holds only while `bossDraw` is 10; `minIosVersion`
and `minAndroidApi` are not applied; `app/src/art/registry.ts:11-15` copies viewBox sizes by hand;
`CLAUDE.md:47` cites a range that holds only `UI_ICONS`; `FeltoRank.ttf` is not kebab-case
(sanctioned by BD-22, not yet in the registry). **Left owed:** iPad landscape; Zach's look at the
ranks; the commit.

**14. Write the sound generator (board item 17, app phase 13).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by
Opus in a snapshot copy (verdict: non-blocking findings); no relay passes. Wrote
`tools/build_sounds.py`, standard library only (`math`, `os`, `struct`, `wave`), which writes six
16-bit mono 44,100 Hz WAV files to `assets/sounds/`: `answer_right`, `answer_wrong`,
`lesson_finish`, `boss_pass`, `boss_fail`, `chest_open`, 0.36 s to 0.90 s, peaks 0.45 to 0.65 of
full scale, a zero sample at both ends. A rebuild is byte-identical, also under
`PYTHONHASHSEED=7`, and the auditor's own `wave` and pitch check agreed with the docstring's
notes. The generator runs in the gate after the two SVG generators (`gateCommand`, `CLAUDE.md`
Commands); gate exit 0, run lines 78, 18 and 6, SVG bytes unchanged. The Python standard is 1.2.0.
The orchestrator fixed three audit findings (docstring timings 0.34, 0.55 and 0.45 s; the
`1-30` citation; `math.exp` named in the G3 caveat); the sound bytes did not change. Judgment
calls: flat file names; the generator has its own `write()`; a minor version bump. Findings, each
`open`: `docs/conventions-python.md:173-174` and `:16-23` read badly (cosmetic);
`tools/build_sounds.py:6` is 101 characters; `PLAN.md:600` says three modules were added and it
was two; byte identity is proven on this Mac only. **Left owed:** Zach approves each sound by ear
(`afplay assets/sounds/<name>.wav`); the runtime-pass entry for it is in the builder's report in
`STATE.md` and joins `RUNTIME-PASS.md` at phase 12; the commit.

**15. Game state and the data module (board item 8, app phase 4).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by
Opus in a snapshot copy (verdict: non-blocking findings, one fix round); no relay passes.
`app/src/game/` holds the rules of `D8` and `D19` to `D21` as pure functions of the state, a path
outline and the time: lives, streak and freeze, sessions and XP, path node states, the seeded
boss draw, the review set, the chest, placement and the first-launch flag, the Sound setting, and
the BD-13 fixtures. `app/src/storage/` is the one data module: a pure core over a
`KeyValueStore`, stored as `{version: 1, player}` under `felto.player`, an unreadable value
copied to `felto.player.backup.<epoch ms>` before a fresh state is used, a migrations table, a
`PlayerCell` that holds the latest state, and a provider and hook. Only
`storage/kv-store-adapter.ts` imports `expo-sqlite`. The auditor wrote 41 spec tests of its own
against the design text and all passed; six mutants (lives 4 h to 3 h, boss pass 8 to 7, and
others) each failed the builder's tests; no stored value can be dropped silently. Two findings
were fixed in a round: refill and freeze purchases overwrote same-tick updates (now computed from
the latest state through `PlayerCell`), and `finishSession` trusted the caller's session size
(now checked against the dials). The orchestrator re-ran typecheck, lint and test after the fix:
exit 0, 26 files, 200 tests. **The fix round was not re-audited by a fresh auditor**; that is
owed (judgment call: budget). Judgment calls, reversals in the builder's report (`STATE.md`):
rules take a `PathOutline`, not the content schema; missed days settle lazily and a break loses
the remaining freezes; placement gives no XP and leaves chests closed; a session left early gives
nothing; reminder settings wait for phase 11 and `STATE_VERSION` 2. Findings, each `open`:
function lengths marginal at `path.ts` `unitNodes`; `use-stored-player.ts:7` comment says what,
not why; the same-millisecond backup key can be overwritten (accepted). **Left owed for item 12:**
mount `PlayerProvider` in `app/src/app/_layout.tsx`; the BD-13 route
`app/src/app/dev/fixture/[name].tsx`; build the `PathOutline` from the content outline; the
provider and hook have never run on a device. The commit.

**16. Cards, the evaluator and the content schema (board item 9, app phase 5).** Done 2026-10-05
under `/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5 and
reviewed by Fable 5.1 as the plan's Deep review (verdict: non-blocking findings, one fix round);
no relay passes. `app/src/cards/` holds card notation, the deck, the evaluator (every five-card
subset, base-15 score), showdown with splits, hand descriptions, outs to a target or better, pot
odds and the rule of 2 and 4, and the 169-hand notation. `app/src/content/` holds the schema, the
four-unit outline with lesson titles, a structural validator, `computeKey`, and an empty catalog
for phases 6 and 7. Proof: an enumeration of all 2,598,960 five-card hands gives the known class
counts and 7,462 distinct strengths; a second evaluator written another way agrees on every
five-card hand and 200,000 seeded six- and seven-card deals; the Deep reviewer's own bitmask
evaluator agreed on all 2,598,960 five-card hands, 2,000,000 random seven-card hands, 200,000
six-card hands and 250,000 showdowns, and on outs against brute force for 20,000 spots, with zero
disagreements. Six findings were fixed in the round, each with a test that fails on the old
code: outs to `one-pair` or `two-pair` refused (board pairings count as outs); showdown options
compared as sets; an `equity` option equal to the exact chance refused; `evaluateFive` no longer
exported; the `requiredPercent` comment corrected; a catalog guard in `keys.test.ts`. The
orchestrator re-ran typecheck, lint and test after the round: exit 0, 26 files, 207 tests;
nothing under `assets/` or `tools/` changed. Judgment calls, reversals in `STATE.md`: outs count
the target or better from the next card only; royal flush is its own category; the pot is the pot
before the bet; `odds` has three asks with the call decided by the rule of 2 and 4 and checked
against the exact chance; showdown options are sets of player indexes; the catalog guard checks
each unit that has a file plus each lesson of each listed unit (so phase 6 does not wait for
phase 7), and a unit file is named for its unit id. Findings, each `open`: outs misleading spots
that the validator cannot refuse (paired-board flush draw, a four-flush board, backdoor draws)
need care in phases 6 and 7; the catalog is empty, so the key test checks nothing yet;
`content/cast.ts` (BD-28) is not written; phase 8 maps `OUTLINE` to item 8's `PathOutline`.
**Left owed:** Zach reads the lesson titles and hand descriptions (strings in the builder's
report, `STATE.md`); the commit.

**17. Content: units 1 and 2 (board item 10, app phase 6).** Done 2026-10-05 under `/autopilot`,
on branch `main` in the main checkout, not committed. Built by Opus 5.5; two Opus review rounds
(the second by a fresh reviewer) and two fix rounds; no relay passes. `app/src/content/units/hands.ts`
(5 lessons: 18 concept, 17 hand-name, 15 showdown) and `units/table.ts` (5 lessons, 50 concept)
are listed in `UNITS`; `app/src/content/cast.ts` holds the `D18` names Flop, Kicker and Ace
(BD-28). The validator passes with 50 exercises in each unit and the 32 checkable written keys all
equal `computeKey`; the reviewer solved all 31 hand-name and showdown items from the cards and
found no wrong key. The first review found one wrong key, three wrong explanations, six terms
used before they are taught and ten minor items; the second found a wrong fact about the ace
playing low, a few untaught terms, one duplicate exercise and some copy; all were applied, and
the answer indexes are spread (hands 15, 20, 14, 1; table 17, 19, 14). Gate after the last round:
exit 0, run lines 78, 18 and 6, tests passing (314 with items 11 and 12 under way). The final
round was applied without a third review. Judgment calls, reversals in the builder's report
(`STATE.md`): keys are typed and checked a second time (rule Q3), not computed in the data;
`cast.ts` was written here; all of unit 2 is concept, so its keys are checked by review only,
not by a test. Findings, each `open`: room-specific rules noted but left (odd-chip rule,
heads-up button, tournament all-in show-down); the seven-card hand-name prompts say "two hole
cards and five on the board", but the data does not mark the split, so the lesson screen (item
13) must show the last five cards as the board. **Left owed:** Zach reads the copy (every prompt,
option and explanation is in the two unit files); the commit.

**18. Content: units 3 and 4 and the preflop chart (board item 11, app phase 7).** Done 2026-10-05
under `/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5;
reviewed by Fable 5.1 (the plan's Deep review of the chart and its keys) and by two Opus concept
reviews; one consolidated fix round; no relay passes. `app/src/content/opening-chart.ts` is the
raise-first-in chart for 6-max at 100 big blinds, blinds only, the small blind raising or folding:
UTG 152, HJ 206, CO 326, BTN 454 and SB 382 of 1,326 combinations, with a test for containment
(UTG in HJ in CO in BTN; CO in SB in BTN) and pinned counts. `units/preflop.ts` (21 concept, 29
preflop) and `units/odds.ts` (14 concept, 14 outs, 22 odds) are listed in `UNITS`. The Deep
reviewer recomputed the counts, the containment, all 29 preflop keys and all 65 checkable keys
with its own enumeration and found no wrong key; no hand on the chart is one that solver charts
fold; the chart is tighter than published raise-first-in ranges at every seat (most at the
button and small blind), which the file's comment now says, with the shares marked approximate
and from memory. The chart was written from principles and cites no source. The fix round
applied one false claim ("72o is the weakest"), one incomplete rule (the rule of 4 also applies
when the bettor is all in), one false header comment (a gutshot beside a flush draw in
`odds-1-09`, fixed by changing the turn card), the pot-odds definition, the "about a third"
wording and about 25 copy points; no key changed. Tests after the round: content and cards, 14
files, 143 passed. Findings, each `open`: the chart should get a checked source citation; the
small blind's raise-or-fold range is the farthest from solver output; the keys of concept items
are checked by review only. **Left owed:** Zach reads the copy and the chart; the commit.

**19. Tabs, the path and the stat bar (board item 12, app phase 8).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by
Opus in a snapshot copy (verdict: non-blocking findings); no relay passes. Three native tabs
(Learn, Practice, Profile; Practice and Profile are placeholders); `PlayerProvider` mounted at the
root and seen working on iOS and Android; the BD-13 route `felto://dev/fixture/<name>` (does
nothing unless `__DEV__`); the game `PathOutline` built from `OUTLINE`; the temporary `/`
redirect deleted. The art module names all 84 SVGs the app draws, with a test that checks every
viewBox against its file; `PathNodeArt` draws the BD-9 gold arc over `node_current_base` with
the geometry of `tools/build_icons.py:264-278` (the auditor checked start angle, direction,
sweep and the zero and full cases). The stat bar, the path view model and its tests, and the
tokens were added. Gate exit 0, run lines 78, 18 and 6, 31 files and 314 tests; nothing under
`assets/` or `tools/` changed. Seen on the iPhone 17 Pro, the `Pixel_9` and the iPad Pro
13-inch (portrait), light and dark, plus an Android tablet in landscape: `unit1-mid` shows
lessons 1 to 3 finished, lesson 4 current with the arc at three fifths, lesson 5 and the boss
locked, and the bar 4, 240, 2, 20. The auditor wrote its own tests on the fresh, `unit1-mid`,
`zero-lives` and `boss-ready` fixtures and the boss-pass and chest-open states, and all agreed
with `DESIGN.md` 10.1. Found: iPadOS 26 puts native tabs at the top; `adb screencap` is stale
after `wm size` (use `adb emu screenrecord screenshot`); a deep link during a cold start can be
dropped. Judgment calls and the new strings are in the builder's report (`STATE.md`). Findings,
each `open`: (a) after placement (D20) the path shows three current lessons at once and a faded
chest under a complete boss (`game/path.ts:35-44`, `unit-header.tsx:31-35`; item 20 must settle
this); (b) the zero-lives path looks like `unit1-mid`, so the out-of-lives sheet (item 14) must
block the tap; (c) the Expo dev-menu button hides the gem count in the Android light shot, no
clean Android `fresh` shot, Android shots stop at lesson 4, and no iPad landscape shot exists;
(d) the claim that a fixture survived a restart has no screenshot; (e) stat labels read "1
lives" and "1 streak freezes" and D10's "hearts" is not used; the current node label gives no
progress; `route-error.tsx:17` is plain register; (f) the dev routes still exist in a release
build (they only show a page). **Left owed:** iPad landscape; the error banner and the error
boundary on screen; Zach reads the strings; the commit.

**20. Random dealers for practice (board item 18, app phase 14).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5; the Default
review (Opus, read-only) found one blocking template and five smaller points, all fixed in one
round; the fix round was not re-reviewed; no relay passes. `app/src/drills/` holds a seeded
dealer for each of `hand-name`, `showdown`, `preflop`, `outs` and `odds` (`D21`, BD-26). Every
key is computed (the evaluator, the showdown, the opening chart, the outs counter, the odds
arithmetic), never typed, and every dealt exercise passes `validateExercise` (`checked.ts`
throws otherwise). `openKinds(state)` maps unit progress to the open kinds through `unitDone`,
so the placement check counts too; `dealSet` deals a Practice set of the dial's size, with ids
`practice-<setSeed>-<n>-<kind>-<childSeed>`. Tests deal 10,000 seeds of each kind through the
validator, `computeKey` and an independent second count (`second-count.ts`: a bit-mask
evaluator, a brute force over all 21 five-card choices for showdowns, every card left in the deck
for outs, and the arithmetic re-derived); they also check seed replay, the answer-position
spread, and the truth of each template, including the rank words. The reviewer ran 100,000 seeds
per dealer with no throw, no wrong key and no spot with two defensible answers. The blocking
finding was a showdown explanation that called flush and high-card comparisons "kickers" in about
3% of seeds; it now says "Compare the cards from the top". Gate exit 0 (each step run alone),
40 files, 378 tests; nothing under `assets/` or `tools/` changed. Judgment calls and the
template strings are in the builder's report (`STATE.md`): hand-name picks its category first;
showdown forces some splits; preflop balances raise and fold; outs deals only flush, straight and
three of a kind; odds draws from fixed pools; `dealSet` was added beyond the scope. Findings,
each `open`: no `As built:` note under `D21` in `DESIGN.md` (the `PLAN.md` header carries it).
**Left owed:** Zach reads the template strings; the commit.

**21. The lesson: exercises, feedback and finish (board item 13, app phase 9).** Done 2026-10-05
under `/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5,
audited by Opus in a snapshot copy (verdict: blocking findings, fixed by item 14's builder in the
same loop; the fixes were checked by this session through typecheck, lint and the full test run,
47 files and 408 tests, and by item 14's own audit); no relay passes. The route
`app/src/app/lesson/[id].tsx` is a full-screen modal; a current or finished lesson stop on the
path opens it. All eight exercise kinds the schema has (concept, hand-name, showdown, preflop,
outs, pot-odds, equity, call) draw through `app/src/components/exercise/` and a pure, tested view
model; a seven-card hand-name shows the first two cards as the hole cards and the last five as the
board. The loop is a pure reducer (`components/lesson/lesson-run.ts`) under a hook: each answer
is recorded at once with `recordAnswer`, `finishSession` runs only after the last exercise, and
0 hearts before the end stops the lesson without counting it (D8). Check and Continue are the
universal `@expo/ui` `Button`; feedback is the universal `BottomSheet`; the progress bar is a
platform pair. Sound and haptics are in `app/src/feedback/` (`expo-audio` with the silent switch
honoured, `expo-haptics`). The audit's blocking finding was that audio errors could crash a
lesson or spend a second life (no error handling in `app/src/feedback/`); it was fixed by routing
every effect through `feedback/safely.ts` and moving the run state before any effect
(`session-steps.ts`), with a test that fails on the old order. The auditor's own 11 tests
confirmed the loop rules: a wrong answer spends a life at once, leaving keeps the spent life and
gives nothing, a double Continue finishes once, and the screen scores by the content key. Also
fixed in the same round: Sound off loads no audio, the Android Back button asks to leave, the WAV
imports moved to `app/src/art/sounds.ts` (rule U6 now covers art and sound, standard 1.0.1),
raw sizes became tokens, and several copy and accessibility points. Seen on the iPhone 17 Pro
and `Pixel_9`, light and dark: every kind with its question, right and wrong feedback, and one
whole lesson walked on both platforms (8 right, 2 wrong: +80 XP, a 1-day streak). Judgment calls
are in the builder's report (`STATE.md`). Findings, each `open`: replaying a finished lesson gives
XP and the streak again (`game/session.ts:52-63`; a decision for Zach); no iPad lesson shot;
sounds not heard, haptics not felt; the feedback sheet covers the lower choices on small
screens. **Left owed:** Zach hears the sounds and reads the strings; the commit.

**22. Boss, review, chest and lives (board item 14, app phase 10).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by
Opus in a snapshot copy (verdict: non-blocking findings); no relay passes. It also fixed every
finding of item 13's audit (step 21). The boss (`boss/[unit]`), review (`review/[unit]`) and
chest (`chest/[unit]`) are full-screen modal routes over one session loop (`components/lesson`:
a `Session` type and `session-steps.ts`); the out-of-lives sheet is a transparent-modal route;
path taps go through `components/path/stop-route.ts`, so at 0 hearts a lesson or the boss opens
the sheet and a refill opens the tapped stop. The review costs no hearts, puts the unit's misses
first and stays open at 0 hearts. The chest has no open art, so it opens as a plain reveal; the
gems come only from `openChest` (once per unit). The standard is 1.0.1 (U6 covers art and
sound). The auditor wrote 17 tests of its own against D8 and all passed (7 of 10 fails and 8
passes; the boss opens after five finished lessons; the chest gives +20 once; a refill costs 20
and is refused at full hearts or with 19 gems; a throwing sound neither spends a second life nor
sticks the session). Gate exit 0, 47 files and 408 tests; the boss pass and fail were played on
the iPhone 17 Pro and `Pixel_9`, light and dark (most runs through the dev link `?play=`; the
steps around them by hand). Findings, each `open`: (a) two taps on Check inside one render both
read "answering" and a wrong answer then spends two hearts (`session-steps.ts:16-23`,
`use-lesson-run.ts:25-32`; a ref guard like `movedOnFrom` fixes it; the comment at
`session-steps.ts:13-15` overstates the protection); (b) no test pins "state moves before
effects": reversing the order kept all 425 tests green, only `safely` is pinned; (c) the review
is the XP farm: it is free, open at 0 hearts and pays 10 XP per right answer on every replay
(allowed by D8 and 10.1; a decision for Zach); a failed boss gives XP and a streak day by D8's
text; (d) Back on the boss finish screen skips "Open the chest" (the chest stays tappable);
(e) `useLessonRun` is about 30 lines (O1) and a comment at `components/boss/unit-exercises.ts:11`
says what, not why (O3). **Left owed:** a boss played wholly by hand; iPad; sounds heard; Zach
reads the strings; the commit.

**23. The Practice tab (board item 19, app phase 15).** Done 2026-10-05 under `/autopilot`, on
branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by Opus in a
snapshot copy together with item 15 (verdict: non-blocking findings, one fix round, the fixes
checked by the builder's gate: 59 files, 479 tests); no relay passes. The Practice tab
(`screens/practice-screen.tsx`) lists the five dealt kinds, open or locked, naming the unit that
opens each, with one "Start a set" that deals a mixed set of ten from the open kinds
(`components/practice/practice-menu.ts`, tested). The set runs as the full-screen modal
`practice-set` over the lesson loop with a `practice` session hosted by the squid; the seed is
the clock at opening. Practice never reads hearts: it opens at 0, hides the heart count and
spends none; a finished set gives 5 XP per right answer and counts the day; a set left early
gives nothing. It also fixed the finding of step 22: the Check double-tap race (a `checkedFor`
ref in `session-steps.ts`) with `session-order.test.ts`, which pins state before effects (the
auditor's mutants fail it). The auditor's own tests (practice kinds by progress, 5 XP per right
answer, sizes 9 and 11 give nothing, no heart spent) agreed with D21. Fixed after the audit: the
odds tile said "1 Cards to come" beside "On the flop" (it now reads "1 card, The turn only",
"2 cards, Turn and river" or "1 card, The river", checked over every written and 2,000 dealt
exercises), and the locked set screen showed the fish instead of the squid. Seen on the iPhone
17 Pro and `Pixel_9`, light and dark. Findings, each `open`: no fixture opened a practice kind
when it was built (item 20 adds `all-done`); a free practice set shows "+0 XP" and a streak tile
when nothing was right (true by `finishSession`); the fix round was not seen on a device.
**Left owed:** Zach reads the strings; the commit.

**24. Profile, settings and the reminder (board item 15, app phase 11).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by
Opus in a snapshot copy (verdict: one blocking finding, fixed in one round; the fix was not
re-audited and was not seen on a device); no relay passes. Profile is a native settings form
(`FieldGroup` in a `Host`): the stats, the `D19` freeze shop (10 gems, at most 2, the button
greyed out with a reason line), a Sound switch that also pauses a playing effect, the `D11`
reminder switch and a platform time picker, and a reset behind a platform alert that backs up
the latest state and keeps the settings. The reminder follows BD-18: `reminder/plan.ts` plans up
to seven `DATE` notifications, none on a played day; `ReminderSync` reschedules at start, on
resume, after a finish and on each settings change; the permission is asked after a first finish
of a day or when the switch is turned on, never at launch; `reminder-device.ts` is the only
importer of `expo-notifications` and cancels only this app's ids. `STATE_VERSION` is 2 (settings
gain `reminder`) with a migration. The auditor's own 20 tests passed: a v1 save with extra fields
loads with every field kept, and garbage, a v3 value, a missing version and version 0 are backed
up before anything is written; the plan keeps the local hour across the 2026-11-01 and
2027-03-14 changes; the freeze shop and same-tick changes agree with `D19`. The blocking finding
was a stale clock: replans between resume events used the mount time, so on iOS a refused past
trigger could leave the week with no reminders, and a finish after midnight left the day unplayed.
It is fixed by `reminder/replan.ts` (reads the clock when it runs, skips dates not in the future,
schedules each reminder in its own `try`), with a test that fails on the old behaviour (3 of 5).
Also fixed: one time format (`reminder/clock-format.ts`), the Android row looks disabled when the
reminder is off, Reset is red, the form background matches the page, the footer is true on a day
already played, and `PlayerProvider` and `ReminderSync` mount from one `root-providers.tsx`.
Gate exit 0, 59 files and 479 tests. Seen on the iPhone 17 Pro and `Pixel_9` before the fix
round: the stats, the freeze shop, both permission prompts, the time pickers, the phone's list of
scheduled reminders (7, then 6 after a finish), a reset. Findings, each `open`: no notification
has been seen arriving; the fix round was not seen on a device (iOS dark form background, the red
reset row, the iOS picker locale, the Android muted row, and no "modifiers" log after toggling the
switch); `lesson-closed.tsx` should use `formatClockTime` from `@/reminder/clock-format` (it forces
the 12-hour form); the phone's own 12 or 24-hour switch cannot be read without a localization
package. **Left owed:** Zach reads the strings; the commit.

**25. Onboarding and the placement check (board item 20, app phase 16).** Done 2026-10-05 under
`/autopilot`, on branch `main` in the main checkout, not committed. Built by Opus 5.5, audited by
Opus in a snapshot copy (verdict: non-blocking findings); no relay passes. The root stack
(`components/root-stack.tsx`) is guarded with `Stack.Protected`: onboarding (welcome, cast, "How
much poker do you know?") is open only while `onboarded` is false and the tabs and every session
route only after, so the back gesture cannot return to onboarding. "I am new" completes
onboarding at unit 1; "I know the basics" opens the check when `placement` is `not-taken`. The
check is the lesson loop with a `placement` session kind: five exercises from each of units 1 and
2 by a seeded shuffle with a clock seed at open, the fish hosts, no hearts shown or spent, no
miss recorded, no XP, no streak; it ends in `finishPlacement` (8 right marks units 1 and 2
finished and opens unit 3 with chests left closed) and a pass or fail result. `game/path.ts` now
has one rule (the first unfinished lesson of the first unit not done is the only current stop; a
placed unit shows its boss complete and its review open), which fixes the finding of step 19; a
placed unit's chest stays faded under the line "You placed past this unit. Beat Ace to win its
chest.", because winning that boss in play gives it. New fixtures `placed` and `all-done`;
`screens/placeholder-screen.tsx` deleted; the `fresh` fixture now opens onboarding. The
auditor's own 18 tests against D20 and D8 passed (8, 9 and 10 right place; 7 right changes only
the flag; the check runs once; a wrong size changes nothing; a placed player who beats the boss
gets the chest once; one current lesson in every fixture; ten distinct exercises, five per unit,
reproducible; no heart and no miss; no reminder permission asked). Gate exit 0, 59 files and 479
tests. Seen on the iPhone 17 Pro and `Pixel_9`, light and dark (the full ten-question walks used
the `?play=` link; the first two answers by hand). Judgment calls (`STATE.md`): five from each
unit; `onboarded` set only by "I am new" or the result button; pass and fail both play the
lesson-finished sound. Findings, each `open`: the result screen's X or Android Back returns to
the level screen, where "I am new" then lands a placed player past units 1 and 2 (harmless); the
X is labelled "Leave the lesson" during the check (`lesson-header.tsx:21`); `placement.ts:13` and
`session.ts:47` accept a right count that is not a whole number (the UI cannot produce one);
`useLoadFixture` is about 19 lines (O1); the faded chest is very dim on a dark background; a
dev-only floating sheet after a fixture link over a result; no iPad shot; sounds not heard.
**Left owed:** Zach reads the strings; the commit.

**26. Close out the app (board item 16, app phase 12).** Done 2026-10-05 under `/autopilot`, on
branch `main` in the main checkout, not committed. Built by Sonnet 5.5, audited by Opus together
with a fresh-checkout proof (verdict: non-blocking findings); no relay passes. Documents plus four
small code fixes; no screen was built. `docs/conventions-typescript.md` is 1.1.0: every correct
example is real felto code with a checked `file:line` (the auditor printed all 45 citations and
read each against its rule), `grep -n ezhomesteading` prints nothing, the lint and Metro facts are
re-read from `app/node_modules` (the standard had said the config turns `import/order` off; it is
never on), the registry holds Z1 to Z4, and a Known gaps list names the raw `fontWeight` strings
(45 sites, U5) and the long hooks. `docs/incomplete/app/RUNTIME-PASS.md` is one ordered list of
47 entries for a person on a device plus the decisions that are Zach's. Four fixes from the audits,
each caught by its test (the auditor ran 8 mutants and all failed their tests): the closed-lesson
time uses `formatClockTime`, stat labels use singular forms and D10's "hearts", the route error
line is warm ("Flop dropped the deck drawing this screen.", button "Deal again"), and the current
path node's label gives its progress. **Fresh-checkout proof:** on a copy of the working tree with
no `app/node_modules`, `bun install --cwd app --frozen-lockfile` (851 packages) then the whole-repo
gate, each step alone, exit 0: run lines 78, 18 and 6, typecheck, lint, 63 files and 490 tests;
the generated art is byte-identical between runs and equal to the working tree; all 1,012 local
imports resolve; a throwaway failing test made the test script exit 1. The auditor also tabled
the MVP against `DESIGN.md`: every user-visible requirement is built; partial or missing are
the open-chest art (the gem replaces the chest), a notice that a streak freeze was spent, the
minimum-version dials (read nowhere; the SDK floors are the same), and an app icon and splash
(`app.json` has none, so the home screen shows the default Expo icon). The audit's seven small
findings were fixed in a doc round (the stat-label and zero-hearts walk entries in
`RUNTIME-PASS.md`, the `Answer: pending` lines of `D15` to `D21` amended to Zach's answers of
2026-10-05, the `CLAUDE.md` citation, the HEAD-isolation command, the `PLAN.md` phase 6
header). Findings, each `open`: the long-function list in the standard undercounts
(`useReminderSync` 20 lines, `useProfileControls` 21, `playerActions` 36, four dealers 17 to
19). **Left owed:** Zach walks `RUNTIME-PASS.md` and decides what it lists as his; the commit.

**27. Autopilot run of 2026-10-05, the whole app.** Ran 01:26 to about 08:15 EDT. Every board row
is `DONE` (items 1 to 21; steps 9 to 26), the plan's 16 phases are built, and a fresh checkout
passes the whole-repo gate (63 files, 490 tests). The rundown is
`docs/incomplete/autopilot-2026-10-05/RUNDOWN.md`; the record of the run is `STATE.md` beside it.
Weekly usage ended at 49%, under Zach's 65% stop. Nothing is committed; no one has held the app on
a phone. Zach's answers to `D15` to `D21` are now in `DESIGN.md`.

**31. The story engine, the route and the header button (board item 23, unit stories phase 2).**
Done 2026-10-05, on Opus 5.5, in the worktree `.claude/worktrees/lane-e-story-engine` (branch
`lane-e-story-engine`, from `main` at `b986f61`), not committed. Steps 28 to 30 belong to the
parallel lanes (28 lane D, item 22; 29 item 26; 30 item 27) and are written in their own worktrees;
each lane's session announced its number on 2026-10-05, so this lane took 31. Built US-4 to US-7
of `docs/incomplete/unit-stories/DESIGN.md`: the dials `storyBackZone` 0.3, `storyWordsPerSlide`
30 and `storySlidesPerUnit` 6 to 8 in one block under `// unit-stories` in `app/src/config/dials.ts`
(lane D adds `dealtLessons` under the same comment, so the merge must keep both blocks); the story
schema, validator, list and key test under `app/src/content/stories/`; the pure `storyTapAction`
and `storyStep` with tests that pin the 30 percent line (just under it goes back, on it goes
forward) and the first and last slide; the screen, the route `story/[unit]` with the session
options, and the "Learn about {unit}" button on the unit header for a unit with a story; and a
six-slide placeholder hands story for board item 24 to replace. The code map lists the files.
The story reads and writes no player state, so `STATE_VERSION` stays 2. Build calls, each with its
reversal, are `PLAN.md` BD-S7 to BD-S13 (lane D confirmed on 2026-10-05 that it took no BD-S
number): one full-screen tap layer instead of two areas; the slide as one adjustable element for
screen readers; every exit closes once through the reducer; the fish beside the words in
landscape, reusing existing tokens because `app/src/theme/tokens.ts` is item 26's; an outlined
native button under the title on every unit with a story, locked or not; the word dial read as a
maximum and the key test built ahead of phase 3; a story-specific not-found view. Each decision
has an `As built` note in the design.

Proof. Whole-repo gate from `CLAUDE.md`, run in the worktree: exit 0, run lines 78, 18 and 6, 69
test files and 531 tests (main has 63 and 490; this item adds 6 files and 41 tests), and
`git diff --stat -- assets/icons assets/mascots assets/sounds` empty. The typecheck also passed
with the typed routes that Metro generated in the worktree, which list `/story/[unit]`.
**Seen running** on a new iPhone 17e simulator (`B84A7615`, 390 points wide) with `main`'s
development build pointed at this worktree's Metro (port 8084), in light and dark: the header with
the button (unit 1) and without it (unit 2), the first slide, the card slide and the last slide;
a left tap on the first slide does nothing; left and right taps move one slide; the cross, "Back to
the path" and a forward tap on the last slide each close the story; the stat bar read 4, 240, 2 and
20 before and after. **Seen running** on the `Medium_Phone_API_36` emulator (1080 by 2400) in light
and dark: the header with the button, the first slide, the card slide and the last slide in light,
the header and the first slide in dark, a left tap on the first slide does nothing, and Android's back button
closes the story with the app still open. **Not seen**, each `open`: a phone or a tablet in
landscape, the not-found view (`felto://story/table`), the Android dark last slide, any iPad, and
a screen reader. The emulator's display failed twice ("Failed to find ColorBuffer", then a black
screen with software rendering) while the Mac's load average reached 90 and free disk fell to 3.6
GiB under the other lanes' native builds; the emulator was stopped to give the machine back. The
runtime entries for these are in `PLAN.md` section 7.

Found, each `open`: (a) from 10:55 to 11:10 EDT taps and a lesson link arrived on the iPhone 17e
that this session did not send (a debug log showed taps at x = 350 to 365 and 28; a `hands-3`
question opened over the story). This session first guessed lane D's session; lane D's session
reported on 2026-10-05 that none of its commands named that simulator, so the source is unknown.
Parallel sessions that drive simulators by "booted" or by the tool's default device can reach
another lane's device. (b) After the merge, `main`'s generated `app/.expo/types/router.d.ts` lacks
`/story/[unit]` until Metro runs once in `main`, so `bun run --cwd app typecheck` in `main` may fail
on `story-button.tsx` until then. (c) The new views add five raw `fontWeight` strings to the U5
known gap of `docs/conventions-typescript.md` (45 sites on 2026-10-05). (d) `story-screen.tsx` and
`story-missing.tsx` are two new call sites of `LessonButton`; item 26 removes `LessonButton` only
when no call site is left (its BD-G7), so the story keeps it alive. (e) The `CLAUDE.md` and
Environment test counts (63 and 490) are stale; this step leaves them for the close-out of board
item 25, because every parallel lane changes them. (f) The development build's tools button
covers the right end of the progress marks (development builds only). New strings, all in the warm
register of `D10` or settled by US-5 and US-6: "Learn about hands" (and the three other unit
labels), "Back to the path", "Close the story", "Story not found.", "This unit has no story yet.",
"Next slide", "Previous slide", "Slide 1 of 6", and the six placeholder slides in
`content/stories/hands.ts`. **Left owed:** the landscape, tablet, not-found and screen-reader
checks above; Zach reads the strings; the commit, which is Zach's, from the worktree.

**33. The hands story: eight slides for unit 1 (board item 24, unit stories phase 3).** Done
2026-10-05, on Opus 5.5, in the worktree `.claude/worktrees/lane-e-story-engine` (branch
`lane-e-story-engine`, at `aed7054`, item 23), not committed. Step 32 belongs to lane F (game-feel
item 28; its session announced the number on 2026-10-05), and `main` holds 29 to 31: during this
item `main` merged item 23 (`06cea5a`) and game-feel items 26 and 27 (`4b592b9`), so this lane
took 33. `app/src/content/stories/hands.ts` now holds eight slides in the order unit 1 teaches its
terms (deck and suits, hole cards and the board, best five of seven, the ten hands from high card up
over three slides, kickers, who wins the pot), and the new `hands-story.test.ts` holds 7 tests of
what is true of this story only (`DESIGN.md` US-7, `As built`). Zach read the full draft and three
registers of slides 1, 5 and 8 in chat on 2026-10-05 and chose warm (R7). Four slides are keyed
(three of a kind, straight, royal flush, one pair) and two show cards with no key, because they
name no hand (four aces, K and Q). No schema, validator, engine or token file changed.

Proof. Whole-repo gate from `CLAUDE.md`, run in the worktree after the last code change: exit 0,
run lines 78, 18 and 6, typecheck and lint clean, 70 test files and 538 tests (step 31 had 69 and
531), and `git diff --stat -- assets/icons assets/mascots assets/sounds` empty. Five mutants of a
copy of `hands.ts` (a wrong key, a dropped key, the big hands before the straights, the pot named
on slide 3, a lesson promised on the last slide) each failed at least one test; the file was
restored with `cp` and `diff -q` showed it equal. A Sonnet 5 read-only check, model passed
explicitly, in its own worktree, ran `parseCards`, `hasDuplicate` and `evaluate` on every row and
read each hand by hand: no disagreement. The harness removed its worktree, which it does only when
nothing changed, and lane E's `git status --short` showed only this item's two files.
**Seen running** on the iPhone 17e (`B84A7615`), with `main`'s development build on this worktree's
Metro (port 8084), light and dark: slides 1, 5 and 8 in both, slides 2, 6 and 7 in one of them;
eight progress marks; "Back to the path" closed the story onto the Learn tab with the stat bar
at 4, 240, 2 and 20 before and after; `felto://story/table` drew the not-found view of step 31 in
dark (the sad fish, "Story not found.", "This unit has no story yet.") and its button closed it.
**Not seen**, each `open`: any Android screen, a phone or a tablet in landscape, and a screen reader.
The `Medium_Phone_API_36` emulator was started twice and stopped with exit 137 (a kill signal) both
times, at about 12:54 and 13:18 EDT, before its boot completed, while the load average ran 60 to
114 and free disk 4.8 to 5.3 GiB. At the second stop the other lane's `Pixel_9` emulator stopped
too, and at about 13:19 the iPhone 17e was found shut down, which this session did not do. iOS
cannot be rotated here (Environment).

Found, each `open`: (a) Input that this session did not send reached the iPhone 17e again. With
the live simulator panel open, the story closed, the path scrolled to unit 2 and the Profile tab,
then the Practice tab, opened. After `detach`, a tap on "Learn about hands" opened lesson
`hands-1` instead; this session left it with the cross before any answer, and the stat bar was
unchanged. The simulator tool acts on "the currently attached simulator, or the first booted one"
when a call names no device (its own description), so another session's call that names none can
land on lane E's device; clicks that Zach makes in the panel land there too. Lane F's session
reported on 2026-10-05 that each of its simulator calls named the iPhone 17
(`436D2BA3-7441-4B50-BA83-FDFD8D55856F`) by id, so the source is still unknown. `detach` also closed
the panel for all five simulators it held (iPhone 17 Pro, iPhone 17, iPad Pro 13-inch (M5), iPhone
Air, iPhone 17e), which other lanes may have been using. (b) Under this load a screenshot taken
just after a tap often showed the screen before the tap; take a second screenshot before you
judge. (c) The Sonnet check noted that slide 2 says the hole cards are face down while its row
draws them face up; a teaching choice, and Zach's to keep or change. (d) On the 390-point phone the
last slide ends with "fun!" alone on its line. (e) The `think` pose reads as worried on slides 3
and 5; that is the existing art, not changed here. New strings, all in `hands.ts`: the titles
"Meet the deck", "Your two cards", "Best five of seven", "The ten hands", "Straights and
flushes", "The big hands", "Kickers break ties", "Who wins the pot?" and their eight bodies, as
Zach read them in chat. The board row is `DONE` and item 25 has its prompt. **Left owed:** the
Android, landscape, tablet and screen-reader checks; Zach reads the whole story on a phone; the
commit, which is Zach's, from the worktree.

## Style rules

Python follows `docs/conventions-python.md` (written in step 2, 2026-10-04). Read it in full
before editing anything in `tools/`. No formatter or linter is configured (Zach, 2026-10-04), so
nothing settles style mechanically.

TypeScript under `app/` follows `docs/conventions-typescript.md` (written 2026-10-05, board
item 6; version 1.1.0 since board item 16). Read it in full before writing anything in `app/`. Lint there is `expo lint` with
`eslint-config-expo/flat`, installed 2026-10-05 (board item 7); every rule in the standard is
*review* until a tool is shown to catch it.
