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
| Whole-repo gate | the Python gate (build, then the well-formed check), then the solver tests (since board item 38, step 53), then the app gate (typecheck, lint, test), as one command (`gateCommand` in `.personal-config.json`, `CLAUDE.md` Commands) | Run 2026-10-05 (board item 16), each step alone: exit 0; run lines 78, 18 and 6; 63 test files, 490 tests. Run 2026-10-06 (board item 38, step 53) on branch `gto-equity` as one command: exit 0; run lines 78, 18 and 12; 33 solver tests; 86 test files, 629 tests; `git diff --stat -- assets/icons assets/mascots assets/sounds` empty after it. Run 2026-10-06 (board item 39, step 54) on branch `gto-equity` as one command: exit 0; run lines 78, 18 and 12; 33 solver tests in 46.5 s; 87 test files, 653 tests; the same diff empty |
| Solver | `python3 solver/cfr.py` solves the five opener subtrees at 12,000 iterations and writes `solver/data/key.json` (608,670 bytes); not in the gate; `python3 solver/validate_key.py solver/data/key.json` checks the file | Run 2026-10-06 (board item 38, step 53) twice at a load average of 3: 104.5 s and 105.9 s wall, the printed output and the file identical (`diff`, `cmp`); the validator prints `valid` |
| Python | 3.14.6, `/opt/homebrew/bin/python3`; the SVG generators import `math`, `os` and `common`; the sound generator imports `math`, `os`, `struct` and `wave`; `solver/equity.py`, `solver/cfr.py`, `solver/best_response.py` and the two tests beside them import numpy 2.4.3, the one third-party module allowed, and only in `solver/` (rule M4, amended 2026-10-05, step 46); `solver/config.py` imports nothing | `python3 --version`; `grep -nE '^(import\|from)' tools/*.py solver/*.py` |
| Solver tests | `python3 -m unittest discover -s solver -p '*_test.py'` (the standard library's `unittest`). Since board item 37 the suite needs numpy: `cfr_test.py` and `best_response_test.py` import it; `equity_test.py` alone still runs without it. In the whole-repo gate since board item 38 (2026-10-06, step 53), between the SVG check and the app gate, as Zach chose on 2026-10-05 (it was to join at phase 3b, when the solver writes its output, step 51) | Run 2026-10-05 (board item 36, step 46): 8 tests, OK, 75.7 s at a high machine load; the Monte Carlo test is most of it. Run 2026-10-05 (board item 37, step 50): 25 tests, OK, 25.7 s at a load average of 5. Run 2026-10-06 (board item 37, step 52): 25 tests, OK, 49.2 s at a load average of 12. Run 2026-10-06 (board item 38, step 53): 33 tests, OK, 23.3 s at a load average of 3 |
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
- `tools/build_sounds.py`: writes `assets/sounds/` (12 WAV files: `answer_right`, `answer_wrong`,
  `lesson_finish`, `boss_pass`, `boss_fail`, `chest_open`, each under one second, `D15`; and `tap`,
  `option_select`, `heart_lost`, `xp_tick`, `reward_claim`, `sparkle`, each under 0.6 s, `GF-5`,
  board item 28; 16-bit mono, 44,100 Hz). It stops the run if an effect is over its ceiling
  (`checked()`, game-feel `PLAN.md` BD-G19). Standard library only (`math`, `os`, `struct`, `wave`); does not import `common` (board
  item 17, `D15`, BD-23). The app plays them through `expo-audio` (BD-24).
- `assets/higgsfield/`: the Higgsfield reference art the style was approved from (19 PNG, 13 SVG).
- `assets/gallery.html`: shows the Higgsfield art; links all 32 files by name.
- `assets/icons/preview.html`, `assets/mascots/preview.html`: inline SVG snapshots, written by
  no script.
- `docs/conventions-python.md`: the Python code standard for `tools/`, version 1.2.2 once step 40 merges, 1.2.1 before it (steps 2 to 4, 8, 9 and 11, and board items 17 and 28). Since step 46 it is 1.3.0 on branch `gto-equity`: rule M4 lets `solver/` import numpy; 1.3.1 since step 53 (every file of `solver/` named, M4's amendment brought up to date, no rule changed). That branch and the branch of step 40 both change the version line, so the second to merge takes the next number.
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
  effects, every call through `safely.ts`; `app/src/art/sounds.ts` is the only WAV importer. `app/src/art/flop-rive.tsx` (`FlopRive`) is the only importer of `rive-react-native` and of `app/assets/rive/flop.riv` (board item 34, step 36); `flop-mode.ts` holds its pure choice.
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
- Motion and the primary button (board item 26, `GF-1`, `GF-2`): `app/src/motion/` is the only
  importer of `react-native-reanimated` and `react-native-worklets` (BD-G3; `motion-boundary.test.ts`
  fails otherwise). It holds `useReducedMotion` (the one reader of the phone's Reduce Motion
  setting, BD-G4), `motionAllowed` over the dial `reducedMotionSkips`, the pure `motion-steps.ts`,
  the hooks `usePressScale`, `useBounce` and `useFadeIn`, and `MotionView`.
  `app/src/components/button/primary-button.tsx` is the raised Check and Continue button
  (registry Z5 of the TypeScript standard); the native `LessonButton` still draws the other
  primary actions.
- Haptics and the Haptics switch (board item 27, `GF-3`): `app/src/feedback/haptics.ts` is the
  vocabulary (a selection tick, a light, medium and rigid impact, and success), each call inside
  `safely`, reached only through `buzz(touch, setting)`; a screen calls `useHaptics()`
  (`use-haptics.ts`), which reads `settings.haptics`. The rule `shouldBuzz` is in `should-buzz.ts`,
  so the pure `moments.ts` can call it in node (game-feel `PLAN.md` BD-G15). The six answer and
  ending buzzes stay `Haptics.notificationAsync` in `use-answer-feedback.ts`, gated in `moments.ts`.
  The lesson loop's `PrimaryButton`s give the dial `pressHaptic` (`lesson-run-view.tsx`,
  `feedback-sheet.tsx`).
- The press sound (board item 28, `GF-5`): a screen plays one effect through the Sound switch with
  `useSound()` (`app/src/feedback/use-sound.ts`), which reads `settings.sound`; the rule is the pure
  `playThrough` in `sound-switch.ts` (game-feel `PLAN.md` BD-G20). The lesson loop's
  `PrimaryButton`s give the dial `pressSound` (`"tap"`) beside `pressHaptic`.
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
  fixtures of BD-13. `PlayerState` is in `player-state.ts`. Since board item 22 (step 28),
  `dealt-slots.ts` deals fresh hands into the drill slots of the lessons in `DIALS.dealtLessons`
  and of every boss (`US-1`), and its `isDealtId` keeps a dealt miss out of `missedExercises`
  (`US-2`); the dealers it is handed are `DEALERS` of `app/src/drills/deal.ts`.
- `app/src/storage/`: the one data module (`D3`, BD-8, board item 8). `player-store.ts` is the
  pure core (load, check, migrate, save, back up); `migrations.ts` holds `STATE_VERSION`;
  `kv-store-adapter.ts` is the only importer of `expo-sqlite`; `player-provider.tsx` and
  `use-player.ts` give screens the state and its actions. `STATE_VERSION` is 3 since board item
  27 (settings gained `haptics`; the step is in `migrations.ts`, the old-save test in
  `haptics-migration.test.ts`); it was 2 from board item 15 (the reminder; `migrations.test.ts`).
- Profile and the reminder (board item 15): `app/src/components/profile/` is the Profile form
  (`FieldGroup`, the freeze shop, the settings, reset; the Haptics switch under Sound since board
  item 27); `app/src/reminder/` plans the week of
  reminders (`plan.ts`, pure and tested) and keeps the phone in step (`use-reminder-sync.ts`,
  mounted at the root as `ReminderSync` inside `components/root-providers.tsx`; the clock is
  read in `replan.ts` when a replan runs); `clock-format.ts` is the one time-of-day format; `reminder-device.ts` is the only importer of
  `expo-notifications`; `felto://dev/reminders` lists what the phone holds.
- `site/`: the marketing site (step 38, 2026-10-05). Astro 7.3.5 static, own `package.json` and
  `bun.lock`. `src/pages/index.astro` is the one page; `src/lib/theme-css.ts` turns
  `app/src/theme/tokens.ts` into CSS variables; `src/lib/art.ts` reads `assets/` and swaps the
  pale shadow for the theme's (as BD-25 does); the page reads the unit titles and the mascot
  names from `app/src/content/outline.ts` and `cast.ts`. `src/config.ts` holds `APP_STORE_URL`.
- `docs/README.md`: the docs index of `docs/AGENT-PRACTICES.md` Part 8.2 (board items 6 and 16).
- `docs/incomplete/app/`: the app effort (Profile P). `DESIGN.md` is what the app is and why
  (`D1` to `D21`); `PLAN.md` is the order of work, 16 phases on board items 5 to 20 (step 7);
  `RUNTIME-PASS.md` is the final, ordered list of what only a person on a device can still check
  (board item 16).
- `docs/incomplete/autopilot-2026-10-05/`: `STATE.md` and `RUNDOWN.md`, the record of the
  `/autopilot` run that built the app. Not kept current.
- `docs/incomplete/gto-trainer/`: the GTO trainer effort (board items 35 to 45). `DESIGN.md` is
  the scope with Zach's answers (A2, B1, C2, D1, E1); `PLAN.md` the ten phases, `BD-T1` to
  `BD-T19`; `KEY-SPEC.md` the game the solver solves and the key's file shape, frozen 2026-10-05
  (step 41). Every screen, grader and line of copy of the trainer reads the game from `KEY-SPEC.md`.
- `solver/`: the GTO trainer's offline solver, a development tool the app never runs (BD-T3).
  Python with numpy allowed here, by BD-T3 and the scope paragraph of `docs/conventions-python.md`.
  On 2026-10-05 it holds one file, `validate_key.py`, the stdlib-only validator of the key schema
  (`KEY-SPEC.md` 7.6): `python3 solver/validate_key.py <key.json>` exits 0 on a valid key.
  Since step 46 (board item 36) it also holds `equity.py`, the first numpy file (M4 as amended,
  version 1.3.0), which writes `solver/data/equity.json`: the 169 by 169 equity table `E` and deal
  weights `W` of `KEY-SPEC.md` 3.3, by exact enumeration with suit symmetry
  (`python3 solver/equity.py`); and `equity_test.py`, its tests, standard library only, run by
  `python3 -m unittest discover -s solver -p '*_test.py'` (Environment). Since step 50 (board item
  37) it also holds the solver: `config.py` (the game object of `KEY-SPEC.md` 12 as `GAME`, the
  nine leaf-model dials with their ranges as `RANGES`, and the other solver dials of `KEY-SPEC.md`
  9); `cfr.py` (CFR+ over one opener subtree at a time, the nodes in the key's shape of 7.1;
  until step 53 `python3 solver/cfr.py` solved the CO, BTN and SB subtrees and printed every seat's
  gain and the bands of 8.2 those subtrees answer); `best_response.py` (each seat's best-response
  gain against a strategy, written apart from `cfr.py` with its own leaf payoffs and tree walk);
  and their tests `cfr_test.py` and `best_response_test.py`, built from hand-worked cases and a toy tree.
  Since step 52 (board item 37) `GAME` in `config.py` holds the provisional freeze of the nine
  leaf-model dials (`KEY-SPEC.md` 12, hash in 7.5, pinned as `SPEC_HASH` in `cfr_test.py`) and
  `RANGES` keeps the starting values the hand-worked leaf tests use (`starting_game()`).
  Since step 53 (board item 38) `python3 solver/cfr.py` solves all five subtrees in seat order
  (`solve_tree`, `chained`), puts `reach`, `hand_reach` and the gains per dealt hand through the
  fold chain of `KEY-SPEC.md` 3.3, prints every seat's gain at a quarter, a half and all of 12,000
  iterations, the 26 band rows of 8.2 and the nodes under `REACH_FLOOR`, and writes
  `solver/data/key.json`, the raw key in the shape of 7.1 (608,670 bytes, 65 nodes), through one
  write path (`render_key`, `write`); `best_response.tree_gains` is the same per-dealt-hand sum
  with its own chain, and the file's `exploitability_bb` comes from it. `solver/data/` holds the
  two generated files, `equity.json` and `key.json`, and nothing else.
- `app/src/gto/`: the GTO trainer's app side (board item 39, step 54). `key.ts` is the one reader of the
  solver's key (BD-T8): `gtoKey()` loads `data/key.json` on first read and checks it (`parseKey`: the
  schema string, the pinned `SPEC_HASH`, the 169 hands in order, the 65 nodes of `treeNodes()` with
  their actors and actions, one strategy, EV and `hand_reach` row per hand, rows summing to 1 within
  0.001, `reach` a probability, `totals` per action), throwing with the node and the fault named.
  `data/key.json` is a byte copy of `solver/data/key.json`. `key.test.ts` builds the tree a second
  way, loads the real file, breaks copies of it, checks the dials `tableSeats` and `stackBigBlinds`,
  pins the chart hands under `gtoChartMinOpen` (`PINNED_UNDER`), checks the byte copy and keeps every
  import of the JSON inside `key.ts`. The rest of the folder is item 40's (the hand engine).
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
- **Reanimated is native code since board item 26.** A development build made before it stops
  at launch. After pulling that change, rebuild (`bun run --cwd app ios`, and the Android
  command in Environment) on every simulator, emulator and phone.
- **The Metro transform cache is shared by every checkout on this Mac** (`$TMPDIR/metro-cache`).
  On 2026-10-05 the main checkout's `app/node_modules` held `react-native-worklets` 0.13.0 and
  `react-native-reanimated`, dated 2026-10-05 01:50 and listed in no `package.json`. A worktree's
  Metro then served code transformed with that 0.13.0 plugin, and the app stopped on "[Worklets]
  Mismatch between JavaScript code version and Worklets Babel plugin version (0.10.1 vs.
  0.13.0)". A Metro started with its own `TMPDIR` and `--clear` fixed it. When another Metro
  runs, start a second one that way, on its own port: `TMPDIR=<a scratch folder>/ bunx expo start
  --dev-client --port 8083 --clear` from `app/`, then `bunx expo run:ios --device <udid> --port
  8083`.
- **A tap from the simulator tool does not flip an `@expo/ui` `Switch` on the iOS simulator**
  (2026-10-05, board item 27, the iPhone 17 simulator): three taps on Haptics and one on Sound
  effects changed nothing on screen or in the stored value. A drag of the knob (`swipe` from one
  end of the switch to the other, 0.3 s) flips it, and the stored value follows.
- **A read-only emulator has no network.** When another checkout already runs an AVD, a second
  copy starts with `emulator -avd <name> -read-only -port <n>` (2026-10-05, `Pixel_9` on 5556 while
  another lane held it on 5560). In that copy `10.0.2.2` is unreachable (`ENETUNREACH`), so open
  the development build on `http://localhost:<port>` after `adb reverse tcp:<port> tcp:<port>`.
  An app installed in the AVD by another checkout may carry another native worklets version; this
  one had 0.13.0 and stopped on "[Worklets] Mismatch between C++ code version and JavaScript code
  version", so install this checkout's own build into the copy first.
- **A clean worktree can be removed by a merge session.** On 2026-10-05 about 12:49, while Zach
  merged `game-feel-2` into `main` (`4b592b9`), the worktrees of the merged lanes were removed,
  and with them lane F's new `.claude/worktrees/game-feel-3`, made from `game-feel-2` a few
  minutes earlier and not yet edited, so its branch looked merged. Nothing was lost. `git worktree
  remove` without `--force` refuses a worktree with changes, so the risk is the time before the
  first edit: check `git worktree list` before a long step until then (board item 28, step 32).

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

**28. Deal fresh hands in lessons 3 and 5 and in every boss (board item 22, unit stories phase
1).** Done 2026-10-05, on Opus 5.5, in the worktree `.claude/worktrees/lane-d-dealt-hands` on
branch `lane-d-dealt-hands`, not committed. The branch was made from local `main` at `b986f61`,
because `origin/main` is still at `5da0bca`, which holds no app. Decisions `US-1` to `US-3` of
`docs/incomplete/unit-stories/DESIGN.md` are built. The plan's step 1 found that `hands-2` stays
authored: each of its eight `hand-name` prompts defines one new hand before it asks about it
(`app/src/content/units/hands.ts:113`, `:122`, `:131`, `:140`, `:149`, `:158`, `:167`, `:184`),
so the order is meant and no question went to Zach. New `app/src/game/dealt-slots.ts`:
`withDealtSlots` (`:29-37`) replaces each exercise whose kind has a dealer with a fresh deal of
that kind in its own place; it draws a seed for every place, dealt or not, so a place's deal
depends only on the set seed and the place; and it gives a dealt slot an id of the shape
`dealSet` writes (`practice-<seed>-<place>-<kind>-<child seed>`). `isDealtId` (`:14-16`) tests the
`practice-` prefix (BD-S2), and `isDealtLesson` (`:22-24`) reads the new dial `dealtLessons`
(`app/src/config/dials.ts:46-49`, block `// unit-stories`). The lesson screen builds its session
once, inside the `useState` that already fixed the access, seeded by `clockSeed` of the opening
time, so a re-render never deals again (`app/src/screens/lesson-screen.tsx:50-53`, `:74-84`).
`bossAccess` runs `withDealtSlots` over the ten drawn exercises with the boss seed
(`app/src/components/boss/boss-session.ts:29`); `drawBoss` is unchanged. `recordAnswer` spends
the heart for a wrong dealt answer and leaves `missedExercises` alone
(`app/src/game/session.ts:27-36`). No stored shape changed, so `STATE_VERSION` stays 2.

Build-level calls, each reversible. (1) `DEALERS` in `app/src/drills/deal.ts:14` is now
exported, one word, because the plan passes that table and it was private to the file; the board
row did not list `drills/deal.ts`, no other open row names it, and the row now lists it. Reverse:
drop the `export` and build the table at the two call sites. (2) `boss-session.test.ts:31`
asserted that every boss id is one of the unit's fifty, which `US-1` ends; it now also accepts a
dealt id, with a comment saying when and why (R5). (3) A third new test file,
`app/src/components/boss/boss-dealt.test.ts`, holds the boss wiring (rule Q1). (4) The lesson
screen reads the clock once when it opens, where it read it twice before.

Tests: `dealt-slots.test.ts` (12), `dealt-missed.test.ts` (4) and `boss-dealt.test.ts` (3). They
include a computed-key check over 100 seeds of `hands-3` and `hands-5` (rule Q3), a check that no
authored id starts with `practice-`, and a check that every lesson in the dial exists. Three
mutants each fail a test: `recordAnswer` keeping a dealt miss, `bossAccess` without the deal, and
one seed for every place. The last one first passed every test, so the test "never deals one hand
into two slots of the same list" was added. Whole-repo gate from the worktree root, exit 0: run
lines 78, 18 and 6, typecheck, lint, 66 test files and 509 tests (63 and 490 before);
`git diff --stat -- assets/icons assets/mascots assets/sounds` is empty.

Seen running, on the iPhone Air simulator (iOS 26.5) and a `Pixel_9` emulator, each with the
existing development build and a Metro on port 8085 from the worktree: `hands-3` played twice on
each platform through the dev link `felto://lesson/hands-3?play=rrrrrrrrrr`, which answers
through the same choose, Check and Continue a tap uses. A screen recording gave one frame per
slot. On both platforms all eight drill slots show other cards in the second play, and slots 3
and 4 show the same two authored concept questions. The boss and the missed-list rule were not
walked on a device; their tests cover them. Device facts found: lanes D, E and F compete for
simulators and emulators, and another session shut down this session's first simulator (an
iPhone 17 Pro Max); a second instance of an AVD cannot start while one runs writable
(`-read-only` needs every instance read-only); an Android deep link sent without the package name
was ignored while the app ran, and `am start ... com.zachshort.felto` delivered it; the disk had
3.6 GiB free at the end of the session (`df -h /Users`, 2026-10-05).

Not done, and why. No fold of this ledger or the board, which `/close-out` asks for: lanes E and F
edit both files in their own worktrees at the same time, and a fold in one lane would conflict
with both; fold after the three lanes merge. The Environment test counts and `CLAUDE.md` still say
63 files and 490 tests; each names the run it came from, lanes E and F change the count too, and
item 25 reconciles them.

Runtime entries (`PLAN.md` section 7, the phase 1 rows): a replayed drill lesson shows new cards
(Learn, unit 1, lesson 3 "Name that hand", twice, iOS and Android: the eight hand slots differ,
the two concept slots are the same; seen 2026-10-05 as above); the boss no longer repeats hands
(unit 1 boss after its lessons, twice: the drill slots show cards not seen in a lesson, concept
questions may repeat; not seen); a dealt miss does not enter the review (a wrong dealt answer in
lesson 3, finish, open the unit 1 review: that hand is not listed; not seen); the kickers lesson is
unchanged (unit 1, lesson 4: the same six showdowns as before; not seen).
**Left owed:** the commit, which is Zach's, in the worktree; then the merge of
`lane-d-dealt-hands` into `main`, where the `// unit-stories` block of `dials.ts` meets lane E's
block of the same name and keeps both.

**29. Reanimated, the motion module, tokens and the primary button (board item 26, game-feel
phase 1).** Done 2026-10-05, on branch `game-feel-1` in `.claude/worktrees/game-feel-1`, made
from local `main` at `b986f61`, on Opus 5.5; not committed. Step 28 is lane D's (board item 22,
in its own worktree, by its message to this session on 2026-10-05), so this worktree's log goes
from 27 to 29 until the branches merge. `bunx expo install` pinned `react-native-reanimated`
4.5.1 and `react-native-worklets` 0.10.1; Expo's Babel preset adds the worklets plugin, so there is
no `babel.config.js` (BD-G9). `app/src/motion/` wraps Reanimated (BD-G3) and holds
`useReducedMotion` (BD-G4), `motionAllowed` over the new dial `reducedMotionSkips` (`GF-8`; the
press and fades stay), the pure `motion-steps.ts`, `usePressScale`, `useBounce`, `useFadeIn` and
`MotionView`; a new test fails if any file outside the folder imports Reanimated or worklets, and
a planted import made it fail (BD-G13). `app/src/config/dials.ts` has a `// game-feel` block after
the `D15` block (BD-G14) with the motion values of `PLAN.md` section 3 plus `fadeMs`,
`pressReleaseMs` and `pressReleaseDamping`. `app/src/theme/tokens.ts` has the button's face, edge
and label, its disabled three, four unit colours and four moment colours, light and dark, each
copied from a chip of `tools/build_icons.py:35-40`, `:250` or `:251` (a script checked all 27
colour citations in the file: none wrong); `BUTTON_HEIGHT` is 52. `PrimaryButton`
(`app/src/components/button/primary-button.tsx`) draws Check and Continue in the lesson loop and
the feedback sheet's Continue (BD-G12); its label is `TYPE.heading` so white on blue passes as
large text (BD-G11); `pressHaptic` and `pressSound` props wait for phases 2 and 3. The other 12
`LessonButton` uses stay native (BD-G7). The double-press guards of `session-steps.ts` were not
touched, and their tests pass unchanged. Registry entry Z5 in `docs/conventions-typescript.md`
(1.1.1); a "built" pointer under `D2` in `docs/incomplete/app/DESIGN.md`; `As built` notes under
`GF-1` and `GF-2`; BD-G8 to BD-G14 and phase 1's `BUILT` header in the game-feel `PLAN.md`.
Gate: exit 0, run lines 78, 18 and 6, 66 test files and 506 tests (16 new);
`git diff --stat -- assets/icons assets/mascots assets/sounds` empty. **Seen running** on the
iPhone 17 simulator (iOS 26.5) and the `Pixel_9` emulator, light and dark: the disabled, resting
and held Check, the sheet's Continue at rest and held, one answer counted per press. **Not
felt**: no one has pressed it on a phone. Found and handled: the shared Metro cache served code
built by the main checkout's stray worklets 0.13.0 (Known facts); a Metro with its own `TMPDIR`
fixed it. Findings, each `open`: (a) on the `Pixel_9`, during the first run under a load
average of 77, Check was once drawn sunk after the lesson moved on and stayed sunk when enabled;
four more tries with logging did not repeat it (the events came in order each time), so
`usePressScale` now puts the button back at rest with a zero-length animation on every change of
`disabled`, and the cause is unknown; (b) on Android the sheet's Continue sits about 14 dp above
the gesture bar (phase 4 reworks the sheet); (c) `useBounce` and `useFadeIn` have never run,
because no screen uses them yet; (d) `primary-button.tsx` adds one more raw `fontWeight` (rule
U5 Known gaps; the dated count of 45 is left as written); (e) the Environment test row here and
the counts in `CLAUDE.md` still say 63 files and 490 tests, left for the merge because lanes D and
E change the same lines; (f) the main checkout's `app/node_modules` holds worklets 0.13.0 and
Reanimated outside any manifest: after merging, run `bun install --cwd app --frozen-lockfile` in
the main checkout and restart its Metro with `--clear`; (g) free disk was 4.1 GiB at 11:15 with
three worktrees building native apps. Simulators: lanes now keep to their own devices (this lane:
the iPhone 17 simulator, `Pixel_9` on `emulator-5556`, Metro on 8083), after an emulator of this
lane stopped at 11:10 when another lane started one. **Left owed:** Zach rebuilds his phone's
development build and presses Check and Continue; the commit, which is Zach's.

Runtime entries (game-feel `PLAN.md` section 7, phase 1):

| Goal | Where | Right answer |
|---|---|---|
| The new button feels right | Any lesson on the iPhone, after a rebuild from branch `game-feel-1`: Check, then the sheet's Continue | Each sinks while held and springs back on release; one press counts one answer; no buzz or sound of its own yet |
| The build runs with Reanimated | The iPhone, the first launch after the rebuild | The app opens; no "[Worklets] Mismatch" screen |
| A disabled Check reads as off | A lesson before an answer is picked, light and dark | A grey face on a darker grey edge, with a readable label |
| The button never stays sunk | Android, a whole lesson | After each Continue, Check sits at rest with its edge showing (finding (a)) |

**30. The haptic vocabulary, the Haptics switch and stored version 3 (board item 27, game-feel
phase 2).** Done 2026-10-05, on branch `game-feel-2` in `.claude/worktrees/game-feel-2`, made from
`game-feel-1` at `888b370` because item 26 is not yet merged into `main`, on Opus 5.5; not
committed. Step 28 is lane D's and step 29 is item 26; this session told the sessions of lanes D and
E by message that lane F takes 30. `STATE_VERSION` is 3 (`app/src/storage/migrations.ts:6`): settings
gain `haptics`, on for a new player (`app/src/game/player-state.ts`) and checked as a boolean
(`app/src/storage/check-state.ts`); the step from 2 writes `haptics: true`, keeps every other field,
and passes a value that is not a version 2 player on unchanged, so the load backs it up. The
old-save test is "loads a stored version 2 player with every field kept, extra ones too, and Haptics
on" in `app/src/storage/haptics-migration.test.ts`; the same file backs up three bad version 2 values
and refuses a version 3 player whose `haptics` is not a boolean. `setHaptics` is in
`app/src/game/settings.ts` and `player-actions.ts` (`haptics-actions.test.ts`). The vocabulary is
`app/src/feedback/haptics.ts`, reached through `useHaptics()` (BD-G17), and the rule `shouldBuzz` is in
`should-buzz.ts` (BD-G15). The six answer and ending moments buzz only while the switch is on
(`moments.ts`; 13 tests in `moment-haptics.test.ts`). The four `PrimaryButton`s of the lesson loop give
the dial `pressHaptic`, a light impact, as the finger goes down (BD-G18). Zach chose the words in chat
on 2026-10-05 from four offered (warm, plain, terse, and the prompt's warm line as written): the label
"Haptics" and the help line "Little taps as you answer and press.", which opens the Settings footer
above the reminder line (BD-G16). Three existing tests changed with the shape, each where an old value
was pinned: `migrations.test.ts` lost its "is version 2" test (the new file pins 3) and its version 1
load now expects `haptics: true`; `profile-actions.test.ts` expects `haptics: true` in the settings;
`moments.test.ts` passes `haptics: true`. Four planted faults each failed their tests (the step drops
`haptics`; the step resets the other settings; the moments ignore the switch; the check ignores
`haptics`), and each file was restored with `cp` and compared with `cmp`. Gate: exit 0, run lines 78,
18 and 6, 70 test files and 531 tests (25 new); `git diff --stat -- assets/icons assets/mascots
assets/sounds` empty. **Seen running** on the iPhone 17 simulator (iOS 26.5, the development build of
item 26, JavaScript from this branch) and on a read-only copy of `Pixel_9` on `emulator-5556` (this
branch's own Android build, installed 12:22): Profile with the switch on and off, light and dark, and
one right answer, the sheet and its Continue on each. The iPhone's own save, left by item 26 as
version 2, loaded with its streak, XP, hearts and gems and was stored again as version 3 with
`haptics: true` and no backup key (read with `sqlite3` from the app's `ExpoSQLiteStorage`). The
emulator's save, left by another checkout's build, is now version 3 with XP 540 and `haptics: true`;
its one backup key dates from 06:32, an earlier reset, and its value before the load was not read.
Turning the switch off stored `haptics: false` and left Sound as it was, on both platforms. **Not
felt**: a simulator has no haptics, and no one has held a phone with this build. Findings, each
`open`: (a) step 29's finding (a) also on iOS: in a shot taken right after Check, the disabled Check
was drawn sunk until the sheet covered it; the next question's Check was at rest; whether the press
haptic plays a part was not tested; (b) `expo-haptics` is imported in two files, `haptics.ts` and
`use-answer-feedback.ts`; phase 4, which moves the wrong answer to the rigid tap, can route the six
moments through the vocabulary and leave one importer; (c) `shouldBuzz` is `return setting`: it is the
one named rule, and the moment tests carry the weight; (d) the test counts in Environment and
`CLAUDE.md` still say 63 files and 490 tests (step 29's (e)); (e) the `Pixel_9` AVD held a build from
another checkout with worklets 0.13.0 native code (installed 2026-10-05 11:44), and the simulator
tool's tap does not flip an `@expo/ui` `Switch` (both in Known facts); (f) this worktree's
`app/android` holds about 1.4 GB of build output (gitignored); free disk ran between 4.0 and 7.0 GiB
during the build with three checkouts building. **Left owed:** Zach turns Haptics off on his phone and
confirms that no buzz is left, then on, and feels the press tap; the commit, which is Zach's.

Runtime entries (game-feel `PLAN.md` section 7, phase 2):

| Goal | Where | Right answer |
|---|---|---|
| The Haptics switch silences everything | The iPhone, after a rebuild from branch `game-feel-2` (or a reload, if the build has item 26): Profile, Haptics off, then a lesson | No buzz on Check, Continue, a right or wrong answer, a finish, a boss end or a chest; Sound still plays |
| The press gives a tap | Haptics on, any lesson: Check, then the sheet's Continue | One light tap as the finger goes down, then the success or error buzz after Check |
| An old save keeps its progress | Install the new build over the old one | Streak, XP, finished lessons, Sound and the reminder are unchanged; Haptics is on |
| The words read right | Profile, Settings, light and dark | "Haptics" under "Sound effects"; the footer opens with "Little taps as you answer and press." |

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

**32. Six sound effects from the generator, and the press sound (board item 28, game-feel phase
3).** Done 2026-10-05, on branch `game-feel-3` in `.claude/worktrees/game-feel-3`, made from `main`
at `4b592b9` after Zach merged `game-feel-2`, on Opus 5.5; not committed. Step 28 is lane D's, step
31 lane E's item 23 (merged into `main` as `06cea5a`), and step 33 lane E's item 24, by its message
to this session the same day. Zach chose in chat on 2026-10-05, through the question tool: the
plan's default six (tap, option select, heart lost, XP tick, reward claim, sparkle) and the feel
line offered for each (quoted in the `As built` note under `GF-5`). `tools/build_sounds.py` has six
new effect functions (`:165-205`), the pitches G3 and E7, the partial tables `HOLLOW` (odd partials,
for "hollow") and `PURE`, the ceilings `CEILING` (one second, `D15`) and `SHORT_CEILING` (0.6 s,
`GF-5`) over the names in `SHORT` (`:60-66`), and `checked()` (`:235-242`), which stops the run when
an effect is over its ceiling (game-feel `PLAN.md` BD-G19). The six old effect functions and the
synth helpers are byte for byte as at `HEAD` (compared with `ast`); only `main()` changed, to call
`checked()`. Run line: 12. A separate `wave` script measured each new file: 16-bit mono at 44,100
Hz, a zero sample at both ends, sound ending at 0.030 s (`xp_tick`) to 0.480 s (`reward_claim`) in
files of 0.035 s to 0.5 s, peaks 0.3 to 0.55 as the docstring says, and a strongest frequency near
the start that matches the docstring's first note (`tap` 302 Hz inside its E4 to C4 glide,
`option_select` 1318, `heart_lost` 258, `xp_tick` 1568, `reward_claim` 1046, `sparkle` 2638). The
twelve `shasum`s were the same over two runs, the second under `PYTHONHASHSEED=7`. A planted 0.65 s
`tap` stopped the generator with exit 1 ("tap runs 0.650 s, over its ceiling of 0.6 s"); the file
was restored with `cp` and compared with `cmp`. In the app the six are registered in
`app/src/art/sounds.ts` (`Effect`, `SOUND_SOURCES`); `effects.ts` did not change and now makes
twelve players. The press sound is the dial `pressSound: "tap"`, played through `useSound()`
(`app/src/feedback/use-sound.ts`) and the pure `playThrough` (`sound-switch.ts`, three tests in
`sound-switch.test.ts`), passed beside `pressHaptic` by the four `PrimaryButton`s of the lesson loop
(BD-G20). Two planted faults failed the gate: `playThrough` ignoring the switch failed "plays nothing
with Sound off", and a dial of `"tapp"` failed the typecheck at both call sites; both files were
restored with `cp` and `cmp`. Records: the counts in `CLAUDE.md` (directory map; the run-line note,
which now names the ceilings) and in the code map here; the moved generator citations in `CLAUDE.md`
and `docs/conventions-python.md` (1.2.1: M1, G3, W1, W2 with its count, H2, Y4, the scope sentence;
the version also in `docs/README.md` and the code map here);
BD-G19, BD-G20 and phase 3's `BUILT` header in the game-feel `PLAN.md`; `As built` under `GF-5`; a
"Built" line under the `D15` amendment in `docs/incomplete/app/DESIGN.md`; board row 28 `DONE`, row
29 `OPEN` with its prompt; a Known fact on the removed worktree. Gate: exit 0, run lines 78, 18 and
12, 71 test files and 534 tests (3 new); `git diff --stat -- assets/icons assets/mascots
assets/sounds` empty, and `git status` lists the six new WAV files as untracked. **Seen running** on
the iPhone 17 simulator (iOS 26.5, item 26's development build, JavaScript from this branch through a
Metro on port 8083 with its own `TMPDIR`) and on a read-only copy of `Pixel_9` on `emulator-5556`
(this branch's own Android build, installed 13:25): Metro bundled all twelve sound imports for each
platform, and on each an option was chosen, Check pressed (one answer counted, the sheet rose) and
the sheet's Continue pressed (the next exercise, Check at rest), with no error in the Metro log or
the Android log. **Heard by Zach** on the Mac with `afplay`, 2026-10-05: the six new sounds
(`tap` four times) and all six old ones, `answer_right` to `chest_open`. His verdict,
in chat: "theyre fine ill update them later". So the six stand as built, and a change to any of
them is his later item; `tap` stays as built (four test copies of it, louder, higher and longer,
were written to the session's scratch folder and none was chosen). Not heard on a phone. Findings,
each `open`: (a) `soundEffects: 6` in the `D15` block of `app/src/config/dials.ts:29` is now wrong
and still read by no code; the block is outside this item's; (b) the Environment rows here still say
6 sounds and run lines 78, 18 and 6, and 63 test files and 490 tests (step 29's (e)), left for the
merge with lanes D and E; (c) `docs/conventions-typescript.md` cites lines that items 27 and 28
moved: Z5 cites `lesson-run-view.tsx:65-69` and `feedback-sheet.tsx:49` (now `:74-84` and `:54-59`),
and O2 cites `lesson-run-view.tsx:43` (now `:46`); (d) step 14's `tools/build_sounds.py:6` at 101
characters is unchanged; (e) on iOS the first tap on a choice row through the simulator tool chose
nothing, and a second tap with a 0.15 s hold chose it; the cause is unknown; (f) the read-only
`Pixel_9` started at 12:50 was killed (exit 137) while Gradle built, together with another session's
`Medium_Phone_API_36`; the cause is unknown, and a second copy ran the check. **Left owed:** Zach presses
Check on his phone after a reload and hears the tap; the commit, which is Zach's.

Runtime entries (game-feel `PLAN.md` section 7, phase 3):

| Goal | Where | Right answer |
|---|---|---|
| Each new sound is liked | On the Mac: `afplay assets/sounds/<name>.wav` for `tap`, `option_select`, `heart_lost`, `xp_tick`, `reward_claim`, `sparkle` | Each matches its feel line in the `GF-5` `As built` note; Zach approves each or names a change. Walked 2026-10-05 on the Mac: "theyre fine ill update them later" |
| The old six did not change | On the Mac: `afplay` each of `answer_right`, `answer_wrong`, `lesson_finish`, `boss_pass`, `boss_fail`, `chest_open` | Each sounds as it did before 2026-10-05 |
| A press makes a tap | The iPhone, on a development build made after item 26 (Reanimated), with the JavaScript reloaded from branch `game-feel-3` (this item adds no native code), Sound on, ringer on, any lesson: choose an option, press Check, then the sheet's Continue | A short soft knock as the finger goes down on each, with the light buzz, then the answer sound after Check |
| Sound off silences the press | Profile, Sound effects off, then a lesson | No tap on Check or Continue; the buzz stays while Haptics is on |
| The silent switch silences the press | The iPhone's ringer switch on silent, Sound on, a lesson | No tap, as for the other effects (`D15`) |

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

**34. A Rive rig of Flop, as a spike (board item 34, Phase A).** Done 2026-10-05, on Opus 5.5, on
`main` with no repo file changed except this step and board item 34. Zach asked for Flop to swim
around frantically on a perfect lesson and for a spike to settle whether an agent can rig Rive.
Settled, with sources: `rive doctor` (CLI 1.3.0 at `~/.rive/bin/rive`, not on PATH) passes except
the login, which only `--publish`, `--rev` and `push` need; RML has animations and state machines
(inputs deprecated, `~/.rive/versions/1.3.0/docs/state-machines.md:11-20`) and cannot import SVG
(`docs/assets.md:236-246`). Zach chose to rig in the Rive editor through the MCP and opened a new
file (id 2632317). The MCP imported `assets/mascots/fish/fish_happy.svg` with its named groups; a
render matched the Quick Look render of the SVG. Built: pivots at the tail and fin roots; the shadow
regrouped by part and moved out of the fish into its own group, keyed as a cast shadow on the page
at Zach's ask (it follows the fish, moves farther and fades on a lift, flips on a turn, and the
round body counter-flips so its lighting matches); `idle` (2.4 s) and `frantic` (1.6 s) timelines,
looped; the state machine `flop` with the view-model boolean `perfect`, whose two transitions the
editor's simulation confirmed. `.riv` export works on Zach's plan (27,939 bytes, in the session's
scratch folder); `.rev` export is refused by the plan, so the Rive file in his account is the only
editable source. The editor is sandboxed: uploads and exports go through the MCP over HTTP at
`127.0.0.1:9791`. Stills of the rest pose, idle at frame 72 and frantic at frames 12 and 38 were
looked at; the motion itself has not been seen by anyone. Board item 34 holds every id, pivot and
key. Findings, each `open`: the fins and tail mirror their small dark edge while Flop faces right;
the body's shadow is faint at full lift; `GF-1` needs a dated amendment (Zach changed who rigs);
`tools/__pycache__/` appeared untracked during this session and this session ran nothing in
`tools/`. **Left owed:** Zach watches the rig in the editor; Phase B (the runtime, the component,
the finish screen) waits on his yes, on Sonnet 5 by his choice; the commit, which is Zach's.

**35. Close out the unit-stories effort (board item 25, unit stories phase 4).** Done 2026-10-05 by `/delegate`. Builder: Sonnet 5.5, worktree `.claude/worktrees/agent-a08caf636b476a4a7`, branch `worktree-agent-a08caf636b476a4a7`, from `main` at `0658776` (lanes D and E merged). Auditor: Opus 5.5 in its own worktree, which reproduced the change exactly (`diff -rq` of the trees found only the four files) and re-ran the gate. Not yet committed. No relay passes. Records only: `docs/README.md` (the unit-stories PLAN row: BD-S1 to BD-S13, phases 1 to 3 built and merged), `docs/incomplete/app/DESIGN.md` (dated pointers under D8 and D9; the D8 `As built` of step 28 was checked against the code and is accurate), `docs/incomplete/unit-stories/PLAN.md` (status and phase headers with commits 810cc25, aed7054 and 1148b43 and merges 0658776, 06cea5a and 21338ca; phase 4 header; section 5 numbers; section 7 gathered, each entry seen or `open`; steps 31 and 33 findings carried) and `docs/incomplete/unit-stories/DESIGN.md` (an `As built` note under US-8). The whole-repo gate ran twice, once by each model, each step alone: exit 0, run lines 78, 18 and 12, 82 test files and 608 tests (step 33 had 70 and 538 before the game-feel and other merges); `git diff --stat -- assets/icons assets/mascots assets/sounds` empty. `CLAUDE.md` still says 63 files and 490 tests: Zach chose in chat on 2026-10-05 to leave it to game-feel item 33. Nothing was seen running; no simulator was driven. The folder stays in `docs/incomplete/` until Zach has walked PLAN.md section 7. Audit verdict: non-blocking findings, each `open`: (a) PLAN.md:243, the "story opens and closes" row says Android was seen in light and dark, but step 31 lists the Android dark last slide as open: add that to the cell; (b) PLAN.md:180 records the worktree build without saying it departs from the prompt's "no worktree"; (c) PLAN.md:268-269 cites Zach's answer on `CLAUDE.md`, which is now recorded here. Also `open`: `docs/README.md` has a stale "13 files" header and no game-feel rows (item 33); Zach's calls on step 33 (c) (slide 2 says the hole cards are face down, its row draws them face up) and (d) ("fun!" alone on the last line). **Left owed:** the walk of section 7, then archiving; the commit, which is Zach's, from the builder's worktree.

**36. The rigged Flop in the app, built but not wired to the finish screen (board item 34, Phase B).**
Done 2026-10-05, on Sonnet 5.5, in the worktree `../felto-lane-g` on branch `lane-g-flop-rive`.
Zach answered the batch of item 34 the same day: the rig is good as it is, Phase B goes ahead in a
worktree, everything is built except the `lesson-finish.tsx` edit (item 29 owns that file and is
still `OPEN`), and `CLAUDE.md` gets a rule for `flop.riv`. `flop.riv` was re-exported from file
2632317 and is byte-identical to step 34's (`cmp`, 27,939 bytes), so the rig did not change.
Runtime chosen with Context7 on 2026-10-05: `rive-react-native` 9.8.5, not the Nitro
`@rive-app/react-native` 0.5.2 (0.x, pins `react-native-nitro-modules` to `>=0.35.10 <0.37`). Its
ref sets a view-model boolean on a bound instance (`setBoolean`, `useRiveBoolean`, `AutoBind(true)`,
`node_modules/rive-react-native/ios/RiveReactNativeView.swift:727`), so the `StateMachineBool`
fallback was not needed. Built: `app/assets/rive/flop.riv`; `app/src/art/flop-rive.tsx`
(`FlopRive`, the only importer of the runtime and the file); `app/src/art/flop-mode.ts` with its
test (the pure choice between the rig and the static `happy` pose through `Mascot`, and the
artboard height); `app/src/art/rive-boundary.test.ts` (fails the gate when a file outside
`src/art/` imports the runtime or `@rive/`); `app/src/types/rive.d.ts`; the alias `@rive/*` in
`app/tsconfig.json` and `riv` in the asset extensions of `app/metro.config.js`; the dial
`flopPerfectDelayMs` (300) and the new reduced-motion kind `swim` in `app/src/config/dials.ts`
(`reduced-motion.test.ts` lists it); a "Flop: swim" button and the rig on `/dev/art`
(`app/src/screens/dev-art-screen.tsx`). Recorded: the dated amendment under `GF-1` in
`docs/incomplete/game-feel/DESIGN.md`, the `flop.riv` rule in `CLAUDE.md`, and standard 1.1.2 (rule
U6 and entry Z4 cover the Rive file). Gate, run 2026-10-05 in the worktree: the generators wrote 78,
18 and 12 files, `xmllint`, typecheck and lint exit 0, 84 test files and 615 tests passed,
`git diff --stat -- assets/icons assets/mascots assets/sounds` empty. Both development builds
compiled with the new native library (iOS on iPhone 17 Pro, Android `BUILD SUCCESSFUL` in 3m 33s)
and `/dev/art` drew the rig on each. **Seen running, by frame comparison, not watched:** on both
platforms the idle loop changes between screenshots 0.3 s apart inside the Flop box only, and with
`perfect` true the fish is at different places, tilted and turned to face left across four frames
(iOS), and on Android a tap on "Flop: swim" flipped the label to "Flop: rest" and moved the fish
across the frames. Nobody has judged the motion or the timing; that is Zach's. **Not done, and
why:** the wiring of `lesson-finish.tsx`, which waits on item 29; the real phone, which needs the
same rebuild (`felto phone-debug`). A first load of the dev client after a cold start timed out
once on iOS (the bundle took longer than the client waits) and loaded on the retry; this is Metro
and not the rig. **Left owed:** wiring on the finish screen for a perfect score only, with the
static pose otherwise (item 34 step 5); Zach commits the branch.

**37. The answer loop: choice, check, sheet and progress bar (board item 29, game-feel phase 4).** Done 2026-10-05 by `/delegate`. Builder: Opus 5.5, worktree `.claude/worktrees/agent-a7d2fdad825b95d3e`, branch `worktree-agent-a7d2fdad825b95d3e`, from `main` at `0658776`. Auditor: Opus 5.5 in its own worktree, which reproduced the change (`diff -rq` found only the generated, gitignored `expo-env.d.ts`) and re-ran the gate. Not yet committed. No relay passes. Zach answered the item's two questions in chat on 2026-10-05: the feedback sheet and the progress bar become custom views of the tokens (a dated amendment of `D2` under `GF-2`, registry entry Z6, `docs/conventions-typescript.md` 1.1.2), because he wants every button and toggle to carry the app's tokens and finds the native `@expo/ui` controls do not match the native look; a chosen row takes its unit's colour in a one-unit session and the neutral `accent` in a practice set or the placement check. Built: the selection tick and `option_select`; the chosen row lifts and takes its colour (`session-colour.ts`); a right answer bounces and flashes the row and the sheet's mascot bounces; a wrong answer shakes the row (an inner view, so the tap target stays still), tilts the mascot, drops the header heart and plays `heart_lost` where a heart is spent; all six moments go through the haptic vocabulary, so `haptics.ts` is the one importer of `expo-haptics`; a custom sheet (a `LessonFrame` overlay on a spring, safe-area padding, modal and focus handling for screen readers) and one progress-bar file in place of the platform pair; reduced motion skips bounce, shake, tilt and the drop and keeps colour, flash, lift, rise and fill. Build calls: BD-G21 to BD-G30. Gate, run by both models: exit 0, run lines 78, 18 and 12, 84 test files and 621 tests (13 new); assets diff empty; the three guard tests unchanged. **Seen running** on the iPhone 17 simulator, light and dark: chosen, right and wrong with the sheet (the builder's screenshots; the auditor did not see them). **Not seen:** every Android state, the gesture-bar fix, Reduce Motion, the screen reader (the Android emulator drew black). **Not felt. Not heard.** Audit verdict: non-blocking findings, each `open`: (N1) `onFeedback` (`use-lesson-run.ts:62-63`) is read by no code and could be removed, and `sheetDismissAction` is read only by its test; (N2) stale comments in `session-steps.ts:38-39,59-62` about a swipe and the native sheet; (N3) BD-G26: `accent` and `unitHands` are both `#2F7BF0` in light mode, so a practice set looks like unit 1; (N4) stale citations and a missing period in the conventions Z5 and Z6 rows (lines 618 and 619) and U3's example names deleted files; (N5) finding (a), Check drawn sunk, was not reproduced and has no status in the phase 4 record; (N6) turning Reduce Motion off while a row is marked plays its motion once more. Open calls for Zach: BD-G25 (a boss fail now gives the rigid tap, not the error buzz; it is item 30's moment), BD-G24 (the sheet closes only by Continue) and BD-G26 (a separate neutral token?). **Native controls left, for one follow-up item:** `LessonButton` (`lesson-button.tsx:16-17`) and its 14 call sites in `screens/`, `story-button.tsx`, `route-error.tsx`, `freeze-shop-section.tsx`, `out-of-lives-sheet.tsx` (a `BottomSheet` and two buttons), the four Profile switches (`settings-section.tsx:36-39`), the reminder pickers, the `FieldGroup` and `ListItem` form, `NativeTabs` and two `Alert.alert` calls. **Left owed:** the Android checks, Zach on his phone, and the commit; item 30's prompt, which the builder wrote into its report and which is not yet in `PASSOFF.md`.

**38. A one-page site that points at the App Store, deployed to Cloudflare (no board item).** Done 2026-10-05 on Sonnet 5.5, at Zach's request in chat. Not yet committed. Zach chose: the button reads "Coming soon to the App Store" and is disabled until a listing exists (`D13` keeps the store release out, so the site is not the release); the site lives in `site/` in this repo; plain copy ("Learn poker, one short lesson at a time."); deployed on Cloudflare. Built `site/` (Astro 7.3.5, static, `bun`): one page of hero, five features, the four units with their lessons, the cast and a closing button. Colours, spacing, radius and button height come from `app/src/theme/tokens.ts` at build time, light and dark by `prefers-color-scheme`; art is read from `assets/` and nothing is copied (`D5`); the favicon is the generated red chip served by `src/pages/favicon.svg.ts`. `typescript` is pinned to `~6.0.3` because `astro check` refuses TypeScript 7. **Gates, run 2026-10-05:** `bun run typecheck` (0 errors) and `bun run build` in `site/`, exit 0. Not added to `scripts/gate.sh`, `CLAUDE.md` or `gateCommand`: that is an owed call. **Seen running** in the browser pane on the built site: desktop dark (hero, features, cast, closing) and phone width light (hero; `scrollWidth` 375, no sideways scroll). **Not seen:** desktop light, phone dark, the units section in light, Safari, a real phone. **Deployed:** `bunx wrangler deploy` from `site/` to Worker `felto-site` in the Cloudflare account `Zms@ezhomesteading.com's Account` (id `29c95ba6869e6c4cf5e070ff6979b795`), live at `https://felto-site.zms-29c.workers.dev` (HTTP 200, title and button text confirmed with `curl`). **Open, Zach's calls:** (a) the domain: none bought, none attached; `SITE_URL` in `site/src/config.ts` is empty until it is (canonical link). (b) `APP_STORE_URL` in `site/src/config.ts` is empty until the app has a listing. (c) Whether to add the site build to the whole-repo gate and `CLAUDE.md`. (d) The account above is the one the wrangler login holds, and its name suggests another project of Zach's; confirm it is the one he wants. (e) Copy checked only against `D10` (warm voice) and the app's own claims (no account, device-only progress, no real money); the age-rating questionnaire (`DESIGN.md` hazard 2) is not mentioned on the page. **Left owed:** the commit, which is Zach's.

**39. Scope the second game-feel pass, chest references, and start items 46 to 48 (no board item).** Done 2026-10-05 on Opus 5.5, at Zach's request in chat ("improve the ui. more resemble duolingo...", then three more messages the same session; `docs/incomplete/game-feel/DESIGN.md` 9.1 quotes all four). Read the 13 photos (`~/Downloads/IMG_2859.HEIC` to `IMG_2872.HEIC`, converted with `sips`); the new one, 2872, is a friend asking that the app say it is proud of you. Found the ask mostly inside board items 30 to 32 (game-feel phases 5 to 7, rows with no prompts) plus new work. Generated six chest references with Higgsfield (`gpt_image_2_5`, quality high, the chosen "extruded flat" style image as the reference; 1,019.5 credits before the first batch), saved as received in the new folder `assets/higgsfield-chest/`; `CLAUDE.md` gained the folder in its first rule and its directory map. Zach answered five asks in chat (`DESIGN.md` 9.3): four chest tiers (wood, blue, red, gold), each chest's tier fixed by a seeded draw before it opens and revealed over at least three taps; mascots that talk in lessons, on finish screens and on the path; all twelve sounds as chimes; every native control custom, the tab bar too. Recorded as `GF-10` to `GF-19` in `DESIGN.md` section 9. `GF-13` amends `D6` and `D8` under a written condition: it must be reopened before anything that leads to gems or chests can be bought, because the loot-box hazard (app `DESIGN.md:204-205`) is defined by purchase. `GF-15` adds Lottie for effects from a generator; rolling numbers stay Reanimated, because a Lottie file cannot show an arbitrary number. Checked that `app/assets/fonts/FeltoRank.ttf` covers every ASCII letter and digit (`fc-query`), so 3D text needs no new font. Wrote the briefs of items 46 (the game kit), 47 (chimes) and 48 (chest tiers art) and started each with an Opus 5.5 builder subagent in its own worktree; a fourth Opus subagent writes the board rows 46 to 57, the widened prompts of 30 to 32 and `PLAN.md` section 8 in the main checkout. **Not seen:** the app was not run this session; no screenshot of the current screens was taken. **Left owed:** the builders' and the board writer's reports, recorded as later steps; the commit, which is Zach's.

**40. Twelve sounds re-voiced as chimes in C major (board item 47, `GF-14`).** Done 2026-10-05 by an Opus 5.5 builder subagent of the session of step 39, in worktree `.claude/worktrees/agent-a43d507c710a61f30`, branch `worktree-agent-a43d507c710a61f30`, made from `052de2f` (one commit behind `main` at `a339d53`, which touched only the GTO scope). Committed by Zach on that branch as `e1d98cd`, 2026-10-05; not yet merged. The disk filled during the run (step 39's session stopped every agent and Zach freed space); the builder found no damage on resume (WAV sizes, `shasum`s, `bun install` "no changes"). Changed: `tools/build_sounds.py` (a `CHIME` voice of partials 1, 2.005, 3.02 and 4.1 with faster upper decay, an 8 ms attack, an exponential decay and a 60 ms fade to zero; a softer `SOFT` voice; shimmers as two copies 6 Hz apart; every note in C major; `tap` a 45 ms C4 tone with seeded noise through a resonator at C6), the twelve WAVs, `docs/conventions-python.md` 1.2.2 (moved citations), `docs/README.md` and two citations in `CLAUDE.md`. Dominant frequencies fell, for example `answer_right` C6 to E5, `chest_open` G6 to C6, `sparkle` E7 to E6, `option_select` E6 to G5; lengths stay under 1 s (`D15`) and 0.6 s (`GF-5`); peaks 0.30 to 0.60; the low tones (`answer_wrong` E4 to C4, `heart_lost` C4 to A3, `boss_fail` to A3) are quieter than the chimes by peak and RMS. Two runs give the same `shasum` for all twelve. Gate, from the CLAUDE.md command in the worktree: exit 0, run lines 78, 18 and 12, 86 test files and 629 tests; `git diff --stat` of the assets shows only the twelve WAVs. **Heard:** Zach played all twelve on the Mac with `afplay` from the worktree on 2026-10-05 and answered "sounds good". Not yet heard on a phone, where the low tones of 220 to 330 Hz may be weak. **Open:** `PLAN.md` BD-G19 cites `build_sounds.py:60-66` and `:235-242`, now `:81-83` and `:282-289` (a frozen row, left as written); docs edits in the worktree (`CLAUDE.md`, `docs/README.md`, `docs/conventions-python.md`) will meet edits in `main` by this session and the GTO session at merge. **Left owed:** a listen on the phone, and the commit, from the worktree.

**53. The full tree solved, convergence per dealt hand, the raw key file and the solver tests in the gate (board item 38, GTO trainer phase 3b).** Done 2026-10-06 on Fable 5.1 (the item's model, checked first), in worktree `.claude/worktrees/gto-equity`, branch `gto-equity`, after step 52's commit `9b66e65`, on top of item 37's uncommitted remainder (`solver/config.py`, `solver/cfr_test.py`, the four documents). Not yet committed. This step is 53 because this branch's last step is 52 and the main checkout's last is 50 (step 50, open (a): steps 46 and 50 collide at merge). **Built.** `solver/cfr.py`: `solve_tree(game, E, W, iterations, report)` solves the five opener subtrees in seat order through the unchanged `solve`, and `chained` puts every number per dealt hand: a subtree's reach is the product of the range-average fold rates of the seats before its opener at their open nodes under the plain deal (`fold_rate`, `KEY-SPEC.md` 3.3), `scaled` multiplies each node's `reach` and `hand_reach` by it, and `tally` adds the subtree's best-response gains times it to each seat's total at each reported count; an EV does not scale, because it is conditional on the hand reaching the node and the folded seats' hands are not dealt. Seven band rows joined `BANDS` (26 rows: the 19 of step 50 plus `UTG` opens, `HJ` opens, `BB` against `UTG` defends and 3-bets, `HJ` against `UTG` calls, `CO` against `UTG` calls, `UTG` folds to a `BB` 3-bet; the 8.2 row "`HJ` or `CO` vs `UTG`, call" is measured per seat). The key writer: `number` (a fixed precision, `KEY-SPEC.md` 7.4, never a negative zero), `rows`, `node_json`, `render_key` (the file of 7.1: `schema`, `spec_hash`, `game` verbatim from `config.py`, `solver` with `method`, `iterations`, `exploitability_bb` per seat to six decimals, `seed` 1, `date`, `equity_table_sha256`, `hands`, 65 `nodes` one per line with `strategy` and `ev` to four decimals and `reach` and `hand_reach` to six) and `write`, the one write path into `solver/data/` (W1); `below_floor` lists the nodes under `REACH_FLOOR`; `gain_lines`; `main()` prints the gains at a quarter, a half and all of `ITERATIONS` (now 12,000, the value of 7.1's example and the prompt's recommended answer (b), taken because a run is far under ten minutes), the subtree reaches, the independent best response over the tree, the band table, the button's lowest pair-open rate and the nodes under the floor, then writes `key.json` and prints the run line. `TUNING_OPENERS` is gone: `main()` solves every opener. `solver/best_response.py`: `tree_gains(nodes, game, E, W)`, the same per-dealt-hand sum with its own fold chain over its own `ids`, so the number the file records comes from the independent module. `solver/cfr_test.py`: eight tests in `TreeTest` (33 in the suite): the fold rate on a hand-made open node; the chain's per-dealt-hand sums, and its scaling of each subtree's nodes, on hand-made parts of the toy (`X` folds half its hands by the deal, so `O`'s subtree, its nodes' reaches and its seats' gains are halved); `tree_gains` on a two-seat cut of the toy against the hand-worked gains of `best_response_test.py` (0 at the equilibrium, 1.25 for the timid defender); the two modules' chains agreeing to 12 places on a three-seat cut of the real game (`MINI`: `BTN`, `SB`, `BB`, 14 nodes, 300 iterations, every gain under 0.005); the key file's shape through `validate_key.validate` with the header fields and one node checked; the rounding of 7.4 (three thirds written to four places sum to 0.9999, inside the validator's tolerance, and `-1e-9` writes as `0.0000`); and the floor list. **Runs, 2026-10-06, load average 2.7 to 3.** `python3 solver/cfr.py` twice: 104.5 s and 105.9 s wall; the 34 printed lines identical (`diff`) and `solver/data/key.json` identical (`cmp`), 608,670 bytes, SHA-256 `fc879c1a4f5b15aad8c01a44b6dff67da2e8bcf7b58f420d7f2a83c46a762ee2`; `python3 solver/validate_key.py solver/data/key.json` prints `valid`. Gains per dealt hand, in bb: at 3,000 iterations UTG 0.000015, HJ 0.000032, CO 0.000020, BTN 0.000020, SB 0.000013, BB 0.000016; at 6,000: 0.000006, 0.000009, 0.000007, 0.000005, 0.000005, 0.000005; at 12,000: 0.000002, 0.000003, 0.000002, 0.000002, 0.000002, 0.000001; every one under the dial 0.005 and falling two- to four-fold per doubling; `tree_gains` from the independent module gives the same six numbers. Subtree reach per dealt hand: UTG 1, HJ 0.8507, CO 0.6912, BTN 0.5232, SB 0.3437. **Bands (26 rows, 19 inside).** The 19 rows of step 52 keep their verdicts (13 inside, the six of `KEY-SPEC.md` 8.5 missed); four values move by at most 0.3 at 12,000 iterations (BB vs CO defends 51.9, BB vs SB defends 63.4, SB vs BTN 3-bets 17.4, CO folds to a BTN 3-bet 18.3). The seven new rows: UTG opens 14.9 (14 to 21), HJ opens 18.8 (18 to 25), BB vs UTG defends 35.1 (28 to 60) and 3-bets 6.5 (4 to 10), HJ vs UTG calls 1.2 and CO vs UTG calls 1.2 (0 to 10), all inside; **UTG folds to a BB 3-bet 41.2 against 45 to 70, missed: a new finding for Zach** (question (c) of the prompt), recorded in `KEY-SPEC.md` 8.5 and not tuned, the mechanism of the five 3-bet-pot misses (section 4, item 3). The button opens every pair at 100 percent. One node is under `REACH_FLOOR` per dealt hand: UTG facing the big blind's 5-bet, reach 0.000088; the next lowest are HJ facing BB's 5-bet (0.000113) and UTG facing SB's 5-bet (0.000135). A reading of the root for the record: UTG opens AA, 66, A9s, ATo, KQo, KTs and QJs at 100 percent, folds 22 (open EV −0.137 bb) and A5s (−0.023 bb; it opens 0.0001). **Gate.** The whole-repo gate with the solver tests in it, run as one command in the worktree: exit 0; run lines 78, 18 and 12; 33 solver tests OK in 23.3 s; typecheck and lint exit 0; 86 test files, 629 tests (this branch's count; `main` is at 103 and 772 since board item 59); `git diff --stat -- assets/icons assets/mascots assets/sounds` empty after it. **The gate change (Zach's answer (a), 2026-10-05).** `CLAUDE.md` Commands: the gate line runs `python3 -m unittest discover -s solver -p '*_test.py'` between the SVG check and the app gate, with a note on what the suite proves and does not (the bands and the key are proven by `python3 solver/cfr.py`, which the gate does not run; a solver change is checked with `git diff --stat -- solver/data`), and the Stack line no longer says the Python side has no tests. `docs/AGENT-PRACTICES.md` Part 6 and Appendix A: the fresh-checkout recipe checks `python3 -c 'import numpy'` and the HEAD-isolation line runs the solver tests. `docs/conventions-python.md` 1.3.1: the scope paragraph names every file in `solver/`, M4's amendment says the suite needs numpy since step 50 and the recipe checks for it; no rule changed. `gateCommand` in `.personal-config.json` lives in the main checkout only and is gitignored: the one-line change is in the hand-back for Zach. **Questions (a) to (c) of the prompt.** (a) and (b) were taken at the recommended values (`solver/data/key.json` in the full shape of 7.1; 12,000 iterations, a run of 105 s) because this session ran unattended; each is a one-line change if Zach wants otherwise. (c) is open: the seventh miss. **Build-level calls**, each with its reversal: the chain is computed in `cfr.py` for the checkpoint totals and again in `best_response.py` for the file's `exploitability_bb` (reverse: one copy, and lose the cross-check); the "HJ or CO" band is two rows (reverse: one row on the larger of the two); `exploitability_bb` is written to six decimals where 7.1's example shows three (reverse: three, which would print every seat as 0.000); the `date` is a constant in the source, not read from a clock (G1); `ITERATIONS` is 12,000 in the source and the checkpoints are a quarter and a half of it. Other edits: `KEY-SPEC.md` 8.5 (the dated paragraph with the seven rows, the new miss, the under-floor node and the reaches); `PLAN.md` phase 3b `BUILT`; this ledger's Environment (Solver tests, Whole-repo gate, a Solver row), the `docs/conventions-python.md` line and the `solver/` entry of the code map; `PASSOFF.md` row 38 `DONE: HANDOFF 53`, a status line under item 38's prompt, row 39 `OPEN` with its files, item 39's prompt (phase 4: the export, `key.ts`, the load tests, the containment test, the Deep review) and the intro of items 35 to 45. **Seen running:** nothing; this item has no screen and no sound. **Open:** (a) to (d) of step 50, (e) of step 51 and (f) of step 52 stand; (g) the seventh miss, question (c); (h) at merge, the gate line in `CLAUDE.md`, the HEAD-isolation line and the Appendix A rows in `docs/AGENT-PRACTICES.md` and the scope and version paragraphs of `docs/conventions-python.md` meet the main checkout's uncommitted Lottie edits to the same lines (`git -C /Users/zachshort/Projects/felto diff`, 2026-10-06: `build_lottie.py` in the gate, version 1.2.4 there against 1.3.1 here), so those lines are merged by hand, keeping both; (i) `solver/config.py`'s uncommitted change is item 37's (step 52), not this step's, and must be committed with or before this step's files, because `cfr_test.py` pins its hash. **Left owed:** the commit, which is Zach's; the `gateCommand` line; item 39 (`OPEN`, Opus 5.5 then a Fable 5.1 review, lane H); item 60 (`HELD` until 39).

**54. The key exported to the app, checked on load and against the unit 3 chart, and a second cold review (board item 39, GTO trainer phase 4).** Done 2026-10-06 on Opus 5.5 (the item's model, checked first), in worktree `.claude/worktrees/gto-equity`, branch `gto-equity`, after step 53's commit `dd99115`. Not yet committed. This step is 54 because this branch's last step is 53 and the main checkout's last is 50 (`grep -oE '^\*\*[0-9]+\. ' HANDOFF.md` in both, 2026-10-06). The main checkout's board still showed row 39 `HELD`; the branch's board had it `OPEN` (step 53). **Zach's answers, in chat, 2026-10-06, one batch before building, every recommendation:** (a) the key is bundled as a JSON import through Metro; (b) the containment test pins the chart hands it finds under the dial, so the gate stays green and a change to the list fails it; (c) hands the Deep review calls wrong because the model cannot see hand features go to item 60 and block nothing, and a fault in the key itself blocks item 41 until fixed; (d) `gtoChartMinOpen` goes in `app/src/config/dials.ts`, a new block `// gto-trainer`, which adds that file to row 39 (row 52 names it too, for part B, which waits on item 48 and was not running). **Built.** The export: `cp solver/data/key.json app/src/gto/data/key.json`, `cmp` identical, 608,670 bytes (116,007 gzipped), SHA-256 `fc879c1a4f5b15aad8c01a44b6dff67da2e8bcf7b58f420d7f2a83c46a762ee2`, step 53's hash. Metro turns a `.json` file into a CommonJS module before any Babel transformer runs (`app/node_modules/metro-transform-worker/src/index.js:474`) and Expo's source extensions include `json` (`app/node_modules/@expo/config/build/paths/extensions.js:75`), so the import needs no plugin and the felto SVG transformer never sees it. `app/src/gto/key.ts` (176 lines): the types (`GtoAction`, `TreeNode`, `GtoNode`, `GtoKey`), `SPEC_HASH` pinned at step 52's `659cdfd1...e845a7`, `treeNodes()` (the 65 nodes of `KEY-SPEC.md` 2.4 and 7.2 built from `OPEN_SEATS` and `BB`, never from the file), `parseKey(raw)` (the schema string, the pinned hash, the 169 hands in the order of `allHandClasses()`, the seat list and `stack_bb`, no node outside the tree, every node of the tree with its actor and actions, `reach` a probability, `strategy` one row per hand with every frequency in 0 to 1 and each row summing to 1 within 0.001, `ev` one row per hand, `hand_reach` 169 numbers, `totals` `null` at fold and a number elsewhere), throwing on the first fault with "The GTO key is broken at <node, or the file, or game>: <fault>", and `gtoKey()`, the bundled key parsed on first read. `app/src/gto/key.test.ts` (211 lines, 24 tests): the tree built a second way (the five open ids written out and the fifteen pairs of 2.4 in the spec's order, walked seat by seat) against `treeNodes()` and against the file, and three ids of 7.2 by their actors; the real file loads with the pinned hash, the 169 hands and 10,985 strategy rows; the bundled file is a byte copy of `solver/data/key.json`; the seats and stack equal `DIALS.tableSeats` and `DIALS.stackBigBlinds` (`KEY-SPEC.md` 9); nine broken copies each fail with their own fault; the containment pin; and the import boundary (no file under `app/src` but `gto/key.ts` imports `key.json`, with a check that the scan finds that one import), the shape of `app/src/art/rive-boundary.test.ts`. The broken copies, each a fresh parse of the real file with one change, and the message each throws: one hand deleted from the node `UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold` ("strategy does not hold one row per hand"); one hand deleted from `hands` ("the hands are not the 169 classes"); the row of `K5s` set to 0.1, 0.5, 0.5 ("the frequencies for K5s sum to 1.1000"); the `ev` field removed ("ev does not hold one row per hand"); `reach` removed ("reach is missing or not a probability"); the node removed ("the node is missing"); a stray node `UTG:limp` ("it is not a node of the game tree"); the actor changed ("the actor is SB, not BB"); `spec_hash` set to 64 zeros ("is not the pinned"); and the unbroken copy loads. `app/src/config/dials.ts`: `gtoChartMinOpen: 0.5` under `// gto-trainer`. **Containment (`PLAN.md` phase 4, step 3).** 46 hands the chart opens are under 0.5 at their seat's open node; the open frequency, then the open EV less the fold EV in bb: UTG `QTs` 0.0001 −0.035, `JTs` 0 −0.062, `T9s` 0 −0.251; HJ `K9s` 0.0001 −0.036, `Q9s` 0 −0.103, `J9s` 0 −0.171, `T9s` 0 −0.197, `98s` 0 −0.609; CO `22` 0 −0.023, `K8s` 0.0003 −0.015, `J9s` 0 −0.039, `T9s` 0 −0.053, `T8s` 0 −0.250, `98s` 0 −0.378, `97s` 0 −0.274, `87s` 0 −0.294, `76s` 0 −0.720, `65s` 0 −0.804, `QTo` 0 −0.036, `JTo` 0 −0.105; BTN `Q7s` 0 −0.053, `Q6s` 0 −0.087, `J8s` 0.0003 −0.014, `J7s` 0 −0.132, `T8s` 0.0001 −0.019, `T7s` 0 −0.189, `98s` 0 −0.041, `97s` 0 −0.171, `96s` 0 −0.277, `87s` 0 −0.180, `86s` 0 −0.338, `76s` 0 −0.418, `75s` 0 −0.766, `65s` 0 −0.716, `64s` 0 −0.877, `54s` 0 −0.807, `J9o` 0 −0.096, `T9o` 0 −0.154; SB `T7s` 0.387 −0.000, `97s` 0 −0.038, `87s` 0 −0.037, `86s` 0 −0.122, `76s` 0 −0.119, `75s` 0 −0.207, `65s` 0 −0.182, `54s` 0 −0.224. 36 of the 46 are suited connectors and one- or two-gappers, the hands `KEY-SPEC.md` 4, item 3, names as too tight. The other way round, the key opens at 0.5 or more hands the chart folds: UTG 7 (`ATo`, `A9s`, `A9o`, `A8s`, `A8o`, `A7s`, `KJo` 0.54), HJ 9, CO 5 (`A8o` to `A4o`), BTN 8 (`A6o` to `A2o`, `K8o`, `K7o`, `K4s`), SB 32 (`A7o` to `A2o`, `K9o` to `K2o`, `Q9o` to `Q4o`, `J9o`, `J8o`, `T9o`, `K4s` to `K2s`, `Q6s` to `Q2s` and `J6s`); offsuit aces and kings are the hands item 3 names as too loose. Five exercises of unit 3 now contradict the key (`PLAN.md` phase 4, watch-for; recorded, not rewritten): `preflop-2-10` (CO `22`, the lesson raises, the key opens 0), `preflop-4-05` (CO `87s`, raise, 0), `preflop-4-09` (BTN `64s`, raise, 0), `preflop-5-08` (SB `54s`, raise, 0), and `preflop-3-05` (UTG `A8o`, the lesson folds, the key opens 0.9999). **Bundle (`PLAN.md` section 5, hazard 3).** `bunx expo export --platform ios` in a scratch copy with its own `TMPDIR` (the Metro cache, Known facts): 4,692,045 bytes of Hermes bytecode with no reader of the key (nothing imports `key.ts` yet), 4,700,301 with one scratch route reading a stub `{}` key, 5,398,379 with the real key: the key adds 698,078 bytes (222,168 gzipped), the reader and route 8,256, 15.1 percent of the bundle in all. Android was not exported; load time on a phone was not measured. **The Deep review.** A Fable 5.1 subagent, model passed explicitly, in its own worktree, review only (29 tool calls, about 23 minutes). The harness removed its worktree on return (absent from `git worktree list`), which it does only for a worktree with no changes, and this worktree's `git status --short` then held only this step's files, with `solver/` and `KEY-SPEC.md` unchanged. Verdict: no fault of class B. By script over the 65 nodes, the fold EVs equal the payoffs of `KEY-SPEC.md` 2.5, `totals` match 2.3, no reached row puts weight on an action more than 0.02 bb below its best, every row sums to 1, each `reach` is the sum of its `hand_reach` and no child outreaches its parent; the call EV at all 60 terminal-call leaves recomputes from `equity.json` and the formulas of 3.2 within 0.0024 bb. Every hand it names is class A: section 4, item 3, nearly everywhere, item 1 at the flats, items 4 and 5 at the 4-bet and 5-bet nodes. The most visible: the big blind 3-bets `33` to `88` against the button and `22` to `66` against the small blind at 100 percent; openers call 3-bets and 4-bets with small pairs and weak suited aces; at the 5-bet nodes `QQ` folds 0.89 to 0.91 after a UTG 4-bet, `KK` 0.664 and 0.269, and `JJ` folds where `TT` calls, on EV gaps under 0.001 bb. `KEY-SPEC.md` 10 holds the second review with every hand by node. This session re-checked four claims against the file (`QQ` 0.9043, `KK` 0.6636, the big blind's pair 3-bets with `22` a call, `72o` uniform at `hand_reach` 0) and counted 2,783 uniform rows against the reviewer's 2,777 (a looser tolerance). Under answer (c) every named hand goes to item 60 and nothing blocks item 41. Its five items for later work, routed: (1) 2,777 rows at hands the actor never holds carry the uniform strategy, so item 41 reads `hand_reach` before `strategy` (item 40's step 7 carries it); (2) the 5-bet indifference and (5) the one-hand flats are item 40's question (d), and the grader's noise rule is item 41's; (3) no band covers a 4-bet or 5-bet quantity, which goes to item 60's GATE 1 batch (a note under its prompt); (4) section 6's statement should name the inversion of item 3, which is phase 10's copy (item 45). Phase 4's done-when ("the Deep review finds no wrong strategy") is not met; that is the recorded deviation. **Gate.** The whole-repo gate of this branch's `CLAUDE.md`, as one command in the worktree, load average 5.6: exit 0; run lines 78, 18 and 12; 33 solver tests OK in 46.5 s; typecheck and lint exit 0; 87 test files, 653 tests (24 new); `git diff --stat -- assets/icons assets/mascots assets/sounds` empty. **Build-level calls**, each with its reversal: the loader throws on the first fault, where `solver/validate_key.py` lists them all (reverse: collect a list, as the content validators do); the key is checked on first read, not at import (reverse: parse at import, which turns a broken key into a crash of every module that imports `key.ts`); the tree comes from the app's seat list and the loader refuses another seat list in `game` (reverse: build the tree from `game.seats`); `totals` is checked for shape only, not against the sizes of 2.3 (reverse: check each against its row, which the engine of item 40 may want); frequencies are also checked to lie in 0 to 1, beyond the prompt's list; `solver.exploitability_bb` is not read by the app (reverse: check it against `gtoExploitabilityBb` when item 41 compares it with `gtoMistakeCostBb`); the containment and boundary tests are in `key.test.ts`, the one test file row 39 names, where rule Q1 prefers a file per feature (reverse: split them out once lane I agrees, since item 40 owns the rest of `app/src/gto/`); the byte-copy test reads `solver/data/key.json` from the app's tests, as `app/src/art/sizes.test.ts` reads `assets/` (reverse: delete it and rely on the `cmp` at export). Other edits: `PASSOFF.md` row 39 `DONE: HANDOFF 54` with `dials.ts` added, a status line under item 39's prompt, row 40 `OPEN` with its files and item 40's prompt (phase 5, the hand engine), row 60 `OPEN` waiting on Zach's answers alone with `key.test.ts` added, a dated note under item 60's prompt, the intro of items 35 to 45; `PLAN.md` phase 4 `BUILT`, section 3 (the dial's home) and section 5 (the size); `KEY-SPEC.md` 10 (the second review); this ledger's Environment (the gate row) and code map. **Seen running:** nothing; this item has no screen, and no screen reads the key yet. **Open:** (a) step 53's (h) stands, and `app/src/config/dials.ts` joins it: the main checkout's file has the second game-feel pass block where this branch adds `// gto-trainer`, so the merge keeps both by hand; (b) the Practice preflop drill answers from the same chart (`app/src/drills/preflop.ts:62`), so it can deal the 46 pinned hands with "raise" as the answer while the key folds them; (c) the editor's TypeScript server flags `new URL(...)` passed to `fileURLToPath` in `key.test.ts` as the DOM `URL`, as it would in `sizes.test.ts` and `rive-boundary.test.ts`, which use the same pattern, while `tsc --noEmit` exits 0; (d) `CLAUDE.md`'s test counts are the main checkout's (103 files, 772 tests) and this branch's are 87 and 653, reconciled at the merge. **Left owed:** the commit, which is Zach's; item 40 (`OPEN`, Opus 5.5, lane I); item 60 (`OPEN`, Fable 5.1, lane H, on Zach's GATE 1 answers).

## Style rules

Python follows `docs/conventions-python.md` (written in step 2, 2026-10-04). Read it in full
before editing anything in `tools/`. No formatter or linter is configured (Zach, 2026-10-04), so
nothing settles style mechanically.

TypeScript under `app/` follows `docs/conventions-typescript.md` (written 2026-10-05, board
item 6; version 1.1.0 since board item 16). Read it in full before writing anything in `app/`. Lint there is `expo lint` with
`eslint-config-expo/flat`, installed 2026-10-05 (board item 7); every rule in the standard is
*review* until a tool is shown to catch it.

**41. The GTO trainer's game spec, key schema and feasibility (board item 35, GTO trainer phase 1).** Done 2026-10-05 on Fable 5.1, on `main`, no worktree. Not yet committed. Built: `docs/incomplete/gto-trainer/KEY-SPEC.md`, twelve sections: one six-player game with a heads-up-only rule (the first seat that calls or 3-bets removes every seat behind it, BD-T11), sizes in four defender rows (BD-T13, BD-T19), 65 decision nodes and 111 terminals, payoffs, a leaf model of all-in equity bent towards the player with the edge by `s = e − c × e × (1 − e)^2` with six `c` dials and a flat tax `t` on a flat by any seat but the big blind (BD-T12, BD-T17, BD-T18), eight simplifications each with the hands it moves, the schema `felto-gto-key/1` (node ids are action histories, hands in the app's `allHandClasses()` order, `spec_hash` over the canonical game object, BD-T15), acceptance bands with a source and a date on every number, the feasibility estimate (BD-T16), the cold review and two decision batches. `solver/validate_key.py` (standard library only): it accepted a one-node fixture and refused five mutants, a row removed, a row summing to 1.1, the `ev` array removed, an open size changed under the hash, the hands reversed, each with one finding naming the fault. The plan gained BD-T11 to BD-T19, the leaf-model dials and the phase 1 header; `docs/conventions-python.md` is 1.2.2 (the scope paragraph names `solver/`; the M4 amendment for numpy is owed to phase 2); `docs/README.md` has the `KEY-SPEC.md` line. Zach, in chat, 2026-10-05: first batch "all recs" (RF-2 realization, menu M1, claim rule C1); second batch after the cold review: keep the flat call ("do not remove cold calling"), the initiative split with `k = 2`, 9 and 23 for the blind-against-blind sizes, and the flat tax. Subagents, each read-only in its own worktree and clean on return: two Opus 5.5 researchers (the first stopped on budget after about 28 pages, the second, a relay, after about 31): three or more named sources with dates for every open rate, for the big blind against the button and for the button against the cutoff; two solver sources and one heuristic for the opener facing a 3-bet; no spot-specific source for the button or `UTG` facing a big blind 3-bet; no rakeless source at all, so every band has a floor from raked sources and a ceiling with a stated no-rake allowance (`KEY-SPEC.md` 8.1, 8.4). One Fable 5.1 cold reviewer, which read the file by absolute path from this checkout because the untracked file was not in its worktree: nine findings, four material (in-position and small-blind flats of most of the deck, an initiative-blind bonus, a curve too flat at the bottom), all answered in `KEY-SPEC.md` 10 and 4; it also confirmed every pot, payoff and count. Feasibility, measured 2026-10-05 on this Mac (Apple M4, numpy 2.4.3) with a scratch script not kept: the 120 matrix-vector products of one iteration take 0.32 ms and the 780 node operations 9.5 ms, so 10,000 iterations take 1.6 minutes and the hour of BD-T3 is reached past 350,000; numpy, no Rust standard. **Gates:** `bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test` on 2026-10-05, exit 0, 86 test files and 629 tests (the plan's 63 and 490 were its writing-day count); no file under `app/` changed; the Python gate was not run because no generator changed. **Seen running:** nothing; this item has no screen and no sound. Found, each `open`: (a) two other sessions took steps 39 and 40 and edited `HANDOFF.md`, `PASSOFF.md` and `CLAUDE.md` while this session ran, and `assets/higgsfield-chest/`, `.mcp.json`, `docs/incomplete/game-feel/DESIGN.md` and `docs/incomplete/game-feel/PLAN.md` carry other sessions' changes, so the two blocks of the hand-back name this session's files and Zach decides the rest; (b) the first draft of `KEY-SPEC.md` 3.2 had a wrong worked number for the 70 percent case (63.7 and 91 for 62.7 and 89.5), found by this session's script and by the reviewer the same hour, and fixed; (c) `solver/` has no test runner; item 36's prompt proposes the standard library's `unittest`, run as `python3 -m unittest discover -s solver -p '*_test.py'`, and asks Zach whether it joins the gate; (d) `.gitignore` has no `__pycache__` line, and this session's import of the validator from a scratch script wrote `solver/__pycache__/`, removed by hand; `tools/__pycache__/` from an earlier session is still untracked; (e) the bands are thin where `KEY-SPEC.md` 8.4 says and a third research pass is possible; (f) the review saw the first draft, not the game as it stands, so the phase 4 Deep review is the next cold read; (g) the plan's `done when` asked for three sources per band and two spots have none. **Left owed:** the commit, which is Zach's; item 36 (`OPEN`, Opus 5.5, lane H).

**46. The preflop equity table and the deal weights (board item 36, GTO trainer phase 2).** Done 2026-10-05 on Opus 5.5, in worktree `.claude/worktrees/gto-equity`, branch `gto-equity`, made from `main` at `6caba99`, because lanes K, N, O, P and Q were open. Not yet committed. This step was numbered 46 because the main checkout's ledger held uncommitted steps 42 to 45 from other sessions when it was written; those steps are not on this branch. Built: `solver/equity.py` (257 lines; the first numpy file, so rule M4 of `docs/conventions-python.md` was amended first: version 1.3.0, a dated paragraph and a second correct example, `solver/` the one place a third-party import is allowed); `solver/data/equity.json` (351,864 bytes, SHA-256 `bb81c98be345d83fac13797a1a4bafb87f332bebf56d64f21240a83bac31861f`): a `meta` header (date, method, bound, hand-order source, the meaning of `E` and `W`, `boards_per_pair` 1,712,304 and `pairs_total` 1,624,350), `hands` in the order of `HANDS` in `solver/validate_key.py`, `E` 169 by 169 to six decimals and `W` 169 by 169 as integers; `solver/equity_test.py` (153 lines, eight tests, standard library only). **Method, exact enumeration with suit symmetry** (Zach's answer (b) in chat, 2026-10-05): the 2,598,960 boards fall in 134,459 classes under the 24 suit permutations (the known count); one board per class is scored and counted by the class size, which is exact because a hand class is closed under a suit permutation. On a board each combination's best hand is the better of two lookups: the best non-flush hand of its seven ranks (49,205 multisets, keyed by the sum of 5 to the rank) and its best flush (the 13-bit rank mask of one suit). Class-pair counts of 2 × wins + ties come from one histogram matrix product per board, less the pairs that share a card (summed over boards on a 52 by 52 by 52 grid and mapped to classes once), plus each combination's meeting with itself. Every count is an integer and every float sum stays under 2^24 in float32 or 2^53 in float64, so the result does not depend on the order of a sum. The run stops unless `counts + countsᵀ = 2 × W × 1,712,304` in every cell, which proves each disjoint pair met each board once, and unless `W` sums to 1,624,350. The bound is the rounding, 0.0000005 per cell. **Checks outside the file:** the decomposition equalled a brute-force count over every disjoint pair on seven boards; three evaluators (the lookups in `equity.py`, the plain evaluator in `equity_test.py`, and the app's TypeScript `evaluate()` run by `bun` from a scratch script, nothing under `app/` touched) agreed on order and ties over 200,000 random seven-card hands, with category shares at the known seven-card odds (pair 43.6 percent, two pair 23.6, high card 17.5); a first scratch prototype with other code counted the nine five-card categories exactly (40 straight flushes to 1,302,540 high cards) and 7,462 distinct values. **Runs:** `python3 solver/equity.py` twice, run line "wrote 1 file ... from 134459 board classes" both times, `cmp` identical. Run 1: 559 s wall, 133 s CPU; run 2: 260 s wall, 120 s CPU. Other sessions held the Mac at a load average of 50 to 440 with 7.7 to 8.7 GB of swap in use (21 simulator processes, 17 Metal compilers, 24 node processes), so the wall times are not this method's speed; the CPU times are closer to it. A self-review against rule G2 then found `value5` iterating a set; it now iterates `dict.fromkeys(ranks)` (the result was already sorted, so no value could move), and a third run wrote the same bytes as run 1 (`cmp`, rule G4). **Tests:** `python3 -m unittest discover -s solver -p '*_test.py'`: 8 tests, OK, 75.7 s. The ten Monte Carlo matchups (200,000 samples each, seeds 36 to 45, bound 0.01) landed within 0.0019: `AA` against `KK` 0.819461 by the table and 0.818185 by Monte Carlo, `AKs`-`QQ` 0.460485 and 0.459228, `AKo`-`22` 0.473508 and 0.472417, `72o`-`AA` 0.118004 and 0.116852, `JTs`-`AKo` 0.405139 and 0.406828, `55`-`AKs` 0.519656 and 0.520610, `AKs`-`AKo` 0.524921 and 0.524860, `T9s`-`88` 0.488781 and 0.489255, `A5s`-`KQo` 0.602771 and 0.600875, `KJs`-`KTo` 0.739433 and 0.739993. Three broken copies of the file, run in scratch, each failed the test they should: `E[AKs][QQ]` and its mirror moved by 0.02 failed the Monte Carlo test, `E[AKs][QQ]` alone moved by 0.001 failed the sum-to-one test, `W[AKs][QQ]` plus one failed both deal-weight tests. **App gate** in the worktree after `bun install --cwd app --frozen-lockfile`: typecheck exit 0, lint exit 0, 86 test files and 629 tests passed, unchanged from step 41; nothing under `app/` changed. **Five-matchup check (the phase's proof):** an Opus 5.5 subagent in its own worktree, read-only, chose five matchups outside the builder's ten and computed each exactly with its own numpy evaluator (13-bit rank masks per suit, no code from `equity.py` or `equity_test.py` read or run), over every disjoint pair of combinations and all 1,712,304 boards, and again with suit symmetry over combination pairs (a different grouping from the table's, which groups boards); both modes gave the same integer counts. It checked its evaluator on the nine five-card category counts and against a second pure-Python best-of-21 evaluator on 60,000 deals. Results, the table first, then the exact value: `KTo` against `QTo` 0.736421 and 1891465/2568456 (offsuit against offsuit, a shared ten); `QJs`-`76s` 0.637358 and 23725/37224 (suited against suited); `33`-`JTs` 0.467542 and 3097/6624; `A8o`-`88` 0.300336 and 3085603/10273824 (a shared eight); `54o`-`A3s` 0.407991 and 2794417/6849216 (wheels). Every table value is the six-decimal rounding of the exact fraction (largest difference 0.000000381), `W` equals its pair count in all five (108, 16, 24, 36, 48), and `E[g][h] = 1 − E[h][g]` holds as stored. This session re-checked the five fractions against the file. The subagent's `git status --short` was empty, and the harness removed its worktree on return, which it does only for a worktree with no changes. **Zach, in chat, 2026-10-05:** (a) the solver tests join the whole-repo gate when the solver lands, so `CLAUDE.md` and `gateCommand` are unchanged and the command is in Environment; item 37 asks whether "lands" means phase 3a or 3b; (b) exact enumeration; (c) one `__pycache__/` line in the root `.gitignore` (outside the item's file list, his yes). That line was checked with `git check-ignore` on a cache file written once and removed. Correction to this session's own question (c): it said the test command writes `solver/__pycache__/` on every run; that holds only in a shell without `PYTHONDONTWRITEBYTECODE`, which this session's shell sets, so its runs wrote none. Step 41 saw one written. **Build-level calls**, each with its reversal: `W` is stored as counts with the denominator in `meta`, where `KEY-SPEC.md` 3.3 defines it divided (reverse: divide on write; the note in `KEY-SPEC.md` 7.1, added by this item, says so); one file holds `E` and `W`, so `equity_table_sha256` names both (reverse: two files and two hashes); `equity.py` and `equity_test.py` read the hand order from `HANDS` in `validate_key.py` (reverse: a copy of the list); the test imports only the standard library, so it runs with no numpy (reverse: none needed). Other edits: `HANDOFF.md` Environment (the Python row and a Solver tests row) and code map; `PASSOFF.md` row 36 `DONE: HANDOFF 46`, row 37 `OPEN` with its files widened to the four-spot work, and item 37's prompt; `PLAN.md` phase 2 header `BUILT`; `KEY-SPEC.md` 7.1, one dated note naming the file, its hash and the `W` denominator. **Seen running:** nothing; this item has no screen and no sound. **Open:** (a) at merge, `HANDOFF.md` and `PASSOFF.md` meet main's uncommitted steps 42 to 45 and board changes, and `docs/conventions-python.md` meets the branch of step 40, which also changes the version line (the second to merge takes the next number); (b) item 37's prompt reads the tree as five opener subtrees that share no hand, an inference from `KEY-SPEC.md` 2.2 and 3.3 that the prompt asks item 37 to verify; (c) `tools/__pycache__/` in the main checkout is now ignored, not removed. **Left owed:** the commit and the merge of `gto-equity`, which are Zach's; item 37 (`OPEN`, Fable 5.1, lane H).

**50. The solver core, the best-response check and the tuning of the leaf model on its four spots, landed before the freeze (board item 37, GTO trainer phase 3a).** Done 2026-10-05 on Fable 5.1, in worktree `.claude/worktrees/gto-equity`, branch `gto-equity`, on top of item 36's commit `8b3616d`. Not yet committed. This step is numbered 50 because the main checkout's ledger held steps 47 to 49 from other sessions when it was written (`grep -oE '^\*\*[0-9]+\. ' HANDOFF.md` in the main checkout, 2026-10-05); the same grep found a second step 46 there (the Lottie effects, board item 49), so item 36's step 46 on this branch collides with `main` at merge, see open (a). **Status: the solver, the check and the tests are built and green; the dials are not frozen**, because no setting inside the ranges of `KEY-SPEC.md` 3.2 lands every band of 8.2, and that choice is Zach's (the prompt's question (b)). `solver/config.py` holds the starting values and `spec_hash(GAME)` is still `fd66084e4602dfb7101d507148e02e406593d9964b10caf877c75a1d440ddce3`, the hash of `KEY-SPEC.md` 7.5. Row 37 is `IN FLIGHT`; the remainder is the prompt under it on the board. **Built:** `solver/config.py` (77 lines: `GAME`, the object of `KEY-SPEC.md` 12 as a dict; `RANGES`, the nine dials with start, floor and ceiling; `DIAL_PATH`; `GTO_EXPLOITABILITY_BB` 0.005, `REACH_FLOOR` 0.0001, `GTO_CHART_MIN_OPEN` 0.5). `solver/cfr.py` (about 420 lines): the game built from `GAME` (`row_of`, `pair_of`, `subtree_of`, `node_id` for the ids of 7.2); the leaf tables of 2.5 and 3 (`shares`, `leaf_tables`: the edge holder is the player whose raise was called, its `c` depends on its position, the caller's share is bent, a flat by `HJ`, `CO`, `BTN` or `SB` is taxed, the all-in leaf is exact); CFR+ (`Node` with regret matching+, the average weighted by the iteration number and the actor's own reach; alternating updates, the opener's nodes together, then each defender in seat order); the key-shaped output (`valued`: `actor`, `actions`, `totals`, `strategy`, `ev`, `reach`, `hand_reach`, with the EV over the plain deal for a hand no opposing hand reaches, 7.1); `solve`; the band measures (`measure`, `realization`, `BANDS`: the 19 rows of 8.2 that the CO, BTN and SB subtrees answer); and `main()`, which solves those three subtrees for 4,000 iterations and prints every seat's gain at 1,000, 2,000 and 4,000, the band table, the button's lowest pair-open rate, `spec_hash(GAME)` and the equity file's SHA-256. `solver/best_response.py` (about 170 lines): its own node ids, its own leaf payoffs (`stakes`, `split`, `payoffs`) and a backward induction over one seat's nodes with counterfactual weights (`opener_gain`, `defender_gain`, `gains`); it shares with `cfr.py` only `config.py`, `validate_key.py` and the equity file. `solver/cfr_test.py` (17 tests) and `solver/best_response_test.py` (4 tests), all from hand-worked cases: the five leaf payoffs below, the fold payoffs and pots of 2.5 for the four rows, position and tax by row, pot conservation (the dead money, less the tax times the pot at a flat), the node ids of 7.2, the hash of `GAME`, and a toy tree with a known equilibrium. **The model, as implemented.** Section 3.3 is read as section 4, item 6, describes it: a defender's fold enters the reach of the defenders behind it as one range-average number, `F_j = Σ_g p(g) σ_j(g, fold)` over the plain deal, while the two live hands are dealt jointly from `W`; so an opener's open value for a hand that blocks the continuing hands sums to a little under one unit of probability, and that hand's EV comes out a little low, the direction item 6 names. The alternative, a fold frequency conditional on the opener's hand, is a proper extensive-form game but contradicts item 6 ("here they fold at their range-average rate"); the implemented one is a set of multilinear utilities on which regret matching and the best response are both defined, and the best response is the proof. **The subtree claim of the prompt, verified:** the decision nodes partition by opener (every id after the open carries `SEAT:open` for one seat, `node_id`); a seat's payoff from decisions in one opener's subtree depends only on strategies in that subtree (the opener's open node, the pair nodes and the earlier defenders' fold frequencies there); the reach of a subtree is a constant from the seats before the opener; and a seat's fold payoff (0, −0.5 or −1) is fixed whatever follows. So the five subtrees are solved apart, and this item solved CO, BTN and SB (27 nodes, 6 pairs). The gains are conditional on the hand reaching the opener's open decision, the stricter reading of "per hand"; phase 3b multiplies by the fold chain of the earlier seats. **Leaf payoffs worked by hand, at the starting dials (the tests' cases):** BB flats a BTN open with 30 percent equity, `c_srp` 0.7, `k` 2: BB keeps 0.1971 of 5.5, BTN +1.91595, BB −1.41595. BTN flats a CO open at 50 percent, `c_srp_oop` 0.3, taxed `t_ip` 0.1: 0.4625 of 0.9 × 6.5, CO +0.644375, BTN +0.205625. SB calls a BB 3-bet to 9 at 40 percent, `c_3bp` 0.4: 0.3424 of 18, SB −2.8368, BB +2.8368. SB calls a BTN 4-bet to 22 at 45 percent, `c_4bp` 0.2: 0.422775 of 45, BTN +3.975125, SB −2.975125. UTG against HJ all in at 70 percent: +41.05 and −39.55. Both modules agree with all five to nine places. **The toy tree:** two hands, `N` always beats `D`, dealt alike with no card removal, no bending, no tax; a seat `X` posts 6 and folds, the opener `O` opens to 1 and the defender `D` 3-bets all in at 2 (the 4-bet and the 5-bet add nothing). Worked by hand: `O` opens both hands; `D` jams `N`, and with `D` calls 0.75 and jams 0.25, the frequency that leaves `O`'s `D` indifferent between folding and calling the jam (−2 against `N`, +3 against `D`, `N` four times as often as `D` in the jam range); `O` continues with `N`, and 0.75 with `D`, the frequency that leaves `D`'s `D` indifferent between calling (1.0) and jamming (1.0); EVs at the open `N` 5.125 and `D` 0.5, at `D`'s first node `N` [0, 5, 5.375] and `D` [0, 1, 1]; the total is 6, the dead money. CFR+ at 4,000 iterations matches every one of those within 0.01 on a frequency and 0.002 on an EV, and `best_response.gains` on its average is under 0.002 and falls from 2,000 to 4,000 iterations. On hand-written profiles the check returns the hand-worked gains exactly: 1.25 bb for a defender that folds its air against an opener that opens both hands, 0 for both seats at the equilibrium, 2.5625 for an opener that folds the nuts. **Runs, 2026-10-05, load average 4 to 14 from other sessions:** `python3 -m unittest discover -s solver -p '*_test.py'`: 25 tests, OK, 25.7 s (`equity_test.py`'s Monte Carlo is most of it). `python3 solver/cfr.py` twice, outputs identical (`cmp`), 25.5 s wall each; one iteration costs 1.2 ms on the SB subtree (1 pair), 2.5 ms on BTN (2 pairs) and 4.0 ms on CO (3 pairs). Gains at the starting dials, in bb per hand given the subtree's root: CO subtree at 1,000 iterations CO 0.00010, BTN 0.00009, SB 0.00004, BB 0.00002; at 2,000 CO 0.00002, BTN 0.00003, SB 0.00001, BB 0.00000; at 4,000 at most 0.00001. BTN subtree: 1,000: BTN 0.00013, SB 0.00005, BB 0.00004; 2,000: 0.00003, 0.00002, 0.00001; 4,000: at most 0.00001. SB subtree: 1,000: SB 0.00008, BB 0.00013; 2,000: 0.00003, 0.00004; 4,000: 0.00001 each. Every number is under the dial 0.005 from 250 iterations on and falls about four-fold per doubling. The button opens every pair at 100 percent at the starting dials. App gate in the worktree: typecheck exit 0, lint exit 0, 86 test files and 629 tests passed, unchanged from step 46; nothing under `app/` changed. **Tuning.** Settings were screened at 500 iterations (gains then under 0.0005, bands good to about a point) with a scratch harness over `cfr.solve` and `cfr.measure`, not kept, and the chosen ones re-solved at 4,000. Grid one: 216 settings of `k` {1, 2}, `c_srp` {0.3, 0.5, 0.7, 0.9}, `c_srp_oop` {0, 0.2, 0.4}, `c_3bp` {0.2, 0.4, 0.6}, `c_3bp_oop` {0, 0.2, 0.4}, with `c_4bp` 0.1, `c_4bp_oop` 0.05 and the taxes at their start. Grid two: 192 settings around the best, with `c_3bp` 0.6, `c_3bp_oop` {0.2, 0.4}, `c_srp` {0.3, 0.5}, `c_srp_oop` {0, 0.2}, `c_4bp` {0.1, 0.3}, `c_4bp_oop` {0, 0.1, 0.2}, `t_ip` {0.05, 0.1}, both `k`. Of these 408 settings inside the ranges of 3.2: the best lands 14 of the 19 bands at the screening count and 13 at 4,000 (`k` 2, `c_srp` 0.5, `c_srp_oop` 0.2, `c_3bp` 0.4, `c_3bp_oop` 0, `c_4bp` 0.1, `c_4bp_oop` 0.05, taxes 0.1 and 0.25); two bands are missed by all 408, the big blind's 3-bet rate against the small blind (22.0 to 36.2 percent against 12 to 20) and the small blind's fold rate to a big blind 3-bet (23.4 to 54.5 against 55 to 80); the cutoff's fold rate to a button 3-bet (52 to 72) is met by three settings, each missing seven other bands; and the button's open rate (40 to 48, at most 40.4 seen) and its fold rate to a big blind 3-bet (45 to 70, at most 57.4) never hold at the same setting, because both move with `c_3bp_oop` in opposite directions (marginal means over grid one: opens 37.1, 30.6, 27.0 and folds 27.8, 39.6, 46.4 at `c_3bp_oop` 0, 0.2, 0.4). The marginal means also show `c_3bp` as the one lever on an opener's fold rate in a 3-bet pot (CO folds 10.3, 25.9, 37.8 at 0.2, 0.4, 0.6; SB 28.7, 37.0, 44.9), `k` 1 helping it (29.6 against 19.7), and `c_srp_oop` as the lever on the big blind's play against the small blind (3-bets 24.9, 29.6, 33.0 and defends 80.1, 57.7, 46.7 at 0, 0.2, 0.4). **The two settings reported at `k` 2 and `k` 1, re-solved at 4,000 iterations, gains at most 0.00002.** `k` 2, the best inside the ranges: CO opens 24.3 (band 24 to 31), BTN opens 34.3 (40 to 48, missed), SB opens 50.4 (38 to 55), BB vs BTN defends 63.8 (50 to 75), 3-bets 15.0 (9 to 15, missed by 0.04), calls 48.8 (38 to 62), BB vs CO defends 52.2 (42 to 68), 3-bets 10.3 (7 to 13), BB vs SB defends 63.6 (48 to 70), 3-bets 27.5 (12 to 20, missed), SB vs BTN 3-bets 17.5 (9 to 18), calls 0.0 (0 to 5), BTN vs CO 3-bets 14.1 (10 to 17), calls 1.2 (0 to 10), CO folds to a BTN 3-bet 18.0 (52 to 72, missed), 4-bets 17.2 (15 to 28), SB folds to a BB 3-bet 35.2 (55 to 80, missed), BTN folds to a BB 3-bet 35.7 (45 to 70, missed), BB realizes 82.8 percent of its equity against a BTN open (65 to 90); the button opens every pair. `k` 1, the best inside the ranges at that `k` (`c_srp` 0.3, `c_srp_oop` 0.2, `c_3bp` 0.6, `c_3bp_oop` 0.2, `c_4bp` 0.3, `c_4bp_oop` 0.2): 12 of 19; CO opens 22.2 and BTN 31.8 (both missed), SB 47.5, BB vs BTN 67.5, 15.2 (missed), 52.3, BB vs CO 50.2, 9.8, BB vs SB 55.0, 29.0 (missed), SB vs BTN 17.9, 0.0, BTN vs CO 15.2, 2.1, CO folds 47.3 (missed), 4-bets 30.5 (missed), SB folds 54.5 (missed), BTN folds 48.7, BB realizes 82.6; and the button folds a small pair, so `k` 1 fails the plan's done-when. **Outside the ranges, for the decision:** a third grid of 288 settings with `c_3bp` {0.8, 1.0} and `c_3bp_oop` {0.4, 0.6, 0.8} lands at most 15 of 19 (`k` 1, `c_srp` 0.3, `c_srp_oop` 0.2, `c_3bp` 0.8, `c_3bp_oop` 0.8, `c_4bp` 0.3, `c_4bp_oop` 0.1: CO opens 19, BTN opens 29, BB vs SB 3-bets 31 and CO 4-bets 35 missed; CO opens, BTN opens and BB vs SB 3-bets are missed by all 288). A negative `c_3bp_oop`, the out-of-position 3-bettor bent and the in-position caller bonused (−0.2, with `c_4bp_oop` −0.1, `k` 2, `c_srp` 0.5, `c_srp_oop` 0.2, `c_3bp` 0.6, `c_4bp` 0.1), lands 14: BTN opens 40.3 and the blinds' 3-bet rates against it come inside, but BTN then folds 28.9 to a BB 3-bet, CO folds 23.0 and SB 32.3, BB 3-bets SB 31.0 and BTN 3-bets CO 17.7. A scratch prototype of a symmetric bend (each player's share its equity times its own `1 − c (1 − e)^k`, renormalized; not kept) lands at most 14 and folds the button's small pairs. **The mechanism, as read from these runs:** the pot is conserved, so whatever the bend takes from the caller's weak hands it gives to the aggressor's hands whatever their strength; a `c` large enough to make an out-of-position opener fold a 3-bet as published play does hands the in-position 3-bettor a bonus that makes 3-betting medium hands profitable (the big blind against the small blind), and a `c_3bp_oop` large enough to make the button fold a big blind 3-bet hands the blinds a bonus that makes them 3-bet more and the button open less. This is section 4, item 3 (the model knows nothing about the hand) acting in 3-bet pots, where the real caller's marginal hands realize far less than the range average while the real 3-bettor's medium hands gain little. **Zach's question (b), put in chat on 2026-10-05 with this step:** (1) freeze the `k` 2 setting above and record its six misses as findings in `KEY-SPEC.md` 8; (2) supersede the ranges of 3.2 (`c_3bp` to 1.0, `c_3bp_oop` to 0.8) and freeze the best wider setting with four misses recorded; (3) supersede the leaf model (BD-T18) and re-tune in the same solver. The recommendation given: (3), because every miss is one mechanism and no dial inside or outside the ranges moves one band without breaking another; (2) as the cheap fallback. **Question (a) of the prompt** (whether the solver tests join the whole-repo gate at this item or at item 38) also went to Zach with this step, with the recommendation item 38, when the solver writes its output. **Build-level calls**, each with its reversal: the gains are conditional on the subtree's root (reverse: multiply by the fold chain once UTG and HJ are solved, item 38); a node no hand reaches keeps a uniform average strategy and the plain-deal EV (reverse: mark such rows, which item 38's "unreachable nodes" watch-for will do); band percentages use the plain deal's weights, `p(g) = combos / 1,326`, as a published range's percentage does (reverse: weight by the deal conditional on the opener's range); `best_response.py` repeats the leaf arithmetic on purpose (reverse: import it from `cfr.py` and lose the independence the plan asks for); `cfr.py` writes no file in this phase (reverse: item 38 adds the raw strategy output). Other edits: `HANDOFF.md` Environment (the Python and Solver tests rows) and code map; `PASSOFF.md` row 37 `IN FLIGHT`, the status note and the remainder prompt; `PLAN.md` phase 3a `IN FLIGHT` with the deviations. `KEY-SPEC.md` is unchanged: nothing was frozen. **Seen running:** nothing; this item has no screen and no sound. **Open:** (a) step 46 on this branch (item 36) and step 46 on `main` (board item 49) share a number; every citation of the equity step (`PASSOFF.md` row 36, `PLAN.md` phase 2, `KEY-SPEC.md` 7.1, `docs/conventions-python.md` M4 and its scope paragraph, this ledger's Environment and code map, and this step) must move with it when `gto-equity` merges; (b) the scope paragraph of `docs/conventions-python.md` names `validate_key.py`, `equity.py` and `equity_test.py` and not the five files of this step, and its M4 amendment says the test suite runs without numpy, which stopped being true at this step; the file is outside this item's list and is left for the merge or the close-out; (c) `best_response_test.py` imports the toy from `cfr_test.py`, so the two test files are not independent of each other; (d) `cfr.py` imports `best_response` for its report, so that dependency runs one way only. **Left owed:** Zach's answers to (a) and (b); the remainder prompt under row 37; the commit, which is Zach's.

**51. Item 37, second round: Zach's answers, and the equity-bent leaf model cannot land the 3-bet-pot bands in any shape (board item 37).** Done 2026-10-06 on Fable 5.1, in worktree `.claude/worktrees/gto-equity`, branch `gto-equity`, after step 50's commit `885294a`. Not yet committed. **Zach's answers, in chat on 2026-10-05, "all recs":** (a) the solver tests join the whole-repo gate at item 38, when the solver writes its output; (b) choice (3) of step 50, supersede the leaf model and re-tune, with choice (2), the wider ranges, as the fallback. **What this round found, which re-opens (b).** At hand level, at step 50's best in-range setting, the big blind 3-bets every offsuit ace and every pair against the small blind (EVs in bb: `A7o` call +0.07, 3-bet +0.47; `66` call +0.27, 3-bet +1.38; `A3o` call −0.14, 3-bet −0.02), the hands real play calls with, because a medium hand's flat realizes about 87 percent while its 3-bet wins +3 when the small blind folds (35 percent) and the edge bonus when it calls (49 percent); the small blind calls the 3-bet with `A2o` to `A9o` and `K4s` up, and continues against a 4-bet with 81 percent of its 3-bet range. Every raise node has the same shape: callers continue too much with medium hands, so aggression pays at every seat. Three more families were tried, each screened at 500 iterations with the scratch harness and the picks re-solved at 2,000 iterations (gains at most 0.00007: the solver converges at every setting tried; a wrong patch of the scratch check printed gains of 1.5 to 2.3 for two picks on 2026-10-06, because it replaced the caller's share with the realization factor, and the unpatched check gives 0.0 at the same settings; nothing in the repo was touched by it). Steeper curves, `k` 3 and 4 with `c` up to 1.5 (grid four, 108 settings; grid five, 64 settings with the 4-bet dials up to 1.2 and the share floored at zero): at most 15 of 19 at the screening count and 14 re-solved (`k` 4, `c_srp` 1.2, `c_srp_oop` 0.4, `c_3bp` 0.8, `c_3bp_oop` 0.4, `c_4bp` 0.5, `c_4bp_oop` 0.2: BTN opens 32, BB vs SB 3-bets 25, CO folds to a BTN 3-bet 23 and SB folds to a BB 3-bet 36 missed; the button's pairs open); those four bands are missed by all 172 steep settings. The wider settings of step 50 (grid three), re-solved at 2,000 iterations: all four picks fold a small pair on the button, and the two that land the fold bands do it with no calls at all (CO calls a BTN 3-bet 0 to 6 percent, BTN calls a BB 3-bet 2, SB calls a BB 3-bet 0) and 4-bets of 30 to 35 percent at every seat, a stable wrong strategy in the sense of `PLAN.md` phase 3a's watch-for. The symmetric bend of step 50 stays at 14 and folds the pairs. The smallest equity in the table is 0.0537 (`K2o` against `KK`), so without a floor the share goes negative above `c` 1.117 at `k` 2, 1.180 at `k` 3 and 1.247 at `k` 4. **Conclusion:** in the family "the caller's share is bent by its equity and the aggressor takes the rest", no shape (`k` 1 to 4), no `c` inside or outside the ranges, no floor and no symmetric variant lands the 3-bet-pot bands, and the two settings that come closest do so by never calling a 3-bet. What the bands describe (offsuit aces and small pairs that call rather than 3-bet, broadways that fold to a 3-bet, 4-bets at 7 to 20 percent) is a difference between hands of equal equity, which is `KEY-SPEC.md` section 4, item 3, and the spec's own fallback for it is RF-3 (section 11, (a)): a per-class adjustment from hand features. RF-3 is a design with hand-set coefficients, the "hand-built chart problem one level down" the spec warned of, so it is a scope decision for Zach, not a re-tune. Nothing is frozen; `config.py` and the hash are unchanged; row 37 stays `IN FLIGHT`. **The question put to Zach on 2026-10-06, with the recommendation:** (1) freeze step 50's `k` 2 in-range setting provisionally (13 of 19, the button's pairs open), record its six misses as findings in `KEY-SPEC.md` 8 marked provisional, let items 38 and 39 build on it, and open a new scoped item for RF-3 whose output re-freezes and re-solves (recommended: it unblocks the plumbing, keeps the record honest, and the solver re-runs in minutes); (2) scope RF-3 first and freeze nothing until it lands; (3) freeze the in-range setting as final and let the phase 4 Deep review judge the hands. **Gates:** no file under `solver/` or `app/` changed in this round; `python3 -m unittest discover -s solver -p '*_test.py'` was last green at step 50 (25 tests) and the app gate is unchanged (86 files, 629 tests). **Seen running:** nothing. **Open:** as step 50, plus (e) the equity-bent family is the wrong instrument for the 3-bet-pot bands, a finding about `KEY-SPEC.md` 3.2 and 8 together. **Left owed:** Zach's answer to the question above; the remainder prompt under row 37, whose step 1 records that answer; the commit, which is Zach's.

**52. The leaf-model dials frozen as provisional, item 38 opened, and board item 60 (RF-3) opened (board item 37, the remainder).** Done 2026-10-06 on Fable 5.1, in worktree `.claude/worktrees/gto-equity`, branch `gto-equity`, after step 51's commit `9b66e65`. Not yet committed. The session opened on Opus 5.5, read the item's `**Model: Fable 5.1**` line before anything else, and Zach switched it to Fable 5.1 (`/model claude-fable-5-1`) before the work began. **Zach's answer, in chat, 2026-10-06:** "provisional freeze, open the rf-3 item", choice (1) of step 51's question, recorded as Q5 in `KEY-SPEC.md` 11 (third batch) together with his 2026-10-05 answers (a) and (b) and the reason (b) could not be carried out. **Frozen, provisional:** `GAME["leaf_model"]` in `solver/config.py` holds step 50's best setting inside the ranges of 3.2: `k` 2, `c_srp` 0.5, `c_srp_oop` 0.2, `c_3bp` 0.4, `c_3bp_oop` 0, `c_4bp` 0.1, `c_4bp_oop` 0.05, `t_ip` 0.1, `t_sb` 0.25; every value inside its range, checked by a scratch line over `RANGES` and `DIAL_PATH`; `c_3bp_oop` is the integer `0`, so the canonical JSON writes `0` (7.5). `RANGES` keeps the starting values, which the hand-worked leaf tests use through `starting_game()`, so no leaf case changed. The new `spec_hash(GAME)` is `659cdfd1072b0ea27a0b74737ce6f3a67c63a329ed18595c6f1f8233ffe845a7`, recorded in `KEY-SPEC.md` 7.5 with the old value kept beside it, written into section 12 under a dated amendment, and pinned as `SPEC_HASH` in `solver/cfr_test.py`. No re-tune: the model and the ranges are unchanged, so step 2 of the remainder prompt did not apply. **Runs, 2026-10-06, load average 12 to 22 from other sessions:** `python3 solver/cfr.py` twice, 42.6 s wall the first time, the 30 output lines identical (`diff`). Gains at 1,000 iterations: CO subtree CO 0.00009, BTN 0.00008, SB 0.00002, BB 0.00002; BTN subtree BTN 0.00010, SB 0.00004, BB 0.00005; SB subtree SB 0.00008, BB 0.00013; at 2,000 every gain at most 0.00004; at 4,000 at most 0.00001; every one under the dial 0.005 and falling about four-fold per doubling. The band table matches step 50's to the decimal: CO opens 24.3; BTN opens 34.3 (missed, 40 to 48); SB opens 50.4; BB against BTN defends 63.8, 3-bets 15.047 (missed by 0.047, 9 to 15; the printed table rounds it to 15.0 and takes the verdict on the unrounded value) and calls 48.8; against CO defends 52.2 and 3-bets 10.3; against SB defends 63.6 and 3-bets 27.5 (missed, 12 to 20); SB against BTN 3-bets 17.5 and calls 0.0; BTN against CO 3-bets 14.1 and calls 1.2; CO folds 18.0 (missed, 52 to 72) and 4-bets 17.2 to a BTN 3-bet; SB folds 35.2 (missed, 55 to 80) to a BB 3-bet; BTN folds 35.7 (missed, 45 to 70) to a BB 3-bet; BB realizes 82.8 percent against BTN. 13 of 19 inside; the button opens every pair at 100 percent; the printed hash is the one above and the equity file's hash is unchanged. `python3 -m unittest discover -s solver -p '*_test.py'`: 25 tests, OK, 49.2 s. The app gate did not run: nothing under `app/` changed (`git status --short`). **Written:** `KEY-SPEC.md` 3.2 (a dated note under "Tuning": the sentence "each spot must land inside its bands" is not met by this model), 7.5, 8.1 (one dated clause pointing at 8.5), 8.5 (new: the 19 rows with the solved value and a verdict, six marked provisional, and what the six share), 11 (the third batch: the three choices with for and against, the answer) and 12; `PLAN.md` section 1 (BD-T20 with its two reversals), section 3 (the frozen values in the three dial rows), phase 3a `BUILT 2026-10-06` with the deviation from its done-when (the button's open rate), and a dated note under phase 3b (its done-when excludes the six bands; the tests join the gate there); `solver/config.py` (the values and a dated docstring sentence); `solver/cfr_test.py` (the hash); this ledger's Environment (the Solver tests row: the gate question answered, the run) and code map; `PASSOFF.md` row 37 `DONE: HANDOFF 52`, a status line under the remainder prompt, row 38 `OPEN` with its files widened to the gate documents, item 38's prompt (phase 3b: the five subtrees in seat order, the fold chain, gains per dealt hand, `solver/data/key.json` in the shape of 7.1, two runs `cmp`, the gate change), the intro of items 35 to 45 (which said only item 35 had a prompt), row 60, and item 60's section and prompt (RF-3: a Stage 1 research pass by an Opus 5.5 subagent, a Stage 2 options section 13 in `KEY-SPEC.md` with one GATE 1 batch, the supersession, the build in both leaf copies, a kept harness `solver/tune.py`, the re-freeze, the re-solve, the re-export and re-pin, a Fable 5.1 cold review; `HELD` until items 38 and 39 are `DONE`, lane H). Item 60 is numbered 60 because the main checkout's board holds row 59 (the merge of the second game-feel pass, `DONE: HANDOFF 50` there), read 2026-10-06; this branch's board had 58 as its highest. This step is 52 because this branch's last step is 51 and the main checkout's last is 50 (its step 50 is that merge, not this branch's solver step; see step 50, open (a)). **Build-level calls**, each with its reversal: the freeze is marked provisional in every place it is written (reverse: strike the word when item 60 lands, or when Zach makes it final, BD-T20's first reversal); item 60 is one item that scopes and builds, in lane H after 38 and 39, so its re-export lands on an exported key (reverse: split it into a scope item and a build item, or run it before 39 and let 39 export once); item 38 writes its raw output as a full key file that the validator checks (reverse: a strategy-only file and a converter in phase 4); the gate change is item 38's, not this item's, as Zach answered (a). **Seen running:** nothing; this item has no screen and no sound. **Open:** (a) to (d) of step 50 and (e) of step 51 stand; (f) `docs/README.md`'s `KEY-SPEC.md` line says "frozen 2026-10-05" and does not mention the provisional dials; the line is still true (the spec changes by amendment) and the file is outside this item's list, so it is left for item 38 or the close-out. **Left owed:** the commit, which is Zach's; item 38 (`OPEN`, Fable 5.1, lane H); item 60 (`HELD`, Fable 5.1, lane H).
