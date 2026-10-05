# Plan: repeat questions and unit stories

Status: phases 1 to 3 `MERGED` into `main` and phase 4 (the close-out) `BUILT`, 2026-10-05. The plan
has been run; no GATE 2 reply is quoted in this file. Decisions `US-1` to `US-8` are in `DESIGN.md`,
section 8, and are frozen. This plan is what is built, in what order, by whom, and done when.
Read `docs/AGENT-PRACTICES.md` and `docs/conventions-typescript.md` first; the whole-repo gate and
the hazards are in `CLAUDE.md` and `HANDOFF.md`.

## 0. Facts verified 2026-10-05 (these win over the design where they differ)

| # | Fact | Source |
|---|---|---|
| 1 | The lesson screen plays the authored lesson as is: `lessonSession(opened.access.lesson)` | `app/src/screens/lesson-screen.tsx:55` |
| 2 | The boss draws ten ids from the unit's fifty and looks them up in the pool | `app/src/components/boss/boss-session.ts:18-27`; `app/src/game/boss.ts:5-7` |
| 3 | The review and the stored missed list work by authored id | `app/src/game/session.ts:24-32`; `app/src/components/boss/unit-exercises.ts:12-15` |
| 4 | A dealt exercise is built by `dealExercise(kind, seed)`, and a set by `dealSet`, ids carry the seed | `app/src/drills/deal.ts:12-34` |
| 5 | Hands lessons by kind: `hands-1` 10 concept; `hands-2` 2 concept and 8 hand-name; `hands-3` 2 concept and 8 hand-name; `hands-4` 4 concept and 6 showdown; `hands-5` 1 hand-name and 9 showdown | the `awk` count over `app/src/content/units/hands.ts` on 2026-10-05 |
| 6 | `STATE_VERSION` is 2 and this effort changes the stored shape in no way | `app/src/storage/migrations.ts:6` |
| 7 | Session routes use `fullScreenModal` with `gestureEnabled: false` | `app/src/components/root-stack.tsx:5` |
| 8 | The unit header draws the unit number, title and chest and is the place for the button | `app/src/components/path/unit-header.tsx:18-30` |
| 9 | Unit ids are `hands`, `table`, `preflop`, `odds` | `app/src/content/schema.ts:110`; `app/src/content/outline.ts:17-` |
| 10 | The board has no open rows; nothing is IN FLIGHT | `PASSOFF.md` at session start, 2026-10-05 |

Each phase re-runs the checks it depends on before building (Part 2.4, "A resumed effort").

## 1. Decisions taken since ratification

| BD | Decision | Reversal |
|---|---|---|
| BD-S1 | The substitution is a pure function in `app/src/game/`: it takes the authored exercises, a seed and a table of dealers and returns the exercises to play. The dealers are passed in, so the function imports no dealer and stays testable in node (rule B2) | Delete the function and the two call sites; lessons play as authored |
| BD-S2 | A dealt exercise is told apart by its id prefix `practice-` (already what `dealSet` writes, `deal.ts:32`), through one named helper `isDealtId`. `recordAnswer` skips `missedExercises` for such an id | Remove the helper and the one branch |
| BD-S3 | Story content is a typed module under `app/src/content/stories/`, one file per unit, checked with `satisfies Story`; the story schema lives beside the lesson schema | Delete the folder and the route |
| BD-S4 | The tap zone is a pure function `storyTapAction(x, width)` returning `back` or `forward`, tested in node; the screen only renders two `Pressable` areas that call it | Replace the function |
| BD-S5 | The story's slide index is a pure reducer (`storyStep`), in the style of `runStep` (`app/src/components/lesson/lesson-run.ts:62-`) | Replace the reducer |
| BD-S6 | New dials go in `app/src/config/dials.ts` as one block, `// unit-stories`, so a merge with another effort's block keeps both | Delete the block |
| BD-S7 | Taken 2026-10-05 by board item 23 (phase 2), amending the second half of BD-S4. The screen has one tap layer, a `Pressable` filling the whole screen behind the slide (`app/src/components/story/story-frame.tsx`). The marks, the slide and their containers pass touches through (`pointerEvents` `none` or `box-none`), and the cross and the last button take their own. The layer has no children, so `locationX` is the tap's x on the screen, and `storyTapAction` decides it against the window width. Two `Pressable` areas sized from the dial would have put the 30/70 split in layout code that no test reads | Two `Pressable` areas, each with a fixed action, sized from `storyBackZone` |
| BD-S8 | A screen reader cannot tap one side of the screen, so the slide is one `adjustable` element: swipe up or down for the next or the previous slide, double tap to go forward (`story-slide.tsx`). The tap layer is hidden from screen readers | Drop the accessibility actions and show two labelled buttons |
| BD-S9 | Every way out (the cross, "Back to the path", a forward tap on the last slide, Android's back button) only asks the reducer to close; one effect calls `router.back()` when `closing` first turns true, and a closing story takes no more events (`use-story-run.ts`, `story-step.ts`). Two taps in one frame cannot pop two screens | Call `router.back()` in each handler, behind a ref guard |
| BD-S10 | A window wider than it is tall puts the fish beside the words; a taller one stacks them, so a phone on its side still fits one slide (`story-slide.tsx`). No token is added, because `app/src/theme/tokens.ts` belongs to board item 26, open in parallel on 2026-10-05: the slide reuses `ART_SCALE.finishMascot` (stacked), `ART_SCALE.castMascot` (beside), `TYPE`, `SPACE` and `LINE_HEIGHT` | Add story tokens to `tokens.ts` after item 26 merges, and point the slide at them |
| BD-S11 | The header button is the native `@expo/ui` `Button` with `variant="outlined"`, under the unit title in the words column, so it wraps with the words and never pushes the chest off a small phone (`story-button.tsx`, `unit-header.tsx`). It shows for every unit with a story, whatever the player's progress, locked units included, because the story gates nothing (US-5) | Show it only on an open unit, or use the filled variant |
| BD-S12 | The stories are listed in `app/src/content/stories/catalog.ts` (`STORIES`, `storyFor`), and `validate-story.ts` checks them: 6 to 8 slides, a body of at most `storyWordsPerSlide` words (the dial is read as a maximum), a title and a body, cards that parse, no card twice, no empty card row, no `key` without cards, one story per unit. The key test of US-7 is built here, ahead of phase 3, in `story-catalog.test.ts` over every listed story, because the placeholder already has a keyed slide | Move the key test into phase 3's `hands-story.test.ts` and read the dial as a target, not a maximum |
| BD-S13 | A unit with no story draws its own not-found view, `StoryMissing` ("Story not found." and "This unit has no story yet."), laid out as `LessonClosed` is. `LessonClosed` says "This unit is not on the path" for a non-lesson session, which is false for a unit without a story, and `app/src/components/lesson/` belongs to the game-feel effort | Add a story case to `LessonClosed` once item 29 has merged |

## 2. Phases

| # | Phase | Driver | Subagents | Est. context | Why that shape |
|---|---|---|---|---|---|
| 1 | Dealt hands in lessons and the boss | Default (Opus 5.5) | none | comfortable | One rule, two call sites, one filter; failure is loud except the missed-id trap, which a test pins |
| 2 | Story engine, route and header button | Default | none | comfortable | One screen, two pure functions, one route; a wrong screen is loud |
| 3 | The hands story content | Default | one Mechanical read-only check that every example's cards parse and the evaluator names the keyed hand, own worktree, model passed explicitly | comfortable | Copy goes to Zach first (R7); the key test is the only silent-failure guard |
| 4 | Close-out | Mechanical (Sonnet 5) | none | comfortable | Records, index, runtime entries; no judgment |

Phases 1 and 2 are two lanes and run in parallel, each in its own worktree. Phase 3 waits on phase 2.
Phase 4 waits on all three.

### Phase 1: Dealt hands in lessons and the boss

**BUILT 2026-10-05, commit `810cc25`, `MERGED` as `0658776`** (board item 22, lane D, branch
`lane-d-dealt-hands`, `HANDOFF.md` step 28). Deviations: `DEALERS` in `app/src/drills/deal.ts` is now exported (one
word, in a file this phase did not list); a third test file holds the boss wiring
(`app/src/components/boss/boss-dealt.test.ts`); one line of `boss-session.test.ts` changed,
because `US-1` ended what it asserted. `hands-3` was seen on iOS and Android; the boss was not
walked on a device.

Lane A. Waits on nothing. Files it owns: `app/src/game/dealt-slots.ts` (new) and its test,
`app/src/game/session.ts`, `app/src/screens/lesson-screen.tsx`,
`app/src/components/boss/boss-session.ts`, `app/src/config/dials.ts` (block `// unit-stories`).

1. **Read `hands-2` and confirm its order** (`US-3`). Open `app/src/content/units/hands.ts`
   from `id: "hands-2"` and write down whether each `hand-name` exercise is meant to meet one hand
   in a set order. If it is not, stop and ask Zach before adding it to the dial.
2. **Add the dials**: `dealtLessons` (`["hands-3", "hands-5"]`).
3. **Write `dealt-slots.ts`** (BD-S1): `withDealtSlots(exercises, seed, dealers)` replaces, in
   place, each exercise whose kind is a key of `dealers`, and returns the rest unchanged. Seed each
   replacement from the set seed and its position so two slots never share a deal. Tests, in a new
   file `dealt-slots.test.ts`: the length and the order of kinds are kept; a `concept` is
   untouched; two seeds give two different lists for `hands-3`; the same seed gives the same list.
4. **Wire the lesson.** In `lesson-screen.tsx`, when the lesson id is in `dealtLessons`, play
   `withDealtSlots(lesson.exercises, clockSeed(opened.now), DEALERS)`. Read the clock once, at the
   edge, when the lesson opens (rule B3, already how `opened` is made, `lesson-screen.tsx:48`).
5. **Wire the boss.** In `bossAccess`, after `exercisesByIds`, run `withDealtSlots` over the
   ten. The boss draw itself (`drawBoss`) is unchanged.
6. **Do not remember a dealt miss** (`US-2`, BD-S2). Add `isDealtId`; in `recordAnswer`
   (`session.ts:24-32`) skip the `missedExercises` change for a dealt id while still spending
   the life. New test file `dealt-missed.test.ts`: a wrong dealt answer in a lesson spends a life
   and leaves `missedExercises` unchanged; a wrong authored answer still adds its id.
7. **Record it** (Part 7): a ledger step at the next free number (read `HANDOFF.md`), an
   `As built` note under `D8` in the app design, and the runtime entries below.

Done when: the whole-repo gate from `CLAUDE.md` is green, and the new tests prove that two seeds
differ, the kinds keep their order, and a dealt miss leaves the saved list alone. The proof a green
gate cannot supply: play `hands-3` twice on the iOS simulator and the Android emulator and the
eight drill slots show different cards each time (screenshots of both, per platform).

Watch for: the review. A dealt id must never reach `missedExercises`, or the review silently loses
it (design US-2). Also `D8` still says "unit's fifty": do not change the pool, only what is played.

### Phase 2: Story engine, route and header button

**BUILT 2026-10-05, commit `aed7054`, `MERGED` as `06cea5a`** (board item 23, `HANDOFF.md` step 31). Built on Opus 5.5 in
the worktree `.claude/worktrees/lane-e-story-engine`, branch `lane-e-story-engine`, from `main` at
`b986f61`. The build calls are BD-S7 to BD-S13. Seen running on the iOS simulator (iPhone 17e) in
light and dark and on an Android emulator in light and dark; not seen in landscape or on a tablet
(step 31 says why). The placeholder story of step 7 is `app/src/content/stories/hands.ts`.

Lane B. Waits on nothing. Files it owns: `app/src/app/story/[unit].tsx` (new),
`app/src/screens/story-screen.tsx` (new), `app/src/components/story/*` (new),
`app/src/content/stories/schema.ts` (new), `app/src/components/root-stack.tsx`,
`app/src/components/path/unit-header.tsx` and `app/src/components/path/path-view-model.ts`
(only to expose whether a unit has a story), `app/src/config/dials.ts` (block `// unit-stories`).

1. **Dials**: `storyBackZone` 0.30, `storyWordsPerSlide` 30, `storySlidesPerUnit` `{min 6, max 8}`.
2. **Schema and validator.** `Slide = { pose, title, body, cards?, key? }`, `Story = { unit, slides }`.
   A validator beside `validate.ts` counts slides against the dial, the words against the dial, and
   that `cards` parse and have no duplicate card (`hasDuplicate`, `validate.ts:7`).
3. **Pure functions** (BD-S4, BD-S5), each with its own test file: `storyTapAction(x, width, zone)`
   (back for `x < width * zone`, else forward) and `storyStep(state, event)` (forward on the last
   slide asks to close; back on the first does nothing; never an index out of range).
4. **The screen** `StoryScreen`: the progress marks, the close control, the fish pose, the title
   and body, the optional `CardRow`, two `Pressable` zones from `storyTapAction`, the last slide's
   single "Back to the path" button. Light and dark values come from tokens (rule U5); no raw sizes.
   The three states of rule U4: a unit with no story shows the same closed view the lessons use for a
   missing id; there is no loading state because the content is bundled; the empty state cannot
   happen, the validator requires slides.
5. **The route** `story/[unit]` is a thin render (rule U1), registered in `root-stack.tsx` with the
   same `SESSION` options. `useHardwareBack` closes it (`use-hardware-back.ts:5-12`).
6. **The header button.** `UnitHeader` shows "Learn about {unit title lower case}" when the unit has
   a story, and pushes `story/[unit]`. It stores nothing (`US-5`).
7. **A placeholder story** for `hands` with the schema's minimum slides, only so the route can be run.
   Phase 3 replaces it.
8. **Record it**: ledger step, code map lines, the divergence registry unchanged (no platform file
   in this phase), runtime entries.

Done when: the gate is green; the two pure functions have tests that pin the 30/70 split at its
edges (`x` just under and at 30 percent) and the first and last slide; and the story opens from the
Learn tab header on the iOS simulator and the Android emulator, light and dark, portrait and
landscape on a tablet, with a screenshot of each of the three states of the header button (unit
with a story, unit without) and of the first and last slide.

Watch for: Android's back button leaving the app instead of the story; a tap on the left edge being
taken by the system as a back gesture (iOS swipe-back is already off, `root-stack.tsx:5`); a header
button that crowds the chest on a small phone.

### Phase 3: The hands story content

**BUILT 2026-10-05, commit `1148b43`, `MERGED` as `21338ca`** (board item 24, `HANDOFF.md` step 33). Built on Opus 5.5 in the
worktree `.claude/worktrees/lane-e-story-engine`, branch `lane-e-story-engine`, at `aed7054` (item 23).
Zach chose the warm register in chat on 2026-10-05. Eight slides, four keyed; the Mechanical check
of step 4 ran on Sonnet 5 in its own worktree and found no disagreement. The `As built` note is
under US-7 in `DESIGN.md`. Seen running on the iPhone 17e in light and dark; the Android result is
in step 33. Main merged item 23 on 2026-10-05 (`06cea5a`, "merge lane-e-story-engine"), after this
phase began; this phase changes only its two files, so it merges onto that.

Lane B, after phase 2. Files it owns: `app/src/content/stories/hands.ts` (new, replaces the
placeholder) and `hands-story.test.ts` (new).

1. **Draft 6 to 8 slides** in the warm voice, about 30 words each: the deck and ranks, hole cards and
   the board, best five of seven, the ten hands in order from high card up with an example row for
   each group, kickers, who wins. Use only terms the lessons teach in that order.
2. **Show Zach the copy before it is final** (R7): two or three registers for the first slide and
   one slide each for a card example and the last slide, then write the rest in the register he picks.
   `D10` already fixes warm; the ask is the exact words.
3. **Key every example.** Each slide with cards that names a hand carries `key` (a `HandCategory`).
   The test computes it with `evaluate` and fails on a disagreement (rule Q3 extended).
4. **A Mechanical read-only subagent**, in its own worktree, model passed explicitly, checks that
   every card string in the file parses and the keyed category is the evaluator's. Its output is a
   list; check its diffstat when it returns (Part 4).
5. **Record it.**

Done when: the gate is green, `hands-story.test.ts` passes with every keyed example, Zach has seen
and approved the copy, and every slide has been read on the iOS simulator and the Android emulator
(screenshots of the first, one card slide and the last).

Watch for: a slide that names a hand the example row does not show, and a slide that uses a term
before the lessons teach it. These pass every gate; the key test and Zach's read are the guards.

### Phase 4: Close-out

**BUILT 2026-10-05, not committed** (board item 25; its ledger step is written by a separate
session, so this header names the item, not a step). Driver Mechanical (Sonnet 5), in its own
worktree on `main` at `0658776`. Records only; no code changed. Done: the whole-repo gate re-run in a worktree
at `main`'s commit `0658776` (section 5 has the numbers); `D8` of the app design checked against the code and given a
dated pointer to `US-5` and `US-6`, `D9` given one to `US-7`; the index `docs/README.md`
reconciled; the runtime entries of section 7 gathered, each marked seen or `open`. Not done, by
design: archiving this folder, which waits until Zach has walked section 7 (Stage 7 and 8 of
`docs/AGENT-PRACTICES.md`, Part 2.2), and folding the ledger.

Waited on phases 1 to 3. Folds nothing; reconciles the index (`docs/README.md`), writes the three
hand-back blocks of Part 7, adds a dated pointer under `D8` and `D9` of the app design, and lists
the runtime entries in one place.

## 3. Dials

| Dial | Value | Where |
|---|---|---|
| `dealtLessons` | `["hands-3", "hands-5"]` | `app/src/config/dials.ts`, block `// unit-stories` |
| `storyBackZone` | 0.30 | same |
| `storyWordsPerSlide` | 30 | same |
| `storySlidesPerUnit` | min 6, max 8 | same |

## 4. Seams reserved, deliberately not built

The stories for the table, preflop and odds units (`US-8`). A "seen" flag and a changing button
label (option 2B, would need stored version 3, which the game-feel effort also wants, so the two
must not both claim it: see the game-feel plan, BD-G2). A bigger authored pool per lesson (option 1B).
A story node on the path (option 2C). Auto-advance and hold to pause.

## 5. Repo hazards, with live numbers

- The saved list `missedExercises` is looked up by authored id (`unit-exercises.ts:12-15`). A dealt
  id in it is dropped without a message. Phase 1 pins it with a test.
- Measured 2026-10-05 at the close-out, on `main` at `0658776` with every lane merged (this effort
  and the game-feel items 26 to 28): 82 test files, 608 tests passed; typecheck and lint exit 0.
  The count of 63 files and 490 tests that the plan was written against is stale. The stored
  version is now 4 (`app/src/storage/migrations.ts:6`); fact 6 of section 0 was true when written
  and this effort still changes no stored shape, but other work (game-feel) has moved the number.
- The gate rewrites generated assets in place; after it, `git diff --stat -- assets/icons
  assets/mascots assets/sounds` must show nothing this effort did not mean (`CLAUDE.md`).
- `app/src/config/dials.ts` is shared with the game-feel effort; each adds one block under its own
  comment, so a merge keeps both.
- Write `bun run --cwd app <script>`, never `bun --cwd app run <script>` (`CLAUDE.md`).

## 6. Session protocol

`docs/AGENT-PRACTICES.md`, Parts 5 to 7. One phase per session. Never run `git commit`, `git push`,
`git add -A` or `git add .`; print the two blocks of Part 11 with the exact files touched. Each
phase starts by running `git status --short` and checking the files it owns against the board.

## 7. Runtime entries, gathered at the close-out of 2026-10-05

This section is the one place for this effort's runtime entries. Each was written by the phase that
built it (`HANDOFF.md` steps 28, 31 and 33) and is collected here by board item 25. The last column
says what has been seen running and by which step; `open` means nobody has seen it on a device yet.
"Gates green" is not "seen running" (`docs/AGENT-PRACTICES.md`, R10). Nothing here blocks the
close-out. It blocks only the claim that a thing was seen.

| Goal | Where | Right answer | Status |
|---|---|---|---|
| A replayed drill lesson shows new cards (phase 1) | Learn tab, unit 1, lesson 3 "Name that hand", play it twice, iOS and Android | Eight hand-naming slots differ between the two plays; the two concept slots are the same | Seen 2026-10-05 on the iPhone Air simulator and the `Pixel_9` emulator, through `felto://lesson/hands-3?play=rrrrrrrrrr` (step 28). Lesson 5 not seen. Open for Zach on his phone |
| The boss no longer repeats hands (phase 1) | Unit 1 boss after finishing its lessons, twice | The drill slots show cards you have not seen in a lesson; concept questions may repeat | `open`: covered by tests (`boss-dealt.test.ts`), not walked on a device (step 28) |
| A dealt miss does not enter the review (phase 1) | Get a dealt answer wrong in lesson 3, finish, open the unit 1 review | The review does not list that hand | `open`: covered by `dealt-missed.test.ts`, not walked on a device (step 28) |
| The kickers lesson is unchanged (phase 1) | Unit 1, lesson 4 | The same six showdowns as before | `open`: not walked (step 28) |
| The story opens and closes (phase 2) | Learn tab, unit 1 header, "Learn about hands" | Right tap forward, left tap back, first-slide back does nothing, last slide shows only "Back to the path", Android back closes it | Seen 2026-10-05 on the iPhone 17e simulator in light and dark, and on the `Medium_Phone_API_36` emulator in light and dark, including Android back with the app left open (step 31). Not seen on a physical phone |
| The story costs nothing (phase 2) | Open and finish the story | Hearts, XP and streak are unchanged | Seen on iOS: the stat bar read 4, 240, 2 and 20 before and after (steps 31 and 33). `open` on Android: no stat bar reading was written down |
| Only a unit with a story shows the button (phase 2) | Learn tab, the headers of units 1 and 2, iOS and Android, light and dark | Unit 1 shows "Learn about hands" under its title, beside the chest; unit 2 "The table" shows no button | Seen on iOS in light and dark, units 1 and 2 (step 31). Android: unit 1 seen in light and dark; unit 2 `open` |
| A unit without a story has a not-found page (phase 2) | Open `felto://story/table` on a development build | The sad fish, "Story not found.", "This unit has no story yet." and "Back to the path", which closes it | Seen on iOS in dark (step 33). `open` on Android and in light |
| A slide fits a phone on its side and a tablet (phase 2) | Rotate a phone to landscape inside the story, then a tablet in landscape (Android: `adb shell wm size 2560x1600` and `wm density 320`) | Landscape puts the fish beside the words; nothing is cut off on the card slide or the last slide, and "Back to the path" shows on the last | `open`: no landscape, tablet or iPad run (steps 31 and 33). iOS cannot be rotated from this Mac (`HANDOFF.md`, Environment) |
| A screen reader can move through the story (phase 2) | VoiceOver or TalkBack on, inside the story | The slide reads its title, body and position ("Slide 1 of 6"); swipe up goes to the next slide, swipe down to the one before | `open`: no screen reader run (steps 31 and 33). The hands story now has 8 slides, so the position reads "Slide 1 of 8" |
| The hands story walks unit 1 in order and every example matches its words (phase 3) | Learn tab, unit 1, "Learn about hands", tap through all eight slides on a phone, iOS and Android, light and dark | Eight marks; the titles run "Meet the deck", "Your two cards", "Best five of seven", "The ten hands", "Straights and flushes", "The big hands", "Kickers break ties", "Who wins the pot?"; the rows show four aces, K and Q, three eights, 5 to 9 in mixed suits, the royal flush in spades and a pair of aces with K, 9 and 4; no text or card is cut off, and only the last slide shows "Back to the path" | Seen on the iPhone 17e: slides 1, 5 and 8 in light and dark, slides 2, 6 and 7 in one of the two (step 33). Slides 3 and 4 were not seen on a device, and no Android screen was seen (`open`). Zach has read the copy in chat but not yet on a phone |

### Open findings carried forward, not fixed

These are in the ledger as `open` and are listed here so the person who walks the pass sees them.
None of them is this effort's to fix in the close-out.

- Step 31 (a), repeated in step 33 (a): taps and a lesson link reached the iPhone 17e that the session
  did not send. The simulator tool acts on the attached or first booted simulator when a call names
  no device, so parallel sessions can reach one another's device. Name the device on every call.
- Step 31 (b): after the merge, the generated `app/.expo/types/router.d.ts` in the main checkout lacks
  `/story/[unit]` until Metro runs once there. On 2026-10-05 the main checkout's
  `app/.expo/types/router.d.ts` already lists the story route, and the typecheck passed in a fresh
  worktree that had no generated types (exit 0). The finding no longer reproduces; it is kept
  because a fresh clone has never been tried on a machine with a different cache.
- Step 31 (c): the story views add five raw `fontWeight` strings to the known gap of rule U5.
- Step 31 (d): `story-screen.tsx` and `story-missing.tsx` call `LessonButton`, which game-feel item 26
  removes only when no call site is left (its BD-G7).
- Step 31 (e): the test counts in `CLAUDE.md` and in the `HANDOFF.md` Environment rows were stale.
  This close-out measured them (section 5); `CLAUDE.md` is left to game-feel item 33 by Zach's
  answer of 2026-10-05.
- Step 31 (f): the development build's tools button covers the right end of the progress marks
  (development builds only).
- Step 33 (b): under heavy load a screenshot taken just after a tap can show the screen before the
  tap. Take a second one.
- Step 33 (c): slide 2 says the hole cards are face down while its row draws them face up. A teaching
  choice, Zach's to keep or change.
- Step 33 (d): on a 390-point phone the last slide ends with "fun!" alone on its line.
- Step 33 (e): the `think` pose reads as worried on slides 3 and 5. That is the existing art.
