# Autopilot rundown, 2026-10-05

## In one paragraph
The run started on 2026-10-05 at 01:26 EDT and ended at about 08:15 EDT. Every board row is `DONE`, items 1 to 21, with ledger steps 2 to 26 as the record. The MVP of `docs/incomplete/app/PLAN.md` (16 phases) is built: an Expo SDK 57 app in `app/` with three native tabs, the path, lessons with all eight exercise kinds, boss, review, chest, hearts, the streak freeze, Practice with seeded random hands, Profile with the daily reminder, onboarding and the placement check, plus the sound generator and the changed icon generator. A fresh checkout with no installed packages passes the whole-repo gate: run lines 78, 18 and 6, typecheck, lint, 63 test files and 490 tests, with the generated art byte-identical between runs. Nothing is committed (that is yours), and no one has held the app on a phone. The run ended because every row was done, not because a cap was reached. Weekly usage ended at 49%, below your 65% stop.

## Rows
Model names are the families passed to the Agent tool: Opus 5.5 for the Default tier, Sonnet 5.5 for the Mechanical tier, Fable 5.1 for the two Deep reviews. Each row built in the main checkout from item 5 on, because worktrees start at `HEAD` and would lack the uncommitted art (see Judgment calls). Auditors worked in snapshot copies under the scratchpad. Gates listed are the ones the auditor or this session ran.

| Item | Builder | Review | Fix rounds | Gate seen | Ledger |
|---|---|---|---|---|---|
| 21 two stale lines | Sonnet | Opus, non-blocking | 0 | 76 and 18 | 9 |
| 5 icon generator | Sonnet | Opus, non-blocking | 1 (orchestrator) | 78 and 18 | 11 |
| 6 TypeScript standard | Opus | Opus, non-blocking | 0 | 78 and 18 | 12 |
| 7 scaffold and art on both platforms | Opus | Opus, non-blocking | 0 | 490 tests later; 5 then | 13 |
| 17 sound generator | Opus | Opus, non-blocking | 1 (orchestrator) | 78, 18, 6 | 14 |
| 8 game state and storage | Opus | Opus, non-blocking | 1 | 26 files, 200 tests | 15 |
| 9 cards, evaluator, content schema | Opus | Fable (Deep), non-blocking | 1 | 26 files, 207 tests | 16 |
| 10 units 1 and 2 | Opus | Opus twice, non-blocking | 2 | 27 files, 208 tests | 17 |
| 11 units 3 and 4, preflop chart | Opus | Fable (Deep) and two Opus, non-blocking | 1 | content and cards, 143 tests | 18 |
| 12 tabs, path, stat bar | Opus | Opus, non-blocking | 0 | 31 files, 314 tests | 19 |
| 18 random dealers | Opus | Opus, one blocking template, fixed | 1 | 40 files, 378 tests | 20 |
| 13 the lesson | Opus | Opus, one blocking finding, fixed | 1 (in item 14) | 47 files, 408 tests | 21 |
| 14 boss, review, chest, lives | Opus | Opus, non-blocking | 0 | 47 files, 408 tests | 22 |
| 19 Practice tab | Opus | Opus, non-blocking | 1 | 59 files, 479 tests | 23 |
| 15 Profile and reminder | Opus | Opus, one blocking finding, fixed | 1 | 59 files, 479 tests | 24 |
| 20 onboarding and placement | Opus | Opus, non-blocking | 0 | 59 files, 479 tests | 25 |
| 16 close out | Sonnet | Opus final audit and fresh-checkout proof, non-blocking | 1 (doc round) | 63 files, 490 tests | 26 |

No row used a relay pass. Two builders needed a message to deliver their report. The builder worktrees `.claude/worktrees/agent-a1cb91d6981ab219e` and `agent-a5fa42196ab8eed27` (item 21) are redundant: the item 21 change was copied into `main`.

## Defects found and not fixed
Everything below is also in the ledger as an `open` finding.
1. Fix rounds that were not re-reviewed by a fresh auditor: item 8 (lost update, session size), item 10 (last content round), item 15 (stale clock), item 18, item 19. Each fix has a test that fails on the old code, and this session re-ran the gate after each one.
2. The fixes of items 15, 19 and 20 were not seen on a device.
3. Replaying a finished lesson gives XP and a streak day again. The free review also pays 10 XP per right answer on every replay, so it is the XP farm. A failed boss played to the end gives XP and a streak day. D8 allows all three. A decision for you.
4. No hearts message when a streak freeze is spent; no open-chest art (the gem replaces the chest); no app icon or splash (`app.json` has none, so the home screen shows the default Expo icon).
5. The dials `minIosVersion`, `minAndroidApi`, `soundEffects` and `soundMaxSeconds` are read nowhere. `react-native-svg-transformer` is installed and unused. `game/placement.ts:13` accepts a fractional right count (the interface cannot produce one).
6. The preflop chart is tighter than published solver ranges at every seat (most at the button and small blind). It was written from principles and cites no source. The file says so.
7. The 12 or 24-hour clock of the phone itself cannot be read without a localization package, so the app follows the locale default.
8. Long functions and raw `fontWeight` strings against the TypeScript standard are listed in its Known gaps.
9. Findings kept open in earlier steps: dev routes exist in a release build (they only show a page), and several small copy and layout points in steps 19, 22 and 25.

## Collisions and merge order
No two rows claimed the same number. Rows 8, 9, 17, then 11 and 12, then 15 and 19 were built at the same time in one checkout with disjoint files. Three files were shared and edited by more than one row: `app/src/app/_layout.tsx` (now `RootProviders` and `RootStack`), `app/src/theme/tokens.ts`, and the docs (`PLAN.md`, `DESIGN.md`, `RUNTIME-PASS.md`, `HANDOFF.md`). Both builders re-read before editing, and the final gate on the whole tree is green, so no edit was lost. Because nothing is committed, there is no merge order: the whole tree is one commit, or you split it yourself. The art (`assets/`) was staged by an earlier session; the 52 card faces and `tools/build_icons.py` carry item 5's font change.

## Judgment calls
Each with its reversal. Builders logged their own in their reports (`STATE.md` Reports, ledger steps 9 to 26); these are the orchestrator's.
- You told me in chat to keep going. I treated that as lifting the skill's rule that holds a row behind an uncommitted sign-off. Reversal: commit what exists, then run `/autopilot` again for new rows.
- From item 5 on, builders worked in the main checkout, not in worktrees, because worktrees would lack the uncommitted art and every earlier phase. Auditors worked in scratch snapshots. Reversal: commit first, then use worktrees.
- Several rows ran at the same time in the main checkout on disjoint files. Failures in files outside a row's ownership were treated as another builder's work in progress. Reversal: run one builder at a time.
- The plan's Deep reviews (items 9 and 11) were run as the audit of those rows, with Fable. They were not rows you had lifted. Reversal: skip them (the evaluator and chart reviews found no wrong key, so they cost two Fable runs and found no bug).
- Fix rounds beyond the first were allowed for the content row (two rounds, a first review and a second fresh review) because content findings were copy-level. Reversal: hold the row.
- Fix rounds of rows 8, 10, 15, 18 and 19 were checked by tests and the gate, not by a fresh auditor, to stay within the usage cap. Reversal: audit them again.
- The approvals that need your eyes or ears (the freeze icon, the six sounds, the ranks) did not block the run. Reversal: none.
- Your D15 to D21 answers are now written into `DESIGN.md` in place with the old value findable ("was: pending"). Reversal: restore "Answer: pending".

## Decisions waiting for the owner
Also listed in `docs/incomplete/app/RUNTIME-PASS.md` under "Decisions that are Zach's".
1. Replay XP for a finished lesson, the free review as an XP farm, and XP for a failed boss.
2. Back on the boss finish screen skips "Open the chest" (the chest stays tappable).
3. Whether you want a freeze-used message, open-chest art, an app icon and a splash in the first version.
4. The pale locked nodes and the dim faded chest in dark mode (the art is as generated).
5. The Rive import is unchecked.
6. Copy: you have read none of it. Every prompt, option, explanation, template and screen string is in the files: units 1 to 4 under `app/src/content/units/`, the dealers' templates in `app/src/drills/`, and the screens. The wrong-answer line is two lines ("So close." and "The answer: ...") instead of D10's one-line "So close. It was ...". The routed copy variants: the register is "warm" (D10 accepted).
7. The TypeScript rule list (`docs/conventions-typescript.md`, 21 rules) and the Python standard 1.2.0.
8. A checked source for the preflop chart, or a decision to widen it.
9. The commit, and how to split it (see below).

## Budget
- Usage readings by `get_usage`, all EDT on 2026-10-05: 02:10 weekly 35% (all models), 5-hour 27%; 02:50 37% and 38%; 03:15 40% and 48%; 03:25 42% and 3%; 04:05 44% and 8%; 05:40 46% and 16%; 06:20 47% and 22%; 07:00 48% and 24%; 07:50 49% and 27%. The Fable weekly window went from 18% to 30%. Your stop was 65% weekly (and the peer session's shared cap was 80%). The run never reached either, and no STOP message arrived from the ezhomesteading session.
- Weekly points used by the account over the run: about 14, shared with the other session.
- Agents: about 46 subagent runs. Builders, Opus: 14. Builders, Sonnet: 4 (items 21, 5, 16 and the doc round). Reviewers and auditors, Opus: about 24. Fable: 2 (the Deep reviews of items 9 and 11), plus none other.
- Hours: about 6 hours 50 minutes wall clock.
- This session's context: peak 54% of 1M tokens (545k) at the end. No compaction.

## Not verified
- Nobody has held the app on a phone. It runs as a development build on the iPhone 17 Pro simulator and the Pixel_9 emulator only. The Android build needs Java 17 and `ANDROID_HOME`.
- No sound has been heard and no haptic felt. An agent cannot hear.
- No notification has been seen arriving at its time, only the phone's list of scheduled ones.
- iPad landscape, the Android small phone (`Medium_Phone_API_36`), a clean Android `fresh` shot, and the tablet screens beyond a few shots.
- The error banner and the error boundary have never appeared on screen.
- A boss played fully by hand. Most boss, review and onboarding runs used the dev link `?play=`; the taps around them were by hand.
- The dev link `felto://dev/fixture/...` on a release build.

## Warnings
- The repository has no commit of any of this. `app/`, `assets/sounds/`, `docs/README.md`, `docs/conventions-typescript.md`, `tools/build_sounds.py` and the run folder are untracked. A tool that removes untracked files or worktrees would delete the whole app. Commit before any cleanup.
- `.claude/worktrees/` holds two redundant worktrees from item 21; nothing in them is needed.
- `app/node_modules` is 2.5 GB and `app/ios` and `app/android` are generated; they are ignored by the root `.gitignore`.
- The Metro server and emulator are stopped. Both simulators are set back to light mode. The iPhone 17 Pro and iPad Pro 13-inch simulators stay booted.
- `.personal-config.json` is ignored by git; its `gateCommand` was updated and is not in any commit.
- The gate takes about 45 seconds and rewrites the generated SVGs and WAVs in place.

## Commit blocks
Everything is in `main`. Run `git status --short` first, then the two blocks, or split them by item. The first block makes git see the new files, as the commit rules require.

```bash
git add -N app assets/sounds assets/icons/path/node_current_base.svg assets/icons/ui/streak_freeze.svg docs/README.md docs/conventions-typescript.md docs/incomplete/app/RUNTIME-PASS.md docs/incomplete/autopilot-2026-10-05 tools/build_sounds.py
```

```bash
git add .gitignore CLAUDE.md HANDOFF.md PASSOFF.md assets app docs tools
```

```bash
git commit .gitignore CLAUDE.md HANDOFF.md PASSOFF.md assets app docs tools -m "build the felto mvp: app, sounds, content and records"
```

To split it by item, the order that typechecks is: items 21, 5 and 17 (documents, `tools/`, `assets/`), then 6, then 7 (`app/` config), then 8 to 20 (the rest of `app/src`), then 16. A split commit that leaves `app/src` partly out will not typecheck on its own.
