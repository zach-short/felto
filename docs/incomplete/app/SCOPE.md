# Scope: the felto app

Status: `RATIFIED` 2026-10-05 (section 7). Opened 2026-10-05 on Opus 5.5 with `/scope the app`
as `SCOPING`. Sections 1 to 6 propose and decide nothing; Zach's answers are in section 7, with
their dates, from GATE 1 (`docs/AGENT-PRACTICES.md`, Part 2.2).

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
| 5 | The mascot layer ids are a rig contract | Every pose of a character keeps the same ids | `docs/conventions-python.md:519-537` (rule I3) |
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
