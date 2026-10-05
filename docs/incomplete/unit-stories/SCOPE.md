# Scope: repeat questions and unit stories

Status: `SCOPING`, opened 2026-10-05. Nothing here is decided. The questions in section 6 go to
Zach in chat in the same turn this file is finished (`docs/AGENT-PRACTICES.md`, R6), and each
answer is written into section 7 on the day it is given.

Zach's words, 2026-10-05, after running the development build on his iPhone: questions "are
getting repeated a lot" in the beginning lessons. People "should have the option before starting
a unit to get a quick rundown on everything in an image and tap through format like a Snapchat
story". Example: before the hands unit, an optional "learn about hands" button. Tap the right
side of the screen to go forward, the left side to go back. It "talks them through everything
with examples and very simply".

Two pieces of work, one shared cause: the lessons teach only through questions, so a player
who does not know a term meets it first as a question, and the same question comes back.

## 1. What exists, verified 2026-10-05

| # | Claim | Verified state | Source |
|---|---|---|---|
| 1 | A lesson is ten authored exercises in a fixed order, and a unit is five lessons (fifty exercises) | Every unit file holds 50 `kind:` entries; `exercisesPerLesson` is 10 and `lessonsPerUnit` is 5 | `grep -c 'kind: "' app/src/content/units/*.ts` gives 50 each; `app/src/config/dials.ts:12,14` |
| 2 | A lesson never draws or shuffles: replaying a lesson gives the same ten questions in the same order | `findLesson` returns the authored lesson and the lesson screen plays `lesson.exercises` as written; only boss, review, placement and practice use a seed | `app/src/components/lesson/lesson-lookup.ts:14-20`; `grep -rn "shuffled(" app/src` finds `boss.ts:6`, `review.ts:15`, `placement-session.ts:17,19` only |
| 3 | A finished lesson stays open to play again, and a lesson left at 0 hearts restarts from question 1 | D8 as built: replaying gives XP and streak again | `docs/incomplete/app/DESIGN.md`, D8 "As built" paragraph; `lesson-lookup.ts:23-24` |
| 4 | The boss is ten questions drawn from the unit's fifty, so every boss question is one the player has already answered in a lesson | By rule D8 | `app/src/game/boss.ts:5-7`; `DESIGN.md` D8 |
| 5 | The placement check draws ten from the 100 questions of units 1 and 2; a player who fails it then meets those same units' lessons | By rule D20 | `app/src/components/onboarding/placement-session.ts:11-21`; `app/src/game/placement.ts:25-27` |
| 6 | Practice deals fresh hands, but only five kinds (never `concept`), and the Practice tab opens only the kinds that finished units unlock | `dealSet` picks from `openKinds`; unit 1 opens two kinds | `app/src/drills/deal.ts:12-18,26-34`; `app/src/components/practice/practice-menu.ts:54-60` |
| 7 | Unit 1 (hands) is 18 concept, 17 hand-name and 15 showdown exercises | Counted by kind | `grep -oE 'kind: "[a-z-]+"' app/src/content/units/hands.ts \| sort \| uniq -c` |
| 8 | Several prompts are word-for-word the same in unit 1, with different cards | "Seven cards: your two hole cards and the five on the board. What is your best five-card hand?" appears 5 times; "Three players are left. Who wins the pot?" 3 times; "What do these five cards make?" 2 times. No two exercises share the same cards | `grep -oE 'prompt: "[^"]*"' app/src/content/units/hands.ts \| sort \| uniq -c \| sort -rn`; duplicate check on `cards:` and `board:` lines returned a count of 1 for every line |
| 9 | Preflop repeats more: "You are UTG, the first to act. Raise or fold?" 8 times, the small blind prompt 8 times | Same grep on `preflop.ts` | `app/src/content/units/preflop.ts` |
| 10 | Lessons teach by question and explanation only. Unit 1 lesson 1 is ten `concept` questions that introduce the deck, ranks and the board | The explanation shows after each answer; there is no reading step before the questions | `app/src/content/units/hands.ts:14-97` |
| 11 | No story, slide, primer or walkthrough feature exists | `grep -rniE "stor(y\|ies)\b\|slide\|walkthrough\|primer\|explainer" app/src` matches only a comment about a sheet that "slides" (`use-lesson-run.ts:23`) | the grep, run 2026-10-05 |
| 12 | A unit is a header and seven stops: five lessons, a boss, a review | `unit-header.tsx` draws the title and the chest; `PathUnit` holds `stops` | `app/src/components/path/unit-header.tsx:18-30`; `app/src/components/path/path-view-model.ts:26,37-41`; `DESIGN.md` 10.1 |
| 13 | A full-screen route style for sessions already exists, with the iOS swipe-back gesture off | `SESSION = { presentation: "fullScreenModal", gestureEnabled: false }` | `app/src/components/root-stack.tsx:5` |
| 14 | Android's back button is handled by one hook | `useHardwareBack` | `app/src/components/lesson/use-hardware-back.ts:5-12` |
| 15 | The card art, a row of cards and the three mascots in six poses each already exist and need no new art | `CardRow` draws a group of cards; mascots have `happy`, `cheer`, `think`, `sad`, `sleep`, `smug` | `app/src/components/exercise/card-row.tsx:9-17`; `ls assets/mascots/fish` |
| 16 | The app has no gesture or animation library, only `react-native-svg` and `expo-router` among the touch and drawing packages, so tap zones are plain `Pressable` areas | `package.json` lists neither `react-native-gesture-handler` nor `react-native-reanimated` | `grep -nE '"react-native-(gesture-handler\|reanimated)"' app/package.json` found nothing |
| 17 | Stored player state is at version 2; a new stored field needs version 3, a migration and a test | `STATE_VERSION = 2` | `app/src/storage/migrations.ts:6`; `docs/AGENT-PRACTICES.md` Part 6 |
| 18 | The board has no open rows, and no archive exists yet | `PASSOFF.md` says no `OPEN` rows (session start hook, 2026-10-05); `docs/README.md` says no effort has closed | `docs/README.md`, "Standing rules" |

What the audit changes about the request. The fish guides lessons (D9), so the story host is
already decided. The word "repeated" has at least three different causes in this code (rows 2,
4, 5 and 8), and each has a different fix, so section 6 asks Zach which one he saw.

## 2. What this is, and what this is not

This is:

- A fix for repeated questions, in whichever of the causes in section 1 Zach confirms.
- An optional, skippable, full-screen story for a unit: a short run of slides, each a mascot,
  a few plain sentences and, where it helps, example cards. Tap the right side to go forward,
  the left side to go back. A row of progress marks across the top, and a close control.
- A button on the unit that opens the story. It never blocks the lesson path.

This is not (parked, and no session raises it again without a new question to Zach):

- A change to how lessons, the boss, the review, the chest or the placement check count hearts,
  XP, streak or progress. The story gives none of them and costs none, so it cannot change a
  streak or a heart count (section 1, rows 3 and 12).
- A lock. No lesson waits on a story.
- Video, Rive animation, auto-advance timers, hold-to-pause or swipe gestures.
- New art. A new card, mascot pose or icon is a generator change under
  `docs/conventions-python.md`, never a hand edit of `assets/`.
- A story for the Practice tab, the boss, the review or the chest.
- A rewrite of the existing 200 exercises beyond the repeat fix Zach picks in section 6.
- Anything under `D1` to `D21` reopened. Where this effort adds to one, it adds a dated `D22`
  or an `As built` note (`docs/AGENT-PRACTICES.md`, Stage 3).

## 3. Options

### Piece 1: repeated questions

**1A. Reword and extend the authored questions.** Rewrite the repeated prompts so each
question reads differently, and add a few new exercises per lesson. Defense: no code change, no
schema change, and every key stays hand-written and test-checked (rule Q3). Against: it does not
fix replay (row 2), where the same ten questions come back in the same order, and the repeated
wording in rows 8 and 9 is partly the point of a drill: the same question with new cards is how
a player learns to see a pattern.

**1B. A bigger pool per lesson, drawn at play time.** Author about 14 exercises per lesson and
draw 10 with a seed each time the lesson opens, the way the boss already draws
(`boss.ts:5-7`). Defense: replay, a retry after hearts run out and a retake after a failed
placement all show a different ten, using a pattern the code already has. Against: it changes
the content count rule (`validate.ts` counts five lessons of ten, `DESIGN.md` D8 says "the unit's
fifty"), so the boss draw, the review fill and the placement draw all read a larger pool, and
the lessons that teach one point in order (for example kickers, lesson 4) lose their order if
the draw is random. It also means writing about 56 new exercises per unit set, each with a key.

**1C. Deal fresh hands into lessons and the boss.** The dealers in `app/src/drills/` already
make a keyed hand-name, showdown, preflop, outs or odds exercise from a seed
(`deal.ts:12-18`), and a program computes the key, which removes the hazard of a wrong
hand-written key. Use them for the drill slots in lessons and for the boss. Defense: the cards
are new every play and no new content has to be written. Against: a random showdown will not
reliably contain a kicker tie, so a dealt exercise cannot teach the one point a lesson exists
to teach, and a dealt exercise has a generic explanation, not the lesson's own words.

**1D. Do none of these and let the story fix it.** A player who understands the terms before
the first question sees less need to replay. Defense: costs nothing extra. Against: it does not
touch the repeats at all, and a boss made only of questions already answered stays so.

### Piece 2: the story

**2A. A story route per unit, data-driven, opened from a button on the unit header; no stored
state.** One new route (`story/[unit]`) rendering one `StoryScreen`, using the existing
`SESSION` options (row 13). Slides are typed content checked with `satisfies` against a story
schema (rule V3). Left tap goes back, right tap goes forward, the last slide closes it. The
button always says the same thing and never changes. Defense: smallest change, touches only the
unit header, one route, one screen and the content, and needs no stored version bump (row 17).
Against: a player cannot tell which unit stories they have already seen.

**2B. The same, plus a stored "seen" flag per unit.** The button changes after a first view
(for example from "Learn about hands" to "Replay: hands"), and the path can nudge a new
player once. Defense: it makes the story easier to find first time and easier to ignore later.
Against: it adds a field to the stored state, so stored version 3, a migration from version 2
and a test that loads a version 2 save (Part 6, rule Q2), for a convenience.

**2C. The story as the first stop of each unit on the path.** A story node sits before lesson 1
and the path draws it. Defense: it cannot be missed. Against: it changes the seven-stop unit
(row 12), the path model, its tests and the node art, and it makes an optional thing look like
a required step.

**2D. Show the story automatically before a unit's first lesson, with a skip.** Defense: every
new player sees it. Against: it is the opposite of the optional button Zach described, and it
adds a step to every first open.

### Content scope for piece 2

**3A. Build the story framework and the hands story first; the other three units are separate
items.** Defense: unit 1 is where new players start and where Zach saw the problem; the hand
examples can be checked by the evaluator the app already has. The strategy units carry the
silent-error hazard (`DESIGN.md` section 5, hazard 4), so each deserves its own review.
Against: a player reaches unit 2 and finds no story there until the next item lands.

**3B. All four units in one effort.** Defense: the feature feels whole at once. Against: about
30 to 40 slides of warm-voice copy, and the preflop and odds slides make strategy claims that
compile, pass every gate and can still be wrong.

## 4. Dials

Each is a proposed default for `app/src/config/dials.ts`, never a constant written twice
(rule U5 and BD-14).

| Dial | Proposed default | Why |
|---|---|---|
| Slides in a unit story | 6 to 8 | "A quick rundown": about a minute of tapping |
| Back-tap zone, as a share of screen width | 0.30 | Right side is the common action, so it gets most of the screen; 0.5 is the Instagram split |
| Auto-advance | Off | Reading speed varies; Zach asked for taps |
| Words per slide | About 30 | "Very simply"; a slide is read at a glance |
| Cards shown in an example row | 2 to 5 | The most `CardRow` draws for a made hand |
| Lesson pool size, if 1B | 14 authored, 10 drawn | Enough that two plays rarely match |
| Story button label | "Learn about {unit}" | Zach's own words; see question 4 |

## 5. Hazards this work walks into

1. **A wrong example in a slide passes every gate** (`DESIGN.md` section 5, hazard 4). A slide
   that shows five cards and says "this is a flush" has a key. The same rule as Q3 applies: a
   test computes each example's category with the evaluator and fails on a disagreement.
2. **Tap zones against system gestures.** The iOS swipe-back is already off for `SESSION`
   routes (row 13). Android's back button must close the story, not exit the app; reuse
   `useHardwareBack` (row 14). Both are checked on a device, because no gate sees a screen.
3. **A screen is called built only after it is seen on iOS and Android** (Part 6). The story
   screen is a full-screen layout, so it needs a screenshot on a phone and a tablet, light and
   dark, in portrait and landscape (`D16`, `D17`).
4. **Piece 1B reaches the boss, the review and the placement draw.** All three read "the unit's
   fifty" (`boss.ts:5-7`, `review.ts:6-15`, `placement-session.ts:11-21`) and `validate.test.ts`
   counts ten per lesson. A larger pool is a content-model change, and `D8` would need a dated
   amendment.
5. **Copy volume.** A story is a large body of new user-facing text. `D10` fixed the voice as
   warm, so only the two items in section 6, question 4, are open; the rest follow `D10` and the
   hand-back lists every new string.
6. **The 5-lesson, 7-stop unit is tested** (`path-view-model.test.ts`). Option 2C breaks it;
   2A and 2B do not.
7. **Collision check for the board.** Files this effort would own, to be checked against every
   open item before work starts: `app/src/components/path/unit-header.tsx`,
   `app/src/components/root-stack.tsx`, a new `app/src/app/story/[unit].tsx`, a new story
   screen and content under `app/src/content/`, `app/src/config/dials.ts`, and for 1B
   `app/src/content/units/*.ts`, `app/src/content/validate.ts`, `app/src/game/boss.ts`,
   `app/src/game/review.ts` and `app/src/components/onboarding/placement-session.ts`.
   The board has no open rows on 2026-10-05, so there is no collision today.
8. **Model routing (Part 4), proposed, not decided.** The story framework and screen fail
   loudly if wrong (a bad screen), so Default (Opus 5.5). The hand-example key test is Default.
   If a later item writes preflop or odds slides, one narrow Deep review of those slides is
   warranted, because a wrong claim there is silent.

## 6. Open questions, the GATE 1 batch

1. **Which repeat did you see?** (a) The same wording with new cards, for example "Seven cards:
   your two hole cards and the five on the board" five times in unit 1 (rows 8 and 9). (b) The
   same questions on a second play: after running out of hearts, replaying a lesson, the boss
   after the lessons, or lessons after a failed placement check (rows 2 to 5). (c) Both.
   Recommendation: tell me which, because the fixes differ. If you do not remember, answer (c).
2. **Which fix for piece 1?** 1A, 1B, 1C or 1D. Recommendation: for (a) choose 1A; for (b)
   choose 1B for lessons 1 and 2 only where order does not matter, and 1C for the boss; for (c)
   choose 1A now and 1B as its own later item. The reason: 1A is the smallest change that fixes
   what you can see now, and 1B touches the boss, review and placement rules.
3. **Which story shape?** 2A, 2B, 2C or 2D. Recommendation: 2A. The button is optional as you
   described it, and a "seen" flag costs a stored-state version bump for a small convenience.
4. **Which button label and slide voice?** The warm voice is already decided (`D10`), but the
   exact words are not. Label options: plain "Learn about hands"; warm "Quick tour: hands";
   terse "Hands rundown". Recommendation: "Learn about hands", because it is your own wording
   and names what the player gets. A sample slide in each register, for the "Ranks" slide:
   - Plain: "A deck has 52 cards. Each card has a rank and a suit. The ace is the highest rank."
   - Warm (recommended, matches `D10`): "Here is the whole deck: 52 cards. Every card has a rank
     and a suit, and the ace sits on top. That is all you need for now!"
   - Terse: "52 cards. Rank and suit. Ace high."
5. **Which units get a story in this effort?** 3A (framework plus hands, others later) or 3B
   (all four). Recommendation: 3A, because the strategy slides in preflop and odds need their
   own review and you can see the feature on a phone sooner.
6. **Tap zones: how far does "left" reach?** Left 30 percent goes back and the right 70 percent
   goes forward, or an even split. Recommendation: 30/70. Also: should the last slide have a
   "Start lesson 1" button, or only close? Recommendation: only "Back to the path", so the
   story never starts a session by itself.

## 7. Answers

Given by Zach in chat, 2026-10-05, as one line: "1c, 3a, 2a, learn about hands, 30/70 close only".
Read against section 6 and section 3 (the letters name options, not question numbers):

| Ask | Answer | Note |
|---|---|---|
| Piece 1 fix | **1C**: deal fresh hands into lessons and the boss | Zach did not answer question 1 (which repeat he saw). 1C covers both causes. This goes against the recommendation (1A now). The hazard stays: a random showdown does not reliably hold a kicker tie, so the lesson that teaches kickers (hands-4) needs a dealer that can force one, or it keeps its authored questions. To settle in `DESIGN.md`, not now. |
| Story content | **3A**: framework plus the hands story; the other three units are later items | As recommended |
| Story shape | **2A**: a button on the unit header, no stored state | As recommended |
| Button label | **"Learn about hands"** | As recommended; the label for other units follows as "Learn about {unit}" |
| Tap zones | **30/70**: left 30 percent goes back, right 70 percent goes forward | As recommended |
| Last slide | **Close only** ("Back to the path"), no button that starts lesson 1 | As recommended |
| Slide voice | Not answered. `D10` (warm) stands, so the warm sample is used | Slide copy is still shown to Zach per R7 before it is final |

Also given 2026-10-05: Zach wants more animation, color, haptics, sounds and character across the
app, with 12 photos of Duolingo Chess as the reference. That is a separate effort, scoped in
`docs/incomplete/game-feel/SCOPE.md`, so this file stays about repeats and stories.
