# Plan: the felto app

Status: `PLANNED`, proposed 2026-10-05 on Opus 5.5. GATE 2 answered the same day: Zach approved
the plan and every recommendation except `D13` (`DESIGN.md`, section 8). His answer to `D13`
brought seven items back into the first version, so this plan was amended the same day: section
0 rows 29 to 33, BD-23 to BD-28, phases 13 to 16, and an "Added for `D15` to `D21`" step in
phases 1, 3, 4, 8, 9, 11 and 12. The amendments wait on Zach's answers to `D15` to `D21`. The design is
`DESIGN.md` in this folder: what the app is and why. This file is the order of work: in what
order, by which model, and done when (`docs/AGENT-PRACTICES.md`, Part 2.2, Stage 4). Once Zach
approves it, it authorizes the whole run, and phases do not each need approval again.

Section 0 wins over the design wherever the two differ, because it was checked later.

## 0. Facts verified 2026-10-05 (supersede the design where they differ)

| # | Claim | Verified state | Citation |
|---|---|---|---|
| 1 | The art is still in no commit | HEAD holds 0 files under `assets/`; 129 are staged | `git ls-tree -r HEAD --name-only \| grep -c '^assets/'`; `git ls-files assets \| wc -l` |
| 2 | Local `main` is one commit ahead of GitHub | `main` is `2ba3288`, `origin/main` is `5da0bca` | `git branch -vv` |
| 3 | An agent worktree starts at `origin/main`, not at local HEAD | The sweep worktrees of 2026-10-05 were created at `5da0bca` | `git worktree list` |
| 4 | Agent worktrees leave an untracked folder | `?? .claude/` | `git status --short` |
| 5 | Zach's Expo apps pin one SDK line | Expo ~57.0.16 and ~57.0.9, React 19.2.3, React Native 0.86.2, expo-router ~57, `@expo/ui` ~57.0.13, TypeScript ~6.0.3, eslint ^9 | `~/Projects/lore/app/package.json:7,14,23,31,33,49`; `~/Projects/ezhomesteading/native/package.json:22,35,52,63,66,86` |
| 6 | Both use bun, vitest and the Expo eslint config, and neither uses jest | `lore/app/bun.lock`; vitest ^4.1 with a node environment on `src/**/*.test.ts`; `eslint-config-expo/flat` | `~/Projects/lore/app/vitest.config.mts:10-13`; `~/Projects/lore/app/eslint.config.js:1-10` |
| 7 | The house tsconfig | Extends `expo/tsconfig.base`, `strict: true`, paths `@/*` to `./src/*`; routes live in `src/app/`; `typedRoutes: true`; `lore` sets `reactCompiler: true` | `~/Projects/lore/app/tsconfig.json:1-24`; `~/Projects/lore/app/app.json:41-44` |
| 8 | Only `ezhomesteading` has a development build and on-device SQL | `expo-dev-client` ~57.0.10, `expo-sqlite` ~57.0.1, `expo-notifications` ~57.0.13, `expo-haptics` ~57.0.1, `react-native-svg` 15.15.4, and `eas.json` | `~/Projects/ezhomesteading/native/package.json:40,44,51,55,73`; `native/eas.json:6-49` |
| 9 | Expo SDK 57 floors | iOS 16.4, Android API 24 (Android 7) | `expo/Expo.podspec:39`; Context7 `/websites/expo_dev`, versions table row "57.0.0" |
| 10 | `react-native-svg` reads only the first font name | The list is cut to its first family in JavaScript | `react-native-svg/src/lib/extract/extractText.tsx:25` (in `~/Projects/ezhomesteading/node_modules`) |
| 11 | Android draws an unknown font in its default face | Looks for `fonts/<family>.otf` or `.ttf` in the app's assets, then asks `ReactFontManager` | `react-native-svg/android/.../TSpanView.java:1146-1177` |
| 12 | A font loaded with `expo-font` is found by SVG text | Android registers it with `ReactFontManager` for the NORMAL style only; iOS maps the alias | `expo-font/android/.../FontLoaderModule.kt:59`; `expo-font/ios/UIFont+FontFamilyAlias.swift:15` |
| 13 | `expo-image` reads SVG, with limits | iOS through SDWebImageSVGCoder on CoreSVG, which warns about non-system fonts; Android through AndroidSVG 1.4, with basic text only | `expo-image/ios/ExpoImage.podspec:33`; `expo-image/android/build.gradle:46`; Context7 `/sdwebimage/sdwebimagesvgcoder` |
| 14 | `react-native-svg-transformer` is in neither app | Not installed and not declared | `ls ~/Projects/ezhomesteading/node_modules/react-native-svg-transformer`; both `package.json` files |
| 15 | Metro reads SVG files as assets by default, and reaches outside the project | `svg` is in Metro's default `assetExts`; SDK 56 and later read files outside `watchFolders` on demand, on by default | `metro-config/src/defaults/defaults.js:35`; `@expo/cli/build/src/start/server/metro/instantiateMetro.js:251` |
| 16 | felto is not a workspace | No `package.json` at the root, so Expo adds no `watchFolders` of its own | `ls package.json`; `@expo/metro-config/build/getWatchFolders.js:73-77` |
| 17 | `expo-sqlite/kv-store` has a sync and an async API | `getItemSync`, `setItemSync`, `getItemAsync`, `setItemAsync` and AsyncStorage-style aliases | `expo-sqlite/build/Storage.d.ts:18,23,51,56,84,88` |
| 18 | Local notifications need no server | A `DAILY` trigger takes `hour` and `minute`; `scheduleNotificationAsync` returns an id; `cancelScheduledNotificationAsync(id)` removes one | `expo-notifications/build/Notifications.types.d.ts:278-283`; `cancelScheduledNotificationAsync.d.ts:21` |
| 19 | Haptics for right and wrong | `notificationAsync(NotificationFeedbackType.Success)` and `.Error` | `expo-haptics/build/Haptics.d.ts:9`; `Haptics.types.d.ts:9,17` |
| 20 | An agent can build and see both platforms here | Xcode 26.6 with iOS 26.5 and 18.3 runtimes and a booted iPhone 17 Pro simulator; the Android emulator with AVDs `Pixel_9` and `Medium_Phone_API_36`; `adb` on the path | `xcodebuild -version`; `xcrun simctl list devices available`; `~/Library/Android/sdk/emulator/emulator -list-avds`; `which adb` |
| 21 | The Android tools are not on the path, and the default Java is 23 | `emulator` is not found by `which`; JDKs 23.0.2 (default) and Zulu 17.0.14 | `which emulator`; `/usr/libexec/java_home -V` |
| 22 | JavaScript tooling | node 26.7.0, bun 1.2.9, npm 11.19.0, `eas` at `/opt/homebrew/bin/eas` | `node --version`; `bun --version`; `which eas` |
| 23 | The current node's ring is fixed at 60% | `node(*NODE_STATES["available"], ring=0.6)` | `tools/build_icons.py:368` |
| 24 | Only the card faces hold text | 52 files, all in `assets/icons/cards/` | `grep -lE '<text' assets/icons/*/*.svg assets/mascots/*/*.svg` |
| 25 | `ezhomesteading` has two TypeScript standards that disagree | `docs/conventions-typescript.md` (146 lines, 11 rules, seeded by `personal-config` with placeholder examples, every rule tagged review) and `docs/conventions.md` (499 lines, the one its `CLAUDE.md:4` names). Rule ids such as F1, T1, L1 and X1 mean different things in each | `wc -l`; `~/Projects/ezhomesteading/CLAUDE.md:4` |
| 26 | The ledger's limits section has no line on an app | It covers generator runs, single SVG files in the browser pane and Rive import. Row 20 shows an agent can also build the app and see it on both simulators, but not on Zach's phone | `HANDOFF.md:34-38` |
| 27 | Board item 4 is open and owns the Python standard | `docs/conventions-python.md`, which phase 1 also edits | `PASSOFF.md:24` |
| 28 | The expo-ui skill names one path wrong | It says `community/datetimepicker`; the package exports `community/datetime-picker`, and 57.0.13 has no universal `Menu` | `~/.claude/plugins/cache/claude-plugins-official/expo/1.13.6/skills/expo-ui/SKILL.md:33`; `@expo/ui/package.json:31` |
| 29 | SDK 57 pins the audio, orientation and system UI packages | `expo-audio` ~57.0.4, `expo-screen-orientation` ~57.0.1, `expo-system-ui` ~57.0.2 | `expo/bundledNativeModules.json:24,79,91` in `~/Projects/lore/app/node_modules` |
| 30 | iPad simulators exist | iPad Pro 13-inch (M5), iPad Pro 11-inch (M5), iPad mini (A17 Pro), iPad Air 13-inch (M4) | `xcrun simctl list devices available` |
| 31 | No Android tablet emulator, and no tool here to make one | AVDs `Medium_Phone` and `Pixel_9` only; `~/Library/Android/sdk/cmdline-tools` does not exist, so `avdmanager` is absent | `ls ~/.android/avd`; `ls ~/Library/Android/sdk/cmdline-tools` |
| 32 | Two colours in the art assume a light page | The hard shadow `#C9CDE2` and the ring track `#DDE1EC` | `tools/common.py:8`; `tools/build_icons.py:271` |
| 33 | An agent cannot hear | No tool here plays audio to the agent; Python's `wave` module can read a file's length, rate and samples | The tool list of this session; `python3 -c 'import wave'` |

## 1. Decisions taken since ratification

Build-level calls that carry out the design. Each has a one-line reversal. A later deviation
cites the number.

- **BD-1. bun, with the manifest in `app/`.** `app/package.json` and `app/bun.lock`; the repo
  root stays free of any manifest, so the Python gate and the fresh-checkout recipe for
  `tools/` do not change. House precedent: `lore` (row 6). Reverse: add a root workspace.
- **BD-2. Versions come from `bunx expo install`,** which picks the SDK 57 version of each
  package; `lore`'s pins (row 5) are the reference. Reverse: pin by hand.
- **BD-3. A development build from the first build** (`expo-dev-client`, local
  `bunx expo run:ios` and `run:android`). Rive needs one later (`DESIGN.md`, row 18), and the
  agent builds locally anyway. No EAS build in this plan. Reverse: run in Expo Go until Rive.
- **BD-4. Tests are vitest in a node environment, on pure logic only** (row 6). Screens are
  proven by screenshots, not component tests. Code under `src/game/`, `src/cards/` and
  `src/content/` imports no React Native module, so it runs in node. Expo documents `jest-expo`
  instead; the house runs vitest, and nothing here needs a native mock. Reverse: add `jest-expo`
  and React Native Testing Library for component tests.
- **BD-5. Lint is `expo lint` with `eslint-config-expo/flat`, and there is no formatter,** as in
  `lore` (row 6). Reverse: add prettier.
- **BD-6. SVG files draw through `react-native-svg`, imported as components by
  `react-native-svg-transformer`,** with SVGO turned off so the bytes the generator writes are
  the bytes that draw. `expo-image` is ruled out by its text limits (row 13). Neither house app
  imports SVG files (row 14), so this is new to Zach's stack. Reverse: load each file with
  `react-native-svg`'s `LocalSvg` at run time.
- **BD-7. Metro reaches `../assets` by an alias and an explicit `watchFolders` entry.** The
  tsconfig path `@art/*` points at `../assets/*`, which keeps the "no parent-relative imports"
  policy (`.personal-config.json`, `practices.imports`). On-demand file access already reads
  outside the project (row 15); the explicit entry makes a regenerated SVG reload while the app
  runs. Reverse: drop the entry.
- **BD-8. Storage is `expo-sqlite/kv-store`:** one key, one JSON value with a `version` field.
  It is Expo's AsyncStorage replacement with a sync read for start-up (row 17), and
  `ezhomesteading` already stores on SQLite (row 8). Reverse: AsyncStorage, as in `lore`.
- **BD-9. The generator writes a second current node,** `assets/icons/path/node_current_base.svg`:
  the same 270 by 270 canvas, ring track, disc and glyph as `node_current.svg`, without the
  progress arc. The app draws the arc over it from the player's progress, with the geometry of
  `tools/build_icons.py:268-276`. `node_current.svg` does not change. The icon count goes from 76
  to 77. Reverse: delete the new file and draw `node_current.svg` as it is.
- **BD-10. Content is TypeScript modules** checked against the schema with `satisfies`, so a
  malformed exercise fails the typecheck before it fails a test. Reverse: JSON files and a
  schema test.
- **BD-11. The hand evaluator lives in `app/src/cards/` and only tests call it** in the first
  version. Random drills can call it later (`DESIGN.md`, `D13`). Reverse: nothing to reverse.
  *Superseded 2026-10-05 by `D21`, if Zach accepts it: the app calls the evaluator at run time
  for the Practice tab. The first half (it lives in `app/src/cards/`) stands.*
- **BD-12. Every game rule takes the time as an argument.** No rule reads the clock. The day key
  is the phone's local calendar date. The test script fixes `TZ=America/New_York`, so hazard 9
  and a daylight-saving change are tested on purpose, not by the machine's zone. Reverse: none
  needed.
- **BD-13. Named fixture states for checks.** In a development build only, the deep link
  `felto://dev/fixture/<name>` loads a named player state, so a screenshot or a runtime-pass
  entry names a fixture, not an id. Reverse: delete the dev route.
- **BD-14. One config module and one token module.** Every dial (`DESIGN.md`, sections 4 and
  10.2) is in `app/src/config/dials.ts`. Every colour and size the app uses is in
  `app/src/theme/tokens.ts`, and each colour copied from the art cites its generator line.
  Reverse: have the generator write the tokens as JSON (section 4).
- **BD-15. Phase 3 installs every dependency this plan names,** so no later phase, and no
  parallel lane, edits `package.json` or `bun.lock`. A later addition is a deviation, recorded in
  its phase. Reverse: none needed.
- **BD-16. Route files default-export their screen,** because expo-router requires it. It is the
  one sanctioned divergence from the owner policy of named exports
  (`.personal-config.json`, `practices.exports`), and the TypeScript standard registers it.
- **BD-17. The TypeScript standard starts from the `personal-config` seed** (row 25, the
  146-line file, which holds the same owner policy as felto's `.personal-config.json`) and takes
  Expo rules from `ezhomesteading/docs/conventions.md` where felto has the same shape. Its rule
  ids are felto's own; no id is copied with its number. Until felto has code, an example may come
  from `ezhomesteading`, labelled with its path; phase 12 replaces them. Reverse: none needed.
- **BD-18. Reminders are single notifications planned a week ahead.** At each app start and on
  each settings change, the app cancels its reminders and schedules one `DATE` notification at
  the reminder time on each of the next seven days that has no finished lesson. Finishing a
  lesson cancels that day's. A `DAILY` trigger (row 18) would fire on days already played.
  Reverse: one `DAILY` trigger.
- **BD-19. Haptics on every answer:** success for right, error for wrong (row 19).
  *Amended 2026-10-05 (board item 27, game-feel `GF-3`, `HANDOFF.md` step 30): the buzz follows a
  stored Haptics switch in Profile, on by default, and no longer only the phone's own setting
  (stored version 3; `app/src/feedback/moments.ts`, `app/src/feedback/should-buzz.ts`). Success
  for right and error for wrong stand.*
- **BD-20. App config:** light appearance only, portrait only, no tablet layout (`DESIGN.md`,
  `D13`), `typedRoutes: true` and `reactCompiler: true`, as in `lore` (row 7). Reverse: per flag.
  *Superseded in part 2026-10-05 by `D16` and `D17`, if Zach accepts them: the appearance
  follows the phone (`userInterfaceStyle: automatic`, with `expo-system-ui`), every orientation
  is allowed, and tablets are supported. `typedRoutes` and `reactCompiler` stand.*
- **BD-21. `.claude/worktrees/` goes into `.gitignore`** (row 4), so a lane's worktree can never
  be swept into a commit. Phase 2 makes the change.
- **BD-22. The rank font is embedded at build time** through the `expo-font` config plugin as
  `FeltoRank.ttf`, so Android finds it in its assets by file name (row 11) at any weight, and no
  card draws before the font exists. If the plugin route fails, the fallback is `useFonts` at
  start, with the splash screen held until it resolves (row 12 says Android then registers the
  NORMAL style only, which phase 3 checks). Applies only if Zach accepts `D14`.

Added 2026-10-05 for `D15` to `D21`; each stands or falls with its decision.

- **BD-23. `tools/build_sounds.py` writes the effects** (`D15`): standard library only
  (`math`, `struct`, `wave`), no randomness, 16-bit mono WAV at 44,100 Hz, each effect under one
  second with a short fade at both ends, to `assets/sounds/`. The whole-repo gate runs it after
  the two SVG generators. Reverse: replace the generator with recorded files.
- **BD-24. Playback is `expo-audio`** (row 29), with one player per effect loaded at start, and
  the Sound switch kept in the data module with the other settings. Reverse: none needed.
- **BD-25. The dark-mode colour swap happens at import** (`D16`): the transformer's
  `replaceAttrValues` turns `#C9CDE2` and `#DDE1EC` (row 32) into props, and the art module
  fills them from the theme. A vitest test reads `tools/common.py` and `tools/build_icons.py`
  and fails if either value changes there, so the coupling is loud. Reverse: have the generators
  write dark copies.
- **BD-26. Random dealers are seeded** (`D21`): every dealer takes a seeded generator, so a test
  replays any deal, and each dealer only deals spots that meet its kind's conditions (an `outs`
  spot holds a draw to the named target and does not already make it). Reverse: none needed.
- **BD-27. One screen wrapper draws the centred column** (`D17`), its width from the dial, and
  the art sizes come from tokens scaled by the column width. Android tablet checks run on the
  `Pixel_9` emulator with `adb shell wm size 2560x1600` and `adb shell wm density 320`, reset
  with `wm size reset` and `wm density reset` (row 31). Reverse: a tablet emulator, if Zach
  makes one in Android Studio.
- **BD-28. The mascot names live in `app/src/content/cast.ts`** (`D18`), and all copy reads them
  from there. Reverse: none needed.

## 2. Phases

Phase numbers are this plan's. Each phase is one board item in `PASSOFF.md` (phase n is item
n + 4, so items 5 to 20), so
the board stays the one list of what is next and the "Files it owns" check covers the app work.

| # | Phase | Driver | Subagents | Est. context | Why that shape |
|---|---|---|---|---|---|
| 1 | Change the icon generator for the app | Mechanical (Sonnet 5) | none | comfortable | A small, bounded generator change with an exact art diff; it runs first because phase 3's screenshots must show its output |
| 2 | Write the TypeScript standard and re-add the app rules | Default (Opus 5.5) | 1 Mechanical sweep | comfortable | `CLAUDE.md:3-5` forbids app code before a standard exists |
| 3 | Scaffold `app/` and draw the art on both platforms | Default | none | full | Native builds on two platforms dump long output; this phase carries every config decision, so nothing else goes in it |
| 4 | Game state and the data module | Default | none | comfortable | Pure rules and one storage module: the data layer comes first (Part 5 seams) |
| 5 | Cards, the evaluator and the content schema | Default | 1 Deep review | comfortable | The evaluator is where a silent error lives (hazard 4); one narrow Deep review of it |
| 6 | Content: units 1 and 2 | Default | 1 Default review | full | 100 written exercises; the reading of every concept item is a subagent's job |
| 7 | Content: units 3 and 4, and the preflop chart | Default | 1 Deep review | full | The chart is a strategy claim; one narrow Deep review of the chart and its keys |
| 8 | Tabs, the path and the stat bar | Default | none | full | The first screens, on both platforms |
| 9 | The lesson: exercises, feedback and finish | Default | none | full | The core loop. If it runs long, it hands the last two exercise kinds to a pass-off |
| 10 | Boss, review, chest and lives | Default | none | full | The rules of phase 4 put on screen |
| 11 | Profile, settings and the reminder | Default | none | comfortable | Native controls and local notifications |
| 12 | Close out: standard examples, runtime pass, records | Mechanical | none | comfortable | Doc reconciliation |
| 13 | Write the sound generator (`D15`) | Default | none | comfortable | Sound design is judgment, and an agent cannot hear it, so Zach approves by ear |
| 14 | Random dealers for practice (`D21`) | Default | 1 Default review | comfortable | Pure code over the evaluator, checked by seeded tests |
| 15 | The Practice tab (`D21`) | Default | none | comfortable | Reuses the lesson screen |
| 16 | Onboarding and the placement check (`D20`) | Default | none | comfortable | Three screens and one reuse of the lesson screen |

Lanes, each in its own checkout:

- **Lane A (tools):** board item 4, then phase 1, then phase 13 once phase 3 is built. Main
  checkout.
- **Lane B (the app):** phases 2, 3, 4, 8, 9, 10, 11, 15, 16, 12, in that order. Main checkout.
- **Lane C (content):** phases 5, 6, 7, 14, in a worktree, after phase 3. A worktree starts at
  `origin/main` (section 0, row 3), so Zach pushes before lane C starts.

Waits: phase 1 waits on board item 4 (both edit `docs/conventions-python.md`). Phase 2 waits on
phase 1 (both edit `CLAUDE.md`). Phase 3 waits on phase 2. Phases 4 and 5 wait on phase 3. Phase
8 waits on phases 4 and 6, with lane C's branch merged into `main`. Phase 9 waits on phases 8
and 13. Phase 13 waits on phase 3 (both edit `CLAUDE.md` and the gate). Phase 14 waits on phase
7. Phase 15 waits on phases 10 and 14, with lane C merged again. Phase 16 waits on phase 15.
Phase 12 waits on every other phase.

Every phase except phase 1 also waits on Zach's commit of the art and of this folder (hazard 1).

### Phase 1. Change the icon generator for the app

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Mechanical (Sonnet 5). Lane A. Waits on board item 4 and GATE 2.

Scope:

1. Run the whole-repo gate and `git diff --stat -- assets/icons assets/mascots`. Both must be
   clean before the first edit.
2. In `tools/build_icons.py`, write `path/node_current_base.svg` (BD-9): the current node's
   canvas, ring track, disc and glyph, with no `ring_progress` element. Keep `node_current.svg`
   byte for byte.
3. If Zach accepted `D14`: put `'FeltoRank'` first in `FONT` (`tools/build_icons.py:20`). If he
   did not, skip this step.
4. Run the gate. The run line must print 77.

Added for `D19` on 2026-10-05, if Zach accepts it: write `ui/streak_freeze.svg`, the flame of
`ui_flame()` (`tools/build_icons.py:289`) in the gem's palette (face `#38B6F5`, depth `#0E6FB0`,
`:324`; lights `#7FD3FF` and `#A6E3FF`, `:325` and `:328`), through one parameterised function,
not a second copy of the flame path. The run line then prints 78, and the hand-back shows the
rendered icon for Zach to approve.
5. Look at `node_current_base.svg` and one card face, rendered from the files in the browser
   pane (not the preview pages).
6. Update every line citation that moved: `docs/conventions-python.md`, `CLAUDE.md` and the
   standing sections of `HANDOFF.md` (the icon count 76 becomes 77 where it is stated).

Subagents: none.

Done when: `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint --noout
assets/icons/*/*.svg assets/mascots/*/*.svg` exits 0 and prints 77 and 18 (78 with `D19`);
`git diff --stat -- assets/icons assets/mascots` lists the new file (two with `D19`) and, with
`D14`, the 52 card faces and nothing else; `git diff -- assets/icons/cards | grep '^[-+]<' | grep -v font-family`
prints nothing (the only changed attribute is the font list); and the rendered
`node_current_base.svg` shows the track and the disc with no gold arc.

Watch for: the ring geometry is defined once in `node()` (`tools/build_icons.py:258-285`); a
second copy of the numbers would break rule H1 of the Python standard.

### Phase 2. Write the TypeScript standard and re-add the app rules

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phase 1.
As built: the standard has 21 rules in six groups (N, B, V, O, U, Q) and one registry entry,
Z1 for BD-16; its letters are used by neither `docs/conventions-python.md` nor either
`ezhomesteading` standard. B2 adds `src/drills/` to the three folders BD-4 names, because phase
14 tests it the same way. The two re-added rules sit in `docs/AGENT-PRACTICES.md` Part 6, under
"Stored player data and both platforms". The sweep ran as a read-only subagent in the main
checkout, not in its own worktree (the `/autopilot` override).

Scope:

1. Read `docs/AGENT-PRACTICES.md` Part 8.1, the seed
   `~/Projects/ezhomesteading/docs/conventions-typescript.md` in full, and the sweep's inventory
   of `~/Projects/ezhomesteading/docs/conventions.md` (subagent below).
2. Write `docs/conventions-typescript.md` for every `.ts` and `.tsx` file under `app/` (BD-17):
   self-contained; ids that never get renumbered; a tag and a provenance label on every rule;
   the owner policy from `.personal-config.json` (comments say why; functions of 6 to 15 lines;
   named exports; kebab-case files; no parent-relative imports; strict types; logic extracted by
   concept; one data client; loading, empty and error states; tokens only; a new test file per
   feature); a sanctioned divergence registry that starts with BD-16; and the Expo rules felto
   needs: route files thin, `@expo/ui` controls inside a `Host`, platform files named
   `.ios.tsx` and `.android.tsx`, no React Native import under `src/game/`, `src/cards/` or
   `src/content/` (BD-4), and no clock read inside a rule (BD-12). State that lint is
   `eslint-config-expo` and that every other rule is review.
3. Re-add to `docs/AGENT-PRACTICES.md` the two rules cut on 2026-10-04 (lines 34-37), in felto's
   words: stored player data is migrated, never dropped; every screen is seen on both
   platforms. Record the re-adding in its header list of cuts.
4. Point `CLAUDE.md` at the new standard (its first blockquote and the `docs/` row). Write
   `docs/README.md`, the docs index of Part 8.2, which felto now needs: it has more than one doc.
5. Add `.claude/worktrees/` to `.gitignore` (BD-21).

Subagents: one Mechanical (Sonnet 5), own worktree, read only. Work-list: every rule id in
`~/Projects/ezhomesteading/docs/conventions.md` with its title, its tag, and whether it names
Expo, native, Next.js or web. It returns the list and nothing else.

Done when: the whole-repo gate exits 0; `git diff --stat -- assets tools` is empty; every rule
in the new standard has an id, a tag, a provenance label and an example pair, checked by reading
it rule by rule; and Zach has read the rule list in the hand-back.

Watch for: copying an `ezhomesteading` rule id with its number (row 25 shows the two files there
already disagree); a rule written for Next.js; padding rules that lint already settles.

### Phase 3. Scaffold `app/` and draw the art on both platforms

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phase 2.
As built: Expo 57.0.26 with React Native 0.86.3, from `bunx expo install`. The app gate is
`bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test`, run from the
root with no `cd`; the form `bun --cwd app run <script>` exits 0 without running anything
(bun 1.2.9), so it is banned in `CLAUDE.md`. `FeltoRank.ttf` is Nunito ExtraBold
(`@expo-google-fonts/nunito` 0.4.2) with its name table set to the family `FeltoRank` by
fontTools 4.62.1, timestamps kept, so the bytes rebuild the same (SHA-1 `156acf08`); iOS takes
the family name from the file, so a file name alone would not do. Both platforms draw the
ranks in it. The SVGr config lives in `app/svg-transformer.js`, because svgr looks for an
`.svgrrc` beside each SVG, which is in `../assets`. Metro also needs
`resolver.nodeModulesPaths` so files in `../assets` resolve `react-native-svg`. The art module
is `app/src/art/` with five entries; phase 8 adds the rest. The `expo-splash-screen` config was
dropped: with no image it breaks the Android resource link. The iPad Pro 13-inch simulator was seen in
portrait only, from a Release build (the debug build stops on an "Open in Felto?" prompt that
the simulator tool had no grant to tap); no iOS simulator can be rotated from here, so iPad
landscape is owed. Android tablet landscape was seen through `wm size 2560x1600`.

Scope:

1. Read `docs/conventions-typescript.md` in full. Run the whole-repo gate; the art diff must be
   empty.
2. Create the Expo SDK 57 app in `app/` with bun (BD-1, BD-2), routes in `app/src/app/`.
3. Install every dependency the plan names (BD-15): `expo-router`, `expo-dev-client`,
   `@expo/ui`, `react-native-svg`, `react-native-svg-transformer`, `expo-sqlite`,
   `expo-notifications`, `expo-haptics`, `expo-font`, and `@expo-google-fonts/nunito` if `D14`
   was accepted; dev: `typescript`, `eslint`, `eslint-config-expo`, `vitest`.
4. Configure: `app.json` with `D12`'s name and identifiers and BD-20's flags; `tsconfig.json` as
   in `lore` plus the `@art/*` path (BD-7); `metro.config.js` for the transformer and the
   `watchFolders` entry (BD-6, BD-7); SVGO off; a `*.svg` module declaration; `eslint.config.js`;
   `vitest.config.mts` with `TZ=America/New_York` (BD-12); scripts `typecheck`, `lint`, `test`,
   `ios`, `android`, `start`. Add `app/node_modules`, `app/ios`, `app/android` and `app/.expo`
   to `.gitignore`.
5. Create `app/src/config/dials.ts` with every dial from `DESIGN.md` sections 4 and 10.2, and
   `app/src/theme/tokens.ts` (BD-14).
6. With `D14`: embed `FeltoRank.ttf` (BD-22).
7. Write one development route, `app/src/app/dev/art.tsx`, that draws `card_A_spades`,
   `card_10_hearts`, `node_current_base`, `fish_happy` and `gem` from `@art/...`, and one
   `@expo/ui` `Button` inside a `Host`. Write one vitest test file so the test gate runs.
8. Build and open it on the iOS simulator (`bunx expo run:ios`) and on the `Pixel_9` emulator
   (`bunx expo run:android`, with `ANDROID_HOME` set and Java 17 if the build needs it, section
   0, row 21). Take a screenshot of each.
Added for `D15` to `D17` on 2026-10-05, each if Zach accepts it: install `expo-audio` and
`expo-system-ui` with the rest (BD-15); set the config of BD-20's amendment; add the colour swap
of BD-25 and its test; give `tokens.ts` a light and a dark value for every colour; add the
screen wrapper of BD-27. The art route is also seen in dark mode on both platforms and on an
iPad simulator in landscape.

9. Update the records: `CLAUDE.md` (Stack, Architecture, Directory map, Commands with the app
   gate as verified, and the lines that say there is no app, `CLAUDE.md:34` and `:86`);
   `HANDOFF.md` Environment, including what an agent can now see (row 26); the fresh-checkout
   recipe and the HEAD-isolation command in `docs/AGENT-PRACTICES.md` Part 6 and Appendix A;
   `gateCommand` in `.personal-config.json`, which becomes the Python gate followed by the app
   gate.

Subagents: none.

Done when: the new whole-repo gate exits 0, which is the Python gate followed by
`cd app && bun run typecheck && bun run lint && bun run test` (the exact form is fixed by this
phase and recorded in `CLAUDE.md`); `git diff --stat -- assets tools` is empty; and the two
screenshots show, on iOS and on Android, the two cards with rounded ranks of the same shape, the
ringless current node, the fish, the gem and a native button. A gate cannot see any of that.

Watch for: the transformer or SVGO rewriting ids or attributes (compare one rendered card with
the browser pane); Android drawing `FeltoRank` in the default face because the SVG asks for
weight 800 (row 12); a native build that fails for an environment reason (Java, `ANDROID_HOME`)
before any real one. If the ranks still differ between platforms after BD-22, stop and ask. If
the phase runs long, the dark-mode and tablet checks go to a pass-off prompt (Part 5).

### Phase 4. Game state and the data module

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phase 3.
As built: the rules take a `PathOutline` (unit ids and lesson ids in path order,
`app/src/game/path.ts`), not the content schema, so this phase does not wait on phase 5; phase 8
builds the outline from the content. The stored value is `{ version, player }` under
`felto.player`, version 1 (`app/src/storage/migrations.ts`); an unreadable value goes to
`felto.player.backup.<epoch ms>`, one key per failure, so no backup overwrites another. Missed
days are applied lazily (`settleStreak`): each missed local day uses one held freeze, and the
first missed day with none left breaks the streak and the freezes are gone. A boss passed by play
readies the chest; the placement check records its units in `placedUnits`, so their chests stay
closed until the boss is played. The provider is `app/src/storage/player-provider.tsx` with
`usePlayer` in `use-player.ts`; it reads the store synchronously, so there is no loading state.
Not built here, because the files belong to the root layout and the dev routes: mounting
`PlayerProvider` in `app/src/app/_layout.tsx`, and the route `app/src/app/dev/fixture/[name].tsx`
for `felto://dev/fixture/<name>`, which calls `actions.loadFixture` (BD-13).

Scope:

1. In `app/src/game/`, one file per rule of `DESIGN.md` `D8`, each a pure function of the
   state, the content and the time: lives (spend, regain, refill for gems), streak (day key,
   record a finish, current length), XP, the node state of every path node (`DESIGN.md` 10.1),
   the boss draw (seeded) and pass mark, the review set, and the chest award.
2. In `app/src/storage/`, the one data module (`DESIGN.md` `D3`, BD-8): a pure core that loads,
   checks, migrates and saves the versioned state, behind a thin adapter over
   `expo-sqlite/kv-store`, so the core runs in vitest. A stored value it cannot read is copied
   to a backup key before a fresh state is written; it is never dropped.
3. A provider and a hook that give screens the state and its actions. No screen touches storage.
4. The named fixture states and the dev deep link (BD-13): at least `fresh`, `unit1-mid`
   (lessons 1 to 3 of unit 1 finished, 2 lives, a 4-day streak, 20 gems), `zero-lives` and
   `boss-ready`.

Added for `D19` to `D21` on 2026-10-05, each if Zach accepts it: the streak freeze (buy, hold
at most the dial, spent by itself on a missed day); practice results (XP, and a finished set
counts for the streak); the first-launch flag and the placement result; the Sound setting.
Tests add: one freeze covers one missed day; two missed days with one freeze break the streak;
a freeze is not spent on a day with a finish; a practice set left early does not count; a
placement pass marks units 1 and 2 finished and gives no gems.

Subagents: none.

Done when: the whole-repo gate exits 0, and vitest shows these tests passing by name: a finish
at 21:00 New York time and another at 08:00 the next morning give a 2-day streak (hazard 9); a
day with no finish resets the streak; a finish on the spring-forward date of 2027-03-14 counts
once; a life comes back at 4:00:00 and not at 3:59:59; a refill needs 20 gems; the boss draw is
the same for the same seed; an unreadable stored value lands in the backup key.

Watch for: a `Date` read in a rule (BD-12); UTC methods where local ones are meant; the storage
core importing a native module, which fails in node.

### Phase 5. Cards, the evaluator and the content schema

**Status:** `BUILT 2026-10-05, commit pending (Zach); Deep review done (HANDOFF step 18)`. Driver
Default (Opus 5.5). Lane C, built in the main checkout under `/autopilot`. Waits on phase 3.
As built: `app/src/cards/` holds the card type and notation (`card.ts`), the deck (`deck.ts`),
the evaluator (`evaluate.ts`: it scores every five-card subset of five to seven cards and keeps
the highest, so no shortcut picks the hand), showdown with splits (`showdown.ts`), descriptions
(`describe.ts`), outs (`outs.ts`: unseen cards that give the target category or better on the
next card), pot odds and the rule of 2 and 4 (`odds.ts`: `pot` is always the pot before the
bet), and the 169-hand notation for phase 7 (`hand-class.ts`). The enumeration test takes about
2 seconds. A second evaluator, written by another method inside
`evaluate-cross-check.test.ts`, agrees on every five-card hand and on 200,000 seeded six- and
seven-card deals. `app/src/content/` holds the schema (`schema.ts`), the four unit records
(`outline.ts`), the validator (`validate.ts`), `computeKey` (`compute-key.ts`) and `catalog.ts`,
where phases 6 and 7 list each unit and the chart so that `keys.test.ts` checks them. The `odds`
kind has three asks: `pot-odds`, `equity` and `call`.

Scope:

1. In `app/src/cards/`: the card type and its two-character notation (`As`, `Td`), the deck,
   the evaluator (the best five of five to seven cards: category and ranking), comparison with
   splits, a description ("two pair, kings and fives"), outs to a named target, and the pot-odds
   arithmetic.
2. In `app/src/content/`: the schema of `DESIGN.md` 10.4 (unit, lesson, the six exercise
   kinds), a structural validator (ids unique, two to four options, the key in range, ten
   exercises per lesson and five lessons per unit from the dials, no card twice in one spot),
   and `computeKey` for the five kinds a program can check.
3. The four unit records with their titles and lesson titles, in `D10`'s register, so phase 8
   can draw the path before all the exercises exist.

Subagents: one Deep (Fable 5.1), own worktree, verdict only. Its job: read the evaluator, the
outs counter and their tests, and name any input where the category, the comparison or the
count is wrong, with the input and the right answer. It does not edit.

Done when: the whole-repo gate exits 0; a test enumerates all 2,598,960 five-card hands and gets
these counts: straight flush 40 (4 of them royal), four of a kind 624, full house 3,744, flush
5,108, straight 10,200, three of a kind 54,912, two pair 123,552, one pair 1,098,240, high card
1,302,540; tests cover the wheel (A-2-3-4-5), a flush beaten by a higher flush on a kicker, a
board that plays for both players, and the classic draws (a flop flush draw has 9 outs, an
open-ended straight draw 8, a gutshot 4); and the Deep review's findings are each fixed with a
test or written into the hand-back as open.

Watch for: the ace as low card in a straight only; comparing two full houses by trips first;
seven-card selection that keeps a pair over a better straight. The enumeration test must stay
fast enough to run in every gate (aim for under 10 seconds).

### Phase 6. Content: units 1 and 2

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default. Lane C. Waits on phase 5.
As built: see `HANDOFF.md` ledger step 17 (board item 10).

Scope:

1. Write units 1 (Hands) and 2 (The table) as data: five lessons of ten exercises each per unit,
   with explanations, in `D10`'s register. Teach a term before an exercise uses it.
2. Every key a program can check has its test (`DESIGN.md` 10.4).
3. Print a digest of both units to the scratchpad: each prompt, its options, its key and the
   computed key.

Subagents: one Default (Opus 5.5), own worktree, verdict only. Work-list: every `concept`
exercise in units 1 and 2. It returns each one that is wrong, has two defensible answers, or
uses a term that was not yet taught, with the reason.

Done when: the whole-repo gate exits 0; the validator counts 50 exercises in each unit; every
computed key equals its data key; and every finding of the review is fixed or listed as open.

Watch for: rules that differ by game or room (a dead button, a straddle): leave them out of the
first version rather than teach one house's rule.

### Phase 7. Content: units 3 and 4, and the preflop chart

**Status:** `BUILT 2026-10-05, commit pending (Zach); Deep review done (HANDOFF step 18)`. Driver
Default (Opus 5.5). Lane C, built in the main checkout under `/autopilot`. Waits on phase 6.
As built: the chart is `app/src/content/opening-chart.ts` (`OPENING_CHART`, raise first in,
6-max, 100 big blinds, blinds only, no ante; written from principles and tighter than common
solver-based charts: UTG 152 of 1,326 combinations, HJ 206, CO 326, BTN 454, SB 382), re-exported
by `catalog.ts`. `opening-chart.test.ts` checks the hand names, the containment UTG to HJ to CO
to BTN, CO inside SB inside BTN (a judgment call beyond the scope's test), and pins the counts.
Unit 3 is `units/preflop.ts` (21 `concept`, 29 `preflop`); unit 4 is `units/odds.ts` (14
`concept`, 14 `outs`, 7 `pot-odds`, 7 `equity`, 8 `call`). `keys.test.ts` checks all 65
checkable keys of the two units against `computeKey`, unchanged.

Scope:

1. Write the opening chart for a 6-max table at 100 big blinds: one range per seat from UTG to
   SB when every player before has folded, in the 169-hand notation (`AKs`, `T9o`, `77`). It is
   a simplified chart for learning, and its prompt text says so.
2. Write unit 3 (Preflop) with its keys taken from the chart, and unit 4 (Outs and odds).
3. Tests: each later seat's range from UTG to BTN holds every hand of the seat before it; every
   unit 3 key equals the chart; every unit 4 key equals the counter or the arithmetic.

Subagents: one Deep (Fable 5.1), own worktree, verdict only. Its job: read the chart and the
unit 3 keys, and name any hand whose fold or raise is out of line with common 100-big-blind
6-max opening practice, with the reason. It does not edit.

Done when: the whole-repo gate exits 0; the containment test passes; the validator counts 50
exercises in each unit; and the Deep review's findings are each fixed or listed as open with
Zach's call.

Watch for: a chart copied from a named training site (write it from the principles and let the
review check it); pot odds stated as a ratio in one place and a percentage in another.

### Phase 8. Tabs, the path and the stat bar

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phases 4 and 6.
As built: three `NativeTabs` (Learn, Practice, Profile) in `app/src/components/app-tabs.tsx`,
under `app/src/app/(tabs)/`; `(tabs)/index.tsx` is now `/`, so the temporary redirect file
`app/src/app/index.tsx` is deleted. `PlayerProvider` is mounted in `app/src/app/_layout.tsx` and
ran on both platforms: a fixture written by it survived a full restart of the app. The BD-13
route is `app/src/app/dev/fixture/[name].tsx` (hook `app/src/screens/use-load-fixture.ts`; it
does nothing unless `__DEV__`). The game `PathOutline` is built once from `OUTLINE` in
`app/src/components/path/path-outline.ts`. The art module now names all 84 SVGs it draws
(cards, path nodes, UI icons, mascots; chips are left out as decoration): the viewBoxes are in
`app/src/art/sizes.ts`, checked against every file by `sizes.test.ts`, and the components are in
`registry.ts`; `Mascot`, `CardArt` and `PathNodeArt` ask for art by name. `PathNodeArt` draws
every node in a 270 square with all discs on one centre, and draws the BD-9 arc over
`node_current_base` with the geometry of `tools/build_icons.py:264-278` (no arc at zero, since a
round cap on a zero dash draws a dot). The path's node states, arc fraction and stat numbers are
a pure view model (`components/path/path-view-model.ts`, `components/stat-values.ts`) with a
vitest file that checks this phase's done-when on the `unit1-mid` fixture. The screen wrapper
gained a `top` slot that stays put above the scroll (the stat bar). On the iPad, iPadOS 26 draws
the native tabs as a bar at the top, not the bottom. `adb exec-out screencap` returns a stale
blank frame after `wm size`; `adb emu screenrecord screenshot <file>` shows the real screen. A
deep link that arrives while the app cold-starts can be dropped, with a React warning from
`expo-router/build/fork/useLinking.native.js:127`; sending it again once the app runs works.

Scope:

1. The two native tabs, Learn and Profile (`DESIGN.md` 10.3), with Profile as an empty screen
   that phase 11 fills.
2. `app/src/art/`: the one module that imports the SVG files and maps names to components
   (cards by rank and suit, nodes by state, the UI icons, the mascots by character and pose).
3. The mascot component (`D4`).
4. The Learn path of `DESIGN.md` 10.1, with the drawn arc over `node_current_base` (BD-9), the
   unit headers and the stat bar.
5. Loading, empty and error states for the path (owner policy `practices.states`).

Added for `D16`, `D17`, `D19` and `D21` on 2026-10-05, each if Zach accepts it: a third tab,
Practice, as an empty screen that phase 15 fills; the freeze icon in the stat bar when one is
held; and the screenshots of this phase in dark mode too, plus `unit1-mid` on an iPad simulator
in landscape.

Subagents: none.

Done when: the whole-repo gate exits 0, and screenshots on iOS and Android of the fixtures
`fresh` and `unit1-mid` show: for `unit1-mid`, lessons 1 to 3 complete, lesson 4 current with
its arc at three fifths, lesson 5 and the boss locked, and the stat bar reading 4, the XP total,
2 and 20.

Watch for: the `unstable-native-tabs` API (`DESIGN.md` `D2`); an icon drawn at a size that
blurs its hard shadow.

### Phase 9. The lesson: exercises, feedback and finish

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phase 8.
As built: the route is `app/src/app/lesson/[id].tsx`, declared a `fullScreenModal` with gestures
off in `app/src/app/_layout.tsx`; a lesson stop on the path that is current or finished opens it
(`components/path/path-stop-view.tsx`). All six kinds of the schema, with the three `odds` asks,
draw through one `ExerciseView` (`components/exercise/`): a pure view model gives each kind its
cards or number tiles and its option labels (`exercise-view-model.ts`, tested), and a seven-card
`hand-name` shows the first two cards as the hole cards and the last five as the board. The loop
is a pure reducer (`components/lesson/lesson-run.ts`, tested) under the hook `use-lesson-run.ts`,
which records each answer at once (`recordAnswer`) and calls `finishSession` only after the last
exercise; at 0 lives before the end the lesson stops and does not count (`D8`). Check and
Continue are the universal `@expo/ui` `Button`, made column-wide by a sized label; the feedback is
the universal `BottomSheet` with an `RNHostView`; the progress bar is the platform pair
`lesson-progress.ios.tsx` and `.android.tsx` with a shared `.d.ts`. Sound and haptics are
`app/src/feedback/` (one `expo-audio` player per effect, made when the first lesson opens;
`playsInSilentMode: false`). The out-of-lives sheet is phase 10; until then a plain message
stands in. In a development build `felto://lesson/<id>?at=<n>&pick=<m>&check=1` opens any lesson
at any exercise with a choice made and checked, for screenshots. Inside the native modal the
native `SafeAreaView` read a top inset of 0 on some opens on iOS, so the lesson frame pads by the
root provider's insets.

Scope:

1. The lesson route as a full-screen modal; the progress bar (`ProgressView` on iOS,
   `LinearProgressIndicator` on Android, as platform files).
2. One exercise view per kind of `DESIGN.md` 10.4, sharing one answer-choice shape.
3. Check and Continue as `@expo/ui` `Button`; the feedback `BottomSheet` with the mascot pose
   of `DESIGN.md` 10.5; haptics (BD-19); a life spent on a wrong answer.
4. The finish screen: XP and the streak. Leaving early follows `D8`.

Added for `D15` to `D17` on 2026-10-05, each if Zach accepts it: the six effects play at their
moments through BD-24, and the screenshots include dark mode and an iPad in landscape.

Subagents: none. If the phase reaches its landing point, it hands the remaining exercise kinds
to a pass-off prompt (Part 5).

Done when: the whole-repo gate exits 0; screenshots on both platforms of a `hand-name`
exercise, a `showdown`, the right and the wrong feedback, and the finish screen; and unit 1,
lesson 1 walked to its end on the iOS simulator by taps, after which the path shows lesson 1
complete and the XP total has grown by 10 for each right answer.

Watch for: a `BottomSheet` inside a modal on Android; a card row that overflows a small phone
(check on `Medium_Phone_API_36`).

### Phase 10. Boss, review, chest and lives

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phase 9.
As built: the boss, the review and the chest are the routes `boss/[unit]`, `review/[unit]` and
`chest/[unit]`, full-screen modals like the lesson; the out-of-lives sheet is the route
`out-of-lives`, a transparent modal holding the universal `BottomSheet`, so the path shows behind
it. A boss and a review run the lesson's own loop: `components/lesson/lesson-run.ts` gained a
`Session` (kind, id, host character, exercises), `LessonRunView` takes a session and a finish view,
and `ExerciseView` and `FeedbackSheet` take the host (the shark is sad at a right answer and smug at
a wrong one, `DESIGN.md` 10.5). The draws are pure: `components/boss/boss-session.ts` and
`components/review/review-session.ts` call `drawBoss` and `reviewSet` with a seed taken from the
clock at opening. A path tap goes through `components/path/stop-route.ts`: at 0 hearts a lesson or
the boss opens the sheet, not the session (item 12's audit); the review always opens. A ready
chest in the unit header is tappable. The art has one chest and no open state, so the opening is a
plain reveal (the chest gives way to the gem and "+20 gems!"). Development links for screenshots:
`felto://boss/<unit>?seed=<n>&play=<r|w...>`, the same for `review/` and `lesson/`, plays the
first answers through the real choose, check and continue; `felto://out-of-lives?kind=<lesson|boss>&id=<id>`
opens the sheet. Also done here, from the audit of item 13: audio can no longer throw into a
session (`feedback/safely.ts`, and the run's state moves before any sound, `session-steps.ts`);
Sound off loads no audio; Android's back button asks to leave, also over the feedback sheet; the
WAV imports moved to `app/src/art/sounds.ts` (rule U6, standard 1.0.1). The fixture link, sent
while a modal is open or just closed, can stack a second Learn screen drawn as a card (seen on iOS;
relaunching clears it).

Scope: the boss mode with the shark, the review mode with the squid, the chest modal (20 gems,
once per unit), and the out-of-lives sheet with the time to the next life and the refill
(`D8`, `DESIGN.md` 10.3 and 10.5).

Subagents: none.

Done when: the whole-repo gate exits 0, and screenshots on both platforms show a boss passed
from the `boss-ready` fixture followed by the chest and a gem total 20 higher, and the
out-of-lives sheet from the `zero-lives` fixture with the time of the next life.

Watch for: a chest awarded twice for one unit; a review that costs a life.

### Phase 11. Profile, settings and the reminder

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits on phase 10.
As built: Profile is a native settings form (`FieldGroup` in a `Host` that fills the centred
column, `components/profile/profile-frame.tsx`), not the screen wrapper's scroll view, because the
form scrolls by itself. Sections: the stats as `ListItem` rows with the stat icons; the streak
freeze shop (held, gems, a `Button` greyed out when full or short of gems, a line saying why); the
settings (`Switch` for Sound, `Switch` for the reminder, the reminder time); reset progress behind
React Native's `Alert`. The time is a platform pair (`reminder-time.ios.tsx`, `.android.tsx`): on
iOS SwiftUI's `DatePicker` drawn as a row of the form, because the community picker is that same
view inside its own `Host` and a `Host` cannot sit inside the form's `Host`; on Android a row that
opens the `@expo/ui/community/datetime-picker` time dialog, drawn outside the form. The reminder
follows BD-18, not a `DAILY` trigger: `reminder/plan.ts` plans up to seven `DATE` notifications
(ids `felto.reminder.<day>`), none on a day with a finish and none already past;
`reminder/use-reminder-sync.ts`, mounted once at the root through `components/root-providers.tsx`,
runs `reminder/replan.ts`, which reads the clock when it runs (not at the last render), cancels this
app's own ids with `cancelScheduledNotificationAsync`, skips any time not in the future and schedules
each reminder on its own, so one failure cannot empty the week; it runs at start, on return to the front, after a
finish and on each settings change, all through one queue (`reminder/queue.ts`). The permission is
asked after the first finish of a day while the app runs, or when the player turns the switch on,
never at launch; Android gets the channel `streak-reminder` first. Each reminder's line reads the
streak as it will stand at that moment, freezes counted. Stored state is version 2: settings gain
`reminder {on, hour, minute}`, on at 19:00, with a migration from version 1 and tests that load a
version 1 save. Reset backs up the latest state under a backup key, then keeps the settings and
the welcome-seen flag. Sound off also pauses any loaded effect (`feedback/effects.ts`
`stopEffects`). The development link `felto://dev/reminders` lists the reminders the phone holds.

Scope: the Profile tab (stats in `List` and `FieldGroup`); the reminder `Switch` and time
picker; reset progress behind the platform alert; the reminder of `D11`, planned as in BD-18,
with the permission asked after the first finished lesson and an Android notification channel.

Added for `D15`, `D18` and `D19` on 2026-10-05, each if Zach accepts it: the Sound switch; the
streak freeze for sale, with its price and the number held; the mascot names read from
`cast.ts`.

Subagents: none.

Done when: the whole-repo gate exits 0; a vitest test of the pure planning function shows seven
dates at the reminder time and none on a day with a finish; screenshots on both platforms of
Profile; and in a development build the list of scheduled notifications shows the planned
dates, and after a finished lesson that day's entry is gone.

Watch for: the permission prompt shown at launch; a reminder planned in UTC.

### Phase 12. Close out

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Mechanical (Sonnet 5). Lane B. Waits on every other phase.
As built: `docs/conventions-typescript.md` is 1.1.0: every correct example is real felto code with a
checked `file:line`, the lint and Metro facts are re-read from `app/node_modules` (the sentence
that said the config turns `import/order` off was wrong: it is never on), the registry holds Z1
to Z4, and a Known gaps list names what no entry sanctions (raw `fontWeight` strings, two long
hooks, two comments that say what). `RUNTIME-PASS.md` is one ordered list of 47 entries for a
person on a device. Four small fixes from the audits, each with a test that fails on the old
code: the closed-lesson time uses `formatClockTime`; stat labels use singular forms and D10's
"hearts"; the route error line is in the warm register; the current path node's label gives its
progress. `As built:` notes were added under D14 to D18 in `DESIGN.md`. `CLAUDE.md`,
`HANDOFF.md` standing sections and `docs/README.md` match the tree. Nothing was built on a
screen, so no screenshot exists for this phase.

Scope: replace every `ezhomesteading` example in `docs/conventions-typescript.md` with felto
code and check every line citation in it; check `CLAUDE.md`, `HANDOFF.md` and `docs/README.md`
against the tree; make `RUNTIME-PASS.md` in this folder complete and ordered for Zach to walk;
write each `As built:` note that a phase left owed under its decision in `DESIGN.md`.

Subagents: none.

Done when: the whole-repo gate exits 0; no example in the TypeScript standard cites a path
outside felto (`grep -n ezhomesteading docs/conventions-typescript.md` prints nothing); and
`RUNTIME-PASS.md` has an entry for every phase from 3 to 11 and from 13 to 16.

Watch for: archiving this folder before Zach has walked the runtime pass. That is Stage 8, after
the pass, not this phase.

### Phase 13. Write the sound generator

**Status:** `BUILT 2026-10-05, commit pending (Zach); approval by ear owed (Zach)`. Driver Default (Opus 5.5). Lane A. Waits on phase 3.

As built: the six files are `answer_right`, `answer_wrong`, `lesson_finish`, `boss_pass`,
`boss_fail` and `chest_open` (`.wav`), 0.36 s to 0.90 s long, peaks 0.45 to 0.65 of full scale.
The generator has its own `write()` and does not import `tools/common.py` (rule W1).

Scope:

1. Read `docs/conventions-python.md` in full. Run the whole-repo gate; the art diff must be empty.
2. Write `tools/build_sounds.py` (BD-23): the six effects of `D15`, each a short function of
   the house shape, written through one shared `write` path, and a `main()` that prints the
   count it wrote.
3. Add it to the whole-repo gate after the two SVG generators, in `CLAUDE.md` and in
   `gateCommand` in `.personal-config.json`.
4. Extend the Python standard where the new file needs it: its scope sentence, and any rule
   that names only two generators. Bump its version.
5. Update `CLAUDE.md` (Stack: the three standard-library modules added; Directory map:
   `assets/sounds/`) and the `HANDOFF.md` code map.

Subagents: none.

Done when: the gate exits 0 and its new run line prints 6; a second run gives the same bytes
(`shasum assets/sounds/*.wav` before and after); a scratchpad script using `wave` reports each
file as mono, 16-bit, 44,100 Hz, under one second, with a peak below full scale; and Zach has
listened to each file (`afplay assets/sounds/<name>.wav`) and approved it in chat. The last is
the proof no gate can give (row 33).

Watch for: a click at the start or end of a file (a fade fixes it); any use of `random`, which
breaks determinism.

### Phase 14. Random dealers for practice

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane C,
built in the main checkout under `/autopilot`. Waits on phase 7.
As built: `app/src/drills/` holds one seeded dealer for each checkable kind (`hand-name.ts`,
`showdown.ts`, `preflop.ts`, `outs.ts`, `odds.ts`), `deal.ts` (`dealExercise`, and `dealSet` for a
Practice set of `DIALS.practiceSetSize`) and `open-kinds.ts` (`openKinds(state)`, through
`unitDone`, so the placement check opens kinds too). Every key is computed by the evaluator, the
outs counter, the odds arithmetic or `OPENING_CHART`, never typed, and `checked.ts` throws on any
exercise `validateExercise` refuses. Dealers pick the answer or category first so rare hands,
splits, raises and calls all appear. The outs dealer deals a flush, a straight or three of a kind
only, on an unpaired board with at most two of a suit, and keeps a spot only when every out makes
the target's own shape and, on the turn, none plays from the board alone. Odds prices are never
on a half percent, and a call is dealt only with the rule of 2 and 4 and the exact chance both 3
points clear of the price. Tests deal 10,000 seeds of each kind and check the validator,
`computeKey`, an independent second count (`second-count.ts`: a bit-mask evaluator, all 21
five-card choices for a showdown, every card left for outs, the arithmetic re-derived), seed
replay, the answer-position spread (at most 1/n + 10 points), and the words of each explanation
against the second count. The Default review found one blocking template (a flush tie called
"kickers") and five smaller points; all were fixed in one round.

Scope:

1. In `app/src/drills/`: a seeded generator, and one dealer for each of `hand-name`,
   `showdown`, `preflop`, `outs` and `odds` (BD-26). Each dealer returns an exercise of the
   schema of `DESIGN.md` 10.4, with options, the key from the evaluator, the counter or the
   chart, and an explanation from a template in `D10`'s register.
2. The map from unit progress to the kinds that are open (`D21`).

Subagents: one Default (Opus 5.5), own worktree, verdict only. Work-list: every explanation
template and every dealer's conditions. It names any template that can state something false
for some deal, and any condition that lets through a spot with two right answers.

Done when: the whole-repo gate exits 0; for 10,000 seeds of each kind, a test recounts the key
by brute force (all 21 five-card choices of each player for a showdown; every card left in the
deck for outs) and gets the dealer's key; options are distinct and hold the key; the same seed
gives the same deal; and the review's findings are fixed or listed as open.

Watch for: the test run time, since these tests run in every gate; an `outs` spot whose target
is already made.

### Phase 15. The Practice tab

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits
on phases 10 and 14, with lane C merged.
As built: the Practice tab (`screens/practice-screen.tsx`) lists the five dealt kinds, each open
with what it asks or locked with the unit that opens it ("Finish unit 3, Preflop, to open
this."), from `components/practice/practice-menu.ts` (tested). One "Start a set" button deals a
mixed set of every open kind; there is no button per kind. The set is the route `practice-set`,
a full-screen modal like the boss, over the lesson loop with a `Session` of kind `practice`
hosted by the squid; the seed is the clock when the set opens. Practice never reads hearts: the
tab and the set open at 0, the set hides the heart count, and a wrong answer spends none.
Leaving early asks "Leave this set?" and gives nothing. Development links:
`felto://practice-set?seed=<n>&play=<r|w...>`, and `&deal=<kind>` deals one kind even before it
is open, since no BD-13 fixture opens units 3 and 4. Also done here, from the audit of item 14:
two presses of Check in one render no longer spend two hearts (a `checkedFor` ref in
`session-steps.ts`), and `components/lesson/session-order.test.ts` fails if the run's state
stops moving before its effects.

Scope: the Practice tab of `DESIGN.md` 10.7: the open kinds, a button to start a set, the
lesson screen in practice mode (no lives), the squid's poses, the effects, and the results
through the data module (`D21`).

Subagents: none.

Done when: the whole-repo gate exits 0; screenshots on both platforms, light and dark, of the
Practice start and of one dealt exercise; and one set walked to its end on the iOS simulator,
after which the XP total has grown by 5 for each right answer and the streak counts the day.

Watch for: a kind offered before its unit is finished.

### Phase 16. Onboarding and the placement check

**Status:** `BUILT 2026-10-05, commit pending (Zach)`. Driver Default (Opus 5.5). Lane B. Waits
on phase 15.
As built: the root navigator (`components/root-stack.tsx`) opens only the `onboarding` stack
while `onboarded` is false and only the tabs and sessions once it is true (Expo Router
`Stack.Protected`); the development routes stay open in both. The stack is welcome, cast and
"How much poker do you know?" (`screens/welcome-screen.tsx`, `cast-screen.tsx`,
`level-screen.tsx`), then the check (`onboarding/placement`), a `Session` of kind `placement`
hosted by the fish, with no hearts shown, spent or missed, ending in `finishPlacement` and a
pass or fail result whose button finishes onboarding. The ten are five from each of units 1 and
2, seeded from the clock (`components/onboarding/placement-session.ts`). Also done here: one
current lesson on the path (`game/path.ts`), a placed unit's header line and closed chest, the
fixtures `placed` and `all-done`, and `screens/placeholder-screen.tsx` deleted. Development
link: `felto://onboarding/placement?seed=<n>&play=<r|w...>` after the fixture `fresh`.

Scope: the three first-launch screens and the placement check of `D20` and `DESIGN.md` 10.7,
with the names from `cast.ts` and the first-launch flag from the data module.

Subagents: none.

Done when: the whole-repo gate exits 0; screenshots on both platforms of the three screens from
the `fresh` fixture; and two walks on the iOS simulator: "I know the basics" with 8 right lands
on the path with units 1 and 2 finished, unit 3's first lesson current and the gem total
unchanged; with 7 right, unit 1's first lesson is current.

Watch for: onboarding shown again after an app restart; the placement check spending lives.

## 3. Dials

Every dial is in `DESIGN.md` sections 4, 10.2 and 10.7, and phase 3 writes them all into
`app/src/config/dials.ts` (BD-14). Their values are the proposed defaults until a runtime pass
gives a reason to change one; a change is a one-line edit there and a line in the ledger.

## 4. Seams reserved, deliberately not built

- **Rive.** The mascot component is the one place a `.riv` file plugs in; the development build
  (BD-3) already allows the native runtime.
- **Accounts and sync.** The data module is the one place state is read and written (`D3`).
- **Card ranks as outlines.** Needed before Rive import (`CLAUDE.md:84-85`); `D14` only names a
  font.
- **Tokens written by the generator.** The colours in `tokens.ts` cite their generator lines
  (BD-14); a later item can have the generator write them as JSON.
- **A store release.** No `eas.json`, no store listing and no age-rating answers in this plan
  (`D13`). The identifiers of `D12` are chosen so that it can come later.
- **More units, and music** (`D13`, `D15`).

## 5. Repo hazards, with live numbers

1. **The art is in no commit** (section 0, rows 1 to 3): 129 staged files, local `main` one
   commit ahead of GitHub, and agent worktrees start at `origin/main`. Zach commits and pushes
   before phase 2, and before lane C opens a worktree.
2. **`.claude/` is untracked** (row 4) until BD-21 lands in phase 2.
3. **Four lines say there is no app** (`CLAUDE.md:34`, `:86`; `HANDOFF.md:9`, `:32`). Phase 3
   changes them; the step log keeps its history as written.
4. **The ledger's limits section has no line on the app** (row 26). Phase 3 adds what an agent
   can see (both simulators) and what it cannot (Zach's phone, Rive import).
5. **Android builds need environment set by hand** (row 21): `ANDROID_HOME` at
   `~/Library/Android/sdk`, the emulator at `~/Library/Android/sdk/emulator/emulator`, and Java
   17 at `/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home` if Gradle refuses Java 23.
6. **Board item 4 is open** (row 27) and shares a file with phase 1.
7. **The Context7 Expo docs mix SDK 57 and SDK 58 pages** (the sweep of 2026-10-05). Check a
   documented API against the installed `.d.ts` before relying on it. The stable
   `expo-router/native-tabs` path is SDK 58; SDK 57 has only `unstable-native-tabs`.
8. **The expo-ui skill has one wrong path** (row 28).
9. **Chips must never become a balance** (`DESIGN.md`, hazard 2), and the chest must stay fixed
   (hazard 3).
10. **An agent cannot hear** (row 33). Every sound is approved by Zach, and a phase that changes
    one says so in its hand-back.
11. **No Android tablet emulator exists** (row 31). BD-27's `wm size` check stands in for one;
    it shows the layout, not a real tablet's density.
12. **The dark-mode swap ties the app to two hex values in the generators** (row 32, BD-25). Its
    test is what makes a change to either one loud.

## 6. Session protocol

Follow `docs/AGENT-PRACTICES.md` in full. For this effort:

- **Read first:** `HANDOFF.md`, `CLAUDE.md`, the code standard for the files the phase touches
  (`docs/conventions-typescript.md` for `app/`, `docs/conventions-python.md` for `tools/`),
  `DESIGN.md` sections 8 to 10, then sections 0 and 1 of this file and the phase.
- **Before the first edit,** run the whole-repo gate and check the art diff. A red gate or a
  dirty art diff before you start is someone else's work; stop and ask.
- **Context:** a Default phase lands at about 300k (Part 5). Measure it with the Part 5 script
  after the reading and before each new front.
- **New copy:** every user-facing string a phase adds follows `D10`'s register and is listed in
  the hand-back.
- **Shared records:** `HANDOFF.md`, `PASSOFF.md`, this file, `DESIGN.md` and `RUNTIME-PASS.md`
  are edited by every phase, so they are not listed under "Files it owns". A phase re-reads one
  just before it edits it, and edits only its own phase header, its own board row, a new
  ledger step and its own `As built:` notes. Lane C works in a worktree; Zach merges its branch
  before phase 8 starts, and a conflict in these files is resolved by keeping both sides.
- **Close-out (Part 7):** the phase header becomes `BUILT <date>, commit pending (Zach)`, and
  the next phase replaces "pending" with the hash from `git log --oneline -1 -- <a file the
  phase owns>`; a ledger step at the next free number; the board row set to `DONE: HANDOFF n`;
  the phase's runtime entries appended to `RUNTIME-PASS.md` and pasted in the hand-back; any
  deviation written as `As built:` under its decision in `DESIGN.md`.
- **Never** run `git commit`, `git push`, `git add -A` or `git add .`. Print the two blocks of
  Part 11.
