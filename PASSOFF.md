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
| 22 | Unit stories phase 1: dealt hands in lessons 3 and 5 and in every boss | `OPEN` | Opus 5.5 | D | nothing | `app/src/game/dealt-slots.ts` (new), `app/src/game/session.ts`, `app/src/screens/lesson-screen.tsx`, `app/src/components/boss/boss-session.ts`, `app/src/config/dials.ts` (block `// unit-stories`) |
| 23 | Unit stories phase 2: the story engine, the route and the header button | `OPEN` | Opus 5.5 | E | nothing | `app/src/app/story/`, `app/src/screens/story-screen.tsx`, `app/src/components/story/`, `app/src/content/stories/schema.ts`, `app/src/components/root-stack.tsx`, `app/src/components/path/unit-header.tsx`, `app/src/components/path/path-view-model.ts`, `app/src/config/dials.ts` (block `// unit-stories`) |
| 24 | Unit stories phase 3: the hands story content | `HELD` until item 23 is `DONE` | Opus 5.5 | E | item 23 | `app/src/content/stories/hands.ts`, `app/src/content/stories/hands-story.test.ts` |
| 25 | Unit stories phase 4: close out | `HELD` until items 22 to 24 are `DONE` | Sonnet 5 | E | items 22 to 24 | `docs/README.md`, `docs/incomplete/unit-stories/`, `docs/incomplete/app/DESIGN.md`, `HANDOFF.md` |
| 26 | Game feel phase 1: Reanimated, the motion module, tokens and the primary button | `DONE: HANDOFF 29` | Opus 5.5 | F | nothing | `app/package.json`, `app/bun.lock`, `app/src/motion/`, `app/src/components/button/`, `app/src/theme/tokens.ts`, `app/src/config/dials.ts` (block `// game-feel`), `docs/conventions-typescript.md` |
| 27 | Game feel phase 2: haptics, the Haptics switch and stored version 3 | `DONE: HANDOFF 30` | Opus 5.5 | F | item 26 | `app/src/feedback/`, `app/src/storage/migrations.ts`, `app/src/storage/check-state.ts`, `app/src/storage/player-actions.ts`, `app/src/game/player-state.ts`, `app/src/game/settings.ts`, `app/src/components/profile/`, `app/src/screens/profile-screen.tsx`, `app/src/components/lesson/lesson-run-view.tsx` and `feedback-sheet.tsx` (the press haptic only) |
| 28 | Game feel phase 3: six new sound effects | `DONE: HANDOFF 32` | Opus 5.5 | F | item 27 | `tools/build_sounds.py`, `assets/sounds/`, `app/src/art/sounds.ts`, `app/src/feedback/effects.ts`, `app/src/config/dials.ts` (block `// game-feel`), `app/src/components/lesson/lesson-run-view.tsx` and `feedback-sheet.tsx` (the press sound only) |
| 29 | Game feel phase 4: the answer loop | `OPEN` | Opus 5.5 | F | item 28 | `app/src/components/lesson/`, `app/src/components/exercise/`, `app/src/feedback/` |
| 30 | Game feel phase 5: finish, chest and boss screens | `HELD` until item 29 is `DONE` | Opus 5.5 | F | item 29 | `app/src/components/lesson/lesson-finish.tsx`, `app/src/components/chest/`, `app/src/components/boss/boss-finish.tsx`, `app/src/screens/chest-screen.tsx` |
| 31 | Game feel phase 6: the path | `HELD` until item 30 is `DONE` | Opus 5.5 | F | item 30 | `app/src/components/path/`, `app/src/art/path-node-art.tsx`, `app/src/art/colour-swap.json`, `tools/build_icons.py` only if the node decision needs it |
| 32 | Game feel phase 7: Learn, Profile, empty states and mascot life | `HELD` until item 31 is `DONE` | Opus 5.5 | F | item 31 | `app/src/screens/learn-screen.tsx`, `app/src/screens/profile-screen.tsx`, `app/src/components/profile/`, `app/src/components/onboarding/`, `app/src/art/mascot.tsx` |
| 33 | Game feel phase 8: close out | `HELD` until items 26 to 32 are `DONE` | Sonnet 5 | F | items 26 to 32 | `docs/README.md`, `docs/incomplete/game-feel/`, `docs/incomplete/app/DESIGN.md`, `HANDOFF.md` |

**Do not paste a prompt marked DONE**: a fresh session would build it again.

A `DONE` item's prompt is folded out to the archive at close-out; its row stays here forever,
with its pointer at the ledger step. `SUPERSEDED` and `SETTLED AS NO` keep their sections:
the replacement and the reason are written nowhere else. `personal-config fold board` does it.

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

Items 24, 25 and 30 to 33: their prompts are written by the session that closes the item before
them, from the matching phase in `docs/incomplete/unit-stories/PLAN.md` or
`docs/incomplete/game-feel/PLAN.md`.
