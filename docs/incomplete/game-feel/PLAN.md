# Plan: game feel

Status: `IN FLIGHT` since 2026-10-05, phase 1 built (board item 26). The line read "`PLANNED`
2026-10-05, awaiting GATE 2" until Zach approved the plan in chat the same day (`PASSOFF.md`, the
note above item 22). Decisions `GF-1` to `GF-9` are in `DESIGN.md`,
section 8, and are frozen. This plan is what is built, in what order, by whom, and done when. Read
`docs/AGENT-PRACTICES.md` and `docs/conventions-typescript.md` first; the whole-repo gate and the
hazards are in `CLAUDE.md` and `HANDOFF.md`.

**What no gate can see.** Typecheck, lint and vitest cannot see a bounce, a colour, a buzz or a
sound. Every phase is proven by screenshots on both platforms, and the motion, haptics and sounds
only by Zach on his phone. A hand-back says which of the two it claims (R10): "gates green, seen in
a screenshot" and "felt on the phone" are different claims.

## 0. Facts verified 2026-10-05 (these win over the design where they differ)

| # | Fact | Source |
|---|---|---|
| 1 | No animation code and no animation library exist | `grep -rnE "Animated\.\|useAnimatedStyle\|withSpring\|withTiming\|LayoutAnimation" app/src`; `app/package.json` |
| 2 | Haptics are one success or error buzz, through `expo-haptics`, on six moments | `app/src/feedback/use-answer-feedback.ts:8-30` |
| 3 | The Sound setting turns off sound only; haptics follow the phone | `app/src/feedback/moments.ts:11-17` |
| 4 | Six sound effects, loaded through the art module | `app/src/art/sounds.ts:9-22`; `assets/sounds/` |
| 5 | The primary buttons are the native `@expo/ui` Button in `Host` | `app/src/components/lesson/lesson-button.tsx:1-20` |
| 6 | The palette is 12 names per scheme, one blue accent | `app/src/theme/tokens.ts:24-57` |
| 7 | The import colour swap covers two colours only | `app/src/art/colour-swap.json:1-4` |
| 8 | `STATE_VERSION` is 2; `Settings = { sound, reminder }` | `app/src/storage/migrations.ts:6`; `app/src/game/player-state.ts:36-41` |
| 9 | The `SESSION` routes are full-screen modals with swipe-back off | `app/src/components/root-stack.tsx:5` |
| 10 | The check and continue paths guard against double presses with refs | `app/src/components/lesson/session-steps.ts:17-27,38-48` |
| 11 | Mascots: 18 uses of `Mascot`, each a static SVG | `grep -rn "<Mascot" app/src \| wc -l` |

## 1. Decisions taken since ratification

| BD | Decision | Reversal |
|---|---|---|
| BD-G1 | Every motion value (duration, spring, scale, offset) is a dial in `app/src/config/dials.ts`, in one block under the comment `// game-feel`. No screen holds a raw number | Inline the values |
| BD-G2 | This effort owns stored version 3 (the Haptics setting). The unit-stories effort changes no stored shape, so the two cannot both claim the number. Read `STATE_VERSION` before raising it (Part 6) | Not reversible once shipped; hence the check |
| BD-G3 | A `motion` module under `app/src/motion/` holds the hooks and wrappers over Reanimated, so a screen never imports Reanimated directly. If the library has to be swapped for the built-in `Animated` (the GF-1 fallback), only this module changes | Replace the module |
| BD-G4 | `useReducedMotion` is the one place reduced motion is read. Every animation takes its `reduced` branch from it | Remove the hook |
| BD-G5 | Particles (sparkles, confetti) are drawn with `react-native-svg` shapes moved by Reanimated; no canvas library is added | Add a library |
| BD-G6 | The haptic vocabulary is one module, `app/src/feedback/haptics.ts`, with named moments, and a pure `shouldBuzz(setting)` so the rule is tested in node. Haptics read the stored setting; an off setting makes every call a no-op | Replace the module |
| BD-G7 | The custom button is `app/src/components/button/primary-button.tsx`, with a platform-free implementation, because it uses no `@expo/ui` (rule U3 does not apply). The native `LessonButton` is removed only when every call site has moved | Keep both |
| BD-G8 | Phase 1, 2026-10-05: the hook files are `use-press-scale.ts`, `use-bounce.ts` and `use-fade-in.ts`, not `press-scale.ts`, `bounce.ts` and `fade-in.ts` as phase 1 step 2 wrote them, because rule O2 names a hook's file for the hook. The pure parts are `motion-steps.ts` and `reduced-motion.ts`, each with its test, and `MotionView` is in `motion-view.ts` | Rename the three files |
| BD-G9 | Phase 1: no `app/babel.config.js`. `babel-preset-expo` 57.0.13 adds `react-native-worklets/plugin` itself when the package is installed (`node_modules/babel-preset-expo/build/configs/expo.js:96-101`). It pushes the plugin before `@expo/ui/babel-plugin`, so it is not last in the preset's list; that is Expo's own order, and the press runs worklets on the simulators | Add a `babel.config.js` that passes `worklets: false` to the preset and lists the plugin last |
| BD-G10 | Phase 1: every animation passes `ReduceMotion.Never` to Reanimated, and `motionAllowed(kind, reduced)` decides instead, from the dial `reducedMotionSkips`. Reanimated's own default (`ReduceMotion.System`) would skip the fades that `GF-8` keeps. The press and fades are not in the dial, so they stay under reduced motion | Drop `Never` and let Reanimated's default decide |
| BD-G11 | Phase 1: the button label is `TYPE.heading` (20 points), not `TYPE.body`. White on the blue face is 4.0 to 1, which passes WCAG AA only as large text (bold from 18.66 px); dark mode puts a dark label on a lighter face (6.1 to 1) | Use `TYPE.body` and a darker face |
| BD-G12 | Phase 1: "Check and Continue" is read as every button in the lesson loop: the bottom button of `lesson-run-view.tsx` (Check, the finish's Continue, the closed-session Continue) and the feedback sheet's Continue, which a player presses after every answer. The sheet's button is drawn inside the sheet's `RNHostView`. The other 12 `LessonButton` uses in 10 screen files (`grep -rn "<LessonButton" app/src`, 2026-10-05) stay native until phases 5 and 7, so `LessonButton` stays (BD-G7) | Put the sheet back on the native `Button` |
| BD-G13 | Phase 1: `app/src/motion/motion-boundary.test.ts` fails when a file outside `src/motion/` imports `react-native-reanimated` or `react-native-worklets`, so BD-G3 is a gate, not only a review rule. A planted import made it fail on 2026-10-05 | Delete the test |
| BD-G14 | Phase 1: the `// game-feel` block sits after the `// D15` block of `dials.ts`, not at the end, so the unit-stories blocks appended at the end merge without a conflict | Move the block |

## 2. Phases

| # | Phase | Driver | Subagents | Est. context | Why that shape |
|---|---|---|---|---|---|
| 1 | Foundation: Reanimated, motion module, tokens, primary button | Default (Opus 5.5) | none | full | One dependency, one rebuild, one module, one component; the rebuild loop uses context |
| 2 | Haptics vocabulary, the Haptics switch, stored version 3 | Default | none | comfortable | A stored-shape change with its migration and old-save test (rule Q2) |
| 3 | Sound: six new effects | Default | none | comfortable | Generator code; each effect proven only when Zach plays it |
| 4 | The answer loop | Default | none | full | The screen Zach uses most; motion, haptics, sound and mascot together |
| 5 | Finish, chest and boss screens | Default | none | comfortable | Colour screens, particles, count-up, chest opening |
| 6 | The path | Default | none | full | Unit colours, nodes, header; contains the art decision of `GF-4` |
| 7 | Learn, Profile, empty states, mascot life | Default | none | comfortable | The remaining surfaces, with the same pieces |
| 8 | Close-out | Mechanical (Sonnet 5) | none | comfortable | Records, index, runtime entries |

No phase needs a Deep driver: each failure is loud (a wrong screen) and the one stored-shape change
has a test that loads an old save. Phases 1 to 3 are lane A, in order. Phases 4 to 7 are lane A, in
order, after phase 1; phases 2 and 3 can run beside phase 4 in their own worktrees if the files do
not collide (check "Files it owns" first). The unit-stories effort runs as lane B and C in
separate worktrees.

### Phase 1: Foundation

**BUILT 2026-10-05, not committed: branch `game-feel-1`, worktree `.claude/worktrees/game-feel-1`
(board item 26, `HANDOFF.md` step 29).** Reanimated 4.5.1 and worklets 0.10.1, as `bunx expo
install` pinned them; built and run on the iPhone 17 simulator and the `Pixel_9` emulator. Build
calls BD-G8 to BD-G14. Three values the plan did not give are new dials: `fadeMs` 200,
`pressReleaseMs` 220 and `pressReleaseDamping` 0.55 (the plan says only "spring back"). The unit
and moment colours are the chip faces of `tools/build_icons.py:35-40`, lighter in dark mode, and
the moment colours take the deep extrusion tone in dark mode. What this changes for later phases:
the press haptic and sound go in through `PrimaryButton`'s `pressHaptic` and `pressSound` props;
the motion hooks must stay inside `src/motion/` (the boundary test fails otherwise); `useBounce`
and `useFadeIn` exist but no screen uses them yet, so phase 4 is the first to run them.

Files it owns: `app/package.json`, `app/bun.lock`, `app/babel.config.js` if one exists or is
needed, `app/src/motion/*` (new), `app/src/components/button/*` (new),
`app/src/theme/tokens.ts`, `app/src/config/dials.ts` (block `// game-feel`),
`docs/conventions-typescript.md` (registry line).

1. **Install Reanimated 4.** Run `bunx expo install react-native-reanimated react-native-worklets`
   from `app/` so the versions match SDK 57, and check them against the library docs before
   moving on (rule `docs-lookup`; Context7, `/websites/swmansion_react-native-reanimated`). Confirm
   the Babel plugin is present, and that it is `react-native-worklets/plugin`, listed last. Then
   rebuild the development build (`bun run --cwd app ios`) and, after it, the Android build. If
   either build fails for a reason that is not a typo, stop and ask Zach: the fallback is the
   built-in `Animated` behind the same `motion` module (BD-G3).
2. **The motion module** (BD-G3, BD-G4): `use-reduced-motion.ts`, `press-scale.ts` (a hook that
   returns an animated style and press handlers), `bounce.ts`, `fade-in.ts`. Values from dials
   (BD-G1). Tests for any pure part (for example the sequence arithmetic), in new files (rule Q1).
3. **Tokens.** Add four unit colours and the moment colours (finish, chest, boss pass, boss
   fail), each with a light and a dark value (rule U5), and the raised-edge colour of a button as a
   darker tone of its face. Cite the generator line where a colour copies the art (`tools/common.py`).
4. **The primary button** (BD-G7): a face, a raised bottom edge of the dial height, a press that sinks
   it, the haptic and sound hooks left as props for phase 2 and 3, disabled and pressed states, label
   in the type tokens. It is sized by `useColumnWidth` like `LessonButton`.
5. **Swap the Check and Continue call sites** to the primary button, behind no flag. Keep the
   double-press guards untouched (`session-steps.ts`): the button calls the same handlers.
6. **Register the divergence.** Add a line to the sanctioned registry in
   `docs/conventions-typescript.md` (the next free `Z` number, read from the file): the primary
   buttons are not native (`GF-2`, amends `D2`).
7. **Record it**: a ledger step, a dated `D2` amendment pointer, code map lines.

Done when: the gate is green, the app builds and launches on the iOS simulator and the Android
emulator with Reanimated linked, Check and Continue are the new button in light and dark, and
pressing one sinks it. The proof a gate cannot supply: a screenshot of the pressed and the
resting button on each platform, and one line from Zach that the press feels right on his phone.

Watch for: the dev build must be rebuilt on the phone (`Reanimated` is native code); an old build
will crash on launch. A press that fires twice: the guards in `session-steps.ts` must keep working.

### Phase 2: Haptics and the Haptics switch

Files it owns: `app/src/feedback/*`, `app/src/storage/migrations.ts` and its test,
`app/src/game/player-state.ts`, `app/src/components/profile/settings-section.tsx`,
`app/src/components/profile/use-profile-controls.ts`, `app/src/screens/profile-screen.tsx`.

1. **Read `STATE_VERSION`** and take the next number, not the one written here (BD-G2).
2. **Add `settings.haptics`** (default true). The migration from the old version sets it to `true`
   for every saved player, written out and not read from a dial (the same reason as the reminder
   migration, `migrations.ts:11-13`). A new test file loads a version 2 save and gets version 3.
3. **The vocabulary** (BD-G6): `selection`, `lightImpact`, `mediumImpact`, `success`, `rigid`, each a
   named moment. `shouldBuzz(setting)` pure, with its test. Calls stay inside `safely`
   (`app/src/feedback/safely.ts`).
4. **The switch** in Profile beside Sound: a native `Switch` (it stays native, `GF-2`), with the
   copy "Haptics" and one line of warm help. Show the strings to Zach (R7) before they are final.
5. **Connect the existing six moments** to `shouldBuzz`, so an off switch silences the old buzz too.
6. **Record it**, including the `BD-19` amendment pointer.

Done when: the gate is green; a test loads a saved value of the old version and the migration
produces the new shape with `haptics: true`; and turning the switch off in Profile silences every
buzz on the phone (Zach confirms, since an agent cannot feel one).

Watch for: a stored value the module cannot read is copied to a backup key before a fresh state is
written (rule Q2); do not break that path.

### Phase 3: Sound

Files it owns: `tools/build_sounds.py`, `assets/sounds/*` (generated), `app/src/art/sounds.ts`,
`app/src/feedback/effects.ts`, `docs/conventions-python.md` only if a rule is touched.

1. **Choose the six** with Zach from: tap, option select, node press, card slide, XP tick, streak up,
   heart lost, reward claim, sparkle, perfect. Default if he picks none: tap, option select, heart
   lost, XP tick, reward claim, sparkle.
2. **Extend the generator** with one function per effect, each no longer than the dial (0.6 s), then run
   `python3 tools/build_sounds.py`. The run line must report the new total.
3. **Register them** in the art module only (rule U6), and load them through `effects.ts`.
4. **Zach plays each one** (`afplay assets/sounds/<name>.wav`) and approves or sends a note. An agent
   cannot hear a sound, so the hand-back lists each as "not heard" until he has.
5. **Record it**, including the `D15` extension.

Done when: the gate is green, the generator wrote the expected count, `git diff --stat -- assets/sounds`
shows only the six new files and nothing changed in the old six, and Zach has approved each effect.

Watch for: the generator is deterministic; a change to an old effect by accident shows in the diff
stat. A long tail on a tap sound gets tiring in a session.

### Phase 4: The answer loop

Files it owns: `app/src/components/lesson/*`, `app/src/components/exercise/*`,
`app/src/feedback/*` (after phase 2), `app/src/art/mascot.tsx` only if a prop is added.

1. **Choosing an option**: a selection haptic, a short select sound, the chosen row lifts and takes
   the unit colour.
2. **Check**: the button presses (phase 1); a right answer bounces the row, flashes the right colour,
   plays the right sound and success haptic, and the fish cheers with a bounce (`GF-6`). A wrong
   answer shakes the row, plays the wrong sound and the rigid haptic, the fish tilts, and the heart
   in the header drops with a short animation and the heart-lost sound.
3. **The feedback sheet** rises with a spring and the Continue button is the primary button.
4. **The progress bar** fills with an animation, and the lesson header counters tick.
5. **Reduced motion**: bounce, shake and tilt are skipped; colour and fades stay (`GF-8`).
6. **Record it.**

Done when: the gate is green; the double-press guards still pass their tests untouched
(`lesson-run.test.ts`, `session-steps.test.ts`); and a lesson plays end to end on the iOS simulator and
the Android emulator in both appearances with screenshots of the chosen, right, wrong and sheet states.

Watch for: an animation that outlives the screen and runs on an unmounted view; motion that delays the
sheet or lets a second Check through; a shake that moves the tap target away from the finger.

### Phase 5: Finish, chest and boss screens

Files it owns: `app/src/components/lesson/lesson-finish.tsx`, `app/src/components/chest/*`,
`app/src/components/boss/boss-finish.tsx`, `app/src/screens/chest-screen.tsx`.

1. **Full-bleed colour by moment** from the tokens of phase 1: green finish, gold chest, a firm boss pass,
   a quiet boss fail.
2. **Finish**: the fish squashes in, XP counts up, the streak flame pulses, a short sparkle burst
   (dial: 24) drawn with SVG shapes (BD-G5).
3. **Chest**: a tap to open with the lid animation, the gem count rolling up, the reward claim sound.
4. **Boss**: a pass has a confetti burst; a fail does not celebrate.
5. **Record it.**

Done when: the gate is green and each screen is seen on both platforms, both appearances, with
screenshots at rest; the animation itself is proven only by Zach on his phone.

Watch for: particles drawn for ever (battery); a count-up that shows a wrong number if the screen
closes early (the real numbers are already written to state before the animation starts).

### Phase 6: The path

Files it owns: `app/src/components/path/*`, `app/src/art/path-node-art.tsx`,
`app/src/art/colour-swap.json`, and `tools/build_icons.py` only if the decision below needs it.

1. **Decide the node colour** and write it as a `BD` before touching art: a longer import swap table
   (`colour-swap.json`) or a generator change. Prefer the swap; use the generator only if the node's
   shading needs more than a colour swap, and then follow `docs/conventions-python.md` and run the
   generators, never edit an SVG.
2. **Unit banners and nodes** take their unit colour from the tokens. A node press sinks and plays
   its sound and haptic; the current node pulses (reduced motion: no pulse).
3. **Header counters** (streak, gems, hearts, XP) get their colour and a small tick when a value
   changes.
4. **Record it.**

Done when: the gate is green, and `git diff --stat -- assets/icons assets/mascots assets/sounds`
shows only what the decision in step 1 meant; each unit is seen in its colour on both platforms in
both appearances, with screenshots of the SVG node itself rendered, not the preview page.

Watch for: the preview pages do not show current SVGs (`CLAUDE.md`). A pale unit colour that
disappears on the dark page.

### Phase 7: Learn, Profile, empty states, mascot life

Files it owns: `app/src/screens/learn-screen.tsx`, `profile-screen.tsx`, `app/src/components/profile/*`,
`app/src/components/onboarding/*`, `app/src/art/mascot.tsx`.

1. **Mascot life**: an idle bob (dial), a greeting bounce on the Learn screen, mascots on the empty and
   recovered states, using the existing poses.
2. **Profile** and **onboarding** take the colours and the button.
3. **Record it.**

Done when: the gate is green and each of these screens is seen on both platforms, both appearances.

### Phase 8: Close-out

Driver Mechanical. Reconciles the index, writes the three hand-back blocks of Part 7, adds `As built`
notes under each `GF` decision, and lists every runtime entry in one place.

## 3. Dials

All in `app/src/config/dials.ts` under `// game-feel` (BD-G1). Proposed values; change them on the
phone, not in the plan.

| Dial | Value |
|---|---|
| Button press scale, duration | 0.96, 90 ms down, spring back |
| Button raised edge | 4 |
| Right-answer bounce | 1.0 to 1.08 to 1.0, 280 ms |
| Wrong-answer shake | 6 px, 3 swings, 240 ms |
| Sheet rise | spring, 320 ms |
| Haptic on option select | selection |
| Haptic on button press | light impact |
| Sound length ceiling | 0.6 s |
| Mascot idle bob | 3 px, 2.4 s |
| Particle burst | 24 shapes, 900 ms |
| Reduced motion | skip bounce, shake, tilt, pulse, bob and particles; keep fades |

## 4. Seams reserved, deliberately not built

Rive for the mascots, through the one `Mascot` component (`D4`). Badges and achievements, daily
quests, a mascot that speaks inside lessons (`GF-9`). A story for the other units (unit-stories
`US-8`). A real music track. A daily puzzle, friend streaks and an avatar, which were not chosen.

## 5. Repo hazards, with live numbers

- The development build must be rebuilt after phase 1, on the simulator, the emulator and Zach's
  phone: Reanimated is native code. An old build crashes on launch.
- 63 test files, 490 tests passed on 2026-10-05 (`HANDOFF.md`). The gate must pass all of them.
- `app/src/config/dials.ts` and `app/src/theme/tokens.ts` are shared with the unit-stories effort
  (it adds a block to `dials.ts` only). Each adds one block under its own comment.
- A stored-shape change raises the version, adds a migration and an old-save test (Part 6). Never
  write a fresh state over a value that was not first backed up.
- The gate rewrites generated assets in place; run `git diff --stat -- assets/icons assets/mascots
  assets/sounds` after it (`CLAUDE.md`).
- Write `bun run --cwd app <script>`, never `bun --cwd app run <script>`.

## 6. Session protocol

`docs/AGENT-PRACTICES.md`, Parts 5 to 7. One phase per session. Never run `git commit`, `git push`,
`git add -A` or `git add .`; print the two blocks of Part 11 with the exact files touched. Start every
phase with `git status --short` and the "Files it owns" check against the board and against the
unit-stories effort.

## 7. Runtime entries, written as the phases are planned

| Goal | Where | Right answer |
|---|---|---|
| The new button feels right | Any lesson, Check and Continue, iPhone | It sinks on press, rises on release, and gives one light buzz |
| Haptics switch silences everything | Profile, Haptics off, then answer in a lesson | No buzz on any answer, press or chest |
| An old save keeps its progress | Install the new build over the old one | Streak, XP, finished lessons and the Sound setting are unchanged; Haptics is on |
| The right and wrong answers feel different | A lesson, one right and one wrong answer | Right bounces with a rising sound and a soft buzz; wrong shakes with a flat sound and a sharp tap; a heart drops |
| Reduced motion is respected | Phone setting Reduce Motion on, then a lesson | No bounce, shake or sparkle; colour changes and fades remain |
| Each new sound is liked | `afplay assets/sounds/<name>.wav`, then in the app | Zach approves each of the six or names a change |
| Unit colours read in both appearances | Learn tab, all four units, light and dark | Each unit has its colour; none disappears on the dark page |
| The chest and the finish feel rewarding | Finish a lesson, open a chest | Colour fills the screen, XP counts up, a burst plays once and stops |
