# Design: game feel (animation, colour, haptics, sound, character)

Status: `RATIFIED` 2026-10-05. This file was `SCOPE.md` until Zach answered section 6 on
2026-10-05 (section 7); git records the rename. Sections 1 to 6 are kept as written, as the record of
what was known and what was offered. Section 8 holds the decisions. From here the design is frozen:
it changes by a new dated decision or an `As built` note, never by editing a decision in place.

Zach's words, 2026-10-05, after running the development build on his iPhone: he wants "more
animation and life in the app, more color, more haptics, more sounds. More character." He sent 12
photos of Duolingo Chess as the closest comparison and as inspiration. The photos were read from
`~/Downloads/IMG_2859.HEIC` to `IMG_2870.HEIC` on 2026-10-05.

This file covers how the app feels. The two other items of the same day, repeated questions and
the unit story, are in `docs/incomplete/unit-stories/DESIGN.md`.

## 1. What exists, verified 2026-10-05

### 1.1 The app today

| # | Claim | Verified state | Source |
|---|---|---|---|
| 1 | The app has no animation code at all | `Animated.`, `useAnimatedStyle`, `withSpring`, `withTiming` and `LayoutAnimation` match nothing under `app/src` except the word "slides" in a comment | `grep -rnE "Animated\.\|useAnimatedStyle\|withSpring\|withTiming\|LayoutAnimation" app/src` |
| 2 | No animation library is installed; React Native's own `Animated` is available | `package.json` lists no `react-native-reanimated`, no Lottie, no Skia, no Rive | `grep -nE '"(react-native-reanimated\|lottie\|@shopify/react-native-skia\|@rive-app[^"]*)"' app/package.json` found nothing |
| 3 | The mascots are static SVG poses, deliberately: a later move to Rive changes one file | `Mascot` draws one SVG by name; D4 and the non-scope list assign Rive rigging to Zach | `app/src/art/mascot.tsx:10-16`; `DESIGN.md` D4 and section 2 |
| 4 | Three mascots with six poses each, used in 18 places | `happy`, `cheer`, `think`, `sad`, `sleep`, `smug` for fish, squid, shark | `grep -rn "<Mascot" app/src \| wc -l` gives 18; `ls assets/mascots/fish` |
| 5 | Haptics fire on answers and endings only, as one success or error buzz | `Haptics.notificationAsync` with `Success` or `Failure`, on six moments; no tap, selection or impact feedback anywhere | `app/src/feedback/use-answer-feedback.ts:8,17,20-30` |
| 6 | There is no haptics setting; haptics follow the phone's own setting | BD-19; the Sound switch turns off sound only | `app/src/feedback/moments.ts:11-17`; `app/src/screens/profile-screen.tsx:44-49` |
| 7 | Six sound effects exist, made by a generator, and each is proven only when Zach plays it | `answer_right`, `answer_wrong`, `lesson_finish`, `boss_pass`, `boss_fail`, `chest_open` | `ls assets/sounds`; `app/src/art/sounds.ts:9-22`; `CLAUDE.md`, "What the gates do not prove" |
| 8 | There is no sound for a tap, a node press, XP, a streak, a lost heart or a reward | Only the six effects above are loaded | `app/src/art/sounds.ts:15-22` |
| 9 | The palette is small: page, surface, text, one blue accent, gold ring, a green for right and a red for wrong, each with a light and a dark value | 12 names per scheme | `app/src/theme/tokens.ts:24-57` |
| 10 | Art colour can be swapped at import for exactly two colours, the shadow and the ring track | `colour-swap.json` maps two hex values to two names | `app/src/art/colour-swap.json:1-4` |
| 11 | The Check and Continue buttons are the native `@expo/ui` Button, drawn in SwiftUI or Jetpack Compose, by decision | D2 requires native components where they exist; rule U2 wraps them in `Host` | `app/src/components/lesson/lesson-button.tsx:1-20`; `DESIGN.md` D2; `docs/conventions-typescript.md`, U2 |
| 12 | There is no reduced-motion handling | `grep -ri "reduce" app/src` matches only array `.reduce` calls | grep, 2026-10-05 |
| 13 | The finish, chest and boss screens exist and each plays one sound and one buzz; they draw a static mascot and static art | `lesson-finish.tsx` draws the happy fish; the chest view draws the chest art | `app/src/components/lesson/lesson-finish.tsx:25`; `app/src/components/chest/chest-view.tsx` |
| 14 | Nothing is stored for any of this, so no stored-state version bump is needed unless a setting is added | `STATE_VERSION = 2` | `app/src/storage/migrations.ts:6` |

### 1.2 What the Duolingo Chess photos show

Twelve photos, read 2026-10-05. Each line is what is on screen, not a claim about how it is built.

| Photo | What it shows |
|---|---|
| 2859, 2860, 2864 | The path. A coloured banner per unit (green for "Opposition", pink for "Discovered checks"). Round node discs with a thick ring around the current one. A "JUMP HERE?" bubble. A tapped node opens a coloured card with a white "START +20 XP" button. Large faded character art sits beside the path. Locked nodes are grey. Header counters in colour (crown, flame, gems, hearts). Bottom tabs with coloured icons |
| 2861, 2863 | Profile. A big avatar, a stats grid, "Monthly badges" and "Achievements" as collectable badge art with a NEW tag, friend streak slots |
| 2862 | A milestone celebration. A big badge ("2000"), the date, a sentence, one blue "CLAIM REWARD" button with a darker bottom edge |
| 2865 | A lesson step. A green progress bar, a close cross, a heart count. A "NEW CONCEPT" tag. A mascot with a speech bubble that colours the key word. The board takes most of the screen. Undo, Hint and Redo controls |
| 2866 | Daily quests. Yellow progress bars that end in a chest, with sparkle dots on the one just completed |
| 2867 | A reward chest on a full blue screen. A white swoosh across the chest, sparkles, and "1 chance left!" |
| 2868 | A feature introduction. The mascot with sparkles, a title, one sentence, one blue button |
| 2869 | "Perfect solve!" Three green dots, two result cards, a blue button with a plain "Continue" under it |
| 2870 | A daily puzzle. A month calendar, a blue "SOLVE IT" button with a rating chip, a results row, an invite card |

What these have in common: every screen has one full-bleed colour that changes by moment (green,
pink, blue, yellow, dark), one primary button with a visible raised bottom edge, and one
character or one big piece of art doing the emotional work. Motion, haptics and sound cannot be
read from a photo, so section 1.2 says nothing about them.

What the audit changes about the request. The app has no motion, a thin palette, one kind of
buzz and six sounds, so every lever in the ask starts from zero. The photos show two things that
are not "feel": collectable badges, quests, a daily puzzle and a calendar (new features), and a
mascot that speaks inside the lesson (a new lesson layout). Both are in the non-scope list.

## 2. What this is, and what this is not

This is a pass over the screens that exist, to add motion, colour, haptics, sound and character
to them, in the warm voice that `D10` fixed. It is built in slices, one screen group at a time,
so each slice can be run on the phone and judged.

This is not (parked, and no session raises it again without a new question to Zach):

- New features seen in the photos: badges and achievements, daily quests, a daily puzzle or
  calendar, friend streaks, leagues, an avatar. Each is its own `D13`-style decision.
- A change to any game rule: hearts, XP, lives timing, streak, boss pass mark, chest contents.
- A mascot that speaks inside a lesson with a speech bubble. That is a lesson layout change
  and sits next to the unit story; it needs its own question.
- New mascots, new poses, new icons or any art made outside the generators. `CLAUDE.md` forbids
  hand edits of `assets/icons/` and `assets/mascots/` and any change to `assets/higgsfield/`.
- Rive rigging, which is Zach's work in the Rive editor (`DESIGN.md` section 2, D4).
- Real music. Sound effects only.
- Anything under `D1` to `D21` reopened; where this effort adds to one, it adds a dated `D22`
  or an `As built` note.

## 3. Options

### Lever A: motion

**A1. React Native's own `Animated`, with the native driver.** Scale, move and fade with no new
dependency and no native rebuild; the installed development build keeps working. Defense: it
covers what the photos show for a first pass (a button that presses down, a card that bounces,
a sheet that rises, a number that counts up, a node that pulses, sparkles that drift).
Against: no layout animation and no gesture-driven motion, and long sequences are verbose.

**A2. Add `react-native-reanimated`.** The standard Expo choice for richer motion, including
layout animations and sequences. Defense: nothing in a later wish list is out of reach. Against:
a new native dependency, a native rebuild of the development build, and a version that has to
match Expo SDK 57 and React Native 0.86. Checked 2026-10-05 in the Reanimated docs (Context7,
`/websites/swmansion_react-native-reanimated`, "Getting started"): version 4 needs the separate
`react-native-worklets` package, its Babel plugin is `react-native-worklets/plugin` (the Expo
starter template includes it), and Expo needs a prebuild after the install. The exact versions
are the ones `npx expo install` pins at design time. Zach asked for the option closest to the
Duolingo feel, and this is it, with Rive for the mascots later (A3 stays as the character path).

**A3. Wait for Rive and animate only through the mascot component.** Defense: it is the
designed path (D4). Against: Rive rigging is Zach's separate work with no date, and it covers
the characters only, not buttons, nodes or screens.

### Lever B: colour

**B1. A colour per unit, plus a colour per moment.** Add tokens, each with a light and a dark
value (rule U5), for four unit colours (banner, node face and button) and for moments (a green
finish, a gold chest, a red boss fail), and use them on the path banner, the node, the finish
screens. Defense: it is the clearest thing in the photos and costs tokens and styling only.
Against: the path node art is generated with one blue face (`tools/build_icons.py:248`) and the
import swap handles only two colours (row 10), so a coloured node needs either a longer swap
table or a generator change.

**B2. One brighter accent only.** Keep one accent and make it more saturated. Defense: one
change, no art work. Against: it will not read as "more colour", which is what Zach asked for.

### Lever C: buttons

**C1. Keep the native buttons (D2) and add colour and motion around them.** Defense: it keeps a
settled decision (D2) and the platform's own look. Against: a native Button cannot take a
raised bottom edge or a custom press animation, which is what every button in the photos has.

**C2. A custom pressable button for the main actions, with a raised bottom edge, a press that
sinks it, a haptic and a sound; native controls stay for switches and pickers.** Defense: it is
the look of the references. Against: it amends D2 for the Check, Continue and primary buttons,
so it needs a dated `D22` and Zach's agreement, and it makes the two platforms look the same
there, which the divergence registry would have to record.

### Lever D: haptics

**D1. A small haptic vocabulary on top of `expo-haptics`, which is already installed.** A light
tick when an option is chosen, a soft impact when a button is pressed, a medium impact for a node
or card, a success pattern for a chest or a unit finished, a rigid tap for a lost heart.
Defense: almost free, no new dependency, no art. Against: haptics are still the phone's own
setting only (row 6); more of them makes a switch in Profile more useful, and that is a stored
setting (version 3, a migration and a test).

### Lever E: sound

**E1. Extend `tools/build_sounds.py` with new effects.** Each new effect is a function of the
generator and one WAV, loaded through `app/src/art/sounds.ts`. A first list, for Zach to cut:
tap, option select, node press, card slide, XP tick, streak up, heart lost, reward claim,
sparkle, perfect. Defense: it extends the one pipeline D15 set. Against: an agent cannot hear
a sound, so each one is proven only when Zach plays it (`afplay assets/sounds/<name>.wav`), and
a synthesised sound can feel flat next to recorded ones.

**E2. Recorded or licensed sounds.** Defense: richer. Against: D15 chose a generator, and a
licence is an outside decision. Not recommended for a first pass.

### Lever F: character

**F1. Animate the existing static poses with transforms.** An idle bob, a bounce on a right
answer, a head tilt on a wrong one, a squash when the finish screen opens, mascots on more
screens (Learn, Profile, empty states). Defense: it uses the 18 poses as they are and needs no
new art. Against: a flat SVG moving as a whole is not an animated character, so it will feel
stiff next to Duolingo's rigged ones.

**F2. New mascot art or new poses.** Defense: real range. Against: the generators are the only
way to change the SVGs, Higgsfield art cannot be regenerated, and it is the larger cost.

### Order of work

**G1. Slice by moment**, each slice finished and run on the phone before the next. A proposed
order: the lesson answer loop (choose, check, right, wrong, continue), then the finish and chest
and boss screens, then the path (nodes, banners, header counters), then Learn and Profile.
Defense: the answer loop is where Zach spends most of his time, and each slice is small enough
for one session. Against: the path is the first screen a player sees, so it waits.

**G2. Slice by lever** (all the haptics, then all the sounds, then all the motion). Defense:
each lever is built and judged once. Against: no screen feels finished until the last slice,
and several slices touch the same files.

## 4. Dials

Each is a proposed default for `app/src/config/dials.ts` (rule U5, BD-14).

| Dial | Proposed default | Why |
|---|---|---|
| Press scale of a button | 0.96, 90 ms down, spring back | A visible but short sink |
| Raised edge height of a primary button | 4 px | The photos show a thin darker edge |
| Right-answer bounce | 1.0 to 1.08 to 1.0 over 280 ms | Reads as a "yes" without hiding the text |
| Haptic on option select | selection tick | Lightest touch on the most frequent action |
| Haptic on button press | light impact | One step above a tick |
| New sound effects, first pass | 6 | A list to cut to what Zach likes |
| Sound length ceiling | 0.6 s | Tap sounds that run long get tiring |
| Reduced motion | On: skip bounces and sparkles, keep fades | The system setting is respected; no screen depends on motion to be understood |
| Unit colours | 4, one per unit, each with a light and a dark value | One per unit, as the photos show |
| Confetti or sparkle count on a finish | 24 | Enough to read as a burst |

## 5. Hazards this work walks into

1. **No gate sees any of it.** Typecheck, lint and vitest cannot see a bounce, a colour or a
   buzz. Every slice is proven by a screenshot on both platforms and, for haptics and sound, by
   Zach on his phone (`AGENT-PRACTICES.md` Part 6, R10). The hand-back says which of the two
   it claims.
2. **Motion on a native stack.** The `SESSION` routes are full-screen modals with the swipe-back
   off (`root-stack.tsx:5`). Added motion must not delay a tap or let a second press through,
   which `performCheck` and `performContinue` guard against with refs
   (`session-steps.ts:17-27,38-48`). An animation that finishes after a screen closes must not
   run on an unmounted view.
3. **Reduced motion and sound off.** Both are settings a player can already set on the phone.
   The Sound switch exists (row 6); reduced motion has no code yet (row 12).
4. **D2 and the native buttons.** Lever C2 amends a ratified decision. Per R8 it is a dated
   `D22` that names what it replaces, not a quiet change.
5. **Dark mode and tablets.** Every new colour needs a light and a dark value (rule U5, `D16`),
   and every new layout must hold in landscape and on a tablet (`D17`).
6. **Sounds are unprovable here.** Six new effects are six listening sessions for Zach. A
   proposal that adds sounds names which ones, and the hand-back says "not heard" until he has.
7. **Battery and performance.** Particles and loops run on a phone, not on this Mac. The first
   slice includes one measured check on the phone, not a guess.
8. **Files this effort would own, for the collision check.** `app/src/theme/tokens.ts`,
   `app/src/config/dials.ts`, `app/src/art/sounds.ts`, `tools/build_sounds.py`,
   `app/src/feedback/*`, the lesson components under `app/src/components/lesson/`, and later the
   path, chest, boss and profile components. The unit-story effort owns
   `app/src/components/path/unit-header.tsx` and a new story route; the two share
   `tokens.ts` and `dials.ts`, so they should not run in the same worktree at once.
9. **Scope creep from the photos.** Badges, quests and the daily puzzle look like "life" and are
   features. Section 2 keeps them out; each would need Zach's own decision.
10. **Model routing (Part 4), proposed.** Motion, colour and haptics fail loudly (a wrong screen),
    so Default (Opus 5.5). No part of this is a silent failure, so no Deep review is proposed.

## 6. Open questions, the GATE 1 batch

1. **Which levers, and in what order?** A to F above, and G1 or G2. Recommendation: A1, B1, C2,
   D1, E1 (six new sounds), F1, built in slices by moment (G1), starting with the lesson answer
   loop. The reason: nothing needs a new dependency or new art, and the answer loop is the part
   you see most.
2. **May the main buttons stop being native?** C2 changes D2 for Check, Continue and the primary
   buttons only; switches and pickers stay native. Recommendation: yes, because the references
   all have the raised coloured button and a native Button cannot take it.
3. **Add a Haptics switch in Profile?** It needs stored version 3 and a migration. Recommendation:
   yes, once there are more haptics than one buzz, because a player who dislikes them has no
   other way to turn them off in the app.
4. **How far toward the photos on colour?** Four unit colours with a coloured banner and node
   (B1), or one brighter accent (B2). Recommendation: B1. If a coloured node needs a generator
   change, the plan will say so before it runs.
5. **Which of the new features in the photos do you want as separate items?** Badges and
   achievements, daily quests, a daily puzzle, a mascot that speaks in lessons, a profile
   avatar. None is in this scope. Recommendation: pick none now, finish this pass first, then
   choose from what you see on the phone.
6. **Order against the other items.** The repeated-questions fix and the unit story are in
   `docs/incomplete/unit-stories/DESIGN.md`. Run game feel first, the story first, or the story
   and the lesson answer loop in parallel? Recommendation: the story first, since it is
   already ratified and small, then game feel, so the story screen gets the new motion and
   colour as it is built and is not redone.

## 7. Answers

Answered by Zach in chat, 2026-10-05, through the question tool:

| Ask | Answer | Note |
|---|---|---|
| Motion approach | First reply: "which will get me the closest to the duolingo feel". Then confirmed **A2, Reanimated now, Rive later** | This reverses my first recommendation (A1, built-in `Animated`), because the ask is fidelity to Duolingo. One new native dependency and one rebuild of the development build |
| Buttons | **C2**: custom main buttons for Check, Continue and primary actions; switches and pickers stay native | Needs a dated `D22` amending D2 |
| Haptics switch | **Yes**, a Haptics switch in Profile | Stored version 3, a migration from version 2 and a test that loads a version 2 save (Part 6, rule Q2) |
| Colour | **B1**: four unit colours plus colours per moment | The plan says before it runs whether a coloured node needs a generator change |
| Sound, character, order of slices | Recommendations stand: **E1** (six new sounds, each proven only when Zach plays it), **F1** (animate the existing poses), **G1** (slice by moment, answer loop first) | Not asked separately; Zach can overrule at the plan gate |
| Photo features | **Badges and achievements**, **daily quests** and a **mascot that talks in lessons** are wanted as separate future items. Not in this pass | Each becomes its own scope later. Daily puzzle, friend streaks and avatar were not chosen |
| Order of the three efforts | **In parallel** | Against my recommendation (story first). The two efforts share `tokens.ts` and `dials.ts` (section 5, hazard 8), so each runs in its own worktree and the board's "Files it owns" column is checked before each starts. Reanimated's native rebuild lands once, in the game-feel lane |

## 8. Decisions

Numbered `GF-1` to `GF-9`, not `D22`, for the reason given in
`docs/incomplete/unit-stories/DESIGN.md`, section 8: two parallel efforts cannot both claim the
next `D` number. Each names the app decision it amends, and the app design carries a dated
pointer back.

### GF-1. Reanimated for interface motion, Rive later for the mascots

Decided 2026-10-05 (Zach, asked which gets closest to the Duolingo feel, then confirmed Reanimated).
Interface motion uses `react-native-reanimated` 4 with `react-native-worklets`, installed with
`npx expo install` so the versions match SDK 57, and one native rebuild of the development build.
The mascots stay static poses moved with transforms until Zach rigs them in Rive (`D4`).

Defense: it is the library that does springs, sequences, layout animation and particle bursts on
the UI thread, which is most of what the photos show. Against: a new native dependency, a
rebuild, and a version coupling to React Native 0.86 that only a build on the phone proves. The
built-in `Animated` was weighed (option A1) and is the fallback if the build fails.

*As built, 2026-10-05 (board item 26, `PLAN.md` phase 1):* `bunx expo install` pinned
`react-native-reanimated` 4.5.1 and `react-native-worklets` 0.10.1, and both development builds
compiled and ran the press on the iPhone 17 simulator and the `Pixel_9` emulator, so the fallback
was not needed. No `babel.config.js` was added; Expo's preset adds the worklets plugin (BD-G9).
Not yet run on Zach's phone, which needs the same rebuild.

*Amended 2026-10-05 (Zach, board item 34; supersedes the second sentence of GF-1, "The mascots stay
static poses moved with transforms until Zach rigs them in Rive", for Flop only):* Zach changed who
rigs. An agent builds the Rive rig through the Rive editor's MCP, and Flop, the fish, is the first
character to have one (`HANDOFF.md` step 34 holds the rig; the file lives in Zach's Rive account,
file 2632317, and the repo holds only the exported `app/assets/rive/flop.riv`). The squid, the
shark and Flop's other five poses stay static poses moved with transforms, and `Mascot` stays the
one component (`D4`): `FlopRive` in `app/src/art/flop-rive.tsx` is a second body that draws the
rig when motion is allowed and falls back to the static `happy` pose through `Mascot`. The runtime
is `rive-react-native` 9.8.5, chosen with Context7 on 2026-10-05 over the new Nitro runtime
`@rive-app/react-native` 0.5.2 because the Nitro package is 0.x and pins `react-native-nitro-modules`
to `>=0.35.10 <0.37`; the legacy package sets a view-model boolean on a bound instance
(`useRiveBoolean`, `AutoBind(true)`). Interface motion still uses Reanimated.

### GF-2. A custom pressable for the main buttons

Decided 2026-10-05 (Zach: "Yes, custom main buttons"). Check, Continue and the primary action
buttons become a custom component with a raised bottom edge, a press that sinks it, a haptic and a
sound. Switches, pickers and the time dialog stay native `@expo/ui` controls.

Amends `D2` of the app design: `D2` required native components "where they exist", and a native
`Button` exists. The amendment covers the primary buttons only. Defense: the references all have
the raised coloured button and a native `Button` cannot take it
(`app/src/components/lesson/lesson-button.tsx:1-20`). Against: on these buttons the two platforms now
look the same, so the divergence registry (`docs/conventions-typescript.md`, Z-entries) gets a new
line. Rule U2 (wrap `@expo/ui` in `Host`) keeps applying to the controls that stay native.

*As built, 2026-10-05 (board item 26):* `PrimaryButton` is a blue face on a darker raised edge,
both taken from the blue chip of the art (`tools/build_icons.py:36`), 52 points high with a
4-point edge. A press shrinks it to 0.96 and sinks the face onto the edge; the release springs
back. It draws Check and Continue in the lesson loop, including the feedback sheet's Continue
(BD-G12); the other primary actions are still native until phases 5 and 7. Registry entry Z5 of
`docs/conventions-typescript.md` holds the divergence. The haptic and sound are props left for
phases 2 and 3; the button plays neither yet.

*Amendment, 2026-10-05 (Zach, in answer to board item 29, `PLAN.md` phase 4):* the answer feedback
sheet and the lesson progress bar stop being native too. Both were native by `D2` (`DESIGN.md`
10.3 of the app named SwiftUI's `ProgressView`, Compose's `LinearProgressIndicator` and the
`@expo/ui` `BottomSheet`). Zach's reason, in his words as relayed for the item: he wants all buttons,
toggles and similar controls to carry the app's tokens, and the native `@expo/ui` components do not
match the native look. This amendment covers those two views only. Profile's switches, the time
picker, the out-of-lives sheet and every other native control stay native until an item names them
(`PLAN.md` BD-G24 to BD-G30; registry entry Z6 of `docs/conventions-typescript.md`). Defense: the
sheet can now rise on the spring of `PLAN.md` section 3, carry the right and wrong colours, and pad
itself above Android's gesture bar; the bar can fill after each answer. Against: the two platforms
now draw both the same, and the screen-reader behaviour the native sheet gave for free (focus moved
into it, the lesson behind it hidden) is written by hand (`use-sheet-focus.ts`, `LessonFrame`'s
`overlayModal`), so a later change can break it with no gate to say so. The swipe that closed the
native sheet is gone: the sheet closes by Continue, and on Android the back button asks to leave as
before (BD-G24).

*As built, 2026-10-05 (board item 29):* the sheet is `app/src/components/lesson/feedback-sheet.tsx`,
an edge-to-edge view on the soft right or wrong colour with rounded top corners, drawn over the
lesson by `LessonFrame`'s `overlay`; the bar is `app/src/components/lesson/lesson-progress.tsx`, a
rounded track with a fill in the right colour that grows over `progressFillMs`. Seen on the iPhone
17 simulator, light and dark. Not seen on Android (`PLAN.md` phase 4 header).

### GF-3. A haptic vocabulary and a Haptics switch

Decided 2026-10-05 (Zach: "Yes, add the switch"). Haptics grow from one buzz to a small set
(selection tick, light impact, medium impact, success, rigid tap for a lost heart) behind
`app/src/feedback/`. A Haptics switch sits in Profile beside Sound, on by default. The setting is
stored, so the stored version rises from 2 to 3, a migration adds `settings.haptics = true` to
every older save, and a test loads a version 2 save (`AGENT-PRACTICES.md` Part 6, rule Q2).
Amends `BD-19` (haptics follow the phone only) and extends `D15`.

*As built, 2026-10-05 (board item 27, `PLAN.md` phase 2, `HANDOFF.md` step 30):* `STATE_VERSION` is
3 (`app/src/storage/migrations.ts:6`). The step from version 2 writes `haptics: true`, keeps every
other field, and passes a value that is not a version 2 player on unchanged so the load backs it up;
`app/src/storage/haptics-migration.test.ts` loads a version 2 save. The vocabulary is
`app/src/feedback/haptics.ts`: a selection tick, a light, medium and rigid impact, and success, each
inside `safely` and reached only through `buzz(touch, setting)` (BD-G17). The rule `shouldBuzz` sits
in its own file so the pure `moments.ts` can call it in node (BD-G15). The six answer and ending
moments keep their success and error buzzes and now follow the switch. Check and Continue give the
light impact as the finger goes down (dial `pressHaptic`, BD-G18); the option tick and the heart
tap wait for phase 4. Zach chose the copy in chat on 2026-10-05 from three registers and the line
as first written: the label "Haptics" and the help line "Little taps as you answer and press." (the
warm register, `D10`; "cheer you on" was dropped because the wrong-answer buzz does not cheer). The
help line opens the Settings footer, above the reminder line, because the native `Switch` takes a
label only (BD-G16). Seen on the iPhone 17 simulator and the `Pixel_9` emulator, light and dark,
on and off; on each, the save already on the device loaded as version 3 with its progress. Not felt: a simulator has no haptics, and no one has held a phone
with this build.

*As built, 2026-10-05 (board item 29, `PLAN.md` phase 4):* choosing an option gives the selection
tick (dial `selectHaptic`). The six answer and ending moments now go through the vocabulary, so
`app/src/feedback/haptics.ts` is the one importer of `expo-haptics`: success for a right answer, a
finish, a boss pass and a chest, and the rigid tap for a wrong answer and for a boss fail, which
before gave the error buzz (BD-G25). Not felt.

### GF-4. Four unit colours and colours for moments

Decided 2026-10-05 (Zach: "Four unit colours"). Tokens, each with a light and a dark value
(rule U5), for four unit colours (banner, node face, button) and for moments (finish, chest, boss
pass, boss fail). Whether a coloured path node comes from a longer import swap table
(`app/src/art/colour-swap.json`) or a change to `tools/build_icons.py` is decided at the start of
the path phase, with the result written as a `BD` in the plan before any art changes. A generator
change follows `docs/conventions-python.md`, never a hand edit of an SVG.

*As built, 2026-10-05 (board item 29):* the unit colours reach a screen for the first time. Zach
chose on 2026-10-05: a chosen answer row takes its unit's colour in a session of one unit (a
lesson, a boss or a review) and the neutral accent in a practice set or the placement check.
`app/src/components/lesson/session-colour.ts` finds the unit (`sessionUnit`, `chosenColour`, with
`session-colour.test.ts`); the neutral accent is the existing `accent` token, which is unit 1's blue
in light mode (BD-G26). The colour is the chosen row's border and raised edge (BD-G27).

### GF-5. Six new sound effects, from the generator

Decided 2026-10-05, a recommendation Zach did not overrule. `tools/build_sounds.py` gains six
effects, chosen from: tap, option select, node press, card slide, XP tick, streak up, heart lost,
reward claim, sparkle, perfect. The exact six are fixed at the sound phase and each is proven
only when Zach plays it (`afplay assets/sounds/<name>.wav`). They extend `D15`.

*As built, 2026-10-05 (board item 28, `PLAN.md` phase 3, `HANDOFF.md` step 32):* Zach chose the
plan's default six in chat on 2026-10-05, and the feel line offered for each: tap ("very short,
dry, low; a soft knock"), option select ("one light high pluck, lighter than tap"), heart lost ("a
short low hollow pop that dips down, quieter than answer_wrong"), XP tick ("a tiny bright tick,
made to repeat fast"), reward claim ("two bright notes up a fifth, then a short shimmer; not a run
like chest_open") and sparkle ("three or four quick, airy high notes falling, quieter than
chest_open"). They are `tap`, `option_select`, `heart_lost`, `xp_tick`, `reward_claim` and
`sparkle` in `tools/build_sounds.py`, 30 ms to 0.48 s of sound in files of 0.035 s to 0.5 s, peaks
0.3 to 0.55; the docstring gives each one's pitches, timing and peak. Two choices the lines left
open: "hollow" is a tone of odd partials only (`HOLLOW`), and the reward's shimmer is two pure
tones 7 Hz apart that beat. The 0.6 s ceiling is a generator constant with a check that fails the
gate (`PLAN.md` BD-G19). `tap` is the press sound of Check and Continue, through the Sound switch
(BD-G20); the other five are registered in `app/src/art/sounds.ts` and played nowhere yet. Zach
played all six on the Mac on 2026-10-05 and answered "theyre fine ill update them later", so they
stand as built until he changes them. Not yet heard on a phone.

*As built, 2026-10-05 (board item 29):* `option_select` plays when an option is chosen (dial
`selectSound`), and `heart_lost` plays with `answer_wrong` when a wrong answer spends a heart, in a
lesson or a boss only (dial `heartSound`, BD-G28). Not heard: an agent cannot hear them, and no one
has played them in the app.

### GF-6. Character through transforms on the existing poses

Decided 2026-10-05, a recommendation Zach did not overrule. An idle bob, a bounce on right, a tilt
on wrong, a squash on the finish screen, and mascots on more screens, all by moving the existing
poses. No new art, no new poses (`CLAUDE.md`: generators only, `assets/higgsfield/` untouched).
`Mascot` stays the one component (`D4`), so Rive replaces its body later.

*As built, 2026-10-05 (board item 29):* the bounce on right and the tilt on wrong are on the
feedback sheet's mascot, which already shows the cheer or sad pose, and start once the sheet is up
(BD-G23). `Mascot` did not change: a `MotionView` around it carries the movement. The idle bob and
the squash wait for later phases.

### GF-7. Built by moment, answer loop first

Decided 2026-10-05, a recommendation Zach did not overrule. The order is the lesson answer loop,
then the finish, chest and boss screens, then the path, then Learn, Profile and the empty states.

### GF-8. Reduced motion is respected

Decided 2026-10-05, a consequence of the above. When the phone asks for reduced motion, bounces,
sparkles and loops are skipped and fades stay. No screen needs motion to be understood.

*As built, 2026-10-05 (board item 29):* in the answer loop, reduced motion skips the row's bounce
and shake, the mascot's bounce and tilt, and the heart's drop. It keeps the colours, the right
answer's flash (a fade), and three movements that show a change of state: the chosen row's lift,
the sheet's rise and the bar's fill (BD-G22). Not seen with Reduce Motion on.

### GF-9. Photo features are parked

Decided 2026-10-05 (Zach). Badges and achievements, daily quests and a mascot that speaks inside
lessons are wanted later, each as its own scope. The daily puzzle, friend streaks and an avatar
were not chosen. None is built here.

### Rules that survive unchanged

All of `D8` (hearts, XP, lives timing, streak, boss, chest). `D9`, `D10`, `D14`, `D16` and `D17`.
`D2` for every control not named in GF-2. The TypeScript standard, in particular `U4`, `U5`, `U6`,
`B3` (a rule never reads the clock) and `Q2`. `assets/higgsfield/` and every generated SVG are
never hand-edited.

## 9. Second pass, opened 2026-10-05

Status: `RATIFIED` 2026-10-05, from Zach's answers in chat the same day. Sections 1 to 8 are kept as
written. This section adds decisions `GF-10` to `GF-19`; each names what it amends or supersedes.

### 9.1 The ask, in Zach's words

Four messages in one session on 2026-10-05, with 13 photos: the 12 Duolingo Chess photos of
section 1.2 again (`~/Downloads/IMG_2859.HEIC` to `IMG_2870.HEIC`) and `IMG_2872.HEIC`, a text
thread in which a friend who saw the app asks "Can it tell you its proud of you and loves you when
you complete a stage".

1. "improve the ui. more resemble duolingo. more custom popovers/components that are fun and
   colorful and fit the design tokens of the app. more character position and animations."
2. "I also would like to redraw the chest to be better looking and more three d. feel free to
   generate more images with higgsfield and write more passoff items for rive animations and i
   will have them completed"
3. "more sparkles. more pleasent chimes instead of just high pitched blips, and characters talking
   with their mouths animated would be awesome"
4. "use lottie more for animations if possible. things like numbers animating when counting up/down
   etc. more 3d text where applicable. fun game styled."

### 9.2 What was checked first, 2026-10-05

| # | Fact | Source |
|---|---|---|
| 1 | Phases 1 to 4 of `PLAN.md` are built and merged; board items 30 to 33 (phases 5 to 8) have rows and no prompts | `PASSOFF.md` rows 26 to 33; `grep -nE '^### [0-9]+\.' PASSOFF.md` |
| 2 | The chest is one flat front view: a body, a lid, two gold bands and a lock, on the shared extrusion | `tools/build_icons.py:343-357` (`ui_chest`); `assets/icons/ui/chest.svg` rendered with `qlmanage` |
| 3 | The chest rule is fixed: a boss passed by playing it readies 20 gems, once per unit | `app/src/game/chest.ts:7-17`; `app/src/config/dials.ts:22` (`chestGems`); app `DESIGN.md` `D6` and row "Chest" at `:189` |
| 4 | The loot-box hazard covers a chest with random contents "that can be bought"; nothing in felto is for sale | app `DESIGN.md:204-205` (hazard 3); `D6`, option 6A |
| 5 | Every random draw takes a seed so a test replays it | `app/src/game/seeded-random.ts:1-15`; `app/src/game/boss.ts:5` |
| 6 | Flop's Rive rig has a separate `mouth` object, so a talk loop needs no new art | `PASSOFF.md` item 34, "The rig, by object id" (`mouth` `0-17`) |
| 7 | `lottie-react-native` is not installed | `grep -n lottie app/package.json` finds nothing |
| 8 | The only bundled font is `FeltoRank`, the card-rank face | `ls app/assets/fonts` |
| 9 | The chosen icon style is "4 extruded flat" of the seventh Higgsfield round | `assets/gallery.html`, Round 7; `assets/higgsfield/20261005_025817_6791f9c3-0705-4da0-a64c-f78f42c3826b.png` |

New reference art, generated 2026-10-05 with Higgsfield (`gpt_image_2_5`, quality high, the style
image above as the reference), at Zach's invitation in message 2. Kept in a new folder,
`assets/higgsfield-chest/`, so `assets/higgsfield/` is untouched (`CLAUDE.md`). The files are kept
as received: `chest-1-closed.png` and `chest-2-open.png` (one wood chest, three-quarter view),
`chest-3-states.png` (closed, ajar, open), `chest-4-tiers.png` (wood, blue, purple; not chosen),
`chest-5-tiers-closed.png` and `chest-6-tiers-open.png` (the four chosen tiers, closed and open).

### 9.3 Answers

Asked in chat through the question tool on 2026-10-05, with a recommendation on each.

| Ask | Answer | Note |
|---|---|---|
| Which chest to redraw | Not one of the offered options: "Tiers, wood (common), blue (rare), red (mythic), gold (legendary)" | `chest-5` and `chest-6` were generated from this answer |
| How a tier is earned | "Randomize they click at least 3 times. in those three times it has the chance to turn into Rare->Mythic->Legendary. But the rarity is predetermined before they open, its just the animation changes" | Against my recommendation (tier by unit, which kept `D6` whole). Recorded as `GF-13`, with the condition below |
| Mascots talking | Lessons, finish and path (the recommendation) | Lifts the part of `GF-9` that parked a mascot speaking in lessons |
| Chimes | All 12 sounds, one family (the recommendation) | |
| Native controls | All of them, with a custom tab bar too | Against my recommendation (keep the native tab bar) |

### 9.4 Decisions

#### GF-10. A kit of custom, token-styled pieces replaces every native control

Decided 2026-10-05 (Zach: "All, with a custom tab bar too"). Every remaining native control becomes
a custom piece drawn from the tokens: `LessonButton` and its call sites, the out-of-lives
`BottomSheet`, the two `Alert.alert` dialogs, the Profile switches, the reminder time pickers, the
`FieldGroup` and `ListItem` form, and `NativeTabs` (the list is step 37 of `HANDOFF.md`, "Native
controls left"). The kit also adds what the photos show and the app lacks: a speech bubble with a
tail, a popover card anchored to a point with an arrow, a callout tag ("NEW", "+20 XP"), a sparkle
layer, 3D game text (`GF-16`) and a rolling number. Supersedes `D2` of the app design for every
control, and the sentence of the `GF-2` amendment that kept "Profile's switches, the time picker,
the out-of-lives sheet and every other native control" native. Defense: Zach said on 2026-10-05
(step 37) that every button and toggle must carry the app's tokens, and the native controls do not.
Against: screen-reader behaviour, focus, the iOS 26 glass tab bar and Android's back handling were
free with the native pieces and are now written by hand, with no gate to catch a loss; each piece
gets a written accessibility check in its item, and the registry of `docs/conventions-typescript.md`
gets one entry for the kit.

#### GF-11. The mascots talk, in a speech bubble, in lessons, on the finish screens and on the path

Decided 2026-10-05 (Zach: the recommendation). Supersedes the part of `GF-9` that parked "a mascot
that speaks inside lessons". In a lesson the host mascot says the prompt in a bubble; on a finish
screen it says a warm line, including the friend's ask (it is proud of you); on the path it greets
the player and points at the next lesson. The text types out at a dial speed. While it types, the
static pose bobs; once a rig exists for that mascot (`GF-19`), its view-model boolean `talking` moves
the mouth instead. Copy is in the warm register of `D10`, and each item lists the lines it adds.
Defense: the photos and the friend both ask for a character who speaks to you. Against: it changes
the lesson layout, and a long line on a small phone pushes the answer rows down; the item that
builds it checks the smallest supported phone.

#### GF-12. Characters are placed on the screen, as Duolingo places them

Decided 2026-10-05 (message 1, "more character position"). Large mascots stand beside the path
between nodes, alternating sides, in a muted version of the unit colour (as photos 2859 and 2860
show), and appear on popovers, empty states and the finish, chest and boss screens. Uses the 18
existing poses until the rigs of `GF-19` land.

#### GF-13. Four chest tiers, decided before the chest opens, revealed by taps

Decided 2026-10-05 (Zach). Tiers: common (wood), rare (blue), mythic (red), legendary (gold). The
tier is decided by a seeded draw (`seeded-random.ts`) when the chest becomes ready, so it never
changes by closing and reopening the app; the odds of each tier and the gems of each tier are dials.
The player taps the closed chest at least three times; each tap shakes it, and on the taps the draw
chose, it upgrades one tier with a flash. The last tap opens it. Amends `D8` ("20 gems, fixed") and
`D6` (fixed contents). Defense: Zach asked for it, and the hazard it touches is defined by purchase
(fact 4 of 9.2): an earned chest that cannot be bought is not a loot box under that definition.
**Condition, written so it is not lost:** the day gems, chests or anything that leads to them can
be bought (the GTO trainer scope proposes a paid tier, `docs/incomplete/gto-trainer/DESIGN.md`), this
decision must be reopened with Zach before the purchase ships, because a random chest that can be
bought rates 9+. Against: random rewards were refused once for that reason; this keeps them only
while the condition holds.

Art: `tools/build_icons.py` draws the four tiers, closed and open, in a three-quarter view from
`assets/higgsfield-chest/chest-5-tiers-closed.png` and `chest-6-tiers-open.png`. Generated SVGs only;
no hand edit (`CLAUDE.md`).

#### GF-14. All twelve sounds are re-voiced as one family of pleasant chimes

Decided 2026-10-05 (Zach: the recommendation). Keeps the twelve names, files and ceilings of `D15`
and `GF-5`, and replaces how each one sounds: the happy ones become soft bell chimes in a lower,
warmer register (notes of one major key, a soft attack, a long gentle decay); `tap` becomes a soft
wooden knock; `answer_wrong`, `heart_lost` and `boss_fail` become soft low tones, never buzzers.
Supersedes the sound design of `GF-5` and of `D15` (not the names). Each sound is proven only when
Zach plays it.

*As built, 2026-10-05 (board item 47, `HANDOFF.md` step 40):* every note is from C
major; the happy sounds use a bell voice of four slightly inharmonic partials with an 8 ms attack
and a fade to zero; `tap` is a short low knock; the three low tones fall in thirds and are the
quietest. Built in a worktree, not yet merged. Zach played all twelve on the Mac on 2026-10-05
and answered "sounds good"; not yet heard on a phone.

#### GF-15. Lottie for particle effects, from a generator; numbers roll with Reanimated

Decided 2026-10-05 (message 4, "use lottie more for animations if possible"). Bursts, confetti,
sparkle showers, gem and chip fly-ups and flame flicker are Lottie files written by a new
deterministic generator, `tools/build_lottie.py`, into `assets/lottie/`, and played by
`lottie-react-native` through the art module (rule U6). Numbers that count up or down are a rolling
odometer built with Reanimated, because a Lottie file holds a fixed animation and cannot show an
arbitrary number. Amends `GF-1` (Reanimated for interface motion, Rive for characters) by adding a
third runtime for effects, and `BD-G5` (particles as SVG shapes) for every effect a Lottie file
draws. Defense: a generator keeps the house rule that art is made by code in this repo, with no
download and no licence question. Against: a new native dependency and a rebuild of every
development build; a third animation runtime to keep in step with SDK 57.

#### GF-16. 3D game text where a number or a title celebrates

Decided 2026-10-05 (message 4). A display font and a `GameText` piece that draws text with a thick
outline and a darker extrusion below, in the style of the "2000" of photo 2862, for celebrations,
counters, banners and big titles. Body text stays plain. The font is bundled with its licence beside
it, as `FeltoRank` is (registry entry Z3).

#### GF-17. More sparkles

Decided 2026-10-05 (message 3). Twinkling sparkles on the current path node, every chest, the
legendary tier, the finish screens and a perfect answer, and a burst on every celebration. Reduced
motion skips them (`GF-8`).

#### GF-18. A custom tab bar

Decided 2026-10-05 (Zach). A tab bar in the style of the photos: coloured icons, a raised selected
state, drawn from the tokens. The tab icons come from `tools/build_icons.py`. Part of `GF-10`,
named apart because it replaces `NativeTabs` and the iOS 26 glass look.

#### GF-19. Rive rigs for every mascot and the chest, built by Zach's sessions

Decided 2026-10-05 (message 2: "write more passoff items for rive animations and i will have them
completed"). Board items for: Flop talking, cheering and sad in the existing rig; a rig for Kicker
(squid) and one for Ace (shark) with the same view-model contract; a chest rig with the four tiers,
the tap shake, the upgrade flash and the opening; then one app item that plays them. Every rig keeps
the `FlopRive` pattern: the static pose stands in under reduced motion or when the file fails to
load, and only `app/src/art/` imports the runtime and the files (rule U6).

### 9.5 Rules that survive unchanged

Everything in "Rules that survive unchanged" of section 8, except where `GF-10` to `GF-19` name an
amendment: hearts, XP, lives timing, streak and the boss rules of `D8` stay; only the chest rule
changes. No art outside the generators, and `assets/higgsfield/` is never touched.
