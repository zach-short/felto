# Design: the felto app

Status: `RATIFIED` 2026-10-05. Renamed from `SCOPE.md` on 2026-10-05 (ledger step 7), so git
records the move from scope to design. Sections 1 to 7 are the scope as Zach ratified it at
GATE 1 and keep their numbers, so citations into them still resolve. Section 8 holds the
decisions `D1` to `D21`, section 9 the rules that do not change, and section 10 the product
screen by screen. The order of work is in `PLAN.md` in this folder.

From here the design changes only by a new dated decision or an `As built:` note under the
decision it touches, never by editing a decision in place (`docs/AGENT-PRACTICES.md`, Part 2.2,
Stage 3).

The scope's own status line, kept as history: `RATIFIED` 2026-10-05 (section 7). Opened
2026-10-05 on Opus 5.5 with `/scope the app` as `SCOPING`. Sections 1 to 6 propose and decide
nothing; Zach's answers are in section 7, with their dates, from GATE 1
(`docs/AGENT-PRACTICES.md`, Part 2.2).

felto keeps a ledger and a board (Profile L, `.personal-config.json`). An effort this size gets
its own folder as well, because it runs through scope, design, plan and several build phases
(`docs/AGENT-PRACTICES.md`, Part 2.2 and Appendix B).

## 1. What exists, verified 2026-10-05

| # | Claim | Verified state | Citation |
|---|---|---|---|
| 1 | There is no app code | No `package.json`, `app.json` or lockfile at the root. HEAD tracks 9 files: process documents and the three generators | `ls package.json app.json bun.lock`; `git ls-tree -r HEAD --name-only` |
| 2 | The generated art is complete for a first build | 76 icon SVGs and 18 mascot SVGs | `ls assets/icons/*/*.svg \| wc -l`; `ls assets/mascots/*/*.svg \| wc -l` |
| 3 | The art describes a lesson-path game | Path nodes `available`, `complete`, `locked`, `boss`, `review`, plus `current` with a progress ring. UI icons `streak_flame`, `xp_bolt`, `lives_heart`, `gem`, `chest`. Chips in six colours, each with a stack. A card back and all 52 faces | `tools/build_icons.py:247-253`, `:371`, `:352-358`, `:34`, `:143-144` |
| 4 | Three mascots, six poses each | fish, squid, shark; `happy`, `sad`, `cheer`, `think`, `smug`, `sleep` | `tools/build_mascots.py:336-337` |
| 5 | The mascot layer ids are a rig contract | Every pose of a character keeps the same ids | `docs/conventions-python.md`, rule I3 (cited as lines 519-537 until 2026-10-05; the lines moved, the rule ID did not) |
| 6 | No asset is in any commit | HEAD holds 0 files under `assets/`. The index holds 129 staged files. `origin/main` is `5da0bca`, the same as local `main`, so GitHub holds none of the art | `git ls-tree -r HEAD --name-only \| grep -c '^assets/'`; `git ls-files assets \| wc -l`; `git branch -vv` |
| 7 | The Higgsfield art cannot be made again | 32 files, 21 MB, from a paid, non-deterministic service. `assets/gallery.html` links all 32 by name | `du -sh assets/higgsfield`; `CLAUDE.md:15-16` |
| 8 | The style is approved | Icon direction 4, "extruded flat", was chosen; the squid without a shadow was approved | `assets/gallery.html`, Round 7 and Round 5 captions |
| 9 | Rive is the intended animation tool, and no Rive file exists | No `.riv` anywhere in the repo | `tools/build_icons.py:11-12`; `tools/build_mascots.py:7-8`; `find . -name '*.riv'` returns 0 |
| 10 | An agent cannot check Rive import here | Stated in the ledger | `HANDOFF.md:36-38` |
| 11 | Card ranks are live text | All 52 card faces hold `<text>`, with the font stack Arial Rounded MT Bold, Helvetica Neue, Arial | `grep -l '<text' assets/icons/cards/*.svg \| wc -l`; `tools/build_icons.py:20` |
| 12 | No poker content exists | No lesson, quiz, chart or curriculum text in any tracked or untracked file outside the SVGs and Higgsfield art | `grep -liE 'curricul\|preflop\|hand rank\|quiz\|lesson content'` over `git ls-files -co --exclude-standard`, no hits |
| 13 | No product decision is settled | The ledger's Settled sections are about process only: tracked process files, the board marker, the private repo | `HANDOFF.md:42`, `:49`, `:56` |
| 14 | No earlier scope of the app exists | The archive home does not exist, and "felto" appears outside this repo only in unrelated data files (CSV, SQL, JSON in `fantomworks` and `wm-courses`) | `ls ~/Projects/archive/felto`; `grep -rIl -i felto ~/Projects` |
| 15 | ~~Zach's mobile apps use one stack~~ Zach's Expo apps use one stack | `lore/app` and `ezhomesteading/native`: Expo ~57, React Native 0.86.2, `expo-router` 57, Reanimated 4.5.1, `@supabase/supabase-js`, TanStack Query, NativeWind. `ezhomesteading/native` adds `react-native-svg` 15.15.4 and `expo-dev-client`. Corrected 2026-10-05: the first wording was wrong, because the survey read only `package.json` files; rows 23 and 24 are native mobile apps | `~/Projects/lore/app/package.json`; `~/Projects/ezhomesteading/native/package.json` |
| 16 | Zach's web apps use another | Next.js 16 with Supabase, for example `buy-in/web` | `~/Projects/buy-in/web/package.json` |
| 17 | Buy-In is a different poker product | A ledger for a home poker night; it records who owes whom and holds no money | `~/Projects/buy-in/README.md` |
| 18 | Rive runs in Expo only in a development build | The current runtime, `@rive-app/react-native`, needs React Native 0.78+, Expo SDK 53+, iOS 15.1+ and Android SDK 24+. It has custom native code, so Expo Go cannot load it | Rive docs, `runtimes/react-native/migration-guide.mdx` and `adding-rive-to-expo.mdx`, read through Context7 2026-10-05 |
| 19 | Apple rates simulated gambling and loot boxes | "Simulated Gambling" is betting or wagering without real money; infrequent rates 13+, frequent rates 18+. Loot boxes (randomized items for purchase) rate 9+ | [App Store Connect Help, age ratings](https://developer.apple.com/help/app-store-connect/reference/age-ratings), fetched 2026-10-05 |
| 20 | Only a Python standard exists | `docs/` holds `AGENT-PRACTICES.md` and `conventions-python.md`. `CLAUDE.md` requires the matching standard before any code | `ls docs`; `CLAUDE.md:3-5` |
| 21 | The router and ledger say there is no app | Four lines state it | `CLAUDE.md:34`, `:86`; `HANDOFF.md:9`, `:32` |
| 22 | A TypeScript standard for an Expo app exists in another repo | `ezhomesteading/docs/conventions-typescript.md`, next to its Expo app | `ls ~/Projects/ezhomesteading/docs` |
| 23 | Zach has a large native iOS app | `furlough`: SwiftUI for iOS 18 and macOS 15, built with XcodeGen, 254 Swift files | `~/Projects/furlough/project.yml:4-6`; `find furlough -name '*.swift' \| wc -l` |
| 24 | Zach has a small native Android app | `drunktion`: Kotlin with Jetpack Compose, 15 Kotlin files | `~/Projects/drunktion/app/build.gradle.kts`; `find drunktion -name '*.kt' -not -path '*/build/*' \| wc -l` |
| 25 | Android does not draw SVG files directly | They are converted to VectorDrawable, which has no group opacity, no mask, no pattern and no blur, and no text element. All 52 card faces use `<text>` (row 11); 13 files use `clipPath`, which VectorDrawable supports inside one group; no file uses group opacity | [Android VectorDrawable and vector graphics docs](https://developer.android.com/jetpack/compose/tooling/relay/vector-graphics), searched 2026-10-05; `grep -c clipPath`; `grep -lE '<g[^>]*opacity'` |
| 26 | The Rive React Native runtime wraps the native runtimes | Its Expo config sets `RiveRuntimeIOSVersion` and `Rive_RiveRuntimeAndroidVersion`, the versions of the iOS and Android runtimes under it | `rive-react-native` README, read through Context7 2026-10-05 |

## 2. What this is, and what this is not

This is the first version of a phone app that teaches poker with the art already built: a path of
short lessons, lives, XP, a daily streak, gems, a chest, and the three mascots reacting to the
player. Section 3 holds the choices that give it its exact shape.

Proposed as not in the first version, whoever asks. Each line is ratified or struck at GATE 1:

- Real money in any form: real-money play, deposits, or links to real-money poker sites.
- Play against other people: multiplayer, friends, leaderboards.
- Full hands against bots, unless option 1C is chosen.
- Accounts and sync, unless option 3B is chosen.
- Ads.
- A web version, unless option 2B is chosen.
- Solver-grade advice after the flop. First-version answer keys come from fixed rules and charts.
- Rigging the mascots in Rive. That is Zach's work in the Rive editor (rows 9 and 10).
- New art directions or new Higgsfield rounds.
- Rebuilding `assets/icons/preview.html` or `assets/mascots/preview.html`.
- Translations.

## 3. Options

### Decision 1: what the app is

**1A. A lesson path with drills.** Units of short lessons on the path. A lesson is a run of
exercises: concept questions (hand rankings, position, pot odds) and hand drills that show real
cards and ask for a decision against a fixed answer key. A boss node is the unit test; a review
node repeats the items the player missed. Defense: every asset already built has a job here, from
the six node states to the lives, the chest and a mascot pose for right, wrong and idle (rows 3
and 4). Against: writing the lessons is the real cost, and every answer key is a strategy claim
that can be wrong with no error anywhere (hazard 4).

**1B. A spot trainer only.** One endless loop: deal a hand, choose fold, call or raise, get graded
against preflop range charts. Defense: the content is data tables, not prose, so a first version
needs very little writing. Against: the path, boss, review and chest art go unused, and a
preflop-only trainer teaches one narrow skill.

**1C. Play against the mascots.** Full hands of hold'em against bots, with fish as the easy
opponent and shark as the hard one, which matches what the two words mean at a poker table.
Defense: it is the most game-like shape, and the cast already fits it. Against: it needs a
betting engine, side pots and bot strategy, which is several times the work of 1A. Chips wagered
on every hand also fit Apple's description of frequent simulated gambling, rated 18+ (row 19).

### Decision 2: platform

**2A. Expo, iOS and Android from one codebase.** Defense: it is the stack of both of Zach's
mobile apps (row 15), and the Rive runtime supports it (row 18). Against: Rive, like any custom
native module, rules out Expo Go, so a native change means a new development build; store review
and an age rating come with it.

**2B. A Next.js web app installed as a PWA.** Defense: it is Zach's most used stack (row 16),
with the fastest loop and no store review. Against: the loop is a daily habit on a phone, and a
move to native later rewrites every screen.

**2C. SwiftUI, iOS first, Android later.** Defense: the closest fit to the platform for animation
and haptics, and it is the stack of Zach's largest app (row 23). Against: no Android in the first
version, and Android later means a second codebase, which is the cost of 2D paid later. As first
written on 2026-10-05, this option said "none of the code in Zach's Expo or Next.js repos carries
over" and missed row 23; corrected the same day.

**2D. Native on both: SwiftUI for iOS and Kotlin with Compose for Android.** Defense: the best
feel on each platform, first-party Rive runtimes with no wrapper (row 26), and Zach has shipped
code on both (rows 23 and 24). Against: two codebases, so every screen and every lesson rule is
written twice, and each platform is a phase of its own (`docs/AGENT-PRACTICES.md`, Part 5,
"Signals a phase is too big"). The answer keys (hazard 4) would exist in two languages, and a
difference between them passes both sets of gates while one platform teaches the wrong thing. The
parity rules cut from the standard because felto has no second platform come back
(`docs/AGENT-PRACTICES.md:34-37`). Android also needs every SVG converted to VectorDrawable, which
cannot hold the card ranks (row 25). Two changes reduce the cost: build iOS first (2C), and keep
lessons and answer keys as data written by the Python tools in this repo, so both apps read the
same files and the logic that can be silently wrong lives once.

### Decision 3: data and accounts in the first version

**3A. On the device only.** Progress is stored on the phone and the lessons ship inside the app.
Defense: no backend, no auth, no row-level security and no migrations, so the whole first version
is client work. Owner policy already asks for one data client (`.personal-config.json:34`,
`"practices.data-layer": "one-client"`), and that one module is the seam where sync goes later.
Against: progress does not follow the player to a new phone, an uninstall loses it, and adding
accounts later means moving local progress up once.

**3B. Supabase accounts from day one.** Defense: it is the backend of every app in row 15 and 16,
and it gives sync, content updates without a release, and a path to leaderboards. Against: auth,
policies and migrations are a project of their own before the first lesson ships.

### Decision 4: mascots in the first version

**4A. Static SVG poses, Rive later.** The screen shows the pose that fits the moment: `cheer` on a
right answer, `sad` on a wrong one, `think` while the player decides, `sleep` when the streak is at
risk. One mascot component owns the choice, so a later switch to Rive changes one file. Defense:
the 18 poses exist (row 4), no `.riv` exists (row 9), and an agent cannot make or check one
(row 10). Against: no motion in the first version.

**4B. Rive from the first build.** Defense: the pipeline was built for it, with the ids kept as a
rig contract (row 5). Against: the first build waits on Zach rigging three characters in the Rive
editor.

### Decision 5: where the app lives

**5A. An `app/` folder in this repo.** Defense: the art is generated here, so the app can read it
from `assets/` and no copy can go stale. The preview pages show what a copy does: 0 of 18 mascot
snapshots matched the files on 2026-10-04 (`HANDOFF.md:82-84`). Against: the repo gains a second
language, a second code standard, a package manager and a new fresh-checkout recipe, and the four
"no app" lines (row 21) change.

**5B. A new repo.** Defense: felto stays an asset pipeline and the app repo starts clean. Against:
the art has to cross repos by copy or by package, which moves the stale-copy problem to a new
place.

### Decision 6: money in the first version

**6A. None.** Gems are earned only, and a chest gives a fixed amount. Defense: no payments, no
in-app purchase review, and no loot box rating (row 19). Against: the first version gives no
signal about what anyone would pay for.

**6B. A subscription**, for example unlimited lives. Defense: it fits the lives mechanic. Against:
StoreKit and Play Billing work, a paywall and its copy, all before anyone has used the app.

**6C. Gem purchases.** Defense: the simplest store to understand. Against: a chest with random
contents that gems can buy is a loot box (row 19).

## 4. Dials

Every number the design leaves open, each with a proposed default. They go into one config module
in the app, never into a constant written twice.

| Dial | Proposed default | Why |
|---|---|---|
| Game taught | No-limit Texas hold'em, cash game | The most played form; tournaments add rules a first version does not need |
| Lives | 5 | One heart icon exists (`lives_heart`); five gives room for mistakes in a 10-exercise lesson |
| One life back every | 4 hours | A wrong answer costs something without ending the day |
| Exercises per lesson | 10 | Short enough for one sitting |
| XP per right answer | 10 | A round number the player can add up |
| Lessons per unit before the boss | 5 | The boss node is the sixth node of a unit |
| Boss pass mark | 80% | Pass or retry, never a dead end |
| Review node | After each boss | Repeats the unit's missed items |
| Chest | After each unit, 20 gems, fixed | Fixed contents keep it out of the loot box rating (hazard 3) |
| Streak day boundary | Local midnight on the device | Hazard 9 |
| Streak reminder | 19:00 local, one local notification | Only if notifications are in scope; no server needed |
| Minimum iOS | The higher of Expo SDK 57's minimum and Rive's 15.1 | Row 18; the Expo figure is checked at plan time |

## 5. Hazards this work walks into

1. **The art is in no commit (row 6).** GitHub holds none of it, and the 32 Higgsfield files exist
   only on this disk and in the local index. `git worktree add` checks out HEAD, so a worktree for
   an app lane starts with no art at all. The staged files go into a commit before any app work
   starts. The commit is Zach's.
2. **Simulated gambling (row 19).** A drill that has the player stake a chip balance reads as
   wagering, and frequent wagering rates 18+. A drill that asks "fold, call or raise?" and grades
   the answer is a quiz. Keep chips as art, never as a balance the player bets. The final rating
   comes from the questionnaire Zach fills in App Store Connect.
3. **Loot boxes (row 19).** A chest with random contents that can be bought rates 9+ for loot
   boxes. A chest that is earned and fixed does not meet the definition.
4. **Answer keys can be wrong without a sign.** A wrong range chart or a hand evaluator bug
   compiles, passes every gate and teaches the wrong thing. That is the case the Deep tier exists
   for (`docs/AGENT-PRACTICES.md:404`): one narrow Deep review of the evaluator and the answer
   keys, plus tests against known hands.
5. **Card ranks depend on a font (row 11).** Whether a phone has Arial Rounded MT Bold or
   Helvetica Neue is not checked here; a phone without them draws a fallback. Converting the
   ranks to paths in `tools/build_icons.py` removes the dependency and changes the art bytes,
   which rule G4 allows when the change is meant.
6. **Expo Go cannot run the app once Rive is in (row 18).** Every native change needs a new
   development build.
7. **A copy of the art goes stale (5A).** The app reads the generated files from `assets/`.
   How the bundler reaches files outside the app folder is a build-level decision for the plan.
8. **Process files must change before code.** No TypeScript standard exists (row 20), and
   `CLAUDE.md:3-5` forbids code without one; `ezhomesteading/docs/conventions-typescript.md` is a
   starting point (row 22). The fresh-checkout recipe (`docs/AGENT-PRACTICES.md:594-603`) covers
   only `python3` and `xmllint`. The "no app" lines (row 21) become false.
9. **The streak day boundary.** A streak counted in UTC breaks for a player in New York who plays
   at 21:00 local time and again the next morning. The bug is silent until someone loses a streak.

## 6. Open questions for GATE 1

Each carries a recommendation. One reply can accept all of them.

1. **What is the app?** Recommended: 1A, a lesson path with drills.
2. **Which platform?** Recommended: 2A, Expo for iOS and Android. If the first version can be
   iOS only, 2C is as strong (row 23). 2D was added on 2026-10-05 when Zach asked why not native
   Kotlin and Swift.
3. **Data in the first version?** Recommended: 3A, on the device only.
4. **Mascots in the first version?** Recommended: 4A, static poses, Rive later.
5. **Where does the app live?** Recommended: 5A, `app/` in this repo.
6. **Money in the first version?** Recommended: 6A, none.

The non-scope list in section 2 and the dials in section 4 stand as written unless Zach changes
them in the same reply. No user-facing copy is decided at this gate; copy gets its variants (R7)
when the design names the screens.

## 7. Answers

Given by Zach in chat on 2026-10-05, in these words: "all recs, expo but using native ui
components where available". Every recommendation in section 6 is accepted. The non-scope list in
section 2 and the dials in section 4 stand as written.

| # | Decision | Answer, 2026-10-05 |
|---|---|---|
| 1 | What the app is | 1A, a lesson path with drills |
| 2 | Platform | 2A, Expo for iOS and Android, with one addition: use native UI components where they exist. Read as `@expo/ui` (SwiftUI on iOS, Jetpack Compose on Android), which both of Zach's Expo apps already depend on (`~/Projects/lore/app/package.json`, `@expo/ui` ~57.0.13; `~/Projects/ezhomesteading/native/package.json`, `@expo/ui` ~57.0.8). Surfaces with no native component (the lesson path, the cards, the mascots) are drawn from the generated art. Which `@expo/ui` components exist on SDK 57 is checked against its docs at design time |
| 3 | Data in the first version | 3A, on the device only, through one data module |
| 4 | Mascots in the first version | 4A, static SVG poses behind one mascot component; Rive later |
| 5 | Where the app lives | 5A, `app/` in this repo |
| 6 | Money in the first version | 6A, none; gems earned only, fixed chest |

Status: `RATIFIED`, 2026-10-05. The next stage renames this file `DESIGN.md` and writes these
answers in as `D1` to `D6` (`docs/AGENT-PRACTICES.md`, Part 2.2, Stage 3).

Still owed before any app code, from section 5: the 129 staged asset files go into a commit
(hazard 1), and a TypeScript standard is written (hazard 8).

## 8. Decisions

`D1` to `D6` were ratified at GATE 1 on 2026-10-05 (section 7). `D7` to `D14` were proposed on
2026-10-05 and went to Zach at GATE 2 together with `PLAN.md`. Each carries a recommendation,
and each gets its answer and date written under it in the turn the answer is given. A later
change to any decision is a new dated decision that names the one it replaces.

Zach's GATE 2 reply, in chat on 2026-10-05, in his words: "all recs except i want sound dark
mode ipad and landscape, mascot names, streak freeze onboarding, and randomly dealt hands". So
`D7` to `D12` and `D14` are ratified, the plan is approved, and `D13` is answered in part.
`D15` to `D21` were proposed the same day to give each item Zach brought back into the first
version its shape; they wait on his answer.

### D1. The app is a lesson path with drills

Ratified 2026-10-05 (option 1A). The player moves along a path of units. A unit is five lessons,
a boss and a review; a lesson is ten exercises with a fixed answer key. Section 10 gives the
exact shape.

Defense: every asset already built has a job in this shape (section 1, rows 3 and 4), and the
lessons are data that the app reads, so more lessons need no new code. The strongest argument
against: writing lessons is the real cost, and a wrong answer key passes every gate (hazard 4).
The answer to it: `D7` limits the first version to four units, and section 10.4 puts every key
that a program can check under a test that computes it a second way, with one narrow Deep
review of the hand evaluator and one of the preflop chart (`PLAN.md`, phases 5 and 7).

Supersedes nothing.

### D2. Expo SDK 57 on iOS and Android, with native components where they exist

> **Amended 2026-10-05 (not yet built, awaiting GATE 2): the primary buttons are not native.** Check, Continue and the primary action buttons become a custom component with a raised edge; switches, pickers and the time dialog stay native. See `docs/incomplete/game-feel/DESIGN.md`, `GF-2`.
>
> **Built 2026-10-05 for Check and Continue only (board item 26, game-feel phase 1).** The lesson loop's bottom button and the feedback sheet's Continue are `PrimaryButton` (`app/src/components/button/primary-button.tsx`). The other primary actions (onboarding, the chest, Practice, the closed-lesson screens) still use the native `LessonButton` until game-feel phases 5 and 7. Registry entry Z5 of `docs/conventions-typescript.md` records the divergence.

Ratified 2026-10-05 (option 2A, with Zach's addition "using native ui components where
available"). One TypeScript codebase on Expo SDK 57. Where `@expo/ui` has a component for a
control, the app uses it; section 10.3 names the component on each screen. The surfaces that
have no native control (the path, the cards, the mascots, the stat icons) draw the generated art.

Facts behind it, verified 2026-10-05 in the installed packages of Zach's SDK 57 app
(`~/Projects/lore/app/node_modules`):

- `@expo/ui` 57.0.13 has a universal layer: Host, Column, Row, Text, Button, ScrollView, Switch,
  Slider, Checkbox, BottomSheet, Collapsible, FieldGroup, Icon, List, ListItem, Picker, Spacer and
  TextInput (`@expo/ui/src/universal/index.ts:1-20`). A progress bar, a time picker and an alert
  have no universal component. Each exists per platform: `ProgressView` under
  `@expo/ui/swift-ui` and `LinearProgressIndicator` under `@expo/ui/jetpack-compose`
  (`@expo/ui/build/jetpack-compose/Progress/index.d.ts:66`), and a time picker under
  `@expo/ui/community/datetime-picker` (`@expo/ui/package.json:31`).
- Expo SDK 57 sets the iOS floor at 16.4 (`expo/Expo.podspec:39`,
  `expo-modules-core/ExpoModulesCore.podspec:54`) and Android `minSdkVersion` at 24
  (`expo-modules-core/expo-module-gradle-plugin/src/main/kotlin/expo/modules/plugin/ProjectConfiguration.kt:75`).
  That answers the "Minimum iOS" dial in section 4: 16.4, which is above Rive's 15.1 (row 18).
- Native tabs come from `expo-router/unstable-native-tabs` (`expo-router/package.json:40-41`),
  and Zach's `lore` app already uses them (`~/Projects/lore/app/src/components/app-tabs.tsx:1`).
  The word `unstable` in the path is the only stability label found.

Defense: the stack of both of Zach's Expo apps (row 15), and one codebase, so every lesson rule
exists once. Against: a custom native module, Rive first, needs a development build, and
`unstable-native-tabs` can change its API between SDK releases. The answer: the app runs as a
development build from its first build (`PLAN.md`, BD-3), and the tab bar is one file.

Row 25 (Android cannot hold the card ranks as VectorDrawable) applies to option 2D only. Under
2A the SVG files are drawn by `react-native-svg` or `expo-image`, not converted to VectorDrawable.

Supersedes nothing.

### D3. Progress lives on the device, behind one data module

Ratified 2026-10-05 (option 3A). All player state (lesson progress, lives, XP, gems, the streak,
settings) is stored on the phone. One module is the only code that reads or writes it, and
screens reach the state through it. The stored value carries a version number, and a change to
its shape ships with a migration and a test that loads the old shape (section 9).

Defense: no backend, no auth and no server migrations, so the first version is client work only
(option 3A). Against: an uninstall loses progress, and progress does not move to a new phone.
Accepted for the first version; the data module is the seam where sync attaches later
(`PLAN.md`, section 4).

### D4. Static mascot poses behind one component

Ratified 2026-10-05 (option 4A). One mascot component takes a character and a pose and draws the
matching file from `assets/mascots/`. Section 10.5 maps each moment in the game to a pose.

Defense: the 18 poses exist (row 4), no `.riv` file exists (row 9), and an agent cannot make or
check one (row 10). Against: no motion in the first version. A move to Rive changes this one
component and nothing that calls it.

### D5. The app is `app/` in this repo and draws the art where it is generated

Ratified 2026-10-05 (option 5A). The app bundles the SVG files from `assets/icons/` and
`assets/mascots/` at build time. No SVG is copied under `app/`, and the generators stay the only
writers of art (section 9).

Defense: no copy can go stale; the preview pages show what a copy does (0 of 18 mascot snapshots
matched on 2026-10-04, `HANDOFF.md:90-92`). Against: the repo gains a second language, a second
code standard, a package manager and a new fresh-checkout recipe. `PLAN.md` phases 2 and 3 pay
that cost before any feature code.

### D6. No money

Ratified 2026-10-05 (option 6A). Nothing in the app is for sale. Gems come only from the chest
after a boss (a fixed 20, section 4) and are spent only on a life refill (`D8`). Chips are art:
the player never holds or stakes a chip balance (hazard 2).

### D7. Four units of no-limit hold'em, 6-max cash, 100 big blinds deep

Proposed 2026-10-05, recommended. Answer: accepted, 2026-10-05 (the GATE 2 reply
quoted at the top of this section).

1. **Hands.** The ten hand categories from royal flush to high card, kickers, and which hand
   wins at showdown.
2. **The table.** Blinds, the six seats of a 6-max table (UTG, HJ, CO, BTN, SB, BB), the four
   betting rounds, and the actions fold, check, call, bet and raise.
3. **Preflop.** Which hands to open with a raise from each seat when every player before you has
   folded, from one chart.
4. **Outs and odds.** Counting outs, pot odds, and the rule of 2 and 4.

Each unit is five lessons of ten exercises, a boss and a review (section 4), so the first version
holds 200 written exercises.

Defense: each unit uses the one before it. A showdown needs the hand ranks, a preflop chart needs
the seats, and pot odds need outs. Units 1, 2 and 4 are rules and arithmetic with one right
answer, so a test can check almost every key in them. Six seats are fewer to learn than nine,
and a fixed depth of 100 big blinds gives every preflop answer one context. Against: unit 3 is a
strategy claim, since a chart is an opinion about what wins money, and it is where hazard 4
bites hardest. `PLAN.md` phase 7 gives the chart a test (each later seat opens every hand an
earlier seat opens) and a narrow Deep review. A full-ring table (nine seats) is the alternative;
it adds three seat names and changes every chart.

### D8. Game rules

> **Amended 2026-10-05 (not yet built, awaiting GATE 2):** in the lessons named by the dial `dealtLessons` and in every boss, each exercise of a dealable kind is dealt fresh, not read from the unit's fifty, and a dealt miss is not saved for the review. The unit's fifty stay the pool for concept exercises and the review. See `docs/incomplete/unit-stories/DESIGN.md`, `US-1` and `US-2`.

Proposed 2026-10-05, recommended. Answer: accepted, 2026-10-05 (the GATE 2 reply
quoted at the top of this section).

- The path is linear. A lesson opens when the one before it is finished; the boss opens when the
  unit's five lessons are finished.
- A wrong answer in a lesson or a boss costs one life. A review costs none.
- Lives come back one at a time, one every 4 hours, up to 5 (section 4).
- At 0 lives, lessons and the boss are closed and the review stays open. The player waits, or
  spends 20 gems on a full refill.
- A lesson that is left before its end (closed, or out of lives) gives no XP and does not count.
  Lives already lost stay lost.
- XP is 10 for each right answer in a finished lesson, boss or review.
- The boss is ten exercises drawn at random from the unit's fifty, and 8 right (80%) passes.
  A pass opens the chest (20 gems, once per unit), the review and the next unit. A fail can be
  retried while lives remain.
- The review is up to ten exercises the player missed in that unit and has not since answered
  right in a review, filled up to ten from the unit. It is optional.
- The streak counts consecutive local calendar days with at least one finished lesson, boss or
  review, by the date on the phone when it was finished (hazard 9).

Defense: every rule uses an asset that exists, and every number is a dial. An open review at 0
lives gives a player with no lives something useful to do: practice on what they got wrong.
Against: a refill for gems lets a player skip the wait. At 20 gems a refill costs one whole
chest, so it stays rare. This adds one dial, "Life refill price: 20 gems" (section 10.2).

As built (phase 10, 2026-10-05): choices the rule left open. A passed boss can be played again,
as a finished lesson can; it gives XP and counts for the streak again, but its chest only once. A
boss played to its end and failed gives XP and counts for the streak (`game/session.ts`). The
boss and review draws are seeded from the clock when they open. At 0 lives a tap on the current
lesson or the boss opens the out-of-lives sheet in place of the session; after a refill the sheet
opens the stop that was tapped. A session that runs out of hearts part way shows the sleeping fish
and "Out of hearts for now.", without the refill, since the session already does not count.
Replaying a finished lesson also gives XP and streak again; that was item 8's rule and is left for
Zach to decide.

### D9. Mascot roles

Proposed 2026-10-05, recommended. Answer: accepted, 2026-10-05 (the GATE 2 reply
quoted at the top of this section).

The fish is the player's guide in lessons. The shark is the boss. The squid hosts the review and
opens the chest. Section 10.5 gives the pose for each moment.

Defense: it gives all three characters a job, and it uses the table slang the cast was drawn
for (option 1C): a fish is a weak player and a shark a strong one, so beating the shark is
beating the unit test. Against: three characters to keep in step. All three have the same six
poses (row 4), so the mascot component does not change with the cast. The alternative is one
guide, the squid (approved in Round 5, row 8), in every role.

### D10. The voice of the copy

Proposed 2026-10-05, recommended: warm. Answer: warm, accepted, 2026-10-05 (the GATE 2
reply). No copy was settled before this point
(section 6), so this is the R7 ask. All later copy follows the chosen register: buttons, sheets,
lesson text and explanations. Each build phase lists in its hand-back the new strings it added.

| String | Plain | Warm (recommended) | Terse |
|---|---|---|---|
| Right answer | "Correct." | "Nice read!" | "Right." |
| Wrong answer | "Not quite. The answer is {answer}." | "So close. It was {answer}." | "No. {answer}." |
| Out of lives | "You are out of lives. The next one comes back at {time}." | "Out of hearts for now. One more is ready at {time}." | "No lives. Next at {time}." |
| Streak reminder | "One lesson keeps your {n}-day streak." | "Your {n}-day streak is waiting. One quick lesson keeps it going." | "{n}-day streak. One lesson." |

Defense of warm: three cartoon characters react to every answer, and a warm voice matches them.
Against: warm copy is longer, and the lesson text is the largest body of copy in the app. Plain
is the alternative if the lesson text should read like a reference.

### D11. A daily streak reminder

Proposed 2026-10-05, recommended. Answer: accepted, 2026-10-05 (the GATE 2 reply
quoted at the top of this section).

One local notification at 19:00 by the phone's clock, on a day with no finished lesson. The app
asks for notification permission after the player's first finished lesson, not at launch. The
Profile tab has a switch and a time for it. No server is involved.

Defense: the streak (row 3) has no pull on a player who forgets the app, and the dial for it
already exists (section 4). Against: a permission prompt, and the edge cases of local
scheduling: a phone that is off at 19:00, or a time-zone change. `PLAN.md` phase 11 schedules a
week of single reminders ahead and cancels the one for any day the player finishes, so a missed
day never sends two.

As built (phase 11, 2026-10-05): the reminder is on at 19:00 for every player, and a version 1
save migrates to that. The permission is asked after the first finish of a day made while the app
runs (a lesson, a boss or a review), or when the player turns the switch on, never at launch.
Without permission no reminder is scheduled, and Profile says so under the switch. The reminder's
text names the streak only when it will still be alive at that moment: "Your {n}-day streak is
waiting. One quick lesson keeps it going.", else "One quick lesson starts a new streak.", under
the title "Flop saved you a seat".

### D12. Name and identifiers

Proposed 2026-10-05, recommended. Answer: accepted, 2026-10-05 (the GATE 2 reply
quoted at the top of this section).

The name on the home screen is "Felto". The iOS bundle identifier and the Android package are
both `com.zachshort.felto`, and the URL scheme is `felto`.

Defense: the name matches the repo and the gallery title (`assets/gallery.html:8`). Zach's
`ezhomesteading` app uses its own domain in reverse (`com.ezhomesteading.app`,
`~/Projects/ezhomesteading/native/app.json:14`); felto has no domain, so the owner's name stands
in. `lore` sets no identifier at all (`~/Projects/lore/app/app.json`, `grep bundleIdentifier`
finds nothing), so there is no other precedent. Against: an identifier cannot change after a
store release. No store release is in this plan (`D13`), so it can still change until then.

### D13. More items that are not in the first version

Proposed 2026-10-05, recommended. Answer, 2026-10-05 (the GATE 2 reply): declined except for
the store release. Zach wants sound, dark mode, iPad and landscape, mascot names, a streak
freeze, onboarding and randomly dealt hands in the first version, so only the store release
joins section 2. `D15` to `D21` give each returned item its shape. The list as proposed, kept
as the record of what was asked:

- Sound and music. No audio asset exists.
- Dark mode. The art assumes a light page: the cream `#FBF4EA` and the pale shadow `#C9CDE2`
  (`tools/common.py:8-9`) disappear on a dark background.
- iPad layouts and landscape. Phones, portrait only.
- A store release: TestFlight, the Play Console, and the age-rating questionnaire (hazard 2).
  The plan ends at a development build on simulators and on Zach's phone.
- Names for the mascots.
- A streak freeze or any other item bought with gems, except the life refill (`D8`).
- Onboarding screens and a placement test. A new player starts at unit 1, lesson 1.
- Hands dealt at random. Every exercise in the first version is written; the evaluator makes
  random drills possible later (`PLAN.md`, section 4).

### D14. Card ranks draw in a bundled open font on the phone

Proposed 2026-10-05, recommended. Answer: accepted, 2026-10-05 (the GATE 2 reply
quoted at the top of this section).

The facts, verified 2026-10-05. All 52 card faces hold their rank as `<text>` with
`font-weight="800"` and the list `'Arial Rounded MT Bold','Helvetica Neue',Arial,sans-serif`
(`tools/build_icons.py:20`, `:174-178`); no other SVG holds text (`grep -lE '<text'` over both
asset folders finds only `assets/icons/cards/`). `react-native-svg` 15.15.4 uses only the first
name in the list (`react-native-svg/src/lib/extract/extractText.tsx:25`, in
`~/Projects/ezhomesteading/node_modules`). iOS ships Arial Rounded MT Bold, which no one has yet
seen in a build here. Android does not: it looks for a bundled font of that name, then asks the
system, which gives its default typeface (`react-native-svg/android/.../TSpanView.java:1146-1177`,
`react-native/.../ReactFontManager.kt:187`). So the first build would draw rounded ranks on an
iPhone and plain ones on Android.

The decision: the app bundles Nunito ExtraBold (weight 800, SIL Open Font License, from the
`@expo-google-fonts/nunito` package) and loads it under the name `FeltoRank`. The icon generator
puts `'FeltoRank'` first in its font list. A browser, the gallery page and Rive do not know that
name and fall through to Arial Rounded MT Bold as before, so the art looks the same everywhere
but on the phone, where it now matches on both platforms. The art diff is the `font-family`
attribute of the 52 card faces and nothing else.

Defense: the same ranks on both platforms, for a one-line generator change and a free font.
Against: on the phone the ranks are Nunito, which is close to Arial Rounded but not the same as
the approved gallery look, and the art carries a font name that only the app defines. The
alternatives: accept the default font on Android (no work; the Android ranks look plain), or
draw the ranks as outlines in the generator (no font at all, and the step Rive needs before
import, `CLAUDE.md:84-85`, but thirteen hand-drawn glyphs is a larger art job that needs Zach's
eye).

As built (phases 1 and 3, 2026-10-05): `app/assets/fonts/FeltoRank.ttf` is Nunito ExtraBold with
its name table set to `FeltoRank` (fontTools, one-off), embedded by the `expo-font` plugin, and
`tools/build_icons.py:20` puts `'FeltoRank'` first. An agent saw the ranks rounded and the same
shape on the iPhone 17 Pro and the `Pixel_9`; Zach's own look is owed (`RUNTIME-PASS.md`, entry 3).
The file name `FeltoRank.ttf` is a sanctioned divergence from kebab-case (`conventions-typescript.md`, Z3).

### D15. Sound effects, made by a generator in this repo

> **Amended 2026-10-05 (not yet built, awaiting GATE 2):** six more effects are added from the same generator, and haptics get a stored on/off setting (stored version 3). See `docs/incomplete/game-feel/DESIGN.md`, `GF-3` and `GF-5`.

> **Built 2026-10-05 for the haptics half (board item 27, game-feel phase 2, `HANDOFF.md` step 30).** `settings.haptics` is stored since version 3, with a Haptics switch under Sound effects in Profile, and every buzz passes it (`app/src/feedback/should-buzz.ts`). The six more effects are game-feel phase 3 (board item 28).

Proposed 2026-10-05, recommended. Answer: accepted by Zach in chat, 2026-10-05 (was: pending).

Six short effects: a right answer, a wrong answer, a finished lesson, a passed boss, a failed
boss and the opened chest. A new generator, `tools/build_sounds.py`, on the standard library
only (`math`, `struct`, `wave`), writes them as short WAV files to `assets/sounds/`, the same way
the SVGs are made: deterministic, rebuilt by the gate, never edited by hand. The app plays them
with `expo-audio` (SDK 57 pins `~57.0.4`, `expo/bundledNativeModules.json:24` in
`~/Projects/lore/app/node_modules`), follows the iPhone's silent switch, and has a Sound switch
in Profile, on by default. No music.

Defense: no audio asset exists (`D13`), and a generator keeps sound in the same pipeline, rules
and gate as the art, at no cost; a sound is retuned by changing a number. Against: tones built
from waveforms sound simple next to recorded effects, and an agent cannot hear, so Zach approves
each sound by ear (`PLAN.md`, phase 13). The alternatives are Higgsfield's audio model (paid,
and each run differs, as with the reference art) or a licensed sound pack. Music is left out
because the request was "sound"; music is a separate yes.

As built (phases 3 and 13, 2026-10-05): `tools/build_sounds.py` writes six 16-bit mono 44,100 Hz
WAV files, 0.36 s to 0.90 s, to `assets/sounds/`, in the gate. The app plays them with
`expo-audio` from `app/src/feedback/` (`playsInSilentMode: false`, one player per effect, made
when the first lesson opens); the only importer of the files is `app/src/art/sounds.ts`. The
Sound switch in Profile is on by default and also stops a playing effect. No agent has heard a
sound: approval by ear is owed (`RUNTIME-PASS.md`, entry 2).

### D16. Dark mode follows the phone

Proposed 2026-10-05, recommended. Answer: accepted by Zach in chat, 2026-10-05 (was: pending).

The app follows the phone's appearance setting, and every app colour has a light and a dark
value in the token module. The art files do not change. The two colours in them that assume a
light page, the hard shadow `#C9CDE2` (`tools/common.py:8`) and the ring track `#DDE1EC`
(`tools/build_icons.py:271`), are swapped for theme colours when the app imports each SVG
(`PLAN.md`, BD-25). Cards keep their cream faces in both modes, as printed cards would.

Defense: one set of files, nothing to keep in step, and no generator change. Against: the app
now depends on two hex values in the generators, so a test fails the gate if either one leaves
the art. The alternative is a generator that writes a dark copy of every SVG, which doubles the
files and every visual check.

As built (phases 3 and 8, 2026-10-05): the tokens with a light and a dark value are in
`app/src/theme/tokens.ts`, and the two swapped hex values are in
`app/src/art/colour-swap.json`, with a test that fails if either leaves the art. In dark mode
the hard shadow is a tone below the page and the ring track a tone above it. The locked path
nodes stay pale discs, as generated, and the faded chest is very dim on a dark page; whether
that is acceptable is Zach's to judge (`RUNTIME-PASS.md`, entry 4).

### D17. Phones and tablets, in any orientation

Proposed 2026-10-05, recommended. Answer: accepted by Zach in chat, 2026-10-05 (was: pending).

The app runs on phones and tablets, iPad and Android, in portrait and landscape. One layout
serves all of them: every screen draws in a centred column at most 640 points wide (a dial), and
the art sizes follow the column width (`PLAN.md`, BD-27).

Defense: one layout to build and check, and a lesson is one column of content in any case.
Against: a tablet in landscape shows empty space at both sides of the column. The alternative is
a two-pane tablet layout, the path beside the lesson, which is a second layout for every screen.

As built (phases 3 and 8, 2026-10-05): the column is `DIALS.columnMaxWidth`, 640
(`app/src/config/dials.ts:33`), read through `useColumnWidth`. Seen by an agent: the iPad Pro
13-inch in portrait (Learn) and an Android tablet in landscape (Learn, light). Not seen: iPad
landscape, and every screen other than Learn on a tablet (`RUNTIME-PASS.md`, entries 44 and 45).

### D18. Mascot names

Proposed 2026-10-05, recommended: poker words. Answer: poker words (Flop, Kicker, Ace), chosen by Zach in chat, 2026-10-05 (was: pending). This is the R7 ask for the
names.

| Set | Fish | Squid | Shark | Register |
|---|---|---|---|---|
| Poker words (recommended) | Flop | Kicker | Ace | Playful: each name is a word the app teaches |
| Friendly | Finn | Pip | Mako | Warm |
| Short | Gil | Ink | Fang | Terse |

The names live in one content module, so a rename is one edit (`PLAN.md`, BD-28).

Defense of poker words: unit 1 teaches the kicker, unit 2 the flop, and the shark named Ace is
the strong player a boss should be. Against: a new player meets the names before the words, and
"Flop" can also read as a failure.

As built (phase 6, 2026-10-05): the names are Flop, Kicker and Ace in `app/src/content/cast.ts`.
Three strings in `app/src/content/units/` pun on them, so a rename there also rewrites those lines.

### D19. A streak freeze

Proposed 2026-10-05, recommended. Answer: accepted by Zach in chat, 2026-10-05 (was: pending).

A streak freeze costs 10 gems (a dial), a player holds at most 2 (a dial), and Profile sells
them. A held freeze is used by itself on a local day with no finish, so the streak survives one
missed day for each freeze. The stat bar shows a held freeze with a new icon, `streak_freeze`:
the streak flame drawn in the gem's ice blue (`#38B6F5` and `#0E6FB0`,
`tools/build_icons.py:324`), written by the icon generator. Gems still come only from chests, so
the first version holds 80 gems in all: four refills, eight freezes, or a mix.

Defense: it softens the one rule that punishes a single missed day, and a fixed item bought with
earned gems stays clear of hazards 2 and 3. Against: the refill and the freeze compete for scarce
gems. That is the intent, and both prices are dials.

As built (phase 8, 2026-10-05): the stat bar shows `streak_freeze` beside the streak when at
least one freeze is held, with the count beside it only when more than one is held. No BD-13
fixture holds a freeze, so the icon was checked on the art route `/dev/art`, which draws a sample
bar with two.

### D20. Onboarding with a placement check

Proposed 2026-10-05, recommended. Answer: accepted by Zach in chat, 2026-10-05 (was: pending).

The first launch shows three screens before the path: a welcome from the fish, the cast by
name, and "How much poker do you know?" with two answers. "I am new" starts at unit 1. "I know
the basics" starts a placement check: ten exercises drawn from units 1 and 2, with no lives and
no XP. Eight right marks units 1 and 2 finished and opens unit 3; their chests are not given,
because gems come from bosses played. Fewer than eight starts at unit 1. The check runs once,
and the units it skips can still be played. The reminder permission stays where `D11` put it.

Defense: a player who knows the hand ranks skips 100 exercises they do not need, and the check
reuses written exercises, so it needs no new content. Against: two more screens before the first
lesson. The `D13` item Zach brought back was "onboarding screens and a placement test"; if only
the screens are wanted, the check is the part to drop.

As built (phase 16, 2026-10-05): the check is five exercises from each of units 1 and 2. It
shows no heart count, and a wrong answer neither spends a heart nor joins the review's misses. A
check left part way counts for nothing and can be started again from the question screen;
`onboarded` is set only by "I am new" or by the button under the check's result, so a check
closed by the app shutting starts over. A placed unit shows every lesson and its boss complete
and its review open; its boss can be played, and beating it gives the chest, so the chest stays
faded (closed, not claimable) with the line "You placed past this unit. Beat Ace to win its
chest." under the unit title. Only one lesson on the path is current: the first unfinished one
of the first unit not done. The pass and the fail both play the lesson-finished sound.

### D21. Random hands in a Practice tab

Proposed 2026-10-05, recommended. Answer: accepted by Zach in chat, 2026-10-05 (was: pending).

A third native tab, Practice, deals exercises at random, without end, for the kinds the player
has opened: `hand-name` and `showdown` after unit 1, `preflop` after unit 3, `outs` and `odds`
after unit 4. The evaluator, the outs counter and the chart compute every key in the app, so
these exercises have no written key (`PLAN.md`, BD-11 is superseded). Practice costs no lives
and stays open at 0 lives; each right answer gives 5 XP (a dial); a finished set of 10 (a dial)
counts for the streak. The squid hosts it. Explanations come from templates, such as "A flush
beats a straight."

Defense: practice that never runs out, from code the tests need anyway. Against: an evaluator
bug now reaches the player, not only the tests. Phase 5's enumeration test and Deep review stand
between them, and phase 14 adds tests over thousands of seeded deals (`PLAN.md`). Template
explanations read flatter than written ones.

As built (phases 14 and 15, 2026-10-05): the dealers are `app/src/drills/`, and every key is
computed. The tab lists all five kinds, open or locked with the unit that opens it, and one
button deals a mixed set of ten from the open kinds. The squid thinks, cheers, is sad, and is
happy at the end, as in a review. The set hides the heart count. It does not appear in the
review: a dealt exercise has no stored id to miss (`game/session.ts`).

## 9. Rules that survive unchanged

The app work does not change these. A build phase that finds one in its way stops and asks
(R12).

- **The generators are the only writers of art.** No SVG under `assets/icons/` or
  `assets/mascots/` is edited by hand or written by app tooling (`tools/build_icons.py:19`,
  `tools/build_mascots.py:17`). An art change the app needs is a change to a generator, under
  `docs/conventions-python.md`, with the whole-repo gate and an art diff that holds only the
  change that was meant (rule G4).
- **The generators stay deterministic** and stay on the standard library (`HANDOFF.md`,
  Invariants).
- **`assets/higgsfield/` is never touched**, and its 32 filenames never change.
- **The mascot layer ids stay a rig contract** (rule I3, `docs/conventions-python.md`). The app
  never depends on an id that rule I3 does not list.
- **The Python standard governs `tools/`** and the new TypeScript standard governs `app/`. Neither
  standard is bent to suit the other language.
- **The process does not change.** The ledger and the board stay the record; agents never run
  `git commit`, `git push`, `git add -A` or `git add .`; Zach commits (Part 11).
- **The non-scope list in section 2 and the dials in section 4 stand**, except where a decision
  above answers or adds to one: `D2` answers "Minimum iOS", `D7` adds the table size and stack
  depth, `D8` adds the refill price, `D13` adds to the non-scope list, and `D14` changes the
  font list of the card generator.
- **Stored player data is migrated, never dropped.** Re-added from the migration rule that
  `docs/AGENT-PRACTICES.md:34-37` cut because felto had no app. A change to the stored shape
  bumps its version and ships a migration with a test that loads the old shape (`D3`).
- **Both platforms are checked.** Re-added from the parity rule cut at the same place. Every
  screen is seen running on an iOS simulator and an Android emulator before its phase is called
  built.

## 10. The product, screen by screen

### 10.1 The path

The Learn tab is one scrolling path. Each unit has a header with its title and the chest icon,
then seven nodes: five lessons, the boss, the review. Each node draws one of the generated path
icons (`assets/icons/path/`, `tools/build_icons.py:247-253`).

| Node | Before it opens | When it is next | After it is finished |
|---|---|---|---|
| Lesson | `node_locked` | `node_current`, its ring showing the unit's finished lessons out of five | `node_complete` |
| Boss | `node_locked` | `node_boss` | `node_complete` |
| Review | `node_locked` | `node_review` | `node_review`; it can be played again at any time |

The chest in a unit header is drawn faded until the boss is passed, then at full strength once
it has been opened. `node_available` has no role in a linear path; it stays in the art set for a
later path that lets a player jump ahead.

Above the path, a bar shows the streak (`streak_flame`), XP (`xp_bolt`), lives (`lives_heart`)
and gems (`gem`), each with its number (`assets/icons/ui/`).

As built (phase 8, 2026-10-05): a chest is faded while its boss is unpassed and drawn at full
strength from the pass on, whether or not it is opened yet; the table above leaves the state
between pass and opening open. The boss stop is captioned "Beat Ace" and the review "Review with
Kicker", both from `content/cast.ts`, and each lesson stop carries its title from the outline.
The stops swing left and right of the centre line. On iPadOS 26 the native tabs draw at the top
of the screen.

### 10.2 Dials added by this design

These join the table in section 4 and go into the same config module.

| Dial | Proposed default | From |
|---|---|---|
| Table size | 6 seats | `D7` |
| Stack depth | 100 big blinds | `D7` |
| Life refill price | 20 gems, refills to the maximum | `D8` |
| Boss draw | 10 exercises from the unit's 50 | `D8` |
| Review size | Up to 10 | `D8` |
| Minimum iOS | 16.4 | `D2` answers the section 4 row |
| Minimum Android | API 24 | `D2` |

### 10.3 Screens and the native component on each

| Screen | How it is shown | Native components (`@expo/ui` unless named) | Drawn from the art |
|---|---|---|---|
| Tabs: Learn and Profile | Root | `NativeTabs` (`expo-router/unstable-native-tabs`) | none |
| Learn | Tab | none | path nodes, the stat bar icons, the unit chest |
| Lesson | Full-screen modal over the tabs | Progress bar: `ProgressView` with the linear style on iOS, `LinearProgressIndicator` on Android. The Check and Continue buttons: `Button` | cards, the fish or the shark |
| Answer feedback | Sheet over the lesson | `BottomSheet` | the mascot's pose |
| Lesson finished | Inside the lesson modal | `Button` | the mascot, `xp_bolt`, `streak_flame` |
| Chest | Modal after a boss pass | `Button` | `chest`, `gem`, the squid |
| Out of lives | Sheet over Learn | `BottomSheet`, `Button` | `lives_heart`, `gem`, the fish asleep |
| Profile | Tab | `List` and `FieldGroup` for the stats and the settings, `Switch` for the reminder, the time picker from `@expo/ui/community/datetime-picker` | the stat icons |
| Reset progress | Confirmation over Profile | React Native `Alert`, which is the platform's own alert | none |

Answer choices are not native controls. A choice that shows cards draws the card SVGs, and a
choice of text uses the same tappable shape so that every exercise looks alike.

### 10.4 The content model

Content is data in `app/`, typed by one schema. A unit holds five lessons; a lesson holds ten
exercises. Every exercise has a prompt, two to four options, the index of the right option and
a short explanation. Some kinds also carry cards, a seat or pot sizes.

| Kind | What the player sees | How its key is checked |
|---|---|---|
| `concept` | A question and text options | Review only. The Deep review does not cover these |
| `hand-name` | Five to seven cards; options are hand categories | A test runs the evaluator on the cards and compares |
| `showdown` | A board and two or three players' hole cards; who wins, or a split | A test runs the evaluator on each player and compares |
| `preflop` | A seat and two hole cards, everyone before has folded; fold or raise | A test looks the hand up in the chart data and compares |
| `outs` | Hole cards and a board, and a named target such as "a flush"; options are counts | A test counts the cards that make the target and compares |
| `odds` | A pot and a bet; options are percentages or call and fold | A test does the arithmetic and compares |

Each key is written twice: once by the author in the data, and once by the test from the cards
or the numbers. A disagreement fails the gate and is resolved by reading both. That is the
answer to hazard 4 for every kind but `concept`. The evaluator itself is checked against the
known count of each category over all 2,598,960 five-card hands, and then by one narrow Deep
review (`PLAN.md`, phase 5). The preflop chart gets its own Deep review (`PLAN.md`, phase 7).

### 10.5 Mascot poses

| Moment | Character | Pose |
|---|---|---|
| An exercise is on screen | fish in a lesson, shark in a boss, squid in a review | `think` |
| Right answer | the same | `cheer` (the shark shows `sad`: the player beat it) |
| Wrong answer | the same | `sad` (the shark shows `smug`) |
| Lesson or review finished | fish or squid | `happy` |
| Boss passed | shark | `sad`, then the squid opens the chest with `cheer` |
| Boss failed | shark | `smug` |
| Out of lives | fish | `sleep` |
| No finished lesson yet on this local day | fish, at the top of the path | `sleep` |

The pose names and the 18 files come from `tools/build_mascots.py:336-337`.

As built (phase 8, 2026-10-05): the table's last row is drawn at the top of the Learn path, and
the fish shows `happy` once a lesson is finished that day; the table does not say what the fish
does then, so that was the build's choice. A player with no progress at all sees the sleeping
fish with a welcome line in place of the nap line (the empty state of rule U4). The Profile and
Practice tabs, empty until phases 11 and 15, show the fish and the squid in `think`.

As built (phase 10, 2026-10-05): the boss shows `think` beside each exercise, `sad` at a right
answer and `smug` at a wrong one, then `sad` at a pass and `smug` at a fail. The chest shows the
squid `happy` beside the closed chest and `cheer` beside the gem once it is opened; there is no
open-chest art, so the gem replaces the chest. The review's squid shows `think`, `cheer`, `sad` and
`happy` as the lesson's fish does.

### 10.6 The art in the app

- **The app draws every SVG with `react-native-svg`** from the file in `assets/`
  (`PLAN.md`, BD-6). `expo-image` also reads SVG, but its iOS decoder warns about fonts that are
  not system fonts and its Android decoder has basic text support only (`expo-image` 57.0.3:
  SDWebImageSVGCoder, `ios/ExpoImage.podspec:33`; AndroidSVG 1.4, `android/build.gradle:46`).
- **The current node's ring is baked at 60%.** The generator calls `node(..., ring=0.6)`
  (`tools/build_icons.py:368`), so `node_current.svg` always shows the same arc. The generator
  gains a second file for the current node without the progress arc, and the app draws the arc
  from the player's progress (`PLAN.md`, BD-9). `node_current.svg` stays as it is, for the
  gallery and for Rive.
- **Card ranks** follow `D14`.
- **Chips are decoration** (`D6`): a chip on screen is never a number the player owns.

### 10.7 Screens, poses and dials added by D15 to D21

Proposed with `D15` to `D21` on 2026-10-05; each row stands or falls with its decision.

| Screen | How it is shown | Native components | Drawn from the art |
|---|---|---|---|
| Welcome, cast, "How much poker do you know?" (`D20`) | Full screen, before the tabs, first launch only | `Button` | the three mascots, `happy` |
| Placement check (`D20`) | The lesson screen of 10.3, with no lives | as the lesson | the fish |
| Practice (`D21`) | A third tab | as the lesson, plus `Button` to start a set | cards, the squid |
| Profile additions (`D15`, `D19`) | Inside Profile | `Switch` for sound, `Button` to buy a freeze | `streak_freeze`, `gem` |

In Practice the squid shows `think`, `cheer` and `sad` as in 10.5. Every screen in 10.3 and in
this table has a dark version (`D16`) and draws in the centred column (`D17`).

| Dial | Proposed default | From |
|---|---|---|
| Sound effects | 6, each under 1 second | `D15` |
| Column width | At most 640 points | `D17` |
| Streak freeze price | 10 gems | `D19` |
| Streak freezes held | At most 2 | `D19` |
| Practice XP | 5 for each right answer | `D21` |
| Practice set | 10 exercises | `D21` |
| Placement check | 10 exercises from units 1 and 2; 8 right passes | `D20` |
