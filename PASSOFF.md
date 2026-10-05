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
| 5 | App phase 1: change the icon generator for the app | `HELD` | Sonnet 5 | A | item 4; Zach's answer to `D15` to `D21` | `tools/build_icons.py`, `assets/icons/path/node_current_base.svg`, `assets/icons/ui/streak_freeze.svg`, `assets/icons/cards/*.svg`, `docs/conventions-python.md`, `CLAUDE.md` |
| 6 | App phase 2: write the TypeScript standard and re-add the app rules | `HELD` | Opus 5.5 | B | item 5 | `docs/conventions-typescript.md`, `docs/AGENT-PRACTICES.md`, `docs/README.md`, `CLAUDE.md`, `.gitignore` |
| 7 | App phase 3: scaffold `app/` and draw the art on both platforms | `HELD` | Opus 5.5 | B | item 6; the art commit | `app/` config files, `app/src/app/dev/`, `app/src/config/`, `app/src/theme/`, `CLAUDE.md`, `docs/AGENT-PRACTICES.md`, `.personal-config.json`, `.gitignore` |
| 8 | App phase 4: game state and the data module | `HELD` | Opus 5.5 | B | item 7 | `app/src/game/`, `app/src/storage/` |
| 9 | App phase 5: cards, the evaluator and the content schema | `HELD` | Opus 5.5 | C | item 7; a push | `app/src/cards/`, `app/src/content/` except `units/` lessons |
| 10 | App phase 6: content, units 1 and 2 | `HELD` | Opus 5.5 | C | item 9 | `app/src/content/units/` (units 1 and 2) |
| 11 | App phase 7: content, units 3 and 4, and the preflop chart | `HELD` | Opus 5.5 | C | item 10 | `app/src/content/units/` (units 3 and 4), the chart file |
| 12 | App phase 8: tabs, the path and the stat bar | `HELD` | Opus 5.5 | B | items 8 and 10; lane C merged | `app/src/app/(tabs)/`, `app/src/art/`, the path, mascot and stat bar components |
| 13 | App phase 9: the lesson | `HELD` | Opus 5.5 | B | items 12 and 17 | `app/src/app/lesson/`, the exercise and feedback components |
| 14 | App phase 10: boss, review, chest and lives | `HELD` | Opus 5.5 | B | item 13 | the boss, review, chest and out-of-lives routes and components |
| 15 | App phase 11: profile, settings and the reminder | `HELD` | Opus 5.5 | B | item 14 | the Profile route and components, the reminder module |
| 16 | App phase 12: close out | `HELD` | Sonnet 5 | B | items 5 to 15 and 17 to 20 | `docs/conventions-typescript.md`, `docs/incomplete/app/RUNTIME-PASS.md` |
| 17 | App phase 13: write the sound generator | `HELD` | Opus 5.5 | A | item 7 | `tools/build_sounds.py`, `assets/sounds/`, `docs/conventions-python.md`, `CLAUDE.md`, `.personal-config.json` |
| 18 | App phase 14: random dealers for practice | `HELD` | Opus 5.5 | C | item 11 | `app/src/drills/` |
| 19 | App phase 15: the Practice tab | `HELD` | Opus 5.5 | B | items 14 and 18; lane C merged | the Practice route and components |
| 20 | App phase 16: onboarding and the placement check | `HELD` | Opus 5.5 | B | item 19 | the onboarding routes and components |

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

**Model: Sonnet 5 (Mechanical). Lane A. Waits on board item 4 and Zach's answer to `D19`.** Work in the main
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
- Board item 4 also edits `docs/conventions-python.md`. It must be `DONE` first; if it is still
  `OPEN`, do it first, from its own prompt above.

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
