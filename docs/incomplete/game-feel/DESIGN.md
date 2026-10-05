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

### GF-4. Four unit colours and colours for moments

Decided 2026-10-05 (Zach: "Four unit colours"). Tokens, each with a light and a dark value
(rule U5), for four unit colours (banner, node face, button) and for moments (finish, chest, boss
pass, boss fail). Whether a coloured path node comes from a longer import swap table
(`app/src/art/colour-swap.json`) or a change to `tools/build_icons.py` is decided at the start of
the path phase, with the result written as a `BD` in the plan before any art changes. A generator
change follows `docs/conventions-python.md`, never a hand edit of an SVG.

### GF-5. Six new sound effects, from the generator

Decided 2026-10-05, a recommendation Zach did not overrule. `tools/build_sounds.py` gains six
effects, chosen from: tap, option select, node press, card slide, XP tick, streak up, heart lost,
reward claim, sparkle, perfect. The exact six are fixed at the sound phase and each is proven
only when Zach plays it (`afplay assets/sounds/<name>.wav`). They extend `D15`.

### GF-6. Character through transforms on the existing poses

Decided 2026-10-05, a recommendation Zach did not overrule. An idle bob, a bounce on right, a tilt
on wrong, a squash on the finish screen, and mascots on more screens, all by moving the existing
poses. No new art, no new poses (`CLAUDE.md`: generators only, `assets/higgsfield/` untouched).
`Mascot` stays the one component (`D4`), so Rive replaces its body later.

### GF-7. Built by moment, answer loop first

Decided 2026-10-05, a recommendation Zach did not overrule. The order is the lesson answer loop,
then the finish, chest and boss screens, then the path, then Learn, Profile and the empty states.

### GF-8. Reduced motion is respected

Decided 2026-10-05, a consequence of the above. When the phone asks for reduced motion, bounces,
sparkles and loops are skipped and fades stay. No screen needs motion to be understood.

### GF-9. Photo features are parked

Decided 2026-10-05 (Zach). Badges and achievements, daily quests and a mascot that speaks inside
lessons are wanted later, each as its own scope. The daily puzzle, friend streaks and an avatar
were not chosen. None is built here.

### Rules that survive unchanged

All of `D8` (hearts, XP, lives timing, streak, boss, chest). `D9`, `D10`, `D14`, `D16` and `D17`.
`D2` for every control not named in GF-2. The TypeScript standard, in particular `U4`, `U5`, `U6`,
`B3` (a rule never reads the clock) and `Q2`. `assets/higgsfield/` and every generated SVG are
never hand-edited.
