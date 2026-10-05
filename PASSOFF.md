<!-- personal-config v0.7.0 · 2026-10-04 · config 3b46daed · standard v1.2.0 · adapted -->
# PASSOFF: felto (the board)

**What is next.** One row per item, one standalone prompt per item below the board. What is
true lives in `HANDOFF.md`. **Check "Files it owns" against every open item before
starting one**: two items naming the same file never run at the same time, whatever their
lanes say.

Status vocabulary, and no other words: `OPEN` · `IN FLIGHT` · `DONE: HANDOFF n` · `HELD` ·
`SETTLED AS NO` · `SUPERSEDED`. `DONE` always points at the ledger step that is the real
record. `HELD` always names what it waits on. `SUPERSEDED` always names what replaced it.
`SETTLED AS NO` always carries its reason, because its whole job is to not be re-proposed.
The colon in `DONE: HANDOFF n` replaced an em dash on 2026-10-04; `personal-config` reads both,
because it matches `startsWith('DONE')` and then `HANDOFF <n>`
(`personal-config/src/doctor/rules/board-status.ts:56,94`, `src/lib/fold.ts:66`).

Lanes run in parallel, each in its own worktree; items inside a lane run in order.

| # | Task | Status | Model | Lane | Waits on | Files it owns |
|---|------|--------|-------|------|----------|---------------|
| 1 | Write the Python code standard for `tools/` | `DONE: HANDOFF 2` | Opus 5.5 | A | nothing | `docs/conventions-python.md`, `CLAUDE.md` |
| 2 | Move the shared generator code into one module | `DONE: HANDOFF 3` | Sonnet 5 | A | nothing | `tools/build_icons.py`, `tools/build_mascots.py`, the new shared module in `tools/`, `docs/conventions-python.md` |
| 3 | Reconcile the line citations in the Python standard | `DONE: HANDOFF 4` | Sonnet 5 | A | nothing | `docs/conventions-python.md` |
| 4 | Name `tools/common.py` in the standard's scope sentence | `DONE: HANDOFF 8` | Sonnet 5 | A | nothing | `docs/conventions-python.md` |
| 5 | App phase 1: change the icon generator for the app | `DONE: HANDOFF 11` | Sonnet 5 | A | items 4 and 21; Zach's answer to `D15` to `D21` | `tools/build_icons.py`, `assets/icons/path/node_current_base.svg`, `assets/icons/ui/streak_freeze.svg`, `assets/icons/cards/*.svg`, `docs/conventions-python.md`, `CLAUDE.md` |
| 6 | App phase 2: write the TypeScript standard and re-add the app rules | `DONE: HANDOFF 12` | Opus 5.5 | B | item 5 | `docs/conventions-typescript.md`, `docs/AGENT-PRACTICES.md`, `docs/README.md`, `CLAUDE.md`, `.gitignore` |
| 7 | App phase 3: scaffold `app/` and draw the art on both platforms | `DONE: HANDOFF 13` | Opus 5.5 | B | item 6; the art commit | `app/` config files, `app/src/app/dev/`, `app/src/config/`, `app/src/theme/`, `CLAUDE.md`, `docs/AGENT-PRACTICES.md`, `.personal-config.json`, `.gitignore` |
| 8 | App phase 4: game state and the data module | `DONE: HANDOFF 15` | Opus 5.5 | B | item 7 | `app/src/game/`, `app/src/storage/` |
| 9 | App phase 5: cards, the evaluator and the content schema | `DONE: HANDOFF 16` | Opus 5.5 | C | item 7; a push | `app/src/cards/`, `app/src/content/` except `units/` lessons |
| 10 | App phase 6: content, units 1 and 2 | `DONE: HANDOFF 17` | Opus 5.5 | C | item 9 | `app/src/content/units/` (units 1 and 2) |
| 11 | App phase 7: content, units 3 and 4, and the preflop chart | `DONE: HANDOFF 18` | Opus 5.5 | C | item 10 | `app/src/content/units/` (units 3 and 4), the chart file |
| 12 | App phase 8: tabs, the path and the stat bar | `DONE: HANDOFF 19` | Opus 5.5 | B | items 8 and 10; lane C merged | `app/src/app/(tabs)/`, `app/src/art/`, the path, mascot and stat bar components |
| 13 | App phase 9: the lesson | `DONE: HANDOFF 21` | Opus 5.5 | B | items 12 and 17 | `app/src/app/lesson/`, the exercise and feedback components |
| 14 | App phase 10: boss, review, chest and lives | `DONE: HANDOFF 22` | Opus 5.5 | B | item 13 | the boss, review, chest and out-of-lives routes and components |
| 15 | App phase 11: profile, settings and the reminder | `DONE: HANDOFF 24` | Opus 5.5 | B | item 14 | the Profile route and components, the reminder module |
| 16 | App phase 12: close out | `DONE: HANDOFF 26` | Sonnet 5 | B | items 5 to 15 and 17 to 20 | `docs/conventions-typescript.md`, `docs/incomplete/app/RUNTIME-PASS.md` |
| 17 | App phase 13: write the sound generator | `DONE: HANDOFF 14` | Opus 5.5 | A | item 7 | `tools/build_sounds.py`, `assets/sounds/`, `docs/conventions-python.md`, `CLAUDE.md`, `.personal-config.json` |
| 18 | App phase 14: random dealers for practice | `DONE: HANDOFF 20` | Opus 5.5 | C | item 11 | `app/src/drills/` |
| 19 | App phase 15: the Practice tab | `DONE: HANDOFF 23` | Opus 5.5 | B | items 14 and 18; lane C merged | the Practice route and components |
| 20 | App phase 16: onboarding and the placement check | `DONE: HANDOFF 25` | Opus 5.5 | B | item 19 | the onboarding routes and components |
| 21 | Fix two stale lines that board item 4 found | `DONE: HANDOFF 9` | Sonnet 5 | A | nothing | `docs/conventions-python.md`, `docs/incomplete/app/DESIGN.md` |
| 22 | Unit stories phase 1: dealt hands in lessons 3 and 5 and in every boss | `DONE: HANDOFF 28` | Opus 5.5 | D | nothing | `app/src/game/dealt-slots.ts` (new), `app/src/game/session.ts`, `app/src/screens/lesson-screen.tsx`, `app/src/components/boss/boss-session.ts`, `app/src/config/dials.ts` (block `// unit-stories`), `app/src/drills/deal.ts` (the `DEALERS` export only) |
| 23 | Unit stories phase 2: the story engine, the route and the header button | `DONE: HANDOFF 31` | Opus 5.5 | E | nothing | `app/src/app/story/`, `app/src/screens/story-screen.tsx`, `app/src/components/story/`, `app/src/content/stories/schema.ts`, `app/src/components/root-stack.tsx`, `app/src/components/path/unit-header.tsx`, `app/src/components/path/path-view-model.ts`, `app/src/config/dials.ts` (block `// unit-stories`) |
| 24 | Unit stories phase 3: the hands story content | `DONE: HANDOFF 33` | Opus 5.5 | E | item 23 committed in the lane E worktree | `app/src/content/stories/hands.ts`, `app/src/content/stories/hands-story.test.ts` |
| 25 | Unit stories phase 4: close out | `DONE: HANDOFF 35` | Sonnet 5 | E | items 22 to 24 | `docs/README.md`, `docs/incomplete/unit-stories/`, `docs/incomplete/app/DESIGN.md`, `HANDOFF.md` |
| 26 | Game feel phase 1: Reanimated, the motion module, tokens and the primary button | `DONE: HANDOFF 29` | Opus 5.5 | F | nothing | `app/package.json`, `app/bun.lock`, `app/src/motion/`, `app/src/components/button/`, `app/src/theme/tokens.ts`, `app/src/config/dials.ts` (block `// game-feel`), `docs/conventions-typescript.md` |
| 27 | Game feel phase 2: haptics, the Haptics switch and stored version 3 | `DONE: HANDOFF 30` | Opus 5.5 | F | item 26 | `app/src/feedback/`, `app/src/storage/migrations.ts`, `app/src/storage/check-state.ts`, `app/src/storage/player-actions.ts`, `app/src/game/player-state.ts`, `app/src/game/settings.ts`, `app/src/components/profile/`, `app/src/screens/profile-screen.tsx`, `app/src/components/lesson/lesson-run-view.tsx` and `feedback-sheet.tsx` (the press haptic only) |
| 28 | Game feel phase 3: six new sound effects | `DONE: HANDOFF 32` | Opus 5.5 | F | item 27 | `tools/build_sounds.py`, `assets/sounds/`, `app/src/art/sounds.ts`, `app/src/feedback/effects.ts`, `app/src/config/dials.ts` (block `// game-feel`), `app/src/components/lesson/lesson-run-view.tsx` and `feedback-sheet.tsx` (the press sound only) |
| 29 | Game feel phase 4: the answer loop | `DONE: HANDOFF 37` | Opus 5.5 | F | item 28 | `app/src/components/lesson/`, `app/src/components/exercise/`, `app/src/feedback/` |
| 30 | Game feel phase 5: finish, chest and boss screens, with the chest tap reveal and the mascot's warm line (widened 2026-10-05) | `HELD` until items 46, 48 and 50 are `DONE` | Opus 5.5 | F | items 46, 48 and 50 | `app/src/components/lesson/lesson-finish.tsx`, `app/src/components/chest/`, `app/src/components/boss/boss-finish.tsx`, `app/src/screens/chest-screen.tsx`, `app/src/config/dials.ts` (its own lines in the block `// game-feel second pass`) |
| 31 | Game feel phase 6: the path, with node popovers, placed mascots and rolling counters (widened 2026-10-05) | `HELD` until item 30 is `DONE` | Opus 5.5 | F | item 30 | `app/src/components/path/`, `app/src/components/stat-bar.tsx`, `app/src/art/path-node-art.tsx`, `app/src/art/colour-swap.json`, `app/src/config/dials.ts` (its own lines in the block `// game-feel second pass`), `tools/build_icons.py` only if the node decision needs it |
| 32 | Game feel phase 7: Learn, Profile, empty states, mascot life, and every native control left replaced by the kit (widened 2026-10-05) | `HELD` until item 31 is `DONE` | Opus 5.5 | F | item 31 | `app/src/screens/learn-screen.tsx`, `app/src/screens/profile-screen.tsx`, `app/src/components/profile/`, `app/src/components/onboarding/`, `app/src/art/mascot.tsx`, the other `LessonButton` call sites (`app/src/screens/`, `app/src/components/story/story-missing.tsx`), `app/src/components/lesson/lesson-button.tsx` and `wide-label.tsx` (deleted when unused), `app/src/components/lesson/lesson-run-view.tsx` (the leave dialog only), `app/src/components/lives/`, `app/src/components/story/story-button.tsx`, `app/src/components/route-error.tsx`, `docs/conventions-typescript.md` |
| 33 | Game feel phase 8: close out both passes, items 26 to 32 and 46 to 57 (widened 2026-10-05) | `HELD` until items 26 to 32 and 46 to 57 are `DONE` | Sonnet 5 | F | items 26 to 32 and 46 to 57 | `docs/README.md`, `docs/incomplete/game-feel/`, `docs/incomplete/app/DESIGN.md`, `HANDOFF.md`, `CLAUDE.md` (the test counts left to this item, `HANDOFF.md` step 35) |
| 34 | Flop in Rive: tune the spike rig, then play it on a perfect finish | `IN FLIGHT` (Phase A done, `HANDOFF 34`; Phase B built on branch `lane-g-flop-rive`, `HANDOFF 36`; the `lesson-finish.tsx` wiring waits on item 29) | Sonnet 5 | G | Zach's yes to Phase B; item 29 for `lesson-finish.tsx` | the Rive file in Zach's account; `app/package.json`, `app/bun.lock`, `app/assets/rive/` (new), `app/src/art/` (a new Rive file only), `app/src/config/dials.ts` (block `// game-feel`), `app/src/components/lesson/lesson-finish.tsx` |
| 35 | GTO trainer phase 1: game spec, schema and feasibility | `DONE: HANDOFF 41` | Fable 5.1 | H | nothing | `docs/incomplete/gto-trainer/KEY-SPEC.md`, `solver/` (schema validator stub), `docs/conventions-rust.md` only if the estimate calls for Rust |
| 36 | GTO trainer phase 2: preflop equity table | `OPEN` | Opus 5.5 | H | item 35 (`DONE`) | `solver/equity.py`, `solver/equity_test.py`, `solver/data/`, `docs/conventions-python.md` (the M4 amendment for numpy) |
| 37 | GTO trainer phase 3a: solver core, one spot | `HELD` until item 36 is `DONE` | Fable 5.1 | H | item 36 | `solver/cfr.py`, `solver/best_response.py` |
| 38 | GTO trainer phase 3b: the full tree and convergence | `HELD` until item 37 is `DONE` | Fable 5.1 | H | item 37 | `solver/`, the raw strategy output |
| 39 | GTO trainer phase 4: key export, validation and containment | `HELD` until item 38 is `DONE` | Opus 5.5, then a Fable 5.1 review | H | item 38 | `app/src/gto/key.ts`, `app/src/gto/data/` |
| 40 | GTO trainer phase 5: the hand engine | `HELD` until item 35 is `DONE` | Opus 5.5 | I | item 35 (the schema); a fixture key until item 39 | `app/src/gto/` except `key.ts`, `data/` and `grade.ts` |
| 41 | GTO trainer phase 6: grading and the review model | `HELD` until items 39 and 40 are `DONE` | Opus 5.5, then a Fable 5.1 review of `grade.ts` | I | items 39 and 40 | `app/src/gto/grade.ts`, the review model |
| 42 | GTO trainer phase 7: the table screen and seats | `HELD` until item 40 is `DONE` | Opus 5.5 | I | item 40 | the table component and screen, `app/src/art/` seat wiring |
| 43 | GTO trainer phase 8: three new characters | `HELD` until Zach has run the Higgsfield round | Opus 5.5, with Zach | J | Zach's round | `assets/higgsfield-table/`, `assets/gallery.html`, the art module |
| 44 | GTO trainer phase 9: session flow, stored version 5 and the free allowance | `HELD` until items 41 and 42 are `DONE` | Opus 5.5 | I | items 41 and 42 | `app/src/storage/migrations.ts`, `app/src/config/dials.ts`, the Practice screen, the session and summary routes |
| 45 | GTO trainer phase 10: copy, runtime pass and close-out | `HELD` until items 35 to 44 are `DONE` | Sonnet 5 | I | items 35 to 44 | `docs/README.md`, `docs/incomplete/gto-trainer/`, `HANDOFF.md` |
| 46 | Game kit: 3D text, rolling numbers, bubbles, popovers, tags, sparkles, switch, sheet and dialog | `IN FLIGHT` | Opus 5.5 | K | nothing | `app/src/components/kit/` (new), new hook files in `app/src/motion/`, `app/src/theme/tokens.ts`, `app/src/config/dials.ts` (block `// game-feel second pass`), `app/src/app/dev/kit.tsx`, `app/src/screens/dev-kit-screen.tsx`, `docs/conventions-typescript.md` |
| 47 | Re-voice all twelve sounds as one family of chimes | `DONE: HANDOFF 40` | Opus 5.5 | L | nothing | `tools/build_sounds.py`, `assets/sounds/` |
| 48 | Redraw the chest in four tiers, closed and open, in a three-quarter view | `DONE: HANDOFF 42` | Opus 5.5 | M | nothing | `tools/build_icons.py`, `assets/icons/ui/chest*.svg`, `app/src/art/registry.ts`, `app/src/art/sizes.ts`, `CLAUDE.md` (the icon count) |
| 49 | Lottie effects from a generator: bursts, confetti, sparkles, fly-ups and a flame | `IN FLIGHT` | Opus 5.5 | N | nothing | `app/package.json`, `app/bun.lock`, `tools/build_lottie.py` (new), `assets/lottie/` (new), the Lottie player and its tests in `app/src/art/`, the `/dev/art` route (`app/src/app/dev/art.tsx`, `app/src/screens/dev-art-screen.tsx`). It edits none of `app/src/config/dials.ts`, `app/src/theme/tokens.ts`, `CLAUDE.md`, `.personal-config.json` or `docs/conventions-typescript.md`: it reports their text |
| 50 | Chest tier rule: a seeded tier fixed when the chest is ready, a reveal plan and dials | `IN FLIGHT` (part A started 2026-10-05; part B waits on item 46) | Opus 5.5 | Q | item 46, for part B only (both write `app/src/config/dials.ts`) | Part A: `app/src/game/chest.ts` and new chest test files beside it; `app/src/storage/migrations.ts`, `app/src/game/player-state.ts` and a new old-save test only if the stored version must rise. Part B adds `app/src/config/dials.ts` (a chest block) |
| 51 | The lesson host speaks: the prompt in a speech bubble, and a NEW CONCEPT tag | `IN FLIGHT` (part A started 2026-10-05; part B waits on item 46) | Opus 5.5 | O | item 46, for part B only | `app/src/components/exercise/*` and new test files beside them |
| 52 | A custom tab bar with generated tab icons and a raised selected tab | `IN FLIGHT` (part A started 2026-10-05; part B waits on items 46 and 48) | Opus 5.5 | P | items 46 and 48, for part B only (`tools/build_icons.py`, `app/src/art/registry.ts`, `tokens.ts`, `dials.ts`) | Part A: `app/src/components/app-tabs.tsx`, the `(tabs)` layout under `app/src/app/`, a new tab bar view in `app/src/components/`. Part B adds `tools/build_icons.py` (tab icons), `assets/icons/ui/tab_*.svg` (new), `app/src/art/registry.ts`, `app/src/art/sizes.ts`, `app/src/theme/tokens.ts`, `app/src/config/dials.ts`, `CLAUDE.md` (the icon count), `docs/conventions-typescript.md` (the registry line) |
| 53 | Rive: Flop talks, cheers and is sad | `HELD` until item 34 is `DONE` | Sonnet 5 (Zach's choice for the Rive work) | G | item 34 | the Rive file 2632317 in Zach's account; `app/assets/rive/flop.riv` (re-exported from that file only) |
| 54 | Rive: rig Kicker the squid with the mascot contract | `HELD` until item 53 is `DONE` | Sonnet 5 (Zach's choice) | G | item 53 | a new Rive file in Zach's account; `app/assets/rive/kicker.riv` (new, exported from that file only) |
| 55 | Rive: rig Ace the shark, the boss, with the contract and a smug mood | `HELD` until item 53 is `DONE` | Sonnet 5 (Zach's choice) | G | item 53 | a new Rive file in Zach's account; `app/assets/rive/ace.riv` (new, exported from that file only) |
| 56 | Rive: rig the chest in four tiers: a wiggle, a tap shake, an upgrade flash and the opening | `HELD` until item 48 is `DONE` | Sonnet 5 (Zach's choice) | G | item 48 | a new Rive file in Zach's account; `app/assets/rive/chest.riv` (new, exported from that file only) |
| 57 | Play the rigs in the app: one mascot player, a chest player, static fallbacks | `HELD` until items 30 to 32, 51 and 53 to 56 are `DONE` | Opus 5.5 | F | items 30 to 32 (31 owns `path-greeting.tsx`, 32 owns `mascot.tsx`), 51 and 53 to 56 | `app/src/art/` (the Rive players, their pure modes and tests, `flop-rive.tsx`, `rive-boundary.test.ts`), `app/src/components/exercise/exercise-view.tsx`, `app/src/components/lesson/lesson-finish.tsx`, `app/src/components/boss/boss-finish.tsx`, `app/src/components/chest/`, `app/src/screens/chest-screen.tsx`, `app/src/components/path/path-greeting.tsx`, `app/src/screens/dev-art-screen.tsx`, `app/src/config/dials.ts` (its own lines in the block `// game-feel second pass`), `docs/conventions-typescript.md` (rule U6), `CLAUDE.md` (the `.riv` rule) |
| 58 | Web app: an Expo web build of the app at felto.app, and the marketing site moved to download.felto.app | `HELD` until Zach answers the five questions in the prompt (the domain first) and items 34 and 49 are `DONE` | Opus 5.5 | R | Zach's answers; items 34 and 49 (they own `app/package.json` and `app/bun.lock`) | `app/package.json`, `app/bun.lock`, `app/app.json`, `app/metro.config.js`, `app/wrangler.jsonc` (new), new `*.web.ts` and `*.web.tsx` files beside the native ones in `app/src/storage/`, `app/src/feedback/`, `app/src/art/` (the Rive file only), `app/src/components/profile/` and `app/src/reminder/`, `app/src/components/app-tabs.tsx` if the web tabs need a branch, `site/src/config.ts`, `site/wrangler.jsonc`, `docs/incomplete/app/DESIGN.md` (one new decision), `docs/README.md`, `HANDOFF.md`, `CLAUDE.md` (the web build command) |

**Do not paste a prompt marked DONE**: a fresh session would build it again.

A `DONE` item's prompt is folded out to the archive at close-out; its row stays here forever,
with its pointer at the ledger step. `SUPERSEDED` and `SETTLED AS NO` keep their sections:
the replacement and the reason are written nowhere else. `personal-config fold board` does it.

*Items 46 to 57 were opened 2026-10-05 out of Zach's second game-feel pass
(`docs/incomplete/game-feel/DESIGN.md` section 9, decisions `GF-10` to `GF-19`; `HANDOFF.md` step
39; the order of work is `docs/incomplete/game-feel/PLAN.md` section 8). The same day items 30 to
32 were widened to carry the parts of that pass that land on their screens, and item 33 to close
out both passes. Lanes K to Q are builders the session of step 39 started, each in its own
worktree; lane G is the Rive work, on Sonnet 5 by Zach's choice. Item 46 opens the dials block
`// game-feel second pass`; items 30, 31, 50 and 57 add their own lines to it only after item
46 is `DONE`, so no two of them write `app/src/config/dials.ts` at once.*

### 1. Write the Python code standard for the asset generators

*`DONE: HANDOFF 2`, 2026-10-04. Do not paste this prompt. It is not folded yet:
`personal-config fold board` refused on 2026-10-04 because `~/Projects/archive/felto` has no
`INDEX.md`, and seeding that index is `personal-config setup`'s job.*

*Opened 2026-10-04, out of the Part 0 adaptation: `CLAUDE.md` requires a code standard before
any code is written, and none exists.*

**Model: Opus 5.5. Lane A. Waits on nothing.** Work in the main checkout; no worktree needed.

You are picking up felto, an asset pipeline with no app code yet. Read `HANDOFF.md` first (the
gates, the invariants and the code map are there; do not re-derive them), then
`docs/AGENT-PRACTICES.md` in full, Part 8.1 above all, then `CLAUDE.md`. Session rules: absolute
dates only; every claim carries a `file:line` or the command that produced it; grep before you
record an absence; ask Zach in one batch, in chat, before building on a guess; never run
`git commit`, `git push`, `git add -A` or `git add .`.

**Why this exists.** Every future change to the art is a change to `tools/build_icons.py` or
`tools/build_mascots.py`. Without a written standard, each session invents its own style for
those files, and the two generators drift apart.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The generators use only `math` and `os` (`grep -nE '^(import|from)' tools/*.py`, 2026-10-04).
- Both are deterministic: a rebuild is byte-identical to the files on disk (`HANDOFF.md`,
  Environment). A rule that breaks determinism is wrong.
- Shared house shape, visible in both files: a module docstring stating the style and the run
  command (`tools/build_icons.py:2-13`), an `OUT` path relative to the file
  (`tools/build_icons.py:17`, `tools/build_mascots.py:16`), small functions returning SVG strings,
  one `main()` behind `if __name__ == "__main__"`.
- No formatter or linter is configured. Per 8.1, every rule therefore carries the *review* tag
  unless Zach adopts a tool.
- Owner policy from `.personal-config.json` answers: comments explain why only; functions of
  roughly 6 to 15 lines; named exports only; strict types; tokens only for design values.
  Some of these do not fit a stdlib Python script as written; those are questions, not rules.

Do these, in order:
1. **Read both generators in full.** The rules must describe what the code already does, with a
   real correct/incorrect pair from this repo for each (8.1).
2. **List where the two files already differ** (helper names, colour constants, how parts are
   layered). Each difference is either a rule or a sanctioned divergence; that is Zach's call.
3. **Batch the questions to Zach** (below), in one message, before writing the file.
4. **Write `docs/conventions-python.md`**: self-contained, rule IDs that never get renumbered,
   an enforcement tag and a provenance label on every rule, and a sentence saying no formatter
   settles anything yet.
5. **Point `CLAUDE.md` at it.** Replace the "no per-language standard exists yet" line.
6. **Record it.** A new ledger step at the next free number, read from `HANDOFF.md`, and set this
   row to `DONE: HANDOFF <n>`.

Ask before building: whether to adopt a formatter (for example `ruff format`), which would
replace prose rules with config; whether the colour constants should move to one shared module,
which would change both generators; how the function-length and type-hint policies apply to
these scripts. All are Zach's calls, and the answer to any of them may be no.

Not in scope, whoever asks: changing either generator's output; refactoring the generators to
fit the new standard; rebuilding the preview pages; anything under `assets/higgsfield/`.

Hand back: the gate `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint
--noout assets/icons/*/*.svg assets/mascots/*/*.svg`, green, and `git diff --stat -- assets`
empty (nothing in the art changed); the new standard's path for Zach to read; then the two
copyable blocks from Part 11, `git add` with the exact files, then `git commit` with the same
files and a short lowercase message.

### 2. Move the shared generator code into one module

*Opened 2026-10-04, out of board item 1 (ledger step 2): Zach decided that code both generators
use lives in one shared module (rule H1 in `docs/conventions-python.md`), and that a separate
item makes the move with byte-identical art.*

**Model: Sonnet 5 (Mechanical). Lane A. Waits on nothing.** Work in the main checkout; no
worktree needed. Escalate to Opus 5.5 the moment the art diff is not empty for a reason you
cannot see at once.

You are picking up felto, an asset pipeline with no app code: two Python generators in `tools/`
write the SVG icons and mascots for a poker game. Read `HANDOFF.md` first (the gate, the
invariants and the code map are there; do not re-derive them), then
`docs/conventions-python.md` in full (rules H1, L6, W1, W2, H2, Y1, I3, G4 and the drift
register above all), then `CLAUDE.md`. Session rules: absolute dates only; every claim carries
a `file:line` or the command that produced it; ask Zach in one batch, in chat, before building
on a guess; never run `git commit`, `git push`, `git add -A` or `git add .`.

**Why this exists.** Both generators hold their own copies of the same helpers, and two copies
already differ. Every future change to the house style would have to be made twice. One shared
module makes the style one code path.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The copies, verified 2026-10-04: `svg` (icons 23-27, mascots 23-27), `tf` (icons 59-60,
  mascots 30-31), `ext` (icons 37-39, mascots 41-42), `gloss` (icons 52-56, mascots 49-53),
  `sector` (icons 74-83, mascots 91-100), `SHADOW` and `CREAM` (icons 18-19, mascots 17-18).
  `stroke()` (mascots 34-38) moves too (rule L6).
- `tf`, `ext`, `sector`, `SHADOW` and `CREAM` are identical in both files. The mascots `svg`
  takes `x0=0, y0=0` and writes the same bytes as the icons `svg` when they are 0; the shark
  passes `y0=-30` (`tools/build_mascots.py:376`).
- The two `gloss` copies differ in two ways only. The icons copy writes `id="gloss"`; the
  mascots copy writes no id. Their defaults differ, but every call passes `rx`, `ry` and `rot`,
  and only `tools/build_icons.py:98` relies on a default (`op=0.6`)
  (`grep -nE '\bgloss\(' tools/*.py`, 2026-10-04).
- `stroke(d, 15, c)` writes the same bytes as the inline path at `tools/build_icons.py:261`.
- A sibling module is imported by its plain name (rule M4). Running `python3 tools/<name>.py`
  puts `tools/` first on `sys.path`.
- The art must not change (rule G4). The proof is the gate followed by an empty
  `git diff --stat -- assets/icons assets/mascots`. The gate rewrites every SVG, so a green
  gate alone proves nothing about the art.

Do these, in order:
1. **Run the gate, then the art diff.** Both must be clean before you edit, or the diff after
   your edit cannot be trusted.
2. **Create the shared module in `tools/`.** Choose a plain `snake_case` name. Put in it
   `svg` (the mascots signature), `tf`, `ext`, `sector`, `gloss`, `stroke`, `write`, `SHADOW`
   and `CREAM`. `gloss` must reproduce both current outputs; how it switches the id is your
   choice. Follow every rule in the standard; no type hints (H3).
3. **Switch `tools/build_icons.py` to the shared module and delete its copies.** Draw the check
   glyph at line 261 with `stroke()`. Run the gate and the art diff.
4. **Switch `tools/build_mascots.py` the same way.** Write through the shared `write()` (W1).
   Run the gate and the art diff.
5. **Fix the run lines.** Each `main()` prints the number of files it wrote, counted from the
   writes (W2). Delete the unused count at `tools/build_icons.py:411`. Bring `main` in
   `tools/build_icons.py` to 15 lines or fewer (H2) and rename the loop name `l` (Y1). The
   icons run must print 76 and the mascots run 18.
6. **Correct the docstring at `tools/build_mascots.py:7-9`** so it matches the id table in rule
   I3. It is a docstring, so the art diff stays empty.
7. **Update `docs/conventions-python.md`.** Name the module in H1 and give H1 and M4 a real
   correct example. In the drift register, mark the H1, L6, W1, W2, H2, Y1 and I3 rows fixed,
   with the date and the ledger step; do not delete them. Bump the version to 1.1.0.
8. **Record it.** A new ledger step at the next free number, read from `HANDOFF.md`; update the
   code map for the new module and the Known facts entries this item resolves; set this row to
   `DONE: HANDOFF <n>`.

Ask before building: nothing is expected to need Zach. If a step cannot keep the art diff empty,
stop and ask before you change any art.

Not in scope, whoever asks: the raw floats under rule G3, the inline colours under C1 and the
comments under K1 (Zach decided on 2026-10-04 that these stay); any change to the art; the
preview pages; anything under `assets/higgsfield/`.

Hand back: the gate `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint
--noout assets/icons/*/*.svg assets/mascots/*/*.svg`, green; `git diff --stat -- assets/icons
assets/mascots` empty; the two run lines, showing 76 and 18; then the two copyable blocks from
Part 11, `git add` with the exact files, including the new module, then `git commit` with the
same files and a short lowercase message.

### 3. Reconcile the line citations in the Python standard

*Opened 2026-10-05, out of board item 2 (ledger step 3): the shared-module move deleted about
60 lines from the two generators, so most `file:line` citations in `docs/conventions-python.md`
now point at the wrong line. Step 3 left this owed.*

**Model: Sonnet 5 (Mechanical). Lane A. Waits on nothing.** Work in the main checkout; no
worktree needed. This item edits one document and no code. If a rule's example no longer
exists in the code, stop and ask Zach before you change what the rule says.

You are picking up felto, an asset pipeline with no app code. Read `HANDOFF.md` first (step 3 and
the code map), then `docs/conventions-python.md` in full, then `CLAUDE.md`. Session rules:
absolute dates only; every claim carries a `file:line` or the command that produced it; ask Zach
in one batch, in chat, before building on a guess; never run `git commit`, `git push`,
`git add -A` or `git add .`.

**Why this exists.** The standard cites real code so a reader can check each rule. On
2026-10-05 `grep -nE 'tools/build_(icons|mascots)\.py:[0-9]' docs/conventions-python.md` found 67
lines with such a citation, and most were taken before `tools/common.py` existed. A wrong
citation sends a reader to code that does not show the rule.

**What is fixed.** Do not relitigate these.
- Rules stay as written. This item moves citations and fixes example text; it adds no rule and
  changes no rule's meaning. Rule IDs never change.
- Examples marked "written for contrast", and examples that describe a state "before 2026-10-05",
  are history and keep no live citation. Do not rewrite them to match current code.
- Citations into `tools/common.py` use its current lines (`grep -n` it; do not count by hand).
- The drift register and the sanctioned divergence registry (S1 to S4) cite lines too; they
  are in scope.

Do these, in order:
1. **List every citation.** For each, open the cited line range and decide: still correct,
   moved (find the new range), or gone (the code was deleted or rewritten).
2. **Fix the moved ones** to the new range, checked by reading the lines, not by offset.
3. **Report the gone ones to Zach in one batch** before touching them. For each, propose a
   replacement example from the current code.
4. **Prove it.** Write a short script in the scratchpad that extracts each live citation and
   prints its first cited line, then read the output against the rule it supports. A citation
   that does not show its rule is a failure, even when the line exists.
5. **Bump the standard to 1.1.1**, delete the sentence in its header that says the citations
   are stale, and record it: a new ledger step at the next free number, read from
   `HANDOFF.md`, and set this row to `DONE: HANDOFF <n>`.

Not in scope, whoever asks: any change under `tools/` or `assets/`; adding or retiring a rule;
the line numbers in `HANDOFF.md` and `CLAUDE.md` (check them, and list any that are wrong, but
do not fix them here).

Hand back: the gate `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint
--noout assets/icons/*/*.svg assets/mascots/*/*.svg`, green, and `git diff --stat -- assets
tools` empty; the citation count before and after; the list of "gone" citations and what Zach
chose; then the two copyable blocks from Part 11, `git add` with the exact files, then
`git commit` with the same files and a short lowercase message.

### 4. Name `tools/common.py` in the standard's scope sentence

*Opened 2026-10-05, out of board item 3 (ledger step 4): the opening of
`docs/conventions-python.md` says the standard covers every `.py` file and then lists two, but
`tools/common.py` has been the third since ledger step 3.*

*Correction, 2026-10-05, recorded in ledger step 8: this prompt says the `HANDOFF.md` code map
read "version 1.1.1 (steps 2 to 5)". It read "(steps 2 to 4)" (`HANDOFF.md:92`), which was
right, because step 5 did not touch the standard.*

**Model: Sonnet 5 (Mechanical). Lane A. Waits on nothing.** Work in the main checkout; no
worktree needed. This item edits one sentence in one document and no code.

You are picking up felto, an asset pipeline with no app code. Read `HANDOFF.md` first (steps 3
to 5 and the code map), then `docs/conventions-python.md` in full, then `CLAUDE.md`. Session
rules: absolute dates only; every claim carries a `file:line` or the command that produced it;
ask Zach in one batch, in chat, before building on a guess; never run `git commit`, `git push`,
`git add -A` or `git add .`.

**Why this exists.** The standard opens by saying which files it covers. A reader who trusts
that sentence will think the repo has two Python files and may miss that rule H1 sends shared
code to a third.

**What is fixed.** Do not relitigate these.
- The sentence is at `docs/conventions-python.md:3-5`: "It covers every `.py` file in the repo.
  On 2026-10-04 those are `tools/build_icons.py` and `tools/build_mascots.py` (`ls tools`)."
  Checked 2026-10-05: `ls tools` lists `build_icons.py`, `build_mascots.py` and `common.py`.
- The 2026-10-04 date was true when written. Keep it as history, and add the current state with
  its own date and its own check.
- Rule IDs never change. No rule is added, retired or reworded. Do not edit any rule's text.
- Nine lines say "both generators", "both files" or "the two generators" (`grep -nE 'both
  (files|generators)|two generators' docs/conventions-python.md`, 2026-10-05). Read each and
  list any that is now wrong; do not fix them in this item. In rules C2, C3, I1 and H4 the
  phrase means the two generators, which is still right.

Do these, in order:
1. **Run `ls tools` and `grep -nE '^(import|from)' tools/*.py`.** The new sentence must carry
   the result of your own check, with today's date, not a copy of this prompt.
2. **Edit the sentence at lines 3-5.** Name all three files and say what `tools/common.py` is
   (the shared module, rule H1). Keep the "read it in full" instruction.
3. **Check the other lines named above** and list any that are wrong in your hand-back.
4. **Bump the standard to 1.1.2.** Update the version line at the top, and the code map entry in
   `HANDOFF.md` (it reads "version 1.1.1 (steps 2 to 5)"; extend the step range).
5. **Record it.** A new ledger step at the next free number, read from `HANDOFF.md`; set this
   row to `DONE: HANDOFF <n>`.

Ask before building: nothing is expected to need Zach.

Not in scope, whoever asks: any change under `tools/` or `assets/`; any rule's text; the C1
counts of 36 and 21 (a separate recount, if Zach wants one); `CLAUDE.md`.

Hand back: the gate `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint
--noout assets/icons/*/*.svg assets/mascots/*/*.svg`, green, and `git diff --stat -- assets
tools` empty; the list of other "both files" lines that are wrong, if any; then the two
copyable blocks from Part 11, `git add` with the exact files, then `git commit` with the same
files and a short lowercase message.

### 5 to 20. The app, one item per plan phase

*Opened 2026-10-05, out of ledger step 7: `docs/incomplete/app/PLAN.md` section 2 holds one
phase per item (phase n is item n + 4), with its scope, subagents, done-when and watch-for.
Items 5 to 16 were opened `HELD` on GATE 2. Zach answered it the same day and approved the plan,
and his answer to `D13` added items 17 to 20. All stay `HELD` until he answers `D15` to `D21`,
which shape items 5, 7, 8, 12, 13, 15 and 17 to 20. Each item's prompt is written at the close
of the item it waits on (Part 7, Block A), so the facts in it are fresh. Item 5's prompt is
below.*

### 5. App phase 1: change the icon generator for the app

*Opened 2026-10-05, out of ledger step 7 (`docs/incomplete/app/PLAN.md`, phase 1). `HELD` on
Zach's answer to `DESIGN.md` `D15` to `D21`, because `D19` adds an icon to this item.*

**Model: Sonnet 5 (Mechanical). Lane A. Waits on board items 4 and 21 and Zach's answer to `D19`.** Work in the main
checkout; no worktree needed. Escalate to Opus 5.5 the moment the art diff holds a change you
cannot explain at once.

You are picking up felto: two Python generators in `tools/` write the SVG art for a poker
lesson app that is about to be built in `app/`. Read `HANDOFF.md` first (the gate, the
invariants and the code map are there; do not re-derive them), then `docs/conventions-python.md`
in full, then `docs/incomplete/app/PLAN.md` sections 0 and 1 and phase 1, then
`docs/incomplete/app/DESIGN.md` `D14`, `D19` and section 10.6. Session rules: absolute dates only;
every claim carries a `file:line` or the command that produced it; ask Zach in one batch, in
chat, before building on a guess; never run `git commit`, `git push`, `git add -A` or
`git add .`.

**Why this exists.** The app draws the generated SVG files as they are. Two of them do not work
for it, and one it needs does not exist yet. The current path node has its progress ring fixed at 60%, so it cannot show a player's
real progress. And the card ranks name a font that Android does not have, so Android would draw
them in its default face. And the streak freeze (`D19`) needs an icon.

**What is fixed.** Read these before changing anything; do not relitigate them.
- `node_current.svg` comes from `node(*NODE_STATES["available"], ring=0.6)`
  (`tools/build_icons.py:368`), and the ring geometry is in `node()` (`:268-276`).
  `node_current.svg` must stay byte for byte the same (BD-9).
- The new file is `assets/icons/path/node_current_base.svg`: the same canvas, the ring track
  (`id="ring_track"`), the disc and the glyph, with no `ring_progress` element. The app draws the
  arc over it.
- `FONT` is at `tools/build_icons.py:20`. Zach accepted `D14` on 2026-10-05, so `'FeltoRank'`
  goes first and the rest of the list stays.
- If Zach accepted `D19`, the new `assets/icons/ui/streak_freeze.svg` is the flame of
  `ui_flame()` (`tools/build_icons.py:289`) in the gem's palette: face `#38B6F5`, depth
  `#0E6FB0` (`:324`), lights `#7FD3FF` and `#A6E3FF` (`:325`, `:328`). One parameterised
  function draws both flames; the flame path is never copied. If he declined it, skip it.
- Rule H1 (one copy of shared code), rule G4 (an art change is meant, and the art diff shows
  exactly it) and rule W2 (the run line prints a count taken from the writes).
- Board items 4 and 21 also edit `docs/conventions-python.md`. Item 4 is `DONE: HANDOFF 8`.
  Item 21 must be `DONE` first; if it is still `OPEN`, do it first, from its own prompt below.

Do these, in order:
1. **Run the gate, then the art diff.** Both must be clean before you edit, or the diff after
   your edit cannot be trusted.
2. **Write the base node through `node()`,** with a parameter rather than a second copy of the
   ring geometry, and write it from `main()`.
3. **Make the `D14` font change,** and, with `D19`, write the freeze icon from `main()`.
4. **Run the gate.** The run lines must read 77 and 18, or 78 and 18 with `D19`.
   `git diff --stat -- assets/icons assets/mascots` must list the new files and the 52 card
   faces and nothing else, and
   `git diff -- assets/icons/cards | grep '^[-+]<' | grep -v font-family` must print nothing.
5. **Look at the art.** Render `assets/icons/path/node_current_base.svg`,
   `assets/icons/cards/card_A_spades.svg` and, with `D19`, `assets/icons/ui/streak_freeze.svg`
   from the files in the browser pane, not from the preview pages. The node shows the grey track
   and the blue disc with no gold arc. Put the freeze icon in front of Zach for approval.
6. **Fix what moved.** Every `tools/build_icons.py` line citation that your edit shifted, in
   `docs/conventions-python.md` and in the standing sections of `HANDOFF.md` and `CLAUDE.md`
   (`grep -nE 'tools/build_icons\.py:[0-9]'`), and the icon count 76, which becomes 77 or 78
   where it is stated. Bump the Python standard's patch version.
7. **Record it.** A new ledger step at the next free number, read from `HANDOFF.md`; the phase 1
   header in `PLAN.md` set to `BUILT <date>, commit pending (Zach)`; this row set to
   `DONE: HANDOFF <n>`.

Ask before building: nothing is expected to need Zach. If any existing SVG other than the 52
card faces changes, stop and ask before you go on.

Not in scope, whoever asks: drawing the ranks as outlines; the preview pages; any app code;
anything under `assets/higgsfield/`; the raw floats of rule G3.

Hand back: the gate `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint
--noout assets/icons/*/*.svg assets/mascots/*/*.svg`, green, with the run lines reading 77 (or 78)
and 18; the output of `git diff --stat -- assets/icons assets/mascots`; what the two renders show;
then the two copyable blocks from Part 11, `git add` with the exact files, then `git commit`
with the same files and a short lowercase message.

### 21. Fix two stale lines: the import fact in the Python standard and a citation in the design

*Opened 2026-10-05, out of board item 4 (ledger step 8): that step found two lines made wrong by
the work around it and left them owed. Zach agreed to this item in chat on 2026-10-05, in answer
to the recommendation "reword line 51 and cite rule I3 in `DESIGN.md:30` without line numbers".
It sits before item 5 because both name `docs/conventions-python.md`; item 5 now waits on it. Do
not confuse this item number with the design decision `D21`: they have nothing to do with each
other.*

**Model: Sonnet 5 (Mechanical). Lane A. Waits on nothing.** Work in the main checkout; no
worktree needed. This item edits two documents and no code. Run it before item 5.

You are picking up felto, an asset pipeline with no app code yet; an app is designed in
`docs/incomplete/app/` and not built. Read `HANDOFF.md` first (step 8 and the code map), then
`docs/conventions-python.md` in full, then `CLAUDE.md`. Session rules: absolute dates only; every
claim carries a `file:line` or the command that produced it; ask Zach in one batch, in chat,
before building on a guess; never run `git commit`, `git push`, `git add -A` or `git add .`.

**Why this exists.** A reader who trusts line 51 of the standard believes the generators import
nothing but `math` and `os`. That has been false since ledger step 3, and it is the exact import
that rule M4 governs. A reader who follows `DESIGN.md:30` to lines 519-537 of the standard lands
six lines before rule I3, because board item 4 added six lines above it. The second line will
break again at the next edit to the standard unless the citation stops using line numbers.

**What is fixed.** Read these before changing anything; do not relitigate them. Line numbers
below were taken on 2026-10-05; re-grep before you trust one.
- Line 51 of `docs/conventions-python.md` reads: "The generators import only `math` and `os`
  (`grep -nE '^(import|from)' tools/*.py`)." It sits under "What the rules rest on", which says
  "These facts were verified 2026-10-04". The grep it cites shows, on 2026-10-05,
  `tools/build_icons.py:14-15` (`math`, `os`) and `:17` (`from common import ...`),
  `tools/build_mascots.py:13` (`os`) and `:15` (`from common import ...`), and
  `tools/common.py:5-6` (`math`, `os`).
- That section holds facts, not rules. No rule's text changes in this item, and rule M4 already
  says what the corrected fact says ("Import the standard library only; import a sibling module
  by its plain name"). Rule IDs never change.
- `docs/incomplete/app/DESIGN.md:30` is row 5 of the ground-truth table in section 1 ("What
  exists, verified 2026-10-05"). It cites `docs/conventions-python.md:519-537` (rule I3). Rule I3
  sat at lines 519-537 before step 8 and sits at 525-543 now
  (`grep -nE '^### I3' docs/conventions-python.md`). Rule IDs never move; lines do.
- The design is frozen: it changes by amendment, never by editing a decision in place
  (`docs/AGENT-PRACTICES.md`, Stage 3). Row 5 is a verified fact in the ground-truth table, not a
  decision, so correcting its citation is not a design change. Rule R5 still applies: the old
  value must stay findable, with the date and the reason.
- On 2026-10-05, `grep -rnE 'conventions-python\.md(:| ?,? ?lines? ?)[0-9]' --include='*.md' .`
  found citations of the standard's lines only in `DESIGN.md:30`, in `HANDOFF.md` step 8 and in
  `PASSOFF.md` prompts. The last two kinds describe the state when written and stay.

Do these, in order:
1. **Run the gate, then `git diff --stat -- assets tools`.** Both must be clean before you edit;
   this item changes no code, but a dirty tree makes the final diff mean nothing. Then run the
   import grep and the I3 grep above, so the text you write carries your own check and its date.
2. **Reword the bullet at line 51 of the standard.** Say what the grep shows now: the generators
   import the standard library and the sibling module `tools/common.py`, and nothing else. A
   suggested form: "The generators import the standard library and the sibling module
   `tools/common.py`, and nothing else (`grep -nE '^(import|from)' tools/*.py`, 2026-10-05)."
   Put the date on the bullet, because the section heading says 2026-10-04. Then run the commands
   behind the other three bullets in that section and list, in your hand-back, any that is wrong;
   do not fix them here (no drive-by fixes).
3. **Change row 5 of `docs/incomplete/app/DESIGN.md` (line 30).** Cite the rule, not lines: for
   example "`docs/conventions-python.md`, rule I3 (cited as lines 519-537 until 2026-10-05; the
   lines moved, the rule ID did not)". Touch no other cell and no other row.
4. **Prove it.** Re-run the citation grep from "What is fixed". It must find no live line
   citation of the standard in `DESIGN.md` or `PLAN.md`. Open `DESIGN.md` at the row and read it
   against `grep -nE '^### I3'`.
5. **Bump the standard to 1.1.3.** Update the version line at the top of the standard (add board
   item 21 and its ledger step to the revision sentence) and the code map entry in `HANDOFF.md`
   (it reads "version 1.1.2 (steps 2 to 4 and 8)"; add this item's step).
6. **Record it.** A new ledger step at the next free number, read from `HANDOFF.md` and not from
   this prompt; set this row to `DONE: HANDOFF <n>`. Do not edit step 8: you did not write it.
   Your step says it closes what step 8 left owed.

Ask before building: nothing is expected to need Zach. If a rule's text would have to change to
match the new bullet, stop and ask; that would make this item bigger than it is.

Not in scope, whoever asks: any change under `tools/` or `assets/`; any rule's text; the C1 counts
of 36 and 21; `CLAUDE.md`; the history inside `HANDOFF.md` steps 3 and 8 and inside the
`PASSOFF.md` prompts; any decision `D1` to `D21` in `DESIGN.md`; line citations in `DESIGN.md` or
`PLAN.md` that point into code under `tools/` (item 5 moves those lines, so a fix now rots).

Hand back: the gate `python3 tools/build_icons.py && python3 tools/build_mascots.py && xmllint
--noout assets/icons/*/*.svg assets/mascots/*/*.svg`, green, with the run lines reading 76 and
18, and `git diff --stat -- assets tools` empty; the new bullet and the new row 5, as written;
the list of other wrong bullets in that section, if any; then the two copyable blocks from
Part 11, `git add` with the exact files (`docs/conventions-python.md`,
`docs/incomplete/app/DESIGN.md`, `HANDOFF.md`, `PASSOFF.md`), then `git commit` with the same
files and a short lowercase message. Documents only: there is nothing to run and no runtime
entry to walk.

### 6 to 20. Prompts written by autopilot, 2026-10-05

*Written 2026-10-05 by the `/autopilot` run (`docs/incomplete/autopilot-2026-10-05/STATE.md`), on Zach's
instruction in chat to keep going until the MVP is met: "write new passoffs and what not until the
mvp is met". Items 6 to 20 share one prompt shape, below; each item's own lines follow it. Every
fact a prompt cites must be re-checked by grep before use: the line numbers move.*

**The shared prompt (read it with the item's own lines).** Work in the main checkout
`/Users/zachshort/Projects/felto`, not a worktree: the art is staged and uncommitted, and a
worktree starts at `HEAD`, so it would lack the art and every earlier phase. Read `HANDOFF.md`
first (the gate, the invariants and the code map are there; do not re-derive them), then
`CLAUDE.md`, then the code standard for the files you touch (`docs/conventions-python.md` for
`.py`, `docs/conventions-typescript.md` for `app/`, once it exists), then `docs/AGENT-PRACTICES.md`
Part 8.1, then `docs/incomplete/app/DESIGN.md` sections 8 to 10 and every decision the phase
cites, then sections 0 and 1 of `docs/incomplete/app/PLAN.md`, then the item's phase in that file.
The phase holds the scope, the subagents, the done-when and the watch-for; follow them. Zach's
answers of 2026-10-05: `D14` to `D21` are all accepted as recommended; `D18` names are Flop (fish),
Kicker (squid), Ace (shark). `DESIGN.md` may still print "Answer: pending"; this paragraph is the
answer. Session rules: absolute dates only; every claim carries a `file:line` or the command that
produced it; grep before you record an absence; never run `git commit`, `git push`, `git add -A`
or `git add .`; use `git -C <path>` and absolute paths, never `cd`.

Under `/autopilot` these overrides hold, and they beat anything in the phase text:
- Do not edit `PASSOFF.md`. Do not add a ledger step to `HANDOFF.md`: report the exact text of the
  step and of any code-map or Known-facts change, and the orchestrator writes it at the next free
  number. You may edit the standing sections of `HANDOFF.md`, your own phase header and `As built:`
  notes in `PLAN.md` and `DESIGN.md`, and append your runtime entries to
  `docs/incomplete/app/RUNTIME-PASS.md`.
- Zach is not at the keyboard. Anything the phase says to show or ask Zach (a render to approve, a
  sound to hear, a copy question) is done as far as you can alone, and listed as owed in the
  report. Never block on it. A decision the phase does not settle: take the recommended option,
  log it as a judgment call with its reversal, and go on.
- A phase that names a subagent: if you have the Agent tool, spawn it as the phase says (its own
  worktree is not possible here, so a read-only subagent only, told never to edit). If you do not
  have the tool, say so and list the review as owed to the orchestrator, which runs it.
- Report: the gates as run with their output, `git status --short` of the files you changed or
  added, what the screenshots or renders show (take them on both simulators where the phase says),
  the text for the ledger step, any number you claimed, every judgment call with its reversal,
  every user-facing string you added, and what was not verified.
- Relay: if you pass roughly two thirds of your budget (more than about 25 files read, or past two
  thirds with substantial work left), STOP and make your final output a standalone pass-off prompt
  for a fresh agent: done, where you stopped and how far, paths, the exact remaining list.

| Item | Phase in `PLAN.md` | Own lines |
|---|---|---|
| 6 | Phase 2 | Writes `docs/conventions-typescript.md` and re-adds two rules to `docs/AGENT-PRACTICES.md`. The sweep subagent reads `~/Projects/ezhomesteading/docs/conventions.md`. The `.gitignore` line for `.claude/worktrees/` is part of it. Nothing under `app/` yet. |
| 7 | Phase 3 | Scaffolds `app/`. Builds and screenshots on the iOS simulator and the `Pixel_9` emulator (`ANDROID_HOME` set, Java 17 if needed; `PLAN.md` section 0 rows 20 and 21). Includes the `D15` to `D17` additions: `expo-audio`, `expo-system-ui`, light and dark tokens, the colour swap, the screen wrapper, the iPad landscape and dark checks. If the native build fails for an environment reason, fix the environment, do not stub the app. The art commit is Zach's; the art files exist on disk, and that is enough. |
| 8 | Phase 4 | Game state and the data module under `app/src/game/` and `app/src/storage/`, with the `D19` streak freeze rules and the dials. Tests are vitest. |
| 9 | Phase 5 | Cards, the evaluator and the content schema. The evaluator is where a silent error lives: test it by enumeration. The plan names one Deep review of it. |
| 10 | Phase 6 | Units 1 and 2 content, 100 written exercises, in `app/src/content/units/`. The plan names a Default review of every concept item. Names use Flop, Kicker and Ace. Added after the Deep review of item 9 (2026-10-05): `outs` exercises never target `one-pair` or `two-pair` (board pairings count as outs); write "with one card to come" in the prompt; a unit file is named for its unit id (`units/hands.ts` holds unit `hands`), is listed in `UNITS` in `app/src/content/catalog.ts` with every lesson of the outline for that unit, and the app reads units only through the catalog (the guard is in `keys.test.ts`). Zach has not read any copy; list every string in the report. |
| 11 | Phase 7 | Units 3 and 4 and the preflop chart. The chart is a strategy claim: the plan names one Deep review of the chart and its keys. Same outs and catalog rules as item 10. |
| 12 | Phase 8 | Tabs, the path and the stat bar, with the node ring drawn over `node_current_base`. Also owed from item 8 (ledger step 15): mount `PlayerProvider` in `app/src/app/_layout.tsx`; write the BD-13 dev route `app/src/app/dev/fixture/[name].tsx`; build the game `PathOutline` from `OUTLINE` in `app/src/content/outline.ts`; replace the temporary `/` redirect in `app/src/app/index.tsx` (it breaks rule U1 until then). The provider and hook have never run on a device: run them. Screenshots on both platforms, light and dark, phone and iPad. |
| 13 | Phase 9 | The lesson: every exercise kind, feedback and finish. From item 10 (ledger step 17): seven-card hand-name exercises say "two hole cards and five on the board" but the data has no marker, so show the last five cards as the board. If it runs long, hand the last two exercise kinds to a pass-off prompt (the phase says so). |
| 14 | Phase 10 | (Item 12's audit: at zero lives the current lesson must not open, since the path draws it as current.) Boss, review, chest and lives, with the `D19` freeze in Profile's shop if the phase places it there. |
| 15 | Phase 11 | Profile, settings, the Sound and Dark-mode-follows-phone switches, and the daily reminder (`expo-notifications`). |
| 16 | Phase 12 | Close out: Also: `app/src/components/lesson/lesson-closed.tsx:49` should use `formatClockTime` from `@/reminder/clock-format` (ledger step 24); and the fix rounds of items 15, 19 and 20 were not seen on a device: list them in RUNTIME-PASS.md. Also from item 12's audit: stat labels say "1 lives" and "1 streak freezes" (use singular forms) and D10's warm word is "hearts"; `route-error.tsx:17` is plain register; the current node's accessibility label gives no progress. reconcile the standard's examples, write `RUNTIME-PASS.md`'s final form, records. Mechanical. It waits on items 5 to 15 and 17 to 20. |
| 17 | Phase 13 | `tools/build_sounds.py` and `assets/sounds/`: six WAV effects from `math`, `struct` and `wave`, deterministic, in the gate. An agent cannot hear: check length, sample rate, peak level and silence at both ends with `wave`, and list "approve by ear" as owed to Zach. |
| 18 | Phase 14 | Random dealers for practice under `app/src/drills/`, checked by seeded tests over thousands of deals. The plan names a Default review. |
| 19 | Phase 15 | The Practice tab (`D21`), reusing the lesson screen. Also fix, since you reuse the run loop (audit of item 14, ledger step 22): two taps on Check inside one render both read `answering` and a wrong answer spends two hearts (`app/src/components/lesson/session-steps.ts:16-23`, `use-lesson-run.ts:25-32`): add a ref guard like `movedOnFrom`, fix the comment at `session-steps.ts:13-15`, and add a test that fails when the order "state moves before effects" is reversed (a `record` or `showWords` that throws, or a call-order record). |
| 20 | Phase 16 | Onboarding and the placement check (`D20`). Also from item 19 (ledger steps 23 to 24): add a BD-13 fixture `all-done` (all four units finished, every Practice kind open) to `app/src/game/fixtures.ts` with its test, so Practice can be seen without the `deal=` link; and the lesson loop's `placeholder-screen.tsx` has no user now (delete it if nothing imports it). From the audit of item 12 (ledger step 19): after placement the path shows three current lessons at once and a faded chest under a complete boss (`app/src/game/path.ts:35-44`, `app/src/components/path/unit-header.tsx:31-35`): settle one rule (the first unfinished lesson of the first unfinished unit is current; a placed-past unit shows its boss complete and its chest per D20) and test it; item 8's game code may be edited for this one change. |

Hand back, for every item: the gate (the Python gate, then the app gate once `app/` exists, in the
form `CLAUDE.md` records), green, and `git diff --stat -- assets tools` showing only what the item
meant to change; then the two copyable blocks, `git add` with the exact files and `git commit` with
the same files and a short lowercase message.

## Items 22 to 33: unit stories and game feel

*Opened 2026-10-05, out of three things Zach asked for after running the development build on his
iPhone: fewer repeated questions, an optional story before each unit, and more animation, colour,
haptics, sound and character (12 Duolingo Chess photos as the reference). Scoped, ratified and
planned in `docs/incomplete/unit-stories/` and `docs/incomplete/game-feel/` (GATE 1 and GATE 2
answered by Zach in chat, 2026-10-05). Zach chose to run the two efforts in parallel: items 22
and 23 and 26 are three lanes (D, E, F) that can start now, each in its own worktree. The three
lanes all add one block to `app/src/config/dials.ts`, under the comments `// unit-stories` and
`// game-feel`; this breaks the board rule that two items naming one file never run at once, so
Zach accepted it on 2026-10-05 and a merge keeps both blocks. Items 24 and 27 to 33 have no prompt
yet: the session that closes the item before each one writes its pass-off prompt (Part 7), from
its phase in the matching `PLAN.md`, with what that session learned.*

### 22. Deal fresh hands in lessons 3 and 5 and in every boss

**Model: Opus 5.5. Lane D. Waits on nothing.** Use its own worktree: items 23 and 26 run beside it.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, TypeScript strict, bun).
Read `HANDOFF.md` first (the build and test commands, the invariants, the code map; do not
re-derive them), then `docs/incomplete/unit-stories/DESIGN.md` (decisions `US-1`, `US-2`, `US-3`)
and `docs/incomplete/unit-stories/PLAN.md` (section 0 and phase 1), then `docs/AGENT-PRACTICES.md`
and `docs/conventions-typescript.md` in full. Session rules, restated: never run `git commit`,
`git push`, `git add -A` or `git add .`; use absolute dates; no em dashes and no contractions in
any document you write; do not fix anything outside this item, note it and raise it; write
`bun run --cwd app <script>`, never `bun --cwd app run <script>`.

**Why this exists.** Zach noticed questions repeating a lot in the early lessons. A lesson plays the
same ten questions in the same order every time, and a boss draws only from questions the player
already answered. He chose to fix it by dealing fresh hands (US-1).

**What is fixed.** Read these before changing anything; do not relitigate them.
- The lesson screen plays the authored lesson as is (`app/src/screens/lesson-screen.tsx:55`). The
  boss draws ten ids from the unit's fifty (`app/src/components/boss/boss-session.ts:18-27`,
  `app/src/game/boss.ts:5-7`).
- Dealers exist: `dealExercise(kind, seed)` and `dealSet` in `app/src/drills/deal.ts:12-34`, for
  `hand-name`, `showdown`, `preflop`, `outs` and `odds`. Their keys are computed and tested. Their ids
  start `practice-`.
- Review and the saved `missedExercises` list work by authored id
  (`app/src/game/session.ts:24-32`, `app/src/components/boss/unit-exercises.ts:12-15`). A dealt id in
  that list is dropped without a message. This is the trap of the item.
- Only `hands-3` ("Name that hand", 8 hand-name) and `hands-5` ("Who wins the pot?", 9 showdown and
  1 hand-name) are dealt. `hands-1` is all concept. `hands-4` stays authored because a random
  showdown rarely ties on a kicker (`app/src/drills/showdown.ts:12-16`). `hands-2` stays authored
  unless step 1 shows its order is not meant.
- Rule B2: `app/src/game/` imports no React Native or Expo module. Rule B3: no rule reads the clock;
  the lesson screen already reads it once, at the edge (`lesson-screen.tsx:48`). No stored-shape
  change, so no stored version bump.

Do these, in order:
1. **Read `hands-2` and confirm its order.** Open `app/src/content/units/hands.ts` from
   `id: "hands-2"` and write down whether its eight hand-name exercises meet the ten hands one at a
   time in a set order. If they do not, stop and ask Zach before putting it in the dial.
2. **Add the dial** `dealtLessons` (`["hands-3", "hands-5"]`) to `app/src/config/dials.ts` as one block
   under the comment `// unit-stories`. Another effort adds a block under `// game-feel`; keep both.
3. **Write `app/src/game/dealt-slots.ts`** with `withDealtSlots(exercises, seed, dealers)`: replace, in
   place, each exercise whose kind is a key of `dealers`; return the rest unchanged; seed each
   replacement from the set seed and its position. The dealers are an argument, so the file imports no
   dealer. Add `isDealtId`. Tests in new files `dealt-slots.test.ts` (length and kind order kept; a
   concept untouched; two seeds differ for `hands-3`; the same seed repeats) and `dealt-missed.test.ts`.
4. **Wire the lesson** in `lesson-screen.tsx`: for a lesson id in `dealtLessons`, play
   `withDealtSlots(lesson.exercises, clockSeed(opened.now), DEALERS)`.
5. **Wire the boss** in `bossAccess`: run `withDealtSlots` over the ten drawn exercises. `drawBoss` is
   unchanged.
6. **Do not remember a dealt miss.** In `recordAnswer` (`session.ts:24-32`), for a dealt id spend the
   life and count the answer but leave `missedExercises` alone. The test: a wrong dealt answer spends a
   life and leaves the list unchanged; a wrong authored answer still adds its id.
7. **Record it.** Read `HANDOFF.md` for the next free step number and append the step; add the new file
   to the code map; add an `As built` note under `D8` in `docs/incomplete/app/DESIGN.md` and under
   `US-1` in the unit-stories design; write this item's runtime entries from `PLAN.md` section 7.

Ask before building: only the `hands-2` question in step 1, if its order is not meant. Both
outcomes are Zach's call, and the answer may be to leave `hands-2` authored.

Not in scope, whoever asks: dealt hands in any lesson but `hands-3` and `hands-5`; a bigger authored
pool per lesson (option 1B); any change to the placement check or to how the review fills; any change
to hearts, XP, streak or the boss pass mark; any story code (item 23); any motion, colour or sound
(items 26 and later).

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the test count; `git diff --stat --
assets/icons assets/mascots assets/sounds` showing nothing; screenshots on the iOS simulator and the
Android emulator of `hands-3` played twice (different cards in the eight drill slots), saying which
claim you hold, "gates green" or "seen running" (R10); then the two copyable blocks, `git add` with the
exact files and `git commit` with the same files and a short lowercase message.

### 23. Build the story engine, the route and the header button

**Model: Opus 5.5. Lane E. Waits on nothing.** Use its own worktree: items 22 and 26 run beside it.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, TypeScript strict, bun, Expo
Router). Read `HANDOFF.md` first, then `docs/incomplete/unit-stories/DESIGN.md` (decisions `US-4` to
`US-8`, and sections 1 and 2) and `docs/incomplete/unit-stories/PLAN.md` (section 0 and phase 2), then
`docs/AGENT-PRACTICES.md` and `docs/conventions-typescript.md` in full. Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates; no em dashes and no
contractions in documents; no drive-by fixes; `bun run --cwd app <script>`, never `bun --cwd app run`.

**Why this exists.** Zach wants an optional, skippable rundown before a unit, as image-and-text slides
you tap through like a Snapchat story: tap the right side to go forward, the left to go back. It
explains the unit very simply, with examples. It must never block a lesson.

**What is fixed.** Read these before changing anything; do not relitigate them.
- One route `story/[unit]` rendering one `StoryScreen`, a thin route (rule U1), registered in
  `app/src/components/root-stack.tsx` with the same options as the sessions:
  `{ presentation: "fullScreenModal", gestureEnabled: false }` (`root-stack.tsx:5`).
- The left 30 percent of the width goes back, the right 70 percent forward (dial `storyBackZone`). A
  back tap on the first slide does nothing. The last slide shows one button, "Back to the path", and
  never starts a lesson. No auto-advance, no hold to pause, no swipe (`US-6`).
- The button on the unit header reads "Learn about {unit title in lower case}", only for a unit that
  has a story (`US-5`); `app/src/components/path/unit-header.tsx:18-30`. It stores nothing. The story
  gives no XP, spends no heart and counts for no streak. The path keeps its seven stops and its tests.
- The host is the fish (`D9`), the voice is warm (`D10`). A slide is a pose, a title, about 30 words and
  optionally a row of cards drawn with `CardRow` (`app/src/components/exercise/card-row.tsx:9-17`).
- Android back closes the story through `useHardwareBack`
  (`app/src/components/lesson/use-hardware-back.ts:5-12`).
- Colours and sizes come from `app/src/theme/tokens.ts`, light and dark (rule U5). The art comes only
  through `app/src/art/` (rule U6). Pure logic goes in files with a colocated test (rule Q1).
- Only the hands story is built in this effort (`US-8`); item 24 writes its real content. Another
  effort, game feel (item 26), is changing the buttons and adding motion at the same time; do not touch
  `app/src/components/lesson/lesson-button.tsx` or `app/src/theme/tokens.ts`.

Do these, in order:
1. **Dials**: `storyBackZone` 0.30, `storyWordsPerSlide` 30, `storySlidesPerUnit` min 6 and max 8, as one
   block under `// unit-stories` in `app/src/config/dials.ts`. Another effort adds a block under
   `// game-feel`; keep both.
2. **Schema and validator** under `app/src/content/stories/`: `Slide`, `Story`, and a validator beside
   `validate.ts` that counts slides and words against the dials and checks that `cards` parse and
   contain no duplicate (`hasDuplicate`, `app/src/content/validate.ts:7`). New test file.
3. **Pure functions, each with its own test file**: `storyTapAction(x, width, zone)` and
   `storyStep(state, event)` (in the style of `runStep`, `app/src/components/lesson/lesson-run.ts`).
   Pin the edges: `x` just under and at 30 percent; first and last slide; never an index out of range.
4. **The screen** `StoryScreen` in `app/src/screens/story-screen.tsx`, with its components under
   `app/src/components/story/`: progress marks across the top, a close control, the mascot, title, body,
   the optional `CardRow`, two `Pressable` zones that call `storyTapAction`. Name its three states
   (rule U4): a unit with no story is drawn like a missing lesson id; there is no loading state because
   the content is bundled; the empty state cannot happen, the validator requires slides.
5. **The route and the button.** Add `app/src/app/story/[unit].tsx` and the stack entry; expose whether a
   unit has a story from `path-view-model.ts`; add the button to `UnitHeader`.
6. **A placeholder story** for `hands` with the minimum slides, only so the route can be run. Item 24
   replaces it.
7. **Record it.** Next free ledger step (read `HANDOFF.md`); code map lines for every new file; runtime
   entries from `PLAN.md` section 7; an `As built` note under `US-4` to `US-6`.

Ask before building: none. If the header button does not fit beside the chest on a small phone, the
fix is yours to choose; record it as a `BD` with its reversal.

Not in scope, whoever asks: the real hands story copy (item 24); stories for the table, preflop and odds
units; a "seen" flag or a changing label (option 2B, which would need stored version 3, and the game
feel effort owns that number); a story node on the path; auto-advance; any change to hearts, XP or the
streak; any new art.

Hand back: the whole-repo gate from `CLAUDE.md`, green; `git diff --stat -- assets/icons assets/mascots
assets/sounds` showing nothing; screenshots on the iOS simulator and the Android emulator, light and
dark, and on a tablet in landscape, of the header with and without a story button and of the first and
last slide, saying "gates green" or "seen running" per item (R10); then the two copyable blocks.

### 24. Write the hands story: six to eight slides that walk a new player through unit 1

**Model: Opus 5.5. Lane E. Waits on item 23 committed in the lane E worktree.** Work in that same
worktree, `.claude/worktrees/lane-e-story-engine` (branch `lane-e-story-engine`): item 23's code is
there and not yet in `main`. Lanes D and F run beside it in their own worktrees.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, TypeScript strict, bun, Expo
Router). Read `HANDOFF.md` first (step 31 is item 23, the code map has the story files), then
`docs/incomplete/unit-stories/DESIGN.md` (US-7 and US-8 with their `As built` notes, and section 6,
question 4) and `docs/incomplete/unit-stories/PLAN.md` (phase 3, and BD-S7 to BD-S13), then
`docs/AGENT-PRACTICES.md` and `docs/conventions-typescript.md` in full. Session rules, restated:
never run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates; no em dashes and no
contractions in documents; no drive-by fixes; `bun run --cwd app <script>`, never
`bun --cwd app run <script>`.

**Why this exists.** Zach wants an optional rundown before a unit, image-and-text slides tapped
through like a phone story, that "talks them through everything with examples and very simply".
Item 23 built the engine and a placeholder. This item writes the real hands story, the first one a
player sees, so it decides whether the feature feels worth tapping.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The placeholder is `app/src/content/stories/hands.ts` (`storyHands`, six slides, `satisfies
  Story`), already listed in `STORIES` in `app/src/content/stories/catalog.ts`. Replace its slides;
  keep the export name and the unit `hands`.
- A slide is `{ pose, title, body, cards?, key? }` (`app/src/content/stories/schema.ts`). `pose` is
  one of the fish's six: `cheer`, `happy`, `sad`, `sleep`, `smug`, `think`. `cards` is one row of
  card codes such as `"As"` or `"Td"`, drawn by `CardRow` with no label; seven cards still fit, but
  2 to 5 read best on a phone. `key` is a `HandCategory` and needs 5 to 7 cards, because
  `evaluate` refuses fewer (`app/src/cards/evaluate.ts`).
- The validator (`content/stories/validate-story.ts`) wants 6 to 8 slides and at most 30 words in a
  body (the title is not counted), and refuses a key without cards, an empty card row and a card
  shown twice. `content/stories/story-catalog.test.ts` already computes every keyed slide with the
  evaluator and fails on a disagreement, and fails if no slide is keyed (BD-S12). Your
  `hands-story.test.ts` pins what is true of this story only, for example that the keyed hands
  climb in strength in the order the slides show them, or that every slide whose title names a
  hand has a key.
- The host is the fish (`D9`), the voice is warm (`D10`), and the copy goes to Zach before it is
  final, in two or three registers (R7, US-7). The three registers already offered for a "Ranks"
  slide are in `DESIGN.md` section 6, question 4.
- Use only terms unit 1 teaches, in the order it teaches them: read the lesson titles in
  `app/src/content/outline.ts` (ranks and suits, the ten hands, naming a hand, kickers, who wins)
  and the prompts in `app/src/content/units/hands.ts`. The last slide shows "Back to the path"
  from the engine; it never starts a lesson (US-6), so its words should not promise one.
- Simulators are shared with other lanes. On 2026-10-05 taps and a lesson link from an unknown
  source landed on lane E's iPhone 17e (step 31). Name every device by its id, never `booted`. Lane
  E's devices: the iPhone 17e simulator `B84A7615-AE2C-48A9-B662-63AEFE9D429F` (install `main`'s
  development build from
  `~/Library/Developer/Xcode/DerivedData/Felto-eebboxkxvbnzxuarrnijdtxzfiyp/Build/Products/Debug-iphonesimulator/Felto.app`),
  the `Medium_Phone_API_36` emulator (install `app/android/app/build/outputs/apk/debug/app-debug.apk`
  from the main checkout), and Metro on port 8084 from the worktree's `app/`. Start the emulator and
  Metro as background commands with the two-hour limit; the 30-minute default kills them.
- Do not touch `app/src/theme/tokens.ts` or `app/src/components/lesson/` (the game-feel lane owns
  them while items 26 to 33 are open, 2026-10-05), and do not change the schema, the validator or the engine.

Do these, in order:
1. **Draft the slides**, 6 to 8, about 30 words each, in the plan's order: the deck and ranks, hole
   cards and the board, best five of seven, the ten hands from high card up with an example row
   for each group, kickers, who wins. Count the words with `wordCount`.
2. **Show Zach the copy before it is final** (R7), in one message: two or three registers (plain,
   warm, terse) for the first slide, one card slide and the last slide, with your recommendation
   marked. Then write the rest in the register he picks.
3. **Key every example** that names a hand, and write `app/src/content/stories/hands-story.test.ts`.
4. **A read-only check** by a Sonnet 5 subagent in its own worktree, with the model passed
   explicitly: every card code in `hands.ts` parses and each keyed category is what the evaluator
   gives. Its output is a list; check its diffstat when it returns (Part 4).
5. **See it running** on the iPhone 17e and the Android emulator, light and dark: the first slide,
   one card slide and the last slide. Also walk the checks step 31 left `open` if the machine
   allows: a phone in landscape, a tablet in landscape (Android `adb shell wm size 2560x1600` and
   `wm density 320`; reset both after), and `felto://story/table` (the not-found view).
6. **Record it.** Next free ledger step (read every worktree's `HANDOFF.md`, as lanes D and F
   take numbers too); a dated `As built` note under US-7; the phase 3 header in `PLAN.md`; this
   row to `DONE`; and the prompt for item 25 from `PLAN.md` phase 4.

Ask before building: which register, in step 2. Also ask before you change anything outside the two
files this item owns, for example if a card row needs a label (that is a schema change, item 23's
file). Both are Zach's calls, and the answer to either may be no.

Not in scope, whoever asks: stories for the table, preflop and odds units (US-8); a "seen" flag or a
changing button label (option 2B); auto-advance; new art or poses; any change to hearts, XP, the
streak or the path; the dealt hands of item 22.

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the test count; `git diff --stat --
assets/icons assets/mascots assets/sounds` showing nothing; screenshots of the first, one card and
the last slide on iOS and Android, saying "gates green" or "seen running" (R10); every new string;
then the two copyable blocks, `git add` with the exact files and `git commit` with the same files
and a short lowercase message, both run from the lane E worktree.

### 25. Close out the unit-stories effort: one record, the index and the runtime entries

**Model: Sonnet 5. Lane E. Waits on items 22 to 24 committed and merged into `main`.** Work in the
main checkout, `/Users/zachshort/Projects/felto`, once Zach has merged the lane D and lane E
branches; no worktree. Written 2026-10-05 by the session that closed item 24 (`HANDOFF.md` step 33).

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, TypeScript strict, bun). This
item writes records only; it changes no code. Read `HANDOFF.md` first (steps 28, 31 and 33 are the
three built phases of this effort), then `docs/incomplete/unit-stories/PLAN.md` (phase 4 and
section 7) and `DESIGN.md` (`US-1` to `US-8` with their `As built` notes), then
`docs/AGENT-PRACTICES.md` Parts 7 and 8.2 and `CLAUDE.md`. Session rules, restated: never run
`git commit`, `git push`, `git add -A` or `git add .`; absolute dates; no em dashes and no
contractions in any document; no drive-by fixes; `bun run --cwd app <script>`, never
`bun --cwd app run <script>`.

**Why this exists.** The unit-stories effort fixed repeated questions by dealing fresh hands (phase
1) and added an optional tap-through story before unit 1 (phases 2 and 3). It was built in two
lanes and two worktrees, so its record is split. This item makes the record one, so that Zach can
walk what only a person can check and the folder can later be archived.

**What is fixed.** Read these before changing anything; do not relitigate them.
- Phase 1 is board item 22, lane D, ledger step 28, written in `.claude/worktrees/lane-d-dealt-hands`.
  Phase 2 is item 23, step 31 (merged into `main` at `06cea5a`). Phase 3 is item 24, step 33. Before
  you trust any of these, open the merged `HANDOFF.md` and read each step: step 28 was not in `main`
  when step 33 was written.
- Ledger numbers on 2026-10-05: `main` held 1 to 27 and 29 to 31 (29 and 30 are game-feel items 26
  and 27), lane D 28, lane F 32 (game-feel item 28), lane E 33. Read every worktree's `HANDOFF.md`
  (`git worktree list`) before you take the next number.
- `PLAN.md` section 7 is the one place for this effort's runtime entries. Steps 31 and 33 say which
  entries were seen running and which are `open`; carry each `open` one forward as written.
- Open findings to carry, not fix: step 31 (a) to (f); step 33's findings (its "Found" paragraph).
  Step 31 (e) left the test counts in `CLAUDE.md` and in the `HANDOFF.md` Environment rows for this
  item, because every parallel lane changes them. `HANDOFF.md` is yours; `CLAUDE.md` is not in this
  item's files (ask, below).
- The design is frozen: add `As built` notes and dated pointers, never edit a decision in place
  (`DESIGN.md` header). The folder stays in `docs/incomplete/` until Zach has walked the runtime
  entries (Part 2.2, Stage 7); do not archive it.

Do these, in order:
1. **Re-verify** (Part 2.4, a resumed effort): `git log --oneline` shows lanes D and E merged; run the
   whole-repo gate from `CLAUDE.md` in `main` and write down its run lines and test count. If the
   gate is red, stop and report; a red gate is not this item's to fix.
2. **Amend the app design**: an `As built` note under `D8` in `docs/incomplete/app/DESIGN.md` for the
   dealt hands (if step 28 already wrote it, check it against the code and add only what is missing),
   and a dated pointer to `US-1` to `US-8` where `D8` and `D9` meet this effort, as section 8 of the
   unit-stories design promises.
3. **Reconcile the index** `docs/README.md`: the unit-stories `PLAN.md` line names `BD-S1` to `BD-S6`
   (it holds `BD-S1` to `BD-S13`) and should say phases 1 to 3 are built; set the checked dates; the
   `HANDOFF.md` Environment test counts get the number from step 1.
4. **Gather the runtime entries** in `PLAN.md` section 7: add any lane D entry that is missing, and
   mark each entry seen (with its step) or `open`. Set the phase 4 header.
5. **Record it.** One ledger step at the next free number; this row to `DONE`. Hand back the three
   blocks of Part 7 (A: a pass-off for whatever Zach decides next, or "none"; B: the runtime entries;
   C: the next model).

Ask before building: whether to update the test count in `CLAUDE.md` (not this item's file; the
game-feel close-out, item 33, may want it too). Zach's call, and the answer may be to leave it to
item 33.

Not in scope, whoever asks: any code; stories for the table, preflop and odds units (`US-8`); the
game-feel documents; archiving the folder; folding the ledger (a separate clean-up); driving a
simulator (nothing here needs one).

Hand back: the whole-repo gate, green, with the test count; `git diff --stat -- assets/icons
assets/mascots assets/sounds` showing nothing; the three blocks of Part 7; then the two copyable
blocks, `git add` with the exact files and `git commit` with the same files and a short lowercase
message.

### 26. Install Reanimated and build the motion module, tokens and the primary button

*`DONE: HANDOFF 29`, 2026-10-05, on branch `game-feel-1` in `.claude/worktrees/game-feel-1`, not
committed. Do not paste this prompt. It reads "Move the Check and Continue call sites"; the build
also moved the feedback sheet's Continue (`docs/incomplete/game-feel/PLAN.md`, BD-G12).*

**Model: Opus 5.5. Lane F. Waits on nothing.** Use its own worktree: items 22 and 23 run beside it.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, React Native 0.86, TypeScript
strict, bun, a development build). Read `HANDOFF.md` first, then `docs/incomplete/game-feel/DESIGN.md`
(decisions `GF-1`, `GF-2`, `GF-4`, `GF-6`, `GF-8`) and `docs/incomplete/game-feel/PLAN.md` (sections 0,
1 and phase 1), then `docs/AGENT-PRACTICES.md` and `docs/conventions-typescript.md` in full. Use the
library docs, not memory, for Reanimated (Context7, `/websites/swmansion_react-native-reanimated`).
Session rules, restated: never run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates;
no em dashes and no contractions in documents; no drive-by fixes; `bun run --cwd app <script>`, never
`bun --cwd app run <script>`.

**Why this exists.** Zach wants the app to feel more like Duolingo: more animation, colour, haptics,
sound and character, with 12 Duolingo Chess photos as the reference. Every screen in the photos has one
full-bleed colour, one raised coloured button and one character. The app today has no animation code,
a 12-colour palette and native buttons that cannot take a raised edge. This item lays the foundation
the other seven phases use. Nothing the player sees changes except the Check and Continue buttons.

**What is fixed.** Read these before changing anything; do not relitigate them.
- Zach chose Reanimated 4 with `react-native-worklets` (`GF-1`), installed with `bunx expo install` so
  the versions match SDK 57, plus one native rebuild. The built-in `Animated` behind the same `motion`
  module is the fallback if the build fails for a reason that is not a typo (BD-G3); stop and ask first.
- Check and Continue become a custom component with a raised bottom edge, a press that sinks it, and
  hooks left as props for a haptic and a sound; switches, pickers and the time dialog stay native
  `@expo/ui` (`GF-2`, amends `D2`). Today they are `app/src/components/lesson/lesson-button.tsx:1-20`.
- The double-press guards stay untouched: `app/src/components/lesson/session-steps.ts:17-27,38-48`. The
  new button calls the same handlers. Their tests must pass unchanged.
- Every motion value is a dial in `app/src/config/dials.ts`, in one block under `// game-feel`, with
  the proposed values of `PLAN.md` section 3 (BD-G1). Another effort adds a block under
  `// unit-stories`; keep both.
- Every colour has a light and a dark value in `app/src/theme/tokens.ts` (rule U5): four unit colours
  and four moment colours (finish, chest, boss pass, boss fail), and the raised-edge tone. A colour copied
  from the art cites its generator line (`tools/common.py`).
- A screen never imports Reanimated directly: the `app/src/motion/` module wraps it (BD-G3). One
  `useReducedMotion` hook is the only place reduced motion is read (BD-G4, `GF-8`).
- No new art, no hand edit of any SVG or of `assets/higgsfield/`, no change to the stored state.
- The development build must be rebuilt: Reanimated is native code, and an old build crashes on launch.

Do these, in order:
1. **Install** with `bunx expo install react-native-reanimated react-native-worklets` from `app/`; check the
   pinned versions and the Babel plugin (`react-native-worklets/plugin`, listed last) against the docs;
   rebuild with `bun run --cwd app ios`, then the Android build (`JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ANDROID_HOME=~/Library/Android/sdk bun run --cwd app android`).
2. **The motion module** under `app/src/motion/`: `use-reduced-motion.ts`, `press-scale.ts`, `bounce.ts`,
   `fade-in.ts`. Tests, in new files, for any pure part.
3. **Tokens and dials** as described above.
4. **The primary button** in `app/src/components/button/primary-button.tsx`: face, raised edge, sink on
   press, disabled and pressed states, label in the type tokens, sized by `useColumnWidth` like
   `LessonButton`.
5. **Move the Check and Continue call sites** to it. Remove `LessonButton` only if no call site is left;
   otherwise leave it (BD-G7).
6. **Register the divergence**: read `docs/conventions-typescript.md` and add the next free `Z` line saying the
   primary buttons are not native (`GF-2`).
7. **Record it.** Next free ledger step (read `HANDOFF.md`); code map lines; a dated pointer under `D2`
   (already there, mark it built); runtime entries from `PLAN.md` section 7.

Ask before building: if the Reanimated build fails, whether to fall back to the built-in `Animated`
(`GF-1`). Both are Zach's call.

Not in scope, whoever asks: any animation on a screen other than the button press; haptic or sound
changes (items 27 and 28); the Haptics switch and any stored-state change (item 27); colour on the path
(item 31); Rive; badges, quests and a speaking mascot (parked, `GF-9`).

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the test count; `git diff --stat --
assets/icons assets/mascots assets/sounds` showing nothing; the app built and launched on the iOS
simulator and the Android emulator with Reanimated linked, with screenshots of the resting and pressed
button in light and dark on each; a line saying whether the press was felt on Zach's phone (you cannot
feel it: say "not felt"); then the two copyable blocks, `git add` with the exact files and `git commit`
with the same files and a short lowercase message.

### 27. Add the haptic vocabulary, the Haptics switch and stored version 3

*`DONE: HANDOFF 30`, 2026-10-05, on branch `game-feel-2` in `.claude/worktrees/game-feel-2`, not
committed. Do not paste this prompt. Step 4 puts `shouldBuzz` in `haptics.ts`; the build put it in
`should-buzz.ts`, because a node test cannot load `expo-haptics` (game-feel `PLAN.md` BD-G15).*

*Written 2026-10-05 by the session that built item 26 (`HANDOFF.md` step 29), from phase 2 of
`docs/incomplete/game-feel/PLAN.md`.*

**Model: Opus 5.5. Lane F. Waits on item 26 (`DONE: HANDOFF 29`).** Use its own worktree. If
Zach has not yet merged branch `game-feel-1` into `main`, make the worktree from that branch
(`git worktree add -b game-feel-2 .claude/worktrees/game-feel-2 game-feel-1`), because `main`
lacks Reanimated, the motion module and the primary button. Items 22 and 23 may run beside it.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, React Native 0.86,
TypeScript strict, bun, a development build). Read `HANDOFF.md` first (the gate, the invariants,
the code map, and two Known facts written by step 29: Reanimated needs a rebuild, and the Metro
cache is shared across checkouts), then `docs/incomplete/game-feel/DESIGN.md` (`GF-3`, `GF-8`, and
the `As built` notes under `GF-1` and `GF-2`) and `docs/incomplete/game-feel/PLAN.md` (sections 0
and 1, including BD-G1 to BD-G14, phase 1's `BUILT` header, and phase 2), then
`docs/AGENT-PRACTICES.md` and `docs/conventions-typescript.md` in full. Session rules, restated:
never run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates; no em dashes and
no contractions in documents; no drive-by fixes, note and raise them; write
`bun run --cwd app <script>`, never `bun --cwd app run <script>`; a change to the stored shape
raises the version, ships its migration and a test that loads the old shape, in the same change.

**Why this exists.** Zach asked for more haptics. On 2026-10-05 the app gives one success or
error buzz on six moments and follows only the phone's own setting. Phase 2 grows that into a small
vocabulary and, because more buzzing needs an off switch in the app, adds the Haptics switch
Zach chose at GATE 1 (`GF-3`). It is the only stored-shape change in the game-feel effort.

**What is fixed.** Read these before changing anything; do not relitigate them.
- `STATE_VERSION` is 2 (`app/src/storage/migrations.ts:6`). Read it there before raising it
  (BD-G2); the unit-stories effort changes no stored shape. The version 1 to 2 step
  (`migrations.ts:11-20`) is the precedent: the new value is written out, not read from a dial,
  and a value that is not the old shape is passed on unchanged so the check fails and the load
  backs it up.
- `Settings` is `{ sound, reminder }` (`app/src/game/player-state.ts:33`), filled in
  `freshState` (`:54`) and checked by `app/src/storage/check-state.ts:38`. Sound is set by
  `app/src/game/settings.ts:5` through `app/src/storage/player-actions.ts:47`, and its switch is
  `app/src/components/profile/settings-section.tsx:27`, wired in `use-profile-controls.ts:16-17`
  and `app/src/screens/profile-screen.tsx:44,49`.
- The six buzzes: `Haptics.notificationAsync` with Success or Error in
  `app/src/feedback/use-answer-feedback.ts:8-26`. `feedbackMoment` (`app/src/feedback/moments.ts:14-19`)
  plays the sound only when Sound is on and always buzzes (BD-19). Every call into `expo-haptics`
  goes through `safely` (`app/src/feedback/safely.ts:4-11`); keep that.
- `PrimaryButton` (`app/src/components/button/primary-button.tsx`) takes `pressHaptic` and
  `pressSound`, each run as the finger goes down. No call site passes either yet. The four call
  sites are `app/src/components/lesson/lesson-run-view.tsx:65-69` and `feedback-sheet.tsx:49`.
- The dials of `PLAN.md` section 3: option select is a selection tick, a button press is a light
  impact. They go in the `// game-feel` block of `app/src/config/dials.ts`, which sits after the
  `// D15` block (BD-G14).
- `expo-haptics` is already a native dependency (`app/package.json`), so this phase needs no
  rebuild of its own. A build made before item 26 still needs one for Reanimated.
- Rule B2: `app/src/game/` imports no React Native or Expo module. `shouldBuzz(setting)` is pure and
  tested in node (BD-G6).

Do these, in order:
1. **Read `STATE_VERSION`** and take the next number (3 if no one has raised it).
2. **Add `settings.haptics`**, default `true`: the type and `freshState`, the shape check, and the
   migration from 2 that writes `haptics: true` into every saved player and keeps every other
   field. A new test file loads a version 2 save and gets version 3 with `haptics: true`, keeps a
   version 2 save's extra fields, and still backs up a value that is not a player (rule Q2).
3. **The action**: `setHaptics` in `app/src/game/settings.ts` and in `player-actions.ts`, beside
   `setSound`.
4. **The vocabulary** in `app/src/feedback/haptics.ts` (BD-G6): `selection`, `lightImpact`,
   `mediumImpact`, `success`, `rigid`, each a named moment, each call inside `safely`, plus the pure
   `shouldBuzz(setting)` with its own test file.
5. **Connect the six existing moments** so the switch silences them: `feedbackMoment` buzzes only
   when `shouldBuzz` says so. Adjust `moments.test.ts` where the old rule (always buzz) is pinned.
6. **The press haptic**: pass a light impact, through the setting, to `pressHaptic` at the four
   `PrimaryButton` call sites. The option-select tick is phase 4's (item 29), not this one.
7. **The switch** in Profile beside Sound: a native `Switch` (switches stay native, `GF-2`), with a
   label and one warm help line. Ask Zach for the words first (below).
8. **Record it.** Next free ledger step (read `HANDOFF.md`; lanes D and E may also have taken
   one); code map lines; a dated pointer under BD-19 in `docs/incomplete/app/PLAN.md` and a "built"
   line under the amendment at `docs/incomplete/app/DESIGN.md` `D15`; an `As built` note under
   `GF-3`; phase 2's `BUILT` header in the game-feel `PLAN.md`; the runtime entries of `PLAN.md`
   section 7 for the switch and the old save; and item 28's pass-off prompt, from phase 3.

Ask before building, in one batch: the switch's label and help line, in three registers (plain,
warm, terse), because the copy is not settled (R7); for example "Haptics" with "Feel a tap when
you answer and press." (plain), "Haptics" with "Little taps that cheer you on." (warm), or
"Vibration" with no help line (terse). The answer may be none of these.

Not in scope, whoever asks: new sounds and the press sound (item 28); the option-select tick, the
answer-loop motion and the heart-lost buzz (item 29); any change to the Sound switch's behaviour;
the other `LessonButton` call sites (items 30 and 32); badges, quests and a speaking mascot
(`GF-9`).

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the test count; `git diff --stat --
assets/icons assets/mascots assets/sounds` showing nothing; the test that loads a version 2 save,
named; screenshots of Profile with the switch on and off, light and dark, on the iOS simulator and
the Android emulator; a line saying the buzzes were "not felt" (an agent cannot feel one; Zach
checks them on his phone); then the two copyable blocks, `git add` with the exact files and
`git commit` with the same files and a short lowercase message.

### 28. Add six sound effects from the generator, and the press sound

*`DONE: HANDOFF 32`, 2026-10-05, on branch `game-feel-3` in `.claude/worktrees/game-feel-3`, not
committed. Do not paste this prompt. The worktree was made from `main` at `4b592b9`, because Zach
had merged `game-feel-2` by then. `effects.ts` did not change; the press sound added
`app/src/feedback/use-sound.ts`, `sound-switch.ts` and its test (game-feel `PLAN.md` BD-G20), and
the moved citations touched `docs/conventions-python.md` (1.2.1).*

*Written 2026-10-05 by the session that built item 27 (`HANDOFF.md` step 30), from phase 3 of
`docs/incomplete/game-feel/PLAN.md`.*

**Model: Opus 5.5. Lane F. Waits on item 27 (`DONE: HANDOFF 30`).** Use its own worktree. If Zach
has not yet merged branch `game-feel-2` into `main`, make the worktree from that branch
(`git worktree add -b game-feel-3 .claude/worktrees/game-feel-3 game-feel-2`), because `main`
lacks Reanimated, the primary button and the Haptics switch. Items 22 and 23 may run beside it.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, React Native 0.86,
TypeScript strict, bun, a development build) whose art and sound come from Python generators in
`tools/`. Read `HANDOFF.md` first (the gate, the invariants, the code map, and the Known facts on
the shared Metro cache, the simulator tool and the read-only emulator), then
`docs/incomplete/game-feel/DESIGN.md` (`GF-5`, and the `As built` notes under `GF-1` to `GF-3`) and
`docs/incomplete/game-feel/PLAN.md` (sections 0, 1 and 3, BD-G1 to BD-G18, phase 2's `BUILT`
header, and phase 3), then `docs/AGENT-PRACTICES.md`, `docs/conventions-python.md` and
`docs/conventions-typescript.md` in full. Session rules, restated: never run `git commit`,
`git push`, `git add -A` or `git add .`; absolute dates; no em dashes and no contractions in
documents; no drive-by fixes, note and raise them; write `bun run --cwd app <script>`, never
`bun --cwd app run <script>`; never hand-edit a file under `assets/`, change the generator and run it.

**Why this exists.** Zach asked for more sounds. On 2026-10-05 the app has six effects, each for an
answer or an ending (`D15`), and nothing sounds when a button is pressed, an option is chosen, a
heart is lost or XP comes in. `GF-5` adds six more from the same generator, and item 27 left the
primary button's `pressSound` prop waiting for one of them.

**What is fixed.** Read these before changing anything; do not relitigate them.
- `tools/build_sounds.py` (162 lines) is standard library only (`math`, `os`, `struct`, `wave`) and
  deterministic. Each effect is a function that fills a buffer with `note(...)` and returns
  `to_frames(buf, peak)` (for example `chest_open`, `:125-130`); the `SOUNDS` table (`:133-140`)
  lists them, and `main()` (`:154-158`) prints a count taken from its writes, so a skipped write
  shows as a short count. Its docstring gives each effect's pitches, timing and peak (`:1-30`).
- `app/src/art/sounds.ts` is the only WAV importer (rule U6): the `Effect` union (`:10-16`) and
  `SOUND_SOURCES` (`:18-25`). `app/src/feedback/effects.ts` makes one player per key of
  `SOUND_SOURCES` (`:14-21`), so a new key gets its player with no other change there.
- The Sound switch gates the six moments in `app/src/feedback/moments.ts`; `playEffect` itself
  reads no setting. The precedent for a gated call from a screen is item 27's `useHaptics()`
  (`app/src/feedback/use-haptics.ts`), which reads the setting through `usePlayer()`.
- `PrimaryButton` runs `pressSound` as the finger goes down (`app/src/components/button/primary-button.tsx:27-31`).
  The four call sites already pass `pressHaptic`: `app/src/components/lesson/lesson-run-view.tsx`
  (Check, the finish's Continue, the closed-session Continue) and `feedback-sheet.tsx` (Continue).
- The dial of `PLAN.md` section 3 is a sound length ceiling of 0.6 s for the new effects. The `D15`
  block of `app/src/config/dials.ts` holds `soundEffects: 6` and `soundMaxSeconds: 1`, and no code
  reads either (`grep -rn "soundEffects\|soundMaxSeconds" app/src tools`, 2026-10-05). The generator
  cannot read `dials.ts`.
- `GF-5`'s list to choose from: tap, option select, node press, card slide, XP tick, streak up,
  heart lost, reward claim, sparkle, perfect. The plan's default if Zach picks none: tap, option
  select, heart lost, XP tick, reward claim, sparkle.
- An agent cannot hear. Each sound is proven only when Zach plays it
  (`afplay assets/sounds/<name>.wav`) and approves it (`CLAUDE.md`, "What the gates do not prove").

Do these, in order:
1. **Ask Zach for the six** (below) before writing any generator code.
2. **Extend the generator** with one function per effect, each no longer than 0.6 s, and add each to
   `SOUNDS`; keep the six old functions byte for byte. Describe each new one in the docstring as the
   old ones are. Decide where the 0.6 s ceiling lives (a generator constant, a check, or both) and
   record it as a `BD` in the game-feel `PLAN.md` with its reversal. Run `python3 tools/build_sounds.py`:
   the run line must say 12.
3. **Check the old six did not move**: `git diff --stat -- assets/sounds` lists only the six new files.
4. **Register them** in `app/src/art/sounds.ts` only, with `@art/sounds/<name>.wav` imports, and add
   each name to `Effect`.
5. **The press sound**: if the six include tap, pass it, through the Sound setting, to `pressSound`
   at the four call sites, the way item 27 passed `pressHaptic`. Any other new sound is wired by the
   phase that owns its moment (option select and heart lost are item 29's); register it only.
6. **Counts**: the "6 WAV files" in `CLAUDE.md` (Directory map, and the run-line note under
   Commands) and in `HANDOFF.md` (the code map line for `tools/build_sounds.py`) become 12, in the
   same change.
7. **Record it.** Next free ledger step (read `HANDOFF.md`; lanes D and E may also have taken one);
   code map lines; an `As built` note under `GF-5`; a "built" line under the `D15` amendment in
   `docs/incomplete/app/DESIGN.md`; phase 3's `BUILT` header; runtime entries; item 29's pass-off
   prompt, from phase 4.

Ask before building, in one batch: which six effects (the plan's default above stands if Zach picks
none), and, for each, one line on how it should feel (for example "tap: short, dry, low"), because
the generator turns that line into pitches and timing. Both are Zach's calls.

Not in scope, whoever asks: wiring option select, heart lost or any answer-loop sound into a screen
(item 29); the finish, chest and boss screens (item 30); the path (item 31); recorded or licensed
sounds (`GF-5` chose the generator); music; any change to the six old effects or to the Sound switch.

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the run lines (78, 18 and 12) and the
test count; `git diff --stat -- assets/icons assets/mascots` empty and `git diff --stat --
assets/sounds` showing only the six new files; the twelve `afplay` commands for Zach, one per line;
each new sound marked "not heard" until Zach approves it; if the press sound is wired, a screenshot
of a lesson on the iOS simulator and the Android emulator and the line "not heard"; then the two
copyable blocks, `git add` with the exact files and `git commit` with the same files and a short
lowercase message.

### 29. Bring the answer loop to life: choose, check, right, wrong and the sheet

*Written 2026-10-05 by the session that built item 28 (`HANDOFF.md` step 32), from phase 4 of
`docs/incomplete/game-feel/PLAN.md`.*

**Model: Opus 5.5. Lane F. Waits on item 28 (`DONE: HANDOFF 32`).** Use its own worktree. If Zach
has not yet merged branch `game-feel-3` into `main`, make the worktree from that branch
(`git worktree add -b game-feel-4 .claude/worktrees/game-feel-4 game-feel-3`), because `main`
lacks the six new sounds and `useSound()`; if he has, make it from `main`. On 2026-10-05 a session
that merged worktrees removed lane F's worktree while it was still clean (`HANDOFF.md`, Known
facts), so check `git worktree list` before each long step until the first edit lands.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, React Native 0.86,
TypeScript strict, bun, a development build) whose art and sound come from Python generators in
`tools/`. Read `HANDOFF.md` first (the gate, the invariants, the code map, and the Known facts on
the shared Metro cache, the simulator tool, the read-only emulator and the removed worktree), then
`docs/incomplete/game-feel/DESIGN.md` (`GF-3` to `GF-8`, with the `As built` notes under `GF-1`,
`GF-2`, `GF-3` and `GF-5`) and `docs/incomplete/game-feel/PLAN.md` (sections 0, 1 and 3, BD-G1 to
BD-G20, the `BUILT` headers of phases 1 to 3, and phase 4), then `docs/AGENT-PRACTICES.md` and
`docs/conventions-typescript.md` in full. Session rules, restated: never run `git commit`,
`git push`, `git add -A` or `git add .`; absolute dates; no em dashes and no contractions in
documents; no drive-by fixes, note and raise them; write `bun run --cwd app <script>`, never
`bun --cwd app run <script>`; never hand-edit a file under `assets/`.

**Why this exists.** Zach asked for more animation, colour, haptics, sound and character, with
Duolingo Chess as the reference. The answer loop (choose, Check, right or wrong, the sheet,
Continue) is where he spends most of his time (`GF-7`). Phases 1 to 3 built the parts: the motion
module, the raised button, the haptic vocabulary with its switch, and the sounds. This phase puts
them on the loop.

**What is fixed.** Read these before changing anything; do not relitigate them.
- Motion goes through `app/src/motion/` only (BD-G3); `motion-boundary.test.ts` fails if any other
  file imports Reanimated or worklets. It holds `useBounce` and `useFadeIn`, which no screen has
  used yet, so this phase is the first to run them; there is no shake or tilt hook yet. Every
  animation passes `ReduceMotion.Never` and asks `motionAllowed(kind, reduced)` instead (BD-G10);
  `reducedMotionSkips` in `app/src/config/dials.ts` lists bounce, shake, tilt, pulse, bob and
  particles. Every value is a dial in the `// game-feel` block (BD-G1): `bounceScale`, `bounceMs`,
  `shakeDistance`, `shakeSwings`, `shakeMs`, `sheetRiseMs`.
- A touch is `useHaptics()` and a name from the vocabulary (`app/src/feedback/haptics.ts`); the dial
  `selectHaptic` (`"selection"`) is read by no code yet. A sound is `useSound()` and a name from
  `Effect` (`app/src/feedback/use-sound.ts`, BD-G20); `option_select` and `heart_lost` are
  registered in `app/src/art/sounds.ts` and played nowhere yet. `heart_lost` starts a major third
  under `answer_wrong`, so the two may play together (`tools/build_sounds.py` docstring).
- The six answer and ending moments still buzz with `Haptics.notificationAsync` in
  `app/src/feedback/use-answer-feedback.ts`, gated in `moments.ts`; the plan moves the wrong answer
  to the rigid tap, which can route the six through the vocabulary and leave `haptics.ts` the one
  importer of `expo-haptics` (step 30, finding (b)).
- The choice rows are React Native `Pressable`s (`app/src/components/exercise/choice-list.tsx:39`),
  so motion can reach them. The feedback sheet is the native `@expo/ui` `BottomSheet`
  (`app/src/components/lesson/feedback-sheet.tsx`) and the progress bar is a native platform pair
  (`lesson-progress.ios.tsx`, `lesson-progress.android.tsx`); both are native by `D2`.
- The double-press guards are `checkedFor` and `movedOnFrom` in
  `app/src/components/lesson/session-steps.ts:19-21,40-42`; `lesson-run.test.ts`,
  `session-steps.test.ts` and `session-order.test.ts` must pass untouched.
- Four unit colours and the right and wrong colours are tokens with light and dark values
  (`app/src/theme/tokens.ts`, `unitHands` to `unitOdds`, `right`, `rightSoft`, `wrong`,
  `wrongSoft`).
- Open findings that land here: the Check button was once drawn sunk after the lesson moved on
  (steps 29 and 30, finding (a)); on Android the sheet's Continue sits about 14 dp above the
  gesture bar (step 29, finding (b)).

Do these, in order:
1. **Choosing an option**: the selection tick and `option_select` through the switches, and the
   chosen row lifts and takes a colour (the answer to the second question below).
2. **Check**: a right answer bounces the row and flashes the right colour, and the host bounces
   (`GF-6`); a wrong answer shakes the row, the host tilts, and the heart in the header drops with
   a short animation and `heart_lost`. A new shake or tilt hook goes in `app/src/motion/`, with any
   pure part tested in a new file (rule Q1). A shake must not move the tap target from under a
   finger.
3. **The sheet and the progress bar**, as Zach answers the first question below.
4. **Reduced motion**: bounce, shake and tilt are skipped; colour and fades stay (`GF-8`).
5. **Record it**: the next free ledger step (read `HANDOFF.md`; other lanes may have taken one),
   code map lines, `As built` notes under the `GF` decisions this touches, phase 4's `BUILT` header
   with any `BD`, runtime entries, and item 30's pass-off prompt, from phase 5.

Ask before building, in one batch: (1) the sheet and the progress bar are native by `D2`, and a
native sheet rises with its own motion, not a spring of ours; keep them native, or replace them
with custom views as `GF-2` did for the buttons (a dated amendment of `D2`)? (2) which colour the
chosen row takes in a session that is not one unit's (a practice set mixes kinds, the placement
check mixes units 1 and 2). Both are Zach's calls, and the answer to either may be no.

Not in scope, whoever asks: the finish, chest and boss screens (item 30); the path, node presses
and header counters outside the lesson (item 31); Learn, Profile and mascot idle life (item 32);
new sounds or changes to the twelve; the other `LessonButton` call sites; badges, quests and a
speaking mascot (`GF-9`).

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the run lines (78, 18 and 12) and the
test count; `git diff --stat -- assets/icons assets/mascots assets/sounds` empty; the three guard
test files unchanged; screenshots of the chosen, right, wrong and sheet states on the iOS simulator
and the Android emulator, light and dark; the lines "not felt" and "not heard"; then the two
copyable blocks, `git add` with the exact files and `git commit` with the same files and a short
lowercase message.

### 30. Celebrate the finish, chest and boss screens, with the chest's tap reveal and a warm word from the mascot

*Written 2026-10-05 by the board writer of `HANDOFF.md` step 39, from phase 5 of
`docs/incomplete/game-feel/PLAN.md` and `GF-10` to `GF-17` of its design, section 9. Item 29's
builder wrote a narrower prompt for this item into its report (step 37); this one replaces it.*

**Model: Opus 5.5. Lane F. Waits on items 46, 48 and 50 (all `DONE`).** Work in a worktree of your
own, made from `main` after those three are merged (`docs/AGENT-PRACTICES.md` Part 6, the
fresh-checkout recipe). Use item 47 (chimes, built 2026-10-05) and item 49 (Lottie) if they are
merged when you start; do not wait for either.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts",
and the ledger steps of items 46, 48 and 50), then `docs/AGENT-PRACTICES.md`, then
`docs/conventions-typescript.md` in full, then `docs/incomplete/game-feel/DESIGN.md` sections 8 and
9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3, phase 5 and section 8. Session rules,
restated: never run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no
em dashes, no contractions and no banned AI words in any document; no drive-by fixes, note them and
raise them; write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit
an SVG under `assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or
`assets/higgsfield-chest/` (reference art, kept as received); never download a file without Zach's
yes.

**Why this exists.** The end of a lesson, a boss and a chest is the reward, and today it is plain
text on a white page. Zach wants it to feel like Duolingo Chess: the screen fills with colour,
numbers roll up, a burst plays, and a character says something warm to you. A friend who saw the
app asked that it "tell you its proud of you" when you finish a stage (`DESIGN.md` 9.1, photo
2872). Zach also chose four chest tiers, decided before the chest opens and revealed over at least
three taps (`GF-13`). Phase 5 of the plan is the base; the second pass adds the kit, the tier art,
the tier rule and the reveal.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The lesson finish is `LessonFinish` (`app/src/components/lesson/lesson-finish.tsx:24-41`): the
  rigged Flop (`FlopRive`, `:29`, which darts on a perfect score, board item 34), a title, a line
  that already says the fish "is proud of you" (`:32`), `LoganLine` (`:44-48`, the loving line of
  Logan Mode, `app/src/components/lesson/logan-line.ts:4`, off by default,
  `app/src/game/player-state.ts:33-35`) and two `Reward` chips (`:51-60`). `Reward` is also drawn
  by `app/src/components/review/review-finish.tsx:4` and
  `app/src/components/practice/practice-finish.tsx:4`; a change to it reaches those two screens,
  which this item does not own, so check them in the screenshots.
- The boss finish is `BossFinish` (`app/src/components/boss/boss-finish.tsx:23-40`): the shark sad
  on a pass and smug on a loss (`:29`), copy in `bossFinishCopy` (`:42-52`).
- The chest today: `ChestScreen` (`app/src/screens/chest-screen.tsx:15-39`) has one native
  `LessonButton`, "Open the chest" (`:30`), whose press calls `actions.openChest` and
  `feedback.chestOpen` (`:23-27`); `ChestView` (`app/src/components/chest/chest-view.tsx:21-38`)
  swaps the chest for a gem; its copy is `chestCopy` (`:40-51`); `chestMoment`
  (`app/src/components/chest/chest-moment.ts:10-15`) gives `missing`, `closed`, `ready`,
  `just-opened` and `opened`.
- The moment colours are tokens with a light and a dark value: `momentFinish`, `momentChest`,
  `momentBossPass`, `momentBossFail` (`app/src/theme/tokens.ts:33-36`, `:71-74`, `:107-110`). The
  four moments buzz and play through `useAnswerFeedback`
  (`app/src/feedback/use-answer-feedback.ts:20-28`); a boss fail gives the rigid tap (BD-G25), an
  open call for Zach below.
- `particleCount` (24) and `particleMs` (900) are dials read by no code yet
  (`app/src/config/dials.ts:56-57`); `reducedMotionSkips` (`:60`) lists `particles`. A new value
  goes in the block `// game-feel second pass` that item 46 opened (BD-G1).
- The kit of item 46 lives in `app/src/components/kit/`: `GameText`, `RollingNumber`, `Bubble`
  (with its `talking` callback), `Sparkles` (ambient and a one-shot burst), `Tag`, `Popover`,
  `GameSheet`, `GameDialog`. Read its ledger step for the exact names and props, and never build a
  second one of any piece.
- Item 48 drew eight chests, drawn by name through `Art`: `chest`, `chest_open`, `chest_rare`,
  `chest_rare_open`, `chest_mythic`, `chest_mythic_open`, `chest_legendary`,
  `chest_legendary_open`. Item 50 wrote the rule: a chest's tier and its reveal plan (which taps
  upgrade, which tap opens), pure and seeded, fixed before the chest opens, with gems by tier as
  dials. This screen draws what the plan says and decides nothing.
- Item 49, if merged, plays Lottie bursts, confetti and gem fly-ups through one player in
  `app/src/art/`; otherwise the kit's burst stands in. Item 47 kept the twelve sound names, so no
  code changes for the chimes.
- Reduced motion (`GF-8`): no burst, sparkle, bounce or shake; colour, fades and the final numbers
  stay. Item 57 will later drive a Rive mouth from the `Bubble`'s `talking` callback, so wire that
  callback to the mascot's bob now and keep it reachable.
- `GF-13` carries a condition: nothing in felto sells gems or chests. Nothing here may lead to a
  purchase.

Do these, in order:
1. **Full-bleed colour by moment** (phase 5, step 1): finish green, chest gold, boss pass purple,
   boss fail quiet, from the moment tokens, with text that keeps its contrast in light and dark.
   If a full-bleed background needs a change outside the files this item owns (`LessonFrame`, the
   route), stop and ask.
2. **The finishes**: titles in `GameText`; XP and the streak as `RollingNumber`s that roll from the
   old value to the new one (the state is written before the roll starts, so a screen closed early
   still keeps the right number, phase 5 "Watch for"); one burst, once, that never loops.
3. **The warm line**: on each finish the mascot says one line in a `Bubble`, in the warm register
   of `D10`, chosen by a pure function in a new file beside `lesson-finish.tsx`, with its test
   (rule Q1): a perfect lesson, a lesson with mistakes, a boss won, a boss lost. At least one line
   says the mascot is proud of you (`GF-11`, the friend's ask). Logan Mode's line stays as it is.
4. **The chest tap reveal** (`GF-13`): the ready chest starts as the common closed chest. Each tap
   shakes it (an inner view moves, so the tap target stays still, as item 29 did for the rows,
   `HANDOFF.md` step 37). On the taps the plan names it flashes and becomes the next tier's closed
   chest, with a `Tag` naming the tier (Rare, Mythic, Legendary). The tap the plan names last
   opens it: the open chest of the final tier, the tier's gems rolling up, `reward_claim`, and a
   gem fly-up if item 49 is merged. `openChest` runs once, on the opening tap, never before. A
   screen reader hears each upgrade and the result. Under reduced motion the tier still changes on
   the same taps, with no shake and no flash.
5. **The boss**: a pass has confetti; a loss does not celebrate (phase 5, step 4).
6. **The chest screen's two buttons** become `PrimaryButton`s (`chest-screen.tsx:28-33`); every
   other `LessonButton` belongs to item 32.
7. **Record it**: the next free ledger step (read the number from `HANDOFF.md`; other lanes take
   numbers too), code map lines, phase 5's `BUILT` header in `PLAN.md` with your build calls as the
   next free `BD-G` numbers, `As built` notes under `GF-11`, `GF-13`, `GF-16` and `GF-17`, the
   runtime entries of `PLAN.md` section 8 marked seen or `open`, row 30 `DONE: HANDOFF n`, and item
   31's prompt checked against what you learned.

Ask before building, in one batch: (a) BD-G25 gives a boss loss the rigid tap; keep it, or a
softer touch? (b) the warm lines: show Zach every line before it is final (R7). Both are his calls,
and the answer to either may be no.

Not in scope, whoever asks: the tier rule, the odds and the gems (item 50); the chest art (item
48); any Rive rig (items 53 to 57); the review and practice finishes beyond the shared `Reward`;
the path (item 31); every `LessonButton` outside `chest-screen.tsx` (item 32); Logan Mode's line
or switch; any rule for hearts, XP or the streak; anything that sells.

Hand back: the whole-repo gate from `CLAUDE.md`, green, with the run lines and the test count;
`git diff --stat -- assets/icons assets/mascots assets/sounds` empty; screenshots on the iOS
simulator and the Android emulator, light and dark, of the lesson finish (perfect and not), the
boss won and lost, and the chest at each step of one reveal, each marked "seen running" or "gates
green" (R10); the reduced-motion chest; the list of copy lines added; the lines "not felt" and "not
heard"; then the two copyable blocks, `git add -N` first for new files, `git add` with the exact
files and `git commit` with the same files and a short lowercase message.

### 31. Bring the path to life: node popovers, mascots beside the path, unit colours and rolling counters

*Written 2026-10-05 by the board writer of `HANDOFF.md` step 39, from phase 6 of
`docs/incomplete/game-feel/PLAN.md` and `GF-10` to `GF-17`.*

**Model: Opus 5.5. Lane F. Waits on item 30 (`DONE`).** Work in a worktree of your own, made from
`main` after item 30 is merged.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts",
and the ledger steps of items 30, 46, 48 and 50), then `docs/AGENT-PRACTICES.md`, then
`docs/conventions-typescript.md` in full (and `docs/conventions-python.md` if the node decision
touches the generator), then `docs/incomplete/game-feel/DESIGN.md` sections 8 and 9 and `PLAN.md`
sections 1 to 3, phase 6 and section 8. Session rules, restated: never run `git commit`,
`git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no contractions and no
banned AI words in any document; no drive-by fixes, note them and raise them; write
`bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`, and never trust a preview page as a picture of them; never
touch `assets/higgsfield/` or `assets/higgsfield-chest/`; never download a file without Zach's yes.

**Why this exists.** The path is the first screen Zach sees each day. The Duolingo Chess photos he
chose show what he wants it to be (`~/Downloads/IMG_2859.HEIC`, `IMG_2860.HEIC`, `IMG_2864.HEIC`;
convert a copy with `sips`): nodes in the unit's colour, big characters standing beside the path,
a popover on a tapped node with the lesson's name and a raised START button, chests along the way,
and counters that tick. Phase 6 of the plan is the base; `GF-11`, `GF-12`, `GF-16` and `GF-17`
add the rest.

**What is fixed.** Read these before changing anything; do not relitigate them.
- `LearnPath` (`app/src/components/path/learn-path.tsx:12-25`) draws, per unit, a `UnitHeader` and
  then its stops. `PathStopView` (`app/src/components/path/path-stop-view.tsx:22-49`) is a
  `Pressable` that swings by `sin(index × 0.9)` (`:20`, `:25`) and, on a tap, pushes the stop's
  route at once (`:33-36`); `stopRoute` reads the time at the tap (BD-12), so a heart that came back
  counts. `PathNodeArt` draws the node (`app/src/art/path-node-art.tsx`). The view model is
  `PathStop` and `PathUnit` (`app/src/components/path/path-view-model.ts:13`, `:20`).
- `UnitHeader` (`app/src/components/path/unit-header.tsx:21-49`) draws "Unit n", the title, the
  placed line, the story button and the chest (`Art` named `chest`, `:45`), faded until the boss
  is passed, and opens the chest screen when it is ready (`:27-28`).
- `PathGreeting` (`app/src/components/path/path-greeting.tsx:16-32`): the fish sleeps or is happy,
  with three lines in the warm register (`:16-20`).
- `StatBar` (`app/src/components/stat-bar.tsx:16-33`) shows streak, freezes, XP, lives and gems;
  the Learn screen draws it (`app/src/screens/learn-screen.tsx:19`), and that screen is item 32's.
- Phase 6, step 1 is a decision before any art: colour the nodes through the import swap table
  (`app/src/art/colour-swap.json`) or through a generator change; prefer the swap (`PLAN.md`
  phase 6). Write it as a `BD` first.
- The kit of item 46 (`Popover`, `GameText`, `Bubble`, `Sparkles`, `RollingNumber`, `Tag`), the
  chest art of item 48 and the tier rule of item 50 are built; read their ledger steps. The
  press haptic and sound go through `useHaptics` and `useSound` with the dials `pressHaptic` and
  `pressSound` (BD-G18, BD-G20).
- `GF-12`: mascots stand beside the path between nodes, alternating sides, in a muted version of
  the unit colour, using the 18 existing poses until the rigs land. No muted art exists. Muting
  through the app (an opacity over the unit's soft colour, or a tint) needs no new file; a muted
  variant from `tools/build_mascots.py` is outside this item's files, so stop and ask before it.

Do these, in order:
1. **The node colour decision** (phase 6, step 1), recorded as a `BD` with its reversal.
2. **Unit banners and nodes**: the unit title in `GameText` on a band of the unit colour; nodes in
   the unit colour; a node press that sinks, with the press haptic and sound; the current node
   pulses and twinkles with ambient `Sparkles` (reduced motion: neither).
3. **The node popover**: a tap on an open node opens a `Popover` anchored to it, in the unit
   colour, with the lesson's title, "Lesson n of m" (a pure function with its test if the view
   model lacks the numbers), and a raised START button showing the XP the lesson can give (from
   the dials) that does what the tap does today (`stopRoute`, read at the press). A locked node's
   popover says what opens it and has no button; a boss node names the boss. A tap outside closes
   it, and a screen reader treats it as modal while it is open.
4. **Mascots beside the path** (`GF-12`): at least one per unit, between nodes, on the side the
   path swings away from, muted to the unit colour, decorative for screen readers, never over a
   node's tap target.
5. **The greeting**: the fish says the greeting in a `Bubble` (`GF-11`), with a greeting bounce,
   and points the player at the next lesson. Keep the three lines or offer warmer ones; list every
   line.
6. **The counters**: each `StatBar` number rolls with `RollingNumber` when it changes and gives a
   small tick (phase 6, step 3; reduced motion: the number changes, nothing moves).
7. **The chest stop**: a closed or ready chest draws as the common closed chest, so the path never
   gives away a tier before the taps reveal it; an opened chest draws the open chest of the tier it
   gave (item 50's rule computes it from the seed); a ready chest wiggles and sparkles.
8. **Record it**: as for item 30, with phase 6's `BUILT` header, `As built` notes under `GF-4` and
   `GF-12`, row 31 `DONE: HANDOFF n`, and item 32's prompt checked against what you learned.

Ask before building, in one batch: (a) if the swap table cannot carry a node's shading, the
generator change (outside this item's files unless Zach says yes); (b) whether a ready chest on the
path may show its tier, which this prompt says no to so the reveal stays a surprise; (c) the
greeting and popover lines (R7). All three are his calls, and any answer may be no.

Not in scope, whoever asks: `learn-screen.tsx`, the story button and Profile (item 32); the chest
screen (item 30); the tier rule (item 50); the tab bar (item 52); any Rive rig (item 57); content.

Hand back: the whole-repo gate, green, with the run lines and the test count;
`git diff --stat -- assets/icons assets/mascots assets/sounds` showing only what the node decision
meant; screenshots of each unit in its colour, an open popover, a locked popover and the chest
stops, on both platforms, light and dark, with any changed node SVG rendered itself, not through a
preview page; the copy lines; then the two copyable blocks, as for item 30.

### 32. Give Learn and Profile colour and life, and replace every native control left with the kit

*Written 2026-10-05 by the board writer of `HANDOFF.md` step 39, from phase 7 of
`docs/incomplete/game-feel/PLAN.md`, `GF-10` and step 37's list of native controls left.*

**Model: Opus 5.5. Lane F. Waits on item 31 (`DONE`).** Work in a worktree of your own, made from
`main` after item 31 is merged.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, "Known facts", step 37, and the ledger steps of
items 30, 31, 46 and 52), then `docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in
full, then `docs/incomplete/game-feel/DESIGN.md` sections 8 and 9 and `PLAN.md` sections 1 to 3,
phase 7 and section 8. Session rules, restated: never run `git commit`, `git push`, `git add -A` or
`git add .`; absolute dates only; no em dashes, no contractions and no banned AI words in any
document; no drive-by fixes, note them and raise them; write `bun run --cwd app <script>`, never
`bun --cwd app run <script>`; never hand-edit an SVG under `assets/icons/` or `assets/mascots/`;
never touch `assets/higgsfield/` or `assets/higgsfield-chest/`; never download a file without
Zach's yes.

**Why this exists.** Zach chose every native control custom ("All, with a custom tab bar too",
2026-10-05, `GF-10`), because he wants every button and toggle to carry the app's tokens and the
native `@expo/ui` controls do not (`HANDOFF.md` step 37). Phase 7 of the plan adds life to the
screens that are left: mascots that idle and greet, colour and the raised button on Learn,
Profile and onboarding.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The native controls left, counted 2026-10-05 (step 37, "Native controls left"; recount with
  `grep -rn "@expo/ui" app/src` and `grep -rn "Alert.alert" app/src` before you start):
  - `LessonButton` (`app/src/components/lesson/lesson-button.tsx:13-22`, a native `Button` in a
    `Host` around `WideLabel`) at 14 call sites in 12 files: 11 under `app/src/screens/` and
    `app/src/components/story/story-missing.tsx`. Item 30 replaced the two in `chest-screen.tsx`.
    `WideLabel` (`app/src/components/lesson/wide-label.tsx:8`) is also used by
    `app/src/components/lives/out-of-lives-sheet.tsx:7`, `:49`, `:53`.
  - The out-of-lives sheet: a native `BottomSheet` with two native `Button`s
    (`out-of-lives-sheet.tsx:1`, `:28-56`).
  - Two `Alert.alert` dialogs: `confirmReset`
    (`app/src/components/profile/use-profile-controls.ts:36-45`) and `confirmLeave`
    (`app/src/components/lesson/lesson-run-view.tsx:130-141`).
  - Four Profile switches: Sound effects, Haptics, Logan Mode and Daily reminder
    (`app/src/components/profile/settings-section.tsx:36-39`).
  - The reminder time pickers: `DatePicker` on iOS (`reminder-time.ios.tsx:1`) and
    `DateTimePicker` on Android (`reminder-time.android.tsx:2`, `:28`), opened through
    `use-time-dialog.ts`, all in `app/src/components/profile/`.
  - The Profile form: `FieldGroup` (`app/src/screens/profile-screen.tsx:1`, `:39-59`) and its
    sections with `ListItem` (`freeze-shop-section.tsx:1`, which also has a native `Button`,
    `reset-section.tsx:1`, `profile-stats-section.tsx:1`, `recovered-section.tsx:1`,
    `settings-section.tsx:1`); `profile-frame.tsx` and `form-modifiers.*.ts` exist for the native
    form (`profile-frame.tsx:17`).
  - `app/src/components/story/story-button.tsx:1`, `:20-22` (an outlined `Button` in a `Host`) and
    `app/src/components/route-error.tsx:2`, `:19-21` (the retry `Button`).
  - Not this item's: `NativeTabs` (item 52) and `app/src/screens/dev-art-screen.tsx:3`, a
    development route (items 49 and 57).
- The kit of item 46 provides `GameSwitch`, `GameSheet` and `GameDialog`; `PrimaryButton`
  (`app/src/components/button/primary-button.tsx`, registry Z5) is the raised button. Read item
  46's ledger step for a secondary or outlined variant before you make one.
- The leave dialog is the only change in `lesson-run-view.tsx`: the guards there and in
  `session-steps.ts` stay, and `lesson-run.test.ts`, `session-steps.test.ts` and
  `session-order.test.ts` pass untouched. Android's back reaches `useHardwareBack`
  (`app/src/components/lesson/use-hardware-back.ts`) and asks to leave; it must still do so.
- Accessibility was free with the native pieces and is now written by hand (`GF-10`, "Against"):
  the switch role and state, a sheet or dialog that is modal with focus moved in and back, and
  Android's back closing a sheet or dialog. The custom feedback sheet is the precedent
  (`use-sheet-focus.ts`, `LessonFrame`'s `overlay`, BD-G30).
- Mascot life: the dials `idleBobDistance` (3) and `idleBobMs` (2400) exist and no code reads them
  (`app/src/config/dials.ts:54-55`); `bob` is in `reducedMotionSkips` (`:60`). `Mascot` is the one
  mascot component (`app/src/art/mascot.tsx:12-14`, `D4`); item 57 later moves it to the rigs, so
  keep its props.

Do these, in order:
1. **Recount** the list above with the two `grep`s and note any change.
2. **Buttons**: replace `LessonButton` at its 12 remaining call sites, `StoryButton`'s button and
   the retry button with `PrimaryButton` or the kit's variant; then delete `lesson-button.tsx` and
   `wide-label.tsx` once nothing imports them.
3. **The out-of-lives sheet** becomes a `GameSheet` with the two buttons; the offer rule
   (`out-of-lives-offer.ts`) does not change.
4. **The two dialogs** become `GameDialog`s with the same copy, the safe choice first, and the
   destructive choice in the wrong colour.
5. **Profile**: a token form (sections, rows, the stats and the freeze shop), `GameSwitch` for the
   four switches, and a token time picker for the reminder, its shape your build call with a
   reversal. The Settings help line keeps its place under the switches (BD-G16).
6. **Mascot life** (phase 7, step 1): an idle bob through `Mascot` from the two dials, and mascots
   on the empty and recovered states, with the existing poses.
7. **Learn, Profile and onboarding** take the colours, `GameText` titles and the raised button.
8. **The standard**: in `docs/conventions-typescript.md`, update registry entries Z5 to Z7 and
   what U2 and U3 now bind, and raise the version.
9. **Record it**: the next free ledger step, code map lines (deleted files out), phase 7's `BUILT`
   header, an `As built` note under `GF-10`, row 32 `DONE: HANDOFF n`, and item 33's prompt.

Ask before building: the reminder picker's shape (a wheel, or steppers for the hour and the
minute), shown to Zach as a screenshot from `/dev/kit` or a sketch before it is built into Profile.
It is his call, and the answer may be to keep that one native.

Not in scope, whoever asks: the tab bar (item 52); the chest screen (item 30); the path and the
stat bar (item 31); any Rive rig (item 57); the development routes; any game rule; the stored
shape.

Hand back: the whole-repo gate, green, with the run lines and the test count; the two `grep`s
showing only the development route (and `app-tabs.tsx` if item 52 is not yet merged); screenshots
of every replaced control on both platforms, light and dark; the screen-reader checks written as
seen or `open`; then the two copyable blocks, as for item 30.

Item 33's prompt is written by the session that closes the last of items 30 to 32 and 46 to 57,
from phase 8 of `docs/incomplete/game-feel/PLAN.md` and its section 8.

## Item 34: Flop in Rive

*Opened 2026-10-05. Zach asked for Flop, the fish mascot, to swim around frantically when a lesson
ends with a perfect score, and for a spike to find out whether an agent can build the Rive rig
through the Rive MCP and CLI. Phase A (the spike) was done on Opus 5.5 the same day and is
`HANDOFF.md` step 34. Zach then chose to run all further Rive work on Sonnet, because the MCP calls
are expensive. It is a spike for game-feel items 30 and 32, not a replacement for item 28 or 29.*

### 34. Tune Flop's Rive rig, then play it on the finish screen for a perfect score

**Model: Sonnet 5 (Zach's choice, 2026-10-05). Lane G. Waits on Zach's yes to Phase B, and on
item 29 for `lesson-finish.tsx`.** Phase B gets its own worktree. Phase A needs none, because it
edits only the Rive file in Zach's account.

You are picking up felto, a poker-learning app in `app/` (Expo SDK 57, React Native 0.86, TypeScript
strict, bun). Read `HANDOFF.md` first (step 34 is the record of the spike), then
`docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in full before any `.ts` or `.tsx`
edit, then `docs/incomplete/game-feel/DESIGN.md` (`GF-1` to `GF-9`) and `PLAN.md` phases 5 and 7.
Session rules, restated: never run `git commit`, `git push`, `git add -A` or `git add .`; use
absolute dates; no em dashes, no contractions and no banned AI words in any document you write; no
drive-by fixes, note them and raise them; write `bun run --cwd app <script>`, never
`bun --cwd app run <script>`; never hand-edit an SVG under `assets/icons/` or `assets/mascots/`;
never touch `assets/higgsfield/`; ask Zach before buying a Rive plan, running `rive login`, or
downloading any file.

**Why this exists.** Zach wants the end of a perfect lesson to feel like a celebration: Flop darts
around the screen, wagging and flapping, instead of standing as a still pose. The static SVG poses
cannot move a tail or a fin on its own, so Flop needs a rig. Motion feel is Zach's call; an agent
can judge poses from stills, never timing.

**What is fixed.** Read these before changing anything; do not relitigate them.

- **What Rive can and cannot do here, with sources (verified 2026-10-05).** The CLI is
  `~/.rive/bin/rive` 1.3.0 and is not on the shell's PATH. `rive doctor`: ok except "Not logged
  in", which blocks only `--publish`, `--rev` and `push`. RML has animations and state machines;
  state-machine inputs are deprecated in favour of view-model properties
  (`~/.rive/versions/1.3.0/docs/state-machines.md:11-20`). **RML cannot import SVG**: `SVGAsset` is
  editor-only and stripped on export (`docs/assets.md:236-246`). So the rig is built in the Rive
  editor through the MCP, which imports SVG (`upload_asset`, then `assets_tool addSvgInstance`).
  `.riv` export works on Zach's plan; `.rev` export is refused ("not available on this workspace's
  plan"), so do not retry it. The pricing page lists runtime export under Cadet
  (https://rive.app/docs/account-admin/pricing.md), but the export worked, so trust the export.
- **The editor is sandboxed.** `upload_asset` with a local path and `export_file` to a local folder
  both fail with "Operation not permitted". Use the recipe each error prints: call the same MCP over
  HTTP at `http://127.0.0.1:9791/mcp` (initialize, take `mcp-session-id`, then `tools/call`), with a
  data URI for uploads and `inline_base64: true` for exports. Never print base64 into the
  conversation; pipe it to disk.
- **The Rive file.** Opened by Zach 2026-10-05 as "Untitled", file id 2632317,
  `https://editor.rive.app/file/untitled/2632317` (Zach may rename it "Flop"). It is the only
  editable source of the rig: the repo can hold only the exported `.riv`. Artboard `Flop` (id
  `0-2`), 600 by 520, transparent background (artboard fill `0-4`, colour `#00000000`).
- **The rig, by object id.** `flop` `0-698` (pivot 290, 260 on the artboard) holds `fish` `0-15`
  (at -210, -215), which holds, front to back: `mouth` `0-17`, `pupil_r` `0-30`, `eye_r` `0-37`,
  `pupil_l` `0-41`, `eye_l` `0-48`, `body` `0-52`, `fin_r` `0-144`, `fin_l` `0-199`, `tail`
  `0-254`, and the clip shape `fishClip` `0-596`. `flop_shadow` `0-699` (pivot 306.5, 271) sits
  behind `flop` and holds `shadow` `0-345`, which holds `sh_tail` `0-694`, `sh_fin_l` `0-695`,
  `sh_fin_r` `0-696` and `sh_body` `0-697`, ten extrusion copies each. Pivots in fish space: tail
  root 300, 206; `fin_l` root 85, 270; `fin_r` root 295, 285; body centre 190, 205; each shadow
  part has its part's pivot plus 16.5, 11. The pupils' origins are at the eye centres (150, 170
  and 232, 170), so a blink closes eye and pupil together. Property keys: x 13, y 14, rotation 15
  (degrees), scale x 16, scale y 17 (percent), opacity 18; timeline fps 56, duration 57 (frames),
  loop 59 (0 one shot, 1 loop, 2 ping-pong); transition duration 158 (ms), interpolation 349.
- **The shadow is a cast shadow on the page, by Zach's ask** ("keep in mind how the shadow would
  realistically transform"). It is never inside `flop`. It follows the fish's x, y and rotation,
  offset down-right by 16.5, 11. When the fish lifts toward the viewer (`flop` scales up to 108),
  the shadow moves a further 24, 17 down-right and fades by 28 percent, and keeps its own size,
  because a distant light does not shrink a shadow. Each shadow part rotates with its part. When
  the fish turns (scale x through zero to -100), the shadow flips with it and stays down-right, and
  `body` counter-flips (its scale x keyed to the facing), so its dark extrusion stays down-right and
  its gloss stays upper-left.
- **The animations.** `idle` (`0-6`, 144 frames at 60 fps, looped): a lift of 0.35 with a 6-unit
  rise at frame 72, tail -8 to 8 every 36 frames, `fin_l` 0 to -14, `fin_r` 6 to -6, one blink at
  frames 114 to 126. `frantic` (`0-700`, 96 frames, looped): a path through (290, 260), (225, 232),
  (165, 212), a turn at frames 24 to 28, (300, 262), (425, 298), a turn back at 50 to 54,
  (375, 318), (320, 290) and back to the start, with lifts up to 1.0 and tilts of -10 to 14
  degrees; tail ±26 every 6 frames; fins 0 to ±40 every 4 frames, in opposite phase.
- **The state machine.** `flop` (`0-7`, the default), one layer: Entry to `idle`; `idle` to
  `frantic` when the view-model boolean `perfect` is true, and back when it is false; both
  transitions 250 ms, cubic. View model `Flop` (`0-1391`), property `perfect` (`0-1393`), instance
  `default` (`0-1395`), bound to the artboard. The editor's simulation confirmed both transitions
  (frames 61 and 181 with `perfect` set at 60 and 180).
- **Scratch tools of the spike**, in
  `/private/tmp/claude-501/-Users-zachshort-Projects-felto/703cff9d-f1a9-40ff-8618-540a5318d950/scratchpad/rive/`,
  which may be gone: `rv.py` (calls the MCP over HTTP; `move_origin(node, x, y)` moves a node's
  origin and shifts its children back), `anim.py` (every pose of fish and shadow from one list, so
  they cannot drift apart), `rekey.py` (pushes changed values onto the existing keyframes),
  `stills.py` and `rest.json`, and `out/flop.riv` (27,939 bytes). If they are gone, re-export the
  `.riv` from the Rive file and rebuild the helpers from this description.
- **How to see a frame.** Moving a timeline's playhead does not change what `capture_artboard`
  draws. The spike set the keyed values of one frame on the rest pose, captured, and restored the
  rest pose from a saved snapshot, then checked that every value matched the snapshot. At a
  keyframe this shows exactly what the timeline holds; between keyframes it does not.
- **Known looks, Zach's to judge.** The fins and tail have a small dark edge (7 to 8 units) that
  mirrors to the left side while Flop faces right. The body's shadow is faint at full lift, pale
  on a pale page. Nobody has seen the motion play.
- **Rules from the repo.** Only `app/src/art/` imports an SVG, a WAV or now a `.riv` (rule U6);
  never copy an SVG under `app/` (`D5`). Screens never import Reanimated (BD-G3). Reduced motion is
  read in one hook only, `useReducedMotion` in `app/src/motion/` (`GF-8`, BD-G4). Every timing and
  size is a dial in `app/src/config/dials.ts` under `// game-feel`. A native library needs a rebuild
  of the development build; `scripts/felto` is the front door (`felto sim`, `felto android`,
  `felto phone-debug`); read it and the script it calls before running one.
- **Decision record owed.** `GF-1` and the app's non-scope list say the mascots move with transforms
  until Zach rigs them in Rive himself. This item is Zach's dated change to that (2026-10-05): an
  agent builds the rig through the MCP. Record it as a dated amendment under `GF-1` in
  `docs/incomplete/game-feel/DESIGN.md`, never as an edit of the decision.

Do these, in order:

1. **Phase A follow-up: let Zach watch it.** Ask Zach to open the file in the Rive editor, select
   the `flop` state machine, press play and toggle `perfect`. Change what he names through the MCP,
   keep fish and shadow keyed from one source (as `anim.py` does), and re-check the rest pose after
   any still. Re-export `flop.riv`.
2. **Phase B, only after Zach says yes.** Make the worktree. Choose the React Native runtime with
   Context7 (`resolve-library-id`, then `query-docs`) for Expo SDK 57 and React Native 0.86; do not
   answer from memory. Confirm from the docs that it can set a view-model boolean on a bound
   instance. If it can only set state-machine inputs, stop and ask, because the file then needs a
   `StateMachineBool` named `perfect`.
3. **Install and rebuild.** Install with `bunx expo install`, then rebuild both development builds
   with `scripts/felto`. If the build fails, stop and report; the fallback is Reanimated on the six
   SVG poses (`GF-6`).
4. **Place the file and the component.** `flop.riv` goes under `app/assets/rive/`. A new component
   in `app/src/art/` plays it and is the only importer. It falls back to the static `happy` pose
   through the existing `Mascot` if the file fails to load, and draws the static pose when
   `useReducedMotion` says so. Every size and timing it needs is a dial under `// game-feel`.
5. **Wire it for a perfect score only.** On the lesson finish screen, show the Rive Flop with
   `perfect` true only when every answer was right; otherwise keep the static pose it draws now. Do not
   change hearts, XP, streak or the pass mark.
6. **Record it.** Read `HANDOFF.md` for the next free step and append it; add the new files to the
   code map; add the `GF-1` amendment; write the runtime entries (what to tap, what Zach should see
   on his phone).

Ask before building: (a) Phase B at all: Zach decides after he watches the rig, and the answer may
be to stop at Phase A or to use Reanimated instead. (b) `lesson-finish.tsx` is in item 29's files
(`app/src/components/lesson/`) and in item 30's: wait for item 29, or ask Zach to accept the overlap.
(c) Whether the exported `.riv` gets a "never regenerate by hand, re-export from the Rive file" rule
in `CLAUDE.md`, like `assets/higgsfield/`, since the repo cannot rebuild it. All three are his calls,
and any answer may be no.

Not in scope, whoever asks: the other mascots (squid, shark) or the other five fish poses; a sad or
other state; buying a Rive plan or `rive login`; any change to the generators or to `assets/`; any
change to hearts, XP, streak, the pass mark or the finish-screen layout beyond the mascot; the
chest and boss screens (item 30); the idle bob of the other screens (item 32).

Hand back: for Phase A, the changes Zach asked for and a fresh `flop.riv`. For Phase B: the
whole-repo gate from `CLAUDE.md`, green, with the run lines and the test count;
`git diff --stat -- assets/icons assets/mascots assets/sounds` empty; screenshots of the perfect
finish on the iOS simulator and the Android emulator, light and dark, saying "seen running" or
"gates green" for each (R10); the reduced-motion screen; then the two copyable blocks, `git add`
with the exact files (`git add -N` first for new ones) and `git commit` with the same files and a
short lowercase message.

## Items 35 to 45: the GTO trainer

The scope is `docs/incomplete/gto-trainer/DESIGN.md` and the plan is
`docs/incomplete/gto-trainer/PLAN.md`, approved by Zach in chat on 2026-10-05 (GATE 2). One
phase per item. Per Part 3, each session writes the next item's prompt when it closes, so only
item 35 has its prompt below. Items 36 to 45 are the plan's phases 2 to 10 and carry the
status `HELD` until their dependency is `DONE`. Lanes: H (the key), I (the table), J (the art).

### 35. Write the GTO game spec, freeze the key schema and check the solver is feasible

**Model: Fable 5.1. Lane H. Waits on nothing.** Run this on Fable 5.1. If the session is on
another model, do not start: hand the prompt off (`~/.claude/rules/model-routing.md`). A wrong
choice here compiles, passes every gate, and teaches a wrong play to the players who notice.

You are picking up felto, a poker-training app. Read, in order: `HANDOFF.md`, then
`docs/incomplete/gto-trainer/DESIGN.md` (the scope and Zach's answers), then
`docs/incomplete/gto-trainer/PLAN.md` (the plan, section 0 and phase 1), then
`docs/AGENT-PRACTICES.md`, then `docs/conventions-python.md`. Session rules: never run
`git commit`, `git push`, `git add -A` or `git add .`; print the two copyable blocks at the end
(`git add` the exact files you touched, then `git commit` the same files with a short lowercase
message, with no `Co-Authored-By` line and no "Generated with" line). Talk to Zach in
ASD-STE100 Simplified Technical English. Documents you write have no em dashes and no
contractions. Ask Zach in chat, in one batch, before any decision that is his.

**Why this exists.** The app wants a trainer for serious players: a 6-max table, dealt hands,
and a review that says where the player went wrong against a solved strategy. Everything else
in the effort (the table, the grading, the paywall) is ordinary work on parts that exist. The
strategy key is the one part with no fallback, so it is specified and checked for feasibility
before any solver code exists.

**What is fixed.** Read these; do not relitigate them.
- Zach chose: an own solver (A2), preflop scored first with the hand run out to showdown after
  (B1, BD-T5), new Higgsfield characters (C2), the paywall later (D1), grading by frequency and
  EV loss (E1). `DESIGN.md` section 6, "Answers".
- No public repo's range data is used. `jensbaagaard/poker-practice` has the right schema shape
  but no licence file and a data README that describes extracting ranges from another app's
  bundle; `byw1/poker-trainer` is MIT but raise-first-in only and hand-written
  (`PLAN.md` section 0, rows 2 to 5, BD-T1).
- The existing `OPENING_CHART` is a hand-written teaching chart, tighter than published solver
  ranges at every seat (`app/src/content/opening-chart.ts:15-30`). It is not a key.
- The solver lives in `solver/` and is a development tool; the app never runs it (BD-T3).
  Python with numpy is the default; Rust is the fallback if the estimate is over an hour.
- Multiway pots are not solved (BD-T4). Postflop is a runout (BD-T5). The key stores a
  frequency and an EV per action per hand class (BD-T6).
- Hands are seeds (BD-T7). The unit 3 chart and its lessons are not changed by this item.

Do these, in order:
1. **Write `KEY-SPEC.md`.** The exact game: six players, 100 big blinds, no ante, no rake, the
   open, 3-bet, 4-bet and all-in sizes by position, the action tree node by node, how a leaf is
   valued (all-in equity with a position-based realization factor, named as an approximation),
   and what BD-T4 leaves out. Every simplification is named with the hands it moves most.
2. **Freeze the schema.** Node ids, the 169 hand classes, one frequency and one EV per action,
   the spec hash. Write it fresh; fact 3 of the plan is only a shape reference. Add a validator
   stub under `solver/` that rejects a missing hand, a frequency sum other than 1 and a missing
   EV.
3. **Collect acceptance bands.** Delegate to a Default (Opus 5.5) subagent in its own worktree,
   report only: at least three named public sources for open rates by seat and 3-bet and
   fold-to-3-bet rates at 6-max 100 big blinds, each with its date. Check its diffstat when it
   returns. Published numbers set bands; nothing is copied into the repo as data.
4. **Estimate feasibility.** From the node count and the table size, write down whether a numpy
   solver can solve the full tree in under an hour on this Mac (10 cores). If not, the fallback
   is Rust (installed, 1.86): write `docs/conventions-rust.md` first, to the shape of Part 8.1,
   before any Rust file.
5. **Get a cold Deep read.** A separate Fable 5.1 subagent in its own worktree reads
   `KEY-SPEC.md` with no other context and answers one question: can a correct solver of this
   game still produce a strategy a strong player would call wrong, and where? Fold its answer
   into the spec.
6. **Record it.** Append the next free `HANDOFF.md` step, mark this row `DONE: HANDOFF n`,
   write the prompt for item 36 below this one, and update the plan's phase 1 header.

Ask before building: (a) the realization-factor model, if more than one is defensible; (b) the
bet-size menu, because it fixes what a player can do at the table; (c) whether the spec may name
the app's claim as "GTO", or must say "solver strategy for this game". All three are Zach's
calls, and any answer may be to change the plan.

Not in scope, whoever asks: writing solver code beyond the validator stub; copying any public
chart or dataset into the repo; multiway solving; postflop scoring; any app screen; any art; the
paywall; changes to unit 3 lessons or the opening chart.

Hand back: `bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test`
green and unchanged (63 test files, 490 tests, or the live count if another item moved it);
`KEY-SPEC.md` complete and the cold review's answer recorded in it; every acceptance band
carries a source and a date; then the two copyable blocks, with `git add -N` first for new
files.

### 36. Build the preflop equity table and the deal weights the solver reads

**Model: Opus 5.5. Lane H. Waits on nothing (item 35 is `DONE: HANDOFF 41`).** Run it in its own
worktree if another lane is open; it writes only under `solver/` and one paragraph of
`docs/conventions-python.md`.

You are picking up felto, a poker-training app. Read, in order: `HANDOFF.md` (Environment, Code
map, then steps 38 to 41), `docs/incomplete/gto-trainer/KEY-SPEC.md` in full (the game and the
schema; section 3.3 is this item's contract), `docs/incomplete/gto-trainer/PLAN.md` section 1
(BD-T1 to BD-T19) and phase 2, `docs/AGENT-PRACTICES.md`, then `docs/conventions-python.md` in
full. Session rules: never run `git commit`, `git push`, `git add -A` or `git add .`; print the
two copyable blocks at the end (`git add -N` then `git add` the exact files you touched, then
`git commit` the same files with a short lowercase message, with no `Co-Authored-By` line and no
"Generated with" line). Talk to Zach in ASD-STE100 Simplified Technical English. Documents you
write have no em dashes and no contractions. Ask Zach in chat, in one batch, before any decision
that is his.

**Why this exists.** The solver (items 37 and 38) values every leaf of its tree from two 169 by
169 tables: the equity of one hand class against another when both see five cards with no more
betting, and the number of ways the two classes can be dealt without sharing a card. Both are
pure arithmetic with one right answer, and every later number in the trainer rests on them. A
wrong cell here is a wrong strategy later that no gate can see.

**What is fixed.** Read these; do not relitigate them.
- The 169 classes and their order are `allHandClasses()` in `app/src/cards/hand-class.ts:16-22`
  (`AA`, `AKs`, `AKo`, `AQs`, `AQo`, down to `22`); `solver/validate_key.py` builds the same list
  as `HANDS` and is the Python source of that order. Every table this item writes uses it for
  rows and columns.
- `E[h][g]` is the share of the pot class `h` wins against class `g`, a tie counting a half,
  averaged over every pair of combinations of `h` and `g` that share no card and every five-card
  board from the other 48 cards (`KEY-SPEC.md` 3.3). `W[h][g]` is the count of ordered pairs of
  combinations of `h` and `g` with no shared card; the sum of all of `W` is 1,326 × 1,225
  (`KEY-SPEC.md` 3.3).
- The solver is Python with numpy (BD-T3, BD-T16). This is the first file in the repo to import
  numpy, and `docs/conventions-python.md` rule M4 says standard library only: the scope paragraph
  of that standard (version 1.2.2) says this item brings a dated amendment to M4 naming `solver/`
  as the one place a third-party import is allowed, and bumps the version. Do that before the
  first numpy line. numpy is 2.4.3 at `/opt/homebrew/bin/python3` (Python 3.14.6).
- Output is a committed file with a header naming the date, the method and the error bound
  (`PLAN.md` phase 2). Determinism holds as it does for the generators (rules G1 and G4): the
  same source writes the same bytes; a sampling method fixes its seed in the source.
- The Python side has no test runner. This item introduces one for `solver/` only: the standard
  library's `unittest`, run as `python3 -m unittest discover -s solver -p '*_test.py'`. Record
  the command in `HANDOFF.md` Environment and in the ledger step; do not add it to the whole-repo
  gate without asking Zach (that is his call, listed below).
- Hand evaluation exists in TypeScript (`app/src/cards/evaluate.ts`) and not in Python. Write
  the Python evaluator fresh; the TypeScript one is a cross-check, not an import.

Do these, in order:
1. **Amend M4.** One dated paragraph under rule M4 in `docs/conventions-python.md`: `solver/`
   may import numpy, by BD-T3; nowhere else may; version 1.3.0 (a rule changed). Keep the rule's
   correct and incorrect examples as they are and add the `solver/` import as a second correct
   example once it exists.
2. **Write `solver/equity.py`.** Module-level constants and tables, the work in `main()`, no
   type hints, helpers at most 15 lines, a docstring that states what it computes, the method,
   and the run command `python3 solver/equity.py` (rules M1 to M4, H2, H3). Choose exact
   enumeration with suit symmetry, or sampling with a stated bound; state which in the header and
   in the ledger. If sampling, the bound must keep the equity error under 0.002, because a 5.5 bb
   pot turns an equity error of 0.001 into 0.0055 bb, the size of the solver's stop dial
   (`gtoExploitabilityBb`, 0.005). Write `E` and `W` to `solver/data/` as JSON: a `meta` object
   (date, method, bound, the hand order's source) and two 169 by 169 nested arrays, equities to
   six decimals, counts as integers. Print the run line with what it wrote.
3. **Write `solver/equity_test.py`.** Tests that do not read the answer from the file under test:
   `E[h][g] + E[g][h]` is 1 for every pair, within the bound; `E[h][h]` is 0.5; `W` is symmetric,
   its total is 1,326 × 1,225, and a row of `W` for a pair sums to 6 × 1,225 and so on for suited
   (4) and offsuit (12) classes; ten matchups each agree with an independent Monte Carlo estimate
   computed inside the test (a second, plain evaluator over random boards, 200,000 samples, bound
   0.01), including `AA` against `KK`, `AKs` against `QQ`, `AKo` against `22`, `72o` against `AA`,
   `JTs` against `AKo`, `55` against `AKs`; and the three class-size identities hold. The
   independent evaluator is the point: a test that compares the table to itself proves nothing.
4. **Run and record.** `python3 solver/equity.py` twice; the two outputs are byte-identical
   (`cmp`). The unittest command above passes. The app gate (`bun run --cwd app typecheck && bun
   run --cwd app lint && bun run --cwd app test`) is green and unchanged, because nothing under
   `app/` changes. Record the run time and the file sizes.
5. **Get the five-matchup check.** `PLAN.md` phase 2's proof: a Default (Opus 5.5) subagent in
   its own worktree, read-only, picks five matchups the builder did not, computes each with its
   own method and compares to the table within the bound. Check its diffstat when it returns.
   Record the five and the result.
6. **Record it.** Append the next free `HANDOFF.md` step (read the file for the number), add
   `solver/equity.py`, `equity_test.py` and `solver/data/` to the code map, set the plan's phase 2
   header to `BUILT` with the date, mark this row `DONE: HANDOFF n`, write item 37's prompt (phase
   3a: the solver core on one spot, Fable 5.1) below this one, and flip item 37 to `OPEN`.

Ask before building: (a) whether the unittest command joins the whole-repo gate in `CLAUDE.md`
and `gateCommand` now or when the solver lands; (b) exact enumeration against sampling, if your
first timing of exact enumeration is over about thirty minutes (the plan allows either; the
bound is what matters). Both are his calls, and either answer may be no.

Not in scope, whoever asks: any solver code (CFR, best response, the tree); any file under
`app/`; the realization model; the acceptance bands; any change to `KEY-SPEC.md` other than the
`equity_table_sha256` note in section 7.1 if it needs one.

Hand back: the app gate green and unchanged; `python3 -m unittest discover -s solver -p
'*_test.py'` green; two runs byte-identical; the five-matchup check recorded; then the two
copyable blocks, with `git add -N` first for the new files.

## Items 46 to 57: the second game-feel pass

*Opened 2026-10-05, out of four messages from Zach and 13 photos (`docs/incomplete/game-feel/DESIGN.md`
section 9 quotes them; decisions `GF-10` to `GF-19`). The order of work is
`docs/incomplete/game-feel/PLAN.md` section 8. The prompts of items 46 to 52 are the briefs the
session of `HANDOFF.md` step 39 wrote and started builders on, copied here as written except for
the heading level; the board writer of that session wrote items 53 to 57. Items 30 to 33, above,
carry the rest of the pass on their screens.*

### 46. Build the game kit: 3D text, rolling numbers, bubbles, popovers, sparkles, switch, sheet and dialog

**Model: Default (Opus 5.5). Lane K. Waits on nothing.** Work in a worktree of your own; the fresh-checkout recipe of `docs/AGENT-PRACTICES.md` Part 6 runs first.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach wants the app to look and feel like Duolingo: custom, colourful pieces
that carry the app's tokens, characters that speak in bubbles, numbers that roll, big 3D game text
and sparkles (`GF-10`, `GF-11`, `GF-16`, `GF-17`). Every later item (30, 31, 32, 51, 52) builds its
screens from this kit, so this item builds the pieces and a page that shows them, and wires them
into no existing screen.

**What is fixed.** Read these before changing anything; do not relitigate them.
- `app/src/motion/` is the only importer of Reanimated (`motion-boundary.test.ts`, BD-G13). Its
  hooks are declarative: they play when a flag turns true (BD-G21). `useReducedMotion` is the one
  reader of Reduce Motion (BD-G4); `motionAllowed(kind, reduced)` and the dial `reducedMotionSkips`
  decide what is skipped (BD-G10). Copy these patterns; add new hooks as new files.
- `PrimaryButton` (`app/src/components/button/primary-button.tsx`) is the raised button: face on a
  darker edge, a press that sinks it, the press haptic and sound through dials (BD-G18, BD-G20).
  New pressable pieces use it or its pattern.
- The feedback sheet (`app/src/components/lesson/feedback-sheet.tsx`, `use-sheet-focus.ts`,
  `LessonFrame`'s `overlay`) is the house pattern for a custom sheet with screen-reader focus.
- Every colour and size is a token with a light and a dark value (`app/src/theme/tokens.ts`, rule
  U5); every motion value is a dial (`app/src/config/dials.ts`, BD-G1). Add one new dials block
  under a comment `// game-feel second pass`, after the `// game-feel` block.
- `app/assets/fonts/FeltoRank.ttf` is Nunito ExtraBold with the full Latin set (checked
  2026-10-05 with `fc-query`: every ASCII letter and digit). Use it as the display face of
  `GameText`; do not download another font.
- The unit colours exist as tokens (`GF-4`, `session-colour.ts`).

Do these, in order:
1. **`GameText`**: text in `FeltoRank` with a thick outline and a darker extrusion below it, in
   the style of the "2000" of `~/Downloads/IMG_2862.HEIC` (convert with `sips` to look at it). Sizes
   and colours from tokens; one tone per use (gold, green, unit colour). Screen readers read the
   text once, not once per layer.
2. **`RollingNumber`**: an odometer that rolls each digit to a new value, up or down, over a dial
   time, in `GameText` or plain text. Reduced motion shows the new value at once. The final value
   is right even if the view unmounts mid-roll.
3. **`Bubble`**: a speech bubble with a tail on any side, the surface and border from tokens, a key
   word highlighted in a colour (photo 2865), and text that types out at a dial speed. It reports
   `talking` (true while typing) through a callback, so a mascot can bob now and move a Rive mouth
   later (`GF-11`, `GF-19`). A tap finishes the typing at once. Reduced motion shows the text whole.
4. **`Popover`**: a card anchored to a point with an arrow, springing in from it, in a given
   colour, holding a title, a line and a raised white button (photo 2864, "START +20 XP").
   A tap outside closes it; it is a modal for screen readers while open.
5. **`Tag`**: a small pill for "NEW", "+20 XP" and the like.
6. **`Sparkles`**: an ambient layer of four-point stars that twinkle in a box (count, size and
   period as dials), and a one-shot burst. SVG shapes moved by Reanimated (`BD-G5`); item 49 may
   later move the burst to Lottie. Reduced motion draws nothing (`GF-8`, `GF-17`). Nothing loops
   while the view is off screen or unmounted.
7. **`GameSwitch`**, **`GameSheet`** and **`GameDialog`**: a token switch with the switch role and
   its state for screen readers; a bottom sheet base drawn the way the feedback sheet is; a dialog
   with a title, a line and one or two buttons, to replace `Alert.alert` later.
8. **A page that shows the kit**: a thin route `app/src/app/dev/kit.tsx` rendering
   `app/src/screens/dev-kit-screen.tsx` (rule U1), with every piece in each state, and buttons that
   replay each animation.
9. **Registry.** Add entry Z7 to the sanctioned divergence registry of
   `docs/conventions-typescript.md` for the kit (`GF-10`), and raise its version.
10. **Record it.** As a subagent of a lead session: do not edit `HANDOFF.md`, `PASSOFF.md` or
   `PLAN.md`; your final report is the record. As a session of your own: append the next free
   ledger step (read the number from the file), add the files to the code map, set row 46 to
   `DONE: HANDOFF n`, and write your build calls into `PLAN.md` section 1 as the next free `BD-G`
   numbers.

Ask before building: nothing; every call this item needs is in `GF-10` to `GF-17`. Make each
build-level call yourself and report it with a one-line reversal.

Not in scope, whoever asks: wiring any piece into an existing screen; the tab bar (item 52); the
reminder time pickers (item 32); Lottie (item 49); any change to `assets/`; any game rule.

Hand back: the whole-repo gate of `CLAUDE.md`, green, with its run lines and test counts; tests
for every pure part (the digit steps of the roll, the typing steps, the anchor and arrow maths) in
new files named for each feature (rule Q1); screenshots of `/dev/kit` on the iPhone simulator in
light and dark (Android is `open` unless an emulator is free); the list of files touched; every
build call with its reversal; and the two commit blocks of Part 11, which Zach runs.

### 47. Re-voice all twelve sounds as one family of pleasant chimes

**Model: Default (Opus 5.5). Lane L. Waits on nothing.** Work in a worktree of your own.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-python.md` in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach played the sounds in the app and wants "more pleasent chimes instead of
just high pitched blips" (2026-10-05). He chose all twelve, as one family (`GF-14`).

**What is fixed.** Read these before changing anything; do not relitigate them.
- `tools/build_sounds.py` writes the twelve WAV files of `assets/sounds/` (16-bit mono, 44,100 Hz),
  standard library only (`math`, `os`, `struct`, `wave`), deterministic. `CEILING` (one second,
  `D15`) and `SHORT_CEILING` (0.6 s, `GF-5`) bound each effect, and `checked()` stops the run when
  one is too long (`PLAN.md` BD-G19). Keep the twelve names, the file format and both ceilings: the
  app loads the files by name (`app/src/art/sounds.ts`) and no app file changes in this item.
- The docstring gives each effect's pitches, timing and peak. Rewrite it for the new sounds.
- The feel lines Zach chose for the six short sounds on 2026-10-05 are in `DESIGN.md` under
  `GF-5`. `GF-14` replaces how they sound, not what each one is for.
- No agent can hear a sound. A sound is proven only when Zach plays it
  (`afplay assets/sounds/<name>.wav`) and says yes (`CLAUDE.md`).

Do these, in order:
1. **Measure the sounds as they are.** For each file, with the standard library: length, peak,
   and the dominant frequency (a short DFT over the loudest 50 ms is enough). This table is the
   "before" of the hand-back.
2. **One chime voice.** A bell or glass tone from a few partials with slightly inharmonic ratios, a
   soft attack (5 to 15 ms), an exponential decay, and a gentle fade to silence (no click at the
   end). Fundamentals in a warm register: nothing above about 1,600 Hz as a fundamental, most notes
   between about 260 and 1,050 Hz. Every note of every effect is from one major key, so any two
   sounds can play together.
3. **The happy sounds as chimes**: `answer_right` (two notes rising), `lesson_finish` and
   `boss_pass` (a short arpeggio that resolves, the boss one fuller), `chest_open` (a rising run with
   a shimmer), `reward_claim` (two notes up a fifth, then a shimmer), `sparkle` (three or four airy
   notes falling, quiet), `option_select` (one soft note), `xp_tick` (a tiny bell, made to repeat
   fast without fatigue).
4. **The others**: `tap` a soft wooden knock (a short filtered noise burst on a low tone, under
   60 ms); `answer_wrong`, `heart_lost` and `boss_fail` soft low tones that fall, never a buzz or a
   square wave, quieter than the happy ones.
5. **Measure again** and check: every file under its ceiling, the run deterministic (two runs, the
   same `shasum` for all twelve), peaks between 0.3 and 0.6.
6. **Record it.** As a subagent of a lead session: do not edit `HANDOFF.md`, `PASSOFF.md` or
   `PLAN.md`; your final report is the record. As a session of your own: append the next free
   ledger step, set row 47 to `DONE: HANDOFF n`, and add an `As built` note under `GF-14`.

Ask before building: nothing; `GF-14` is Zach's answer. Report the voice you chose so he can
change it in one line.

Not in scope, whoever asks: new effect names, longer ceilings, any file under `app/`, recorded or
downloaded audio.

Hand back: the whole-repo gate of `CLAUDE.md`, green; the before and after table (length, peak,
dominant frequency, per file); the two `shasum` runs; `git diff --stat -- assets/icons
assets/mascots assets/sounds` showing only the twelve WAV files; the line "not heard: Zach plays
each with afplay"; and the two commit blocks of Part 11.

### 48. Redraw the chest in four tiers, closed and open, in a three-quarter view

**Model: Default (Opus 5.5). Lane M. Waits on nothing.** Work in a worktree of your own.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-python.md` and `docs/conventions-typescript.md` in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach wants the chest "better looking and more three d" and in four tiers:
wood (common), blue (rare), red (mythic), gold (legendary) (`GF-13`). He approved reference art
generated with Higgsfield on 2026-10-05.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The references, kept as received in the main checkout:
  `/Users/zachshort/Projects/felto/assets/higgsfield-chest/chest-5-tiers-closed.png` and
  `chest-6-tiers-open.png` (the four tiers), with `chest-1-closed.png` and `chest-2-open.png`
  for detail. Convert a copy with `sips` into a scratch folder to look at it; never write into that
  folder.
- `ui_chest` in `tools/build_icons.py` (about `:343-357`) draws today's flat front-view chest
  through `solid()`, the shared extrusion. The house style: no outlines, solid fills, a darker
  extrusion down and to the right, a hard pale shadow, one gloss highlight
  (`tools/build_icons.py:4-6`). `ui_gem` and the chip drawing in the same file are the gems and
  chips to put inside an open chest.
- The pale shadow colour is swapped for dark mode at import (`app/src/art/colour-swap.json`,
  BD-25): use the shared `SHADOW` constant so the swap still finds it.
- Generated SVGs only: change the generator and run it, never edit an SVG (`CLAUDE.md`). The
  Python standard `docs/conventions-python.md` applies to every line you write.
- The app draws `chest` by name (`app/src/art/registry.ts`; `sizes.ts` holds each viewBox and
  `sizes.test.ts` checks them against the files). Screens that show a chest belong to items 30
  and 31; do not touch them.

Do these, in order:
1. **One chest drawing with a palette.** A three-quarter view as in the references: the front, the
   right side (darker) and the top of a rounded barrel lid (lighter) visible, wooden planks or
   panels, thick bands that wrap over the lid and down the front, rounded corners, a lock plate.
   A palette per tier: wood with gold bands; blue with gold bands; red with gold bands and a white
   gem on the lock; gold with amber bands, white diamond studs, a red gem on the lock and two small
   sparkles.
2. **Open variants**: the lid flipped back showing its dark inside, a soft glow, and contents that
   grow with the tier (a few gems; more gems; gems and chips; an overflowing heap with sparkles).
3. **Names.** `chest.svg` stays the name of the common closed chest, so no screen changes; add
   `chest_open`, `chest_rare`, `chest_rare_open`, `chest_mythic`, `chest_mythic_open`,
   `chest_legendary` and `chest_legendary_open`. Register all eight in `registry.ts` and their
   viewBoxes in `sizes.ts`.
4. **Look at every one.** Render each new SVG file itself (`qlmanage -t -s 400 -o <scratch>
   <file>`, or the browser pane), never a preview page, and compare it with the references in a
   light and a dark render (swap the shadow colour as BD-25 does). Iterate until each reads as a
   chunky 3D chest at 48 points as well as at 200.
5. **Counts.** The icon generator's run line rises from 78; update the count in `CLAUDE.md` (the
   directory map and the gate note) to the new number.
6. **Record it.** As a subagent of a lead session: do not edit `HANDOFF.md`, `PASSOFF.md` or
   `PLAN.md`; your final report is the record. As a session of your own: append the next free
   ledger step, set row 48 to `DONE: HANDOFF n`, and add an `As built` note under `GF-13`.

Ask before building: nothing. Report every drawing call (the angle, the palette hex values, the
names) so Zach can change one in a line.

Not in scope, whoever asks: the chest rule and the tap reveal (item 50 and item 30); any screen;
Rive (item 56); any mascot.

Hand back: the whole-repo gate of `CLAUDE.md`, green, with the new run line; `git diff --stat --
assets/icons assets/mascots assets/sounds` showing only the chest files; one rendered PNG of all
eight chests side by side, light and dark, saved outside the repo and its path given; and the two
commit blocks of Part 11.

### 49. Add Lottie effects from a generator: bursts, confetti, sparkles, fly-ups and a flame

**Model: Default (Opus 5.5). Lane N. Waits on nothing.** Work in a worktree of your own. Use a
simulator other than the one item 46 uses (item 46 uses the iPhone 17 Pro).

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-python.md` and `docs/conventions-typescript.md` in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach asked to "use lottie more for animations if possible", fun and game
styled (2026-10-05). `GF-15` settles it: effects are Lottie files written by a deterministic
generator in this repo, played through the art module; numbers roll with Reanimated (item 46), not
Lottie.

**What is fixed.** Read these before changing anything; do not relitigate them.
- Art is made by code in this repo: generators in `tools/`, standard library only, deterministic,
  and checked in the whole-repo gate (`CLAUDE.md`). `docs/conventions-python.md` applies to the new
  generator. `tools/common.py` and `tools/build_icons.py` hold the palette; take colours from them
  and cite the lines.
- Only `app/src/art/` imports art and art runtimes (rule U6; `rive-boundary.test.ts` is the
  precedent for a boundary test). The app reaches `assets/` through `@art/*` (BD-6, BD-7).
- Reduced motion is read only by `useReducedMotion` in `app/src/motion/`, and `motionAllowed`
  decides (BD-G4, BD-G10). A burst is skipped under reduced motion (`GF-8`).
- A new native dependency needs a rebuild of the development build (`HANDOFF.md`, Environment:
  CocoaPods needs `LANG=en_US.UTF-8`). Follow "Known facts" on the shared Metro cache: your own
  `TMPDIR`, `--clear`, and a free port (8084 or the next free one).
- Other items run at the same time and own these files, so do not edit them: `app/src/config/dials.ts`,
  `app/src/theme/tokens.ts`, `docs/conventions-typescript.md`, `CLAUDE.md`, `.personal-config.json`,
  `app/src/app/dev/kit.tsx`. Report the exact text each one needs; the lead applies it.
- Use Context7 for the `lottie-react-native` docs before you write the player.

Do these, in order:
1. **Install** with `bunx expo install lottie-react-native`, so the version fits SDK 57. Rebuild
   the development build on your simulator and check it launches.
2. **The generator** `tools/build_lottie.py`: standard library only (`json`, `math`, `os`), its own
   seeded random so the output is byte-identical on every run, writing `assets/lottie/` with one
   file each for a burst (stars and circles flying out from a centre), confetti (falling rotating
   pieces), a sparkle shower (four-point stars twinkling), a gem fly-up, a chip fly-up and a flame
   flicker (a loop). Extruded-flat palette, no outlines, short (under 1.5 s, the flame a loop). It
   prints a count from its writes, as the other generators do (rule W2).
3. **The player**: one component in `app/src/art/` that plays an effect by name (a string-literal
   union, rule V2), once or looped, with an end callback, sized by width, drawing nothing under
   reduced motion for the one-shot effects. A boundary test fails when a file outside
   `app/src/art/` imports `lottie-react-native` or a file under `assets/lottie/`. A vitest test reads
   every generated file and checks the fields a Lottie file needs and that each name is registered.
4. **Show them** on the existing `/dev/art` route (not `/dev/kit`, which item 46 owns), each with a
   replay button, and take screenshots mid-animation in light and dark.
5. **Record it.** As a subagent of a lead session: do not edit `HANDOFF.md`, `PASSOFF.md` or
   `PLAN.md`; your final report is the record, with the text for each file you were told not to
   edit (the gate line with the new generator, `gateCommand`, U6 widened to Lottie, any dial). As a
   session of your own: append the next free ledger step and set row 49 to `DONE: HANDOFF n`.

Ask before building: nothing; `GF-15` is settled. Report every call with a one-line reversal.

Not in scope, whoever asks: using an effect on any screen (items 30 and 31 do that); downloaded
Lottie files; Rive; rolling numbers.

Hand back: the whole-repo gate with `python3 tools/build_lottie.py` added before `xmllint`, green;
two generator runs with the same `shasum`; screenshots; the installed version; and the two commit
blocks of Part 11.

### 50. Decide each chest's tier before it opens, and plan the taps that reveal it

**Model: Default (Opus 5.5). Lane Q. Part A waits on nothing; part B waits on item 46.** Work in a
worktree of your own.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach chose four chest tiers, common (wood), rare (blue), mythic (red) and
legendary (gold), in his words: "Randomize they click at least 3 times. in those three times it has
the chance to turn into Rare->Mythic->Legendary. But the rarity is predetermined before they open,
its just the animation changes" (2026-10-05, `GF-13`). This item is the rule; item 30 draws the
taps and item 48 draws the art.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The chest rule today: `chestState` and `openChest` in `app/src/game/chest.ts:7-17`; a boss passed
  by playing it readies 20 gems (`DIALS.chestGems`, `app/src/config/dials.ts:22`), once per unit;
  `openedChests` and `passedBosses` live in `PlayerState` (`app/src/game/player-state.ts`).
- Every random draw takes a seed (`app/src/game/seeded-random.ts:1-15`; `drawBoss` in
  `app/src/game/boss.ts:5` is the precedent). A rule never reads the clock (rule B3) and imports no
  React Native module (rule B2).
- The tier must not change when the player closes and reopens the app, or opens the chest screen
  twice. Find a stable seed. If `PlayerState` holds no value that is stable per player and set
  before the chest is ready, the stored shape changes: read `STATE_VERSION` in
  `app/src/storage/migrations.ts` first, raise it by one, add the migration and a test that loads a
  save of the old shape (`docs/AGENT-PRACTICES.md` Part 6, rule Q2). The GTO trainer plans its own
  version later (board item 44); do not take more than one number.
- `GF-13` carries a condition: the day anything that leads to gems or chests can be bought, this
  rule is reopened with Zach, because a random chest that can be bought rates 9+ (app
  `DESIGN.md:204-205`). Write that condition into the comment above the odds dial in part B.
- `app/src/config/dials.ts` belongs to item 46 while it runs. In part A, do not edit it.

Part A, now:
1. **The tier rule**, pure and seeded: the tier of a unit's chest from the seed, the unit id and a
   table of odds passed in as an argument (a string-literal union for the tier, rule V2).
2. **The reveal plan**, pure: for a chest's final tier, which of at least three taps upgrade it
   (common never upgrades; legendary upgrades on each of three taps), and which tap opens it. The
   upgrades must look like chances: spread them over the taps by the seed, not always on the
   first ones. Record your reading of "at least 3 times" (three taps then an open tap, or the third
   tap opens) as a build call with a reversal.
3. **The seed**: choose it and, only if needed, the stored version with its migration and old-save
   test.
4. **Tests** in new files named for the feature (rule Q1): the same seed gives the same tier and the
   same plan; over many seeds the share of each tier is within a few points of the odds; every plan
   has at least three taps and upgrades exactly as many times as the tier is above common.
5. **Stop** and report part A, with the proposed odds and gems for Zach: common 55, rare 30,
   mythic 12, legendary 3 per cent; 20, 35, 60 and 100 gems.

Part B, when the lead sends word that item 46 is done:
6. **The dials**: the odds and the gems per tier in `dials.ts`, in a chest block, with the `GF-13`
   condition as the comment; `openChest` adds the gems of the chest's tier; its existing tests
   updated where the fixed 20 changes, the old cases kept.
7. **Record it.** As a subagent: your report is the record; do not edit `HANDOFF.md`, `PASSOFF.md`
   or `PLAN.md`. As a session of your own: the next free ledger step, row 50 `DONE: HANDOFF n`, and
   an `As built` note under `GF-13`.

Ask before building: nothing; report each call with a reversal. The odds and gems are proposals
Zach confirms later; they are dials, so a change is one line.

Not in scope, whoever asks: the chest screen and its taps (item 30); the chest art (item 48); any
purchase; any other game rule.

Hand back: the whole-repo gate, green, with the test counts; the build calls; the proposed odds and
gems; and the two commit blocks of Part 11.

### 51. Let the lesson host speak: the prompt in a speech bubble, and a NEW CONCEPT tag

**Model: Default (Opus 5.5). Lane O. Waits on item 46 for part B only.** Work in a worktree of your own.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach chose mascots that talk in lessons (`GF-11`, 2026-10-05), as in photo
2865 (`~/Downloads/IMG_2865.HEIC`): a host beside the prompt, a speech bubble that says the
instruction with the key word in colour, and a "NEW CONCEPT" tag over the title.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The exercise views are in `app/src/components/exercise/`; the lesson loop in
  `app/src/components/lesson/` is item 29's work (built, `HANDOFF.md` step 37) and stays as it is.
  The thinking host beside the prompt does not move today (BD-G23).
- The kit of item 46 provides `Bubble` (tail on any side, a highlighted word, typed text, a
  `talking` callback, a tap that finishes typing) and `Tag`. Never build a second bubble.
- Copy is in the warm register of `D10`; list every line you add.
- Tokens and dials only (rules U5, BD-G1); reduced motion shows the text whole and skips the bob.

Part A, now, without the kit:
1. **Read** the exercise components, the content schema (`app/src/content/schema.ts`) and the four
   units, and write down which text the host should say for each exercise kind, and where a key
   word can come from without changing content (none is also an answer).
2. **Pure parts with tests** (new files, rule Q1): the host's line for an exercise, the word to
   highlight if any, whether a NEW CONCEPT tag shows, and the layout rule that keeps the answer rows
   on screen on the smallest supported phone and in landscape (`D17`).
3. **Stop** and report part A. Do not edit any view yet.

Part B, when the lead sends the kit:
4. **Wire it**: the host mascot and a `Bubble` replace the plain prompt in each exercise view; the
   mascot bobs while `talking` is true; the `Tag` sits over the title of a concept exercise.
5. **See it** on the iPhone simulator in light and dark, on a small phone and in a lesson in
   landscape if a device allows, with screenshots.
6. **Record it.** As a subagent: your report is the record; do not edit `HANDOFF.md`, `PASSOFF.md`
   or `PLAN.md`. As a session of your own: the next free ledger step, row 51 `DONE: HANDOFF n`.

Ask before building: nothing; report each call with a reversal.

Not in scope, whoever asks: content edits, the finish screens (item 30), the feedback sheet, Rive
mouths (item 57), any file outside `app/src/components/exercise/` except new test files beside it.

Hand back: the whole-repo gate, green; screenshots; the copy lines added; the two commit blocks of
Part 11.

### 52. Replace the native tabs with a custom game tab bar

**Model: Default (Opus 5.5). Lane P. Part A waits on nothing; part B waits on items 46 and 48.**
Work in a worktree of your own. Use an iOS simulator that no other item is using.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, the Metro and simulator quirks under "Known facts"),
then `docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` (and `docs/conventions-python.md` for part B) in full, then `docs/incomplete/game-feel/DESIGN.md`
sections 8 and 9 (`GF-1` to `GF-19`) and `PLAN.md` sections 1 to 3. If your checkout was made
before section 9 and this prompt were committed, read both in the main checkout at
`/Users/zachshort/Projects/felto` (the design file and `PASSOFF.md`). Session rules, restated: never
run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes, note them and raise them;
write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit an SVG under
`assets/icons/` or `assets/mascots/`; never touch `assets/higgsfield/` or `assets/higgsfield-chest/`
(reference art, kept as received); never download a file without Zach's yes.

**Why this exists.** Zach chose every native control custom, "with a custom tab bar too"
(2026-10-05, `GF-10`, `GF-18`): a tab bar like the photos (`~/Downloads/IMG_2859.HEIC`, bottom row),
with coloured icons and a raised selected state, drawn from the tokens.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The tabs today are `NativeTabs` in `app/src/components/app-tabs.tsx`, under the `(tabs)` group of
  `app/src/app/` (Learn is `index.tsx`, which is `/`; then Practice and Profile). The root stack
  (`app/src/components/root-stack.tsx`) and the onboarding guard (`D20`) stay as they are.
- Route files stay thin (rule U1); a `_layout.tsx` holds the navigator and nothing else, and the
  view lives in `app/src/components/` (registry Z2 is the precedent).
- `PrimaryButton` (`app/src/components/button/primary-button.tsx`) is the raised-press pattern; the
  press haptic and sound go through `useHaptics` and `useSound` with the dials `pressHaptic` and
  `pressSound` (BD-G18, BD-G20). Reuse them; do not add a second press pattern.
- Other items running now own these files, so in part A do not edit them: `tools/build_icons.py`,
  `app/src/art/registry.ts`, `app/src/art/sizes.ts`, `CLAUDE.md` (item 48),
  `app/src/theme/tokens.ts`, `app/src/config/dials.ts`, `docs/conventions-typescript.md`,
  `app/src/components/kit/` (item 46). Report the tokens and dials you need instead.
- Use Context7 for the current expo-router tabs API (a JavaScript `Tabs` navigator with a custom
  `tabBar`, or the headless `expo-router/ui` tabs) before choosing.

Part A, now:
1. **Choose the navigator** from the docs and record the choice with a reversal. Deep links, the
   `/` route and the onboarding guard must keep working.
2. **The tab bar view** in `app/src/components/`: three tabs with an icon and a label, a raised
   selected state (a coloured face on a darker edge, as `PrimaryButton` draws it), a press that
   sinks, the press haptic and sound, the safe-area inset at the bottom, the tab role and selected
   state for screen readers, and Android's back behaviour as before. For icons in part A, use art
   the registry already has (name each choice), so part B only swaps names.
3. **See it** on the iPhone simulator in light and dark with each tab selected, and on Android if
   an emulator is free. Screenshots.
4. **Stop** and report part A.

Part B, when the lead sends word that items 46 and 48 are done:
5. **Tab icons** drawn by `tools/build_icons.py` in the house style (Learn, Practice, Profile, each
   with a selected and a resting colour if the design needs it), registered in the art module; the
   tokens and dials you reported, added to the blocks item 46 made; the kit's pieces where they fit.
6. **Record it.** As a subagent: your report is the record; do not edit `HANDOFF.md`, `PASSOFF.md`
   or `PLAN.md`. As a session of your own: the next free ledger step, row 52 `DONE: HANDOFF n`, and
   registry entry for the tab bar under `GF-10` in `docs/conventions-typescript.md`.

Ask before building: nothing; report each call with a reversal.

Not in scope, whoever asks: new tabs or routes; any screen inside a tab; the kit pieces themselves
(item 46); any other native control (item 32).

Hand back: the whole-repo gate, green; screenshots of each tab selected in light and dark; the
tokens and dials needed; and the two commit blocks of Part 11.

### 53. Make Flop talk, cheer and be sad in the Rive rig

**Model: Sonnet 5 (Zach's choice for the Rive work, 2026-10-05). Lane G. Waits on item 34
(`DONE`).** Zach runs this item himself: a session with the Rive editor open on his Mac, where an
agent drives the editor through the Rive MCP and Zach watches and judges the motion. The only repo
file it writes is `app/assets/rive/flop.riv`, so the main checkout will do unless another item has
that file open.

You are picking up felto, a poker-learning game whose app (Expo SDK 57, React Native 0.86.3,
TypeScript strict, bun 1.2.9) plays a Rive rig of Flop, the fish. Read `HANDOFF.md` first (steps 34
and 36 are the record of the rig and its runtime), then `docs/incomplete/game-feel/DESIGN.md`
section 9 (`GF-11` and `GF-19`), then board item 34's prompt below in this file, whose Rive facts
this prompt repeats only in part. Session rules, restated: never run `git commit`, `git push`,
`git add -A` or `git add .`; absolute dates only; no em dashes, no contractions and no banned AI
words in any document; no drive-by fixes, note them and raise them; never hand-edit
`app/assets/rive/flop.riv`, only re-export it from the Rive file (`CLAUDE.md:24`); never touch
`assets/higgsfield/` or `assets/higgsfield-chest/`; ask Zach before buying a Rive plan, running
`rive login` or downloading any file.

**Why this exists.** Zach chose mascots that talk in a speech bubble in lessons, on the finish
screens and on the path (`GF-11`), and asked for "characters talking with their mouths animated"
and for Rive items he will complete (`DESIGN.md` 9.1, messages 2 and 3). Flop hosts every lesson,
so his rig comes first, and the view-model contract it sets is the one Kicker (item 54) and Ace
(item 55) copy and item 57 reads.

**What is fixed.** Read these before changing anything; do not relitigate them.
- **Tools.** The CLI is `~/.rive/bin/rive` 1.3.0, not on PATH; RML cannot import SVG
  (`~/.rive/versions/1.3.0/docs/assets.md:236-246`), so the rig is built in the editor through the
  MCP. State-machine inputs are deprecated; drive everything with view-model properties
  (`docs/state-machines.md:11-20` of the same folder). `.riv` export works on Zach's plan; `.rev`
  export is refused, so do not retry it.
- **The sandbox.** `upload_asset` with a local path and `export_file` to a local folder fail with
  "Operation not permitted". Call the same MCP over HTTP at `http://127.0.0.1:9791/mcp`
  (initialize, take `mcp-session-id`, then `tools/call`), with a data URI for uploads and
  `inline_base64: true` for exports, piped to disk. Never print base64 into the conversation.
- **The file and the rig.** Rive file 2632317 in Zach's account is the only editable source.
  Artboard `Flop` (`0-2`, 600 by 520, transparent); `flop` `0-698` holds `fish` `0-15`, which
  holds `mouth` `0-17`, the eyes and pupils, `body` `0-52`, `fin_r` `0-144`, `fin_l` `0-199` and
  `tail` `0-254`; the cast shadow `flop_shadow` `0-699` sits outside `flop` and follows it. Item
  34's prompt lists every id, pivot and key; read it there.
- **Property keys.** x 13, y 14, rotation 15 (degrees), scale x 16, scale y 17 (percent), opacity
  18; timeline fps 56, duration 57 (frames), loop 59 (0 one shot, 1 loop, 2 ping-pong); transition
  duration 158 (ms), interpolation 349.
- **What the app already reads, which must not change.** `FlopRive`
  (`app/src/art/flop-rive.tsx:20-22`) loads artboard `Flop`, state machine `flop` and the
  view-model boolean `perfect`, with `AutoBind(true)` (`:52`). The animations `idle` (`0-6`) and
  `frantic` (`0-700`), view model `Flop` (`0-1391`), property `perfect` (`0-1393`) and instance
  `default` (`0-1395`) keep their names. The runtime, `rive-react-native` 9.8.5, can set booleans,
  numbers, enums and triggers on a bound instance
  (`app/node_modules/rive-react-native/lib/typescript/index.d.ts:3`); booleans are the kind proven
  on both platforms (`HANDOFF.md` step 36).
- **How to see a frame.** Moving a playhead does not change what `capture_artboard` draws. Set the
  keyed values of one frame on the rest pose, capture, and restore the rest pose from a saved
  snapshot, then check every value against it (item 34).

**The contract, which item 57 reads by these exact names.** On the existing view model `Flop`:
`talking` (boolean): while true the mouth opens and shuts in a loop, on its own layer of the state
machine `flop`, so it combines with any mood; `cheer` (boolean): the cheer mood, looped while true;
`sad` (boolean): the sad mood, looped while true; `perfect` (boolean): unchanged. With no mood true,
`idle` plays. The app sets at most one of `cheer`, `sad` and `perfect` at a time (item 57 tests
that), so the rig needs no priority between them.

Do these, in order:
1. **The talk loop**: a new animation `talk` on a second layer that opens and shuts `mouth`
   about four to five times a second (start from scale y, key 17), with a rest state when
   `talking` is false. If stills at the open and shut keyframes do not read as speech, ask Zach
   before importing another pose's mouth from `assets/mascots/fish/` (read, never changed).
2. **The cheer mood**: an animation `cheer`, looped: small hops, fins up, a fast tail.
3. **The sad mood**: an animation `sad`, looped: the fish droops and sinks a little, the tail slows,
   the fins hang, and the mouth turns down (scale y of the mouth below zero flips the smile).
4. **The transitions**: `idle` to `cheer` and to `sad` when each boolean is true, and back when it
   is false, 250 ms cubic like the two that exist; `perfect` keeps its own. Keep fish and shadow
   keyed from one source, as item 34 did, so the shadow never drifts.
5. **Check in the editor's simulation** that each boolean turns its state on and off, and that
   `talking` plays over `idle`, `cheer` and `sad`.
6. **Zach watches**: ask him to play the state machine and toggle each property; change what he
   names.
7. **Re-export** `flop.riv` into `app/assets/rive/` through the HTTP recipe, then run the
   whole-repo gate and open `/dev/art` on a simulator (`app/src/screens/dev-art-screen.tsx:37-39`
   draws the rig and its swim button) to check the app still loads it.
8. **Record it**: the next free ledger step with the new object ids (layers, animations,
   transitions, properties) and the contract above as built, and row 53 `DONE: HANDOFF n`.

Ask before building: (a) whether talking needs a second mouth shape, if the scale alone does not
read as speech; (b) the timing of each mood, which only Zach's eye can judge. Both are his calls,
and the answer to either may be no.

Not in scope, whoever asks: any app code (item 57); Kicker, Ace and the chest (items 54 to 56); any
generator or file under `assets/`; renaming an existing object, animation or property; a Rive plan
or `rive login`.

Hand back: what Zach should see in the editor with the state machine `flop` playing: `talking` on
makes the mouth open and shut steadily while the fish idles, cheers or droops; `cheer` on makes it
hop and flap; `sad` on makes it droop with a frown; `perfect` still sends it darting; each turns
off cleanly. Then the stills at each new keyframe; Zach's words on the motion; the size of the new
`flop.riv`; the gate, green, and a `/dev/art` screenshot; and the two copyable blocks for
`app/assets/rive/flop.riv`.

### 54. Rig Kicker the squid with Flop's contract

**Model: Sonnet 5 (Zach's choice). Lane G. Waits on item 53 (`DONE`).** Zach runs it, with an
agent driving the Rive editor through the MCP, as for item 53. Zach opens a new file in the Rive
editor first and gives the session its id, because only he can make a file in his account. Besides the ledger and the board, the
only file it writes is `app/assets/rive/kicker.riv` (new).

You are picking up felto, a poker-learning game whose app plays a Rive rig of Flop the fish.
Read `HANDOFF.md` first (steps 34 and 36, and item 53's step: the contract as built), then board
items 34 and 53 in this file for every Rive fact this prompt does not repeat, then
`docs/incomplete/game-feel/DESIGN.md` section 9 (`GF-19`). Session rules, restated: never run
`git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no
contractions and no banned AI words in any document; no drive-by fixes; never hand-edit an SVG
under `assets/` or a `.riv` under `app/assets/rive/`, only export it from the Rive file; never
touch `assets/higgsfield/` or `assets/higgsfield-chest/`; ask Zach before buying a Rive plan,
running `rive login` or downloading any file.

**Why this exists.** Kicker hosts the review and opens the chest (`D9`;
`app/src/content/cast.ts:1-3`; `app/src/components/chest/chest-view.tsx:18-19`). For him to talk
in a bubble the way Flop does (`GF-11`), he needs a rig with the same contract, so the app's one
mascot player (item 57) drives all three alike.

**What is fixed.** Read these before changing anything; do not relitigate them.
- The tools, the sandbox and HTTP recipe, the property keys and the way to see a frame are item
  53's, unchanged.
- The art: `assets/mascots/squid/squid_happy.svg`, viewBox `0 0 430 545`, with the ids `shadow`,
  `tentacles`, `body`, `sqClip`, `face`, `eye_l`, `pupil_l`, `eye_r`, `pupil_r` and `mouth`. Every
  pose of a character uses the same ids (`tools/build_mascots.py:7-9`), so a part from another pose
  drops into the same place.
- The shadow is a cast shadow on the page, as Flop's is: outside the character's group, following
  it down and to the right, never shrinking as the character lifts (item 34).
- **The contract, which item 57 reads by these exact names**: artboard `Kicker`, state machine
  `kicker`, view model `Kicker` with instance `default` bound to the artboard, and the booleans
  `talking`, `cheer` and `sad` with the same meaning and the same 250 ms cubic transitions as
  Flop's (item 53). With no mood true, `idle` plays. If item 53's step records a change to the
  contract, follow the step.

Do these, in order:
1. **Import** `squid_happy.svg` through the MCP (`upload_asset`, then `assets_tool
   addSvgInstance`), name the artboard, and move the shadow out of the squid into its own group.
2. **Pivots** at the tentacle roots, the body centre and the eyes, so a blink closes eye and pupil
   together.
3. **`idle`**: a slow float and a tentacle wave, looped, with one blink.
4. **`talk`** on its own layer, **`cheer`** (a bounce with the tentacles up) and **`sad`** (a
   droop, slow tentacles, the mouth turned down), with transitions on the three booleans.
5. **Simulate**, then **Zach watches** and names changes.
6. **Export** `kicker.riv` into `app/assets/rive/` through the HTTP recipe; check its size.
7. **Record it**: the next free ledger step with the file id, the object ids and the contract as
   built, and row 54 `DONE: HANDOFF n`.

Ask before building: the motion of each state, which is Zach's to judge, and the answer may be to
keep it simpler.

Not in scope, whoever asks: any app code (item 57); Flop, Ace and the chest; any generator or
file under `assets/`; a Rive plan or `rive login`.

Hand back: what Zach should see in the editor with the state machine `kicker` playing: the squid
floats and waves; `talking` moves the mouth over any mood; `cheer` bounces; `sad` droops; each
turns off cleanly. Then stills, Zach's words, the export's size, and the two copyable blocks with
`git add -N` first for `app/assets/rive/kicker.riv`.

### 55. Rig Ace the shark, the boss, with Flop's contract and a smug mood

**Model: Sonnet 5 (Zach's choice). Lane G. Waits on item 53 (`DONE`).** Zach runs it, with an
agent driving the Rive editor through the MCP, as for items 53 and 54; he opens a new file and
gives the session its id. It can run beside item 54, since each writes only its own `.riv`. Besides the ledger and the board, the
only file it writes is `app/assets/rive/ace.riv` (new).

You are picking up felto, a poker-learning game whose app plays a Rive rig of Flop the fish.
Read `HANDOFF.md` first (steps 34 and 36, and item 53's step), then board items 34 and 53 in this
file, then `docs/incomplete/game-feel/DESIGN.md` section 9 (`GF-19`). Session rules, restated:
never run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no em dashes,
no contractions and no banned AI words in any document; no drive-by fixes; never hand-edit an SVG
under `assets/` or a `.riv`, only export it from the Rive file; never touch `assets/higgsfield/` or
`assets/higgsfield-chest/`; ask Zach before buying a Rive plan, running `rive login` or downloading
any file.

**Why this exists.** Ace is the boss: he hosts every boss session, is sad when the player beats him
and smug when he wins (`app/src/components/boss/boss-finish.tsx:21`, `:29`). A rig lets him talk
in his bubble and gloat or sulk with motion instead of a still pose (`GF-11`, `GF-19`).

**What is fixed.** Read these before changing anything; do not relitigate them.
- The tools, the sandbox and HTTP recipe, the property keys and the way to see a frame are item
  53's, unchanged.
- The art: `assets/mascots/shark/shark_happy.svg`, viewBox `0 -30 430 500` (it starts above zero),
  with the ids `shadow`, `dorsal`, `fin_l`, `fin_r`, `body`, `belly`, `glasses` and `mouth`; every
  pose shares them (`tools/build_mascots.py:7-9`). `shark_smug.svg` is the still the smug mood
  must read like.
- The shadow is a cast shadow on the page, outside the shark's group (item 34).
- **The contract, which item 57 reads by these exact names**: artboard `Ace`, state machine `ace`,
  view model `Ace` with instance `default` bound, the booleans `talking`, `cheer` and `sad` as for
  Flop (item 53), and one more boolean, `smug`, looped while true. With no mood true, `idle` plays;
  the app sets at most one mood at a time.

Do these, in order:
1. **Import** `shark_happy.svg`, name the artboard, move the shadow out.
2. **Pivots** at the fin roots, the dorsal fin, the body centre and the glasses.
3. **`idle`**: a slow cruise in place with a fin sway, looped.
4. **`talk`** on its own layer; **`cheer`**; **`sad`** (sinks, fins drop, mouth down); **`smug`**
   (leans back, the glasses glint or tilt, a slow fin flick), each looped, with transitions on the
   four booleans.
5. **Simulate**, then **Zach watches** and names changes.
6. **Export** `ace.riv` into `app/assets/rive/`; check its size.
7. **Record it**: the next free ledger step with the file id, the object ids and the contract as
   built, and row 55 `DONE: HANDOFF n`.

Ask before building: the smug mood's look, which Zach judges against `shark_smug.svg`; the answer
may be a different gesture.

Not in scope, whoever asks: any app code (item 57); Flop, Kicker and the chest; any generator or
file under `assets/`; a Rive plan or `rive login`.

Hand back: what Zach should see in the editor with the state machine `ace` playing: the shark
cruises; `talking` moves the mouth over any mood; `smug` leans back and gloats; `sad` sinks;
`cheer` lifts; each turns off cleanly. Then stills, Zach's words, the export's size, and the two
copyable blocks with `git add -N` first for `app/assets/rive/ace.riv`.

### 56. Rig the chest in four tiers: a wiggle, a tap shake, an upgrade flash and the opening

**Model: Sonnet 5 (Zach's choice). Lane G. Waits on item 48 (`DONE`).** Zach runs it, with an
agent driving the Rive editor through the MCP, as for item 53; he opens a new file and gives the
session its id. Besides the ledger and the board, the only file it writes is `app/assets/rive/chest.riv` (new).

You are picking up felto, a poker-learning game whose app plays a Rive rig of Flop the fish.
Read `HANDOFF.md` first (steps 34 and 36, and item 48's step: the eight chest drawings), then board
items 34 and 53 in this file for the Rive facts, then `docs/incomplete/game-feel/DESIGN.md`
section 9 (`GF-13`, `GF-17`, `GF-19`). Session rules, restated: never run `git commit`,
`git push`, `git add -A` or `git add .`; absolute dates only; no em dashes, no contractions and no
banned AI words in any document; no drive-by fixes; never hand-edit an SVG under `assets/` or a
`.riv`, only export it from the Rive file; never touch `assets/higgsfield/` or
`assets/higgsfield-chest/` (the chest references are kept as received); ask Zach before buying a
Rive plan, running `rive login` or downloading any file.

**Why this exists.** A chest is opened by at least three taps; each tap shakes it, on the taps the
seeded plan chose it flashes and upgrades a tier, and the last tap opens it (`GF-13`). Item 30 draws
that with the kit and the SVGs; a rig makes the lid flip, the glow and the sparkles feel like a
game (`GF-17`, `GF-19`).

**What is fixed.** Read these before changing anything; do not relitigate them.
- The tools, the sandbox and HTTP recipe, the property keys and the way to see a frame are items
  34 and 53's, unchanged.
- The art is item 48's, eight SVGs in `assets/icons/ui/`: `chest`, `chest_rare`, `chest_mythic`,
  `chest_legendary` and the `_open` of each, all in the same three-quarter view. Read item 48's
  step for the viewBoxes and the palettes.
- The rule decides; the rig only shows. The tier and the taps come from item 50's seeded plan
  through item 30's screen; the rig never chooses a tier.
- **The contract, which item 57 reads by these exact names**: artboard `Chest`, state machine
  `chest`, view model `Chest` with instance `default` bound, and three properties: `tier` (number,
  0 common, 1 rare, 2 mythic, 3 legendary): a rise plays the upgrade flash and shows that tier's
  closed chest; `tap` (trigger): one shake; `open` (boolean): the lid flips back to the open chest
  of the current tier, with a glow and sparkles, and stays open while true. While closed and
  untouched, the chest wiggles now and then.
- Only booleans are proven end to end in this toolchain (`HANDOFF.md` step 36). `rive-react-native`
  9.8.5 exports `useRiveNumber` and `useRiveTrigger`
  (`app/node_modules/rive-react-native/lib/typescript/Rive.d.ts:20`, `:23`). Check in the editor's
  simulation that a view-model number and trigger drive the transitions; if the MCP cannot make one,
  use a boolean (`shaking`, which the app pulses) or four booleans for the tiers, and record the
  change in the ledger step, because item 57 follows the step.

Do these, in order:
1. **Import** the eight SVGs and stack each tier's closed and open drawing on one artboard,
   shown or hidden by opacity on `tier` and `open`.
2. **`idle`**: an occasional wiggle, looped. **`shake`**: one short shake on `tap`.
3. **`upgrade`**: a white flash and a ring of sparkles each time `tier` rises, then the new tier's
   chest.
4. **`opening`**: the lid flips back, a glow rises, sparkles burst; the contents show more as the
   tier rises (item 48 drew them).
5. **Simulate** every path (tier 0 to 3 in steps, a tap at each tier, open at each tier), then
   **Zach watches** and names changes.
6. **Export** `chest.riv` into `app/assets/rive/`; check its size.
7. **Record it**: the next free ledger step with the file id, the object ids and the contract as
   built, and row 56 `DONE: HANDOFF n`.

Ask before building: the feel of the flash and the opening, which Zach judges; and, if a number or
trigger property fails, the boolean shape before it is built. Both are his calls.

Not in scope, whoever asks: the tier rule and odds (item 50); the chest screen (item 30); any app
code (item 57); any generator or SVG; a Rive plan or `rive login`.

Hand back: what Zach should see in the editor with the state machine `chest` playing: the wooden
chest wiggles; firing `tap` shakes it; setting `tier` to 1, 2 and 3 flashes it into the blue, red
and gold chest; `open` flips the lid with a glow and sparkles over that tier's contents. Then
stills, Zach's words, the export's size, and the two copyable blocks with `git add -N` first for
`app/assets/rive/chest.riv`.

### 57. Play the rigs in the app: one mascot player, a chest player and static fallbacks

**Model: Opus 5.5. Lane F. Waits on items 30 to 32, 51 and 53 to 56 (all `DONE`).** Work in a
worktree of your own, made from `main` after they are merged.

You are picking up felto, a poker-learning game: an asset pipeline in `tools/` (Python, standard
library only) and an Expo app in `app/` (SDK 57, React Native 0.86.3, TypeScript strict, bun 1.2.9).
Read `HANDOFF.md` first (environment, code map, "Known facts", step 36, and the ledger steps of
items 30, 31, 51 and 53 to 56, whose contracts as built win over this prompt), then
`docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in full, then
`docs/incomplete/game-feel/DESIGN.md` sections 8 and 9 and `PLAN.md` section 8. Session rules,
restated: never run `git commit`, `git push`, `git add -A` or `git add .`; absolute dates only; no
em dashes, no contractions and no banned AI words in any document; no drive-by fixes, note them and
raise them; write `bun run --cwd app <script>`, never `bun --cwd app run <script>`; never hand-edit
an SVG under `assets/` or a `.riv` under `app/assets/rive/`; never touch `assets/higgsfield/` or
`assets/higgsfield-chest/`; never download a file without Zach's yes.

**Why this exists.** Zach asked for characters whose mouths move as they talk and for Rive work he
would have completed (`DESIGN.md` 9.1). Items 53 to 56 built the rigs in his Rive account; this
item plays them where the static poses stand today, so Flop, Kicker and Ace talk while their
bubbles type and the chest opens with its own motion (`GF-19`).

**What is fixed.** Read these before changing anything; do not relitigate them.
- `FlopRive` is the pattern (`app/src/art/flop-rive.tsx:27-59`): a pure `flopMode`
  (`app/src/art/flop-mode.ts:9-11`) picks the rig or the static pose from
  `motionAllowed("swim", reduced)` and a load failure; the static pose comes through `Mascot`; the
  view-model boolean is set with `useRiveBoolean` on a ref bound by `AutoBind(true)`; a dial delays
  the dart (`flopPerfectDelayMs`, `app/src/config/dials.ts:63`).
- `Mascot` is the one mascot component (`app/src/art/mascot.tsx:11-14`, `D4`: a move to Rive
  changes this file and nothing that calls it). Its poses are `cheer`, `happy`, `sad`, `sleep`,
  `smug` and `think` (`app/src/art/names.ts:7`).
- The boundary test matches `rive-react-native` and `@rive/` (`app/src/art/rive-boundary.test.ts:6`)
  and checks that `art/flop-rive.tsx` imports the runtime (`:17-19`); a rename moves that check.
  The alias `@rive/*` (`app/tsconfig.json:9`), `riv` in Metro's asset extensions
  (`app/metro.config.js:16-17`) and `app/src/types/rive.d.ts` already exist, so the new `.riv`
  files need no config, and no native library is added, so no rebuild should be needed.
- The contracts (items 53 to 56): artboards `Flop`, `Kicker`, `Ace`, `Chest`; state machines
  `flop`, `kicker`, `ace`, `chest`; mascot booleans `talking`, `cheer`, `sad` (and `perfect` for
  Flop, `smug` for Ace); chest `tier` (number), `tap` (trigger), `open` (boolean).
- Where the poses stand: the lesson host (`app/src/components/exercise/exercise-view.tsx:32`,
  with item 51's `Bubble` and its `talking` callback), the lesson finish (`FlopRive` in
  `lesson-finish.tsx`, with item 30's bubble), the boss finish (`boss-finish.tsx`, sad or smug),
  the chest (`chest-view.tsx` and `chest-screen.tsx`, item 30's reveal driven by item 50's plan),
  and the path greeting (`path-greeting.tsx`, item 31's bubble).
- Reduced motion (`GF-8`): every rig draws its static pose, and the chest its SVG for the tier and
  state.

Do these, in order:
1. **One mascot player** in `app/src/art/` for the fish, the squid and the shark: props for the
   character, a mood, `talking` and a width; a pure function, with its test, from the mood to the
   booleans it sets, which never sets two moods at once; a pure mode (rig or static) as
   `flopMode` does; a static fallback through `Mascot` with the pose that matches the mood.
   `FlopRive` becomes its fish case and keeps `perfect`.
2. **A chest player** in `app/src/art/`: `tier`, a tap and `open` from item 30's screen state; its
   static fallback is item 48's SVG for the tier and state.
3. **Wire them**: the lesson, review and boss hosts talk while their bubbles type; the finishes
   show the mood (a perfect lesson, a boss won or lost); the chest screen plays the reveal on the
   rig; the path greeting talks.
4. **The boundary and the rules**: the boundary test covers every `.riv`; rule U6 names the four
   files; the `CLAUDE.md` rule for `flop.riv` (`CLAUDE.md:24`) widens to all four; any new timing
   is a dial in the block `// game-feel second pass`.
5. **See it** on the iOS simulator and the Android emulator, light and dark, and with Reduce
   Motion on.
6. **Record it**: the next free ledger step, code map lines, an `As built` note under `GF-19`, the
   runtime entries of `PLAN.md` section 8 marked seen or `open`, and row 57 `DONE: HANDOFF n`.

Ask before building: nothing new; the contracts and the screens are settled. Report each build
call with a one-line reversal.

Not in scope, whoever asks: any change to a rig (items 53 to 56, re-exported from Zach's files
only); the bubbles, the reveal or the greeting themselves (items 30, 31, 51); the tier rule (item
50); new moods or poses.

Hand back: the whole-repo gate, green, with the run lines and the test count;
`git diff --stat -- assets/icons assets/mascots assets/sounds` empty; frame comparisons on both
platforms showing each rig moving (as step 36 did, "seen running, by frame comparison, not
watched"), the reduced-motion static screens, and a file that fails to load falling back; the line
"motion not judged: Zach on his phone"; then the two copyable blocks, `git add -N` first for new
files.

## Item 58: the web app

### 58. Build the app for the web at felto.app, and move the marketing site to download.felto.app

**Model: Opus 5.5. Lane R. Waits on Zach's answers to the five questions below (the domain first) and on items 34 and 49 being `DONE`, because both write `app/package.json` and `app/bun.lock`.** Run it in its own worktree. Nothing in it is silent-failure work: a web build that does not boot, or a type error, is loud. The one quiet risk is stored progress, and step 2 covers it.

You are picking up felto, a poker-training app. Read, in order: `HANDOFF.md` (Environment, Code map, then step 38, the site), `docs/incomplete/app/DESIGN.md` (`D13` and the hazards section), `docs/AGENT-PRACTICES.md`, then `docs/conventions-typescript.md` in full, because `app/` code follows it. Session rules: never run `git commit`, `git push`, `git add -A` or `git add .`; print the two copyable blocks at the end (`git add -N` for new files, then `git add` the exact files you touched, then `git commit` the same files with a short lowercase message, with no `Co-Authored-By` line and no "Generated with" line). Talk to Zach in ASD-STE100 Simplified Technical English. Documents you write have no em dashes and no contractions. Write `bun run --cwd app <script>`, never `bun --cwd app run <script>`. Never change DNS, attach a domain, deploy to production or buy a domain yourself: print the steps for Zach. Ask Zach in chat, in one batch, before any decision that is his.

**Why this exists.** Felto runs as a development build on simulators only, so nobody can try it without Xcode. A web version at `felto.app` lets anyone open the real app in a browser, which is the fastest way to show it to a friend or a reviewer. The marketing page, which says "Coming soon to the App Store", would then sit at `download.felto.app` and be the place a store link goes later. Expo can export the same routes and screens to the web, so most of the code is shared.

**What is fixed.** Read these; do not relitigate them.
- The app has no web target today (`app/app.json` has no `web` key; `react-native-web` and `react-dom` are not installed). Verified 2026-10-05.
- Native-only code is in few files, which keeps this small. Verified 2026-10-05 with a grep of `app/src`:
  - `expo-sqlite`: only `storage/kv-store-adapter.ts` (rule B4). Its interface is synchronous (`getItemSync`, `setItemSync`). `localStorage` is synchronous too, so a `kv-store-adapter.web.ts` fits without any change to the provider.
  - `rive-react-native`: only `art/flop-rive.tsx`. It has no web build. Web uses the static Flop art that item 57 and the existing fallback path draw.
  - `expo-notifications`: only `reminder/reminder-device.ts`. A web reminder is out of scope; the device module becomes a no-op on web and the reminder row in Profile is hidden.
  - `expo-haptics`: only `feedback/haptics.ts`. It does nothing on web; keep it that way, and confirm it does not throw.
  - `expo-audio`: only `feedback/effects.ts`. It supports web; browsers block sound until a tap, so check the first sound plays after a tap.
  - `@expo/ui` (SwiftUI and Compose): `screens/profile-screen.tsx`, `components/route-error.tsx`, `components/profile/*` (with `reminder-time.ios.tsx` and `reminder-time.android.tsx`, so web has no variant today), `screens/dev-art-screen.tsx`. Item 46 is replacing native controls with the game kit; build against whatever `main` holds when you start and do not duplicate its work.
  - `expo-system-ui` and the native tabs: `components/app-tabs.tsx`. Item 52 replaces the native tabs with a custom bar; read its state first.
- Platform extensions are the house way to split code (`reminder-time.ios.tsx` beside `.android.tsx`). Use `.web.ts` and `.web.tsx` files beside the native ones. Do not add `Platform.OS` branches inside shared files; `reminder-device.ts` is the only file with one today.
- Only `app/src/art/` imports an SVG or a WAV (rule U6), and the app draws `../assets` through the `@art/*` alias (`D5`). The web build must not copy anything into `app/` or write under `assets/`.
- `D13` says nothing ships from this repo: a development build on simulators, no store release, no deploy. Putting the app on a public address is a deploy. The marketing site is already deployed (step 38) because it is a page, not the app. So `D13` must be reopened in writing before the app goes public (question 1 below). The loot-box hazard in `DESIGN.md` (`GF-13`) is defined by purchase; the web build sells nothing and must stay that way.
- The site is `site/`, Astro static, Worker `felto-site` on Cloudflare (`site/wrangler.jsonc`, `assets.directory ./dist`). `SITE_URL` in `site/src/config.ts` is empty "until the domain is chosen" and feeds the canonical link. As of step 38 no domain is bought or attached, and the Cloudflare account the wrangler login holds may belong to another project of Zach's (step 38, open call (d)).
- Progress on the web would live in the browser's `localStorage`: per browser, not synced, and lost if the person clears site data. That matches the no-account, device-only promise on the page. The page and the Profile screen must say it plainly.

**Do these, in order.**
1. **Get the answers.** Ask the five questions below in one batch and wait. Do not start before the domain question has an answer, because every later step names the address.
2. **Add the web target.** In `app/`: install `react-native-web`, `react-dom` and `@expo/metro-runtime` at the versions `bunx expo install` picks for SDK 57 (read the versions it chose; do not hand-pick). Add `"web": {"bundler": "metro", "output": "single"}` to `app/app.json`. `single` is a single-page build, which needs no server and fits a static host. The reason to avoid `static` here is that the app reads stored progress before the first frame, and a pre-rendered page would show the empty state first. Run `bunx expo export -p web` and fix what stops the build, one file at a time, with a `.web` file beside the native one and no change to the native file.
3. **Storage.** Write `storage/kv-store-adapter.web.ts` over `localStorage`, same `KeyValueStore` shape. Wrap each read and write in `try/catch`: private windows and blocked site data make `localStorage` throw, and a throw there would blank the app. On a failed write the app keeps running with in-memory state. Add a test that a throwing store does not crash the provider. This is the step that decides whether a learner loses progress without knowing it, so also show a one-line notice in Profile on web: "Progress is saved in this browser only."
4. **The native-only screens.** Give each file in the "fixed" list a web path: a `.web.tsx` for `reminder-time` (render nothing, and hide the whole reminder row), a no-op `reminder-device` branch, a static Flop where `flop-rive.tsx` would load. Check that `app-tabs.tsx` or item 52's tab bar draws and routes on web. Do not redesign a screen.
5. **Run it and look.** Start `bunx expo start --web` and walk, in the browser pane at desktop width and at 375 px: onboarding and the placement check, one lesson to the finish, a boss, the chest, Practice, Profile, a reload that keeps progress, and a private window that does not crash. Record what you saw and what you did not: haptics, sound after the first tap, and Safari are not seen by an agent. Keep the console clean of errors, and record any warning you leave.
6. **Hosting files, no deploy.** Add `app/wrangler.jsonc` for a Worker named `felto-app` that serves `./dist` with the single-page fallback (`"not_found_handling": "single-page-application"`). Add a root script or a documented command for `bunx expo export -p web` then `wrangler deploy`. Do not run `wrangler deploy`. Print the exact commands for Zach, with the Cloudflare account he must confirm.
7. **The marketing site move, in files only.** In `site/src/config.ts` set `SITE_URL` to `https://download.felto.app/`. Add a "Try it in your browser" link on the page only if Zach said yes to question 4. Print, for Zach, the DNS and attach steps in this order, because the order avoids a gap where `felto.app` shows nothing: (a) attach `download.felto.app` to the `felto-site` Worker and wait until it serves the site; (b) deploy `felto-app`; (c) attach `felto.app` to `felto-app`; (d) attach `www.felto.app` as a redirect to `felto.app`. Note that the old `felto-site.<account>.workers.dev` address keeps working and can be turned off.
8. **Record it.** Add the new decision to `DESIGN.md` (the next free `D` number, the date, Zach's answer to question 1, and the condition that the web build sells nothing and keeps `GF-13` intact). Add the build command and the web notes to `CLAUDE.md` (Stack, Commands, and the line "nothing ships" corrected to say what does), `docs/README.md` and the `HANDOFF.md` code map. Append the next free ledger step, mark this row `DONE: HANDOFF n`, and print the two copyable blocks.

**Ask before building.** All five are Zach's calls, and any answer may be no.
1. **May the app go public at all?** `D13` says no deploy. Recommend yes for a free, no-account web build, with the decision written into `DESIGN.md`. If no, stop after step 5 and leave the site where it is.
2. **Is `felto.app` bought, and where does its DNS live?** Step 38 says no domain was bought. Buying a domain is a purchase and is his. If it lives outside Cloudflare, say so, because attaching it then needs a nameserver or CNAME change at that registrar.
3. **Which Cloudflare account and which host?** Recommend the same Cloudflare Workers assets setup as `felto-site`, in one account for both. EAS Hosting is the other choice. The wrangler login's account may belong to another project (step 38, call (d)); he must confirm it first.
4. **Does the marketing page link to the web app?** Recommend yes, a quiet "Try it in your browser" under the store button, since the store button is disabled today. If no, the page stays as it is and only the address changes.
5. **When does `felto.app` flip?** Recommend deploying the web app to its `workers.dev` address first, Zach plays it, then he flips `felto.app`. Until then `felto.app` can keep pointing at the marketing site. The risk of flipping early is that the address a stranger sees first is a half-working app.

**Not in scope, whoever asks.** Rive on web (`@rive-app/react-canvas`); web reminders or push notifications; accounts, sync between browser and phone, or any server for progress; a store release or the App Store link; Android or iOS native changes; any change to game rules, content, art, sound or the generators; a PWA install prompt or offline cache; analytics; redesigning any screen to suit a wide browser window beyond a centred, width-limited column.

**Hand back.** The whole-repo gate from `CLAUDE.md` green and its test counts unchanged except the new tests; `bunx expo export -p web` exits 0 and `app/dist` is gitignored; `git diff --stat -- assets/icons assets/mascots assets/sounds` empty; the "seen" and "not seen" list from step 5; the printed Cloudflare and DNS steps; then the two copyable blocks, with `git add -N` first for new files. Zach plays the web build on his own browser and phone before `felto.app` flips; an agent cannot judge feel.
