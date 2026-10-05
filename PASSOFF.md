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
| 1 | Write the Python code standard for `tools/` | `OPEN` | Opus 5.5 | A | nothing | `docs/conventions-python.md`, `CLAUDE.md` |

### 1. Write the Python code standard for the asset generators

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

**Do not paste a prompt marked DONE**: a fresh session would build it again.

A `DONE` item's prompt is folded out to the archive at close-out; its row stays here forever,
with its pointer at the ledger step. `SUPERSEDED` and `SETTLED AS NO` keep their sections:
the replacement and the reason are written nowhere else. `personal-config fold board` does it.
