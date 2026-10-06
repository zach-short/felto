# Docs index: felto

Every document in the repo has a line here: what it is, whether it is kept current, and the date
it was last checked against the tree. It is ordered by status first, then by topic
(`docs/AGENT-PRACTICES.md`, Part 8.2). Written 2026-10-05 for board item 6 and reconciled for
board item 16 on the same date; the file list was taken with
`find . -name '*.md' -not -path './.git/*' -not -path './.claude/*' -not -path '*/node_modules/*'`
excluding the generated `app/ios`, `app/android` and `app/.expo` (13 files). A doc with no line
here is invisible, so a new doc gets its line in the same change that adds it.

## Open work

Efforts in progress live in `docs/incomplete/<effort>/`. Their files change with every phase.

| Doc | What it is | Kept current? | Checked |
|---|---|---|---|
| `docs/incomplete/app/DESIGN.md` | The app: what it is and why, decisions `D1` to `D21` | Yes, by amendment only: a decision is never edited in place | 2026-10-05 |
| `docs/incomplete/app/PLAN.md` | The order of work for the app: facts, build decisions BD-1 to BD-28, 16 phases on board items 5 to 20 | Yes: each phase sets its own header | 2026-10-05 |
| `docs/incomplete/app/RUNTIME-PASS.md` | The final, ordered list of what only a person on a device can still check, 47 entries and the decisions that are Zach's | Yes, until Zach has walked it; then the folder is archived (Stage 8) | 2026-10-05 |
| `docs/incomplete/unit-stories/DESIGN.md` | Repeated questions in early lessons and an optional tap-through story before each unit: scope, options, Zach's answers of 2026-10-05, decisions `US-1` to `US-8`, each with its `As built` note for the phases built | Yes, by amendment only | 2026-10-05 |
| `docs/incomplete/unit-stories/PLAN.md` | The order of work for that effort: facts, `BD-S1` to `BD-S13`, 4 phases. Phases 1 to 3 are built and merged into `main` (`HANDOFF.md` steps 28, 31 and 33); phase 4 is the close-out. Section 7 holds the runtime entries, each marked seen or `open` | Yes: each phase sets its own header | 2026-10-05 |
| `docs/incomplete/game-feel/DESIGN.md` | More animation, colour, haptics, sound and character, with 12 Duolingo Chess photos as reference: scope, options, Zach's answers of 2026-10-05, decisions `GF-1` to `GF-9`, and in section 9 the second pass of the same day (a 13th photo, the chest references, decisions `GF-10` to `GF-19`) | Yes, by amendment only | 2026-10-05 |
| `docs/incomplete/game-feel/PLAN.md` | The order of work for that effort: facts, `BD-G1` to `BD-G30`, 8 phases (1 to 4 built), and in section 8 the second pass: board items 46 to 57 and phases 5 to 7 widened, with its dials and runtime entries | Yes: each phase sets its own header | 2026-10-05 |
| `docs/incomplete/gto-trainer/DESIGN.md` | A 6-max GTO trainer with the mascots at the table, random hands, a review of each decision and a paid tier: scope, options, dials, hazards, open questions, and Zach's answers of 2026-10-05 in section 6 (A2, B1, C2, D1, E1) | Yes, by amendment only | 2026-10-05 |
| `docs/incomplete/gto-trainer/PLAN.md` | The order of work for the trainer: facts (including the public-dataset search), `BD-T1` to `BD-T19`, 10 phases in three lanes. Approved at GATE 2, 2026-10-05; phase 1 built the same day (board item 35) | Yes: each phase sets its own header | 2026-10-05 |
| `docs/incomplete/gto-trainer/KEY-SPEC.md` | The game the solver solves and the key's file shape, frozen 2026-10-05: seats, sizes, the 65-node tree, payoffs, the realization model, the simplifications with the hands they move, the schema and spec hash, the acceptance bands with sources, the feasibility estimate, the cold review | Yes, by amendment only: a change to the game is a new solve | 2026-10-05 |
| `docs/incomplete/autopilot-2026-10-05/STATE.md` | The state file of the `/autopilot` run of 2026-10-05, with Zach's answers to `D15` to `D21` | No: a record of that run | 2026-10-05 |
| `docs/incomplete/autopilot-2026-10-05/RUNDOWN.md` | The report of that run | No: a record of that run. It says items 6 to 20 had no prompts, which was true when it was written and is not true since the prompts were added to `PASSOFF.md` | 2026-10-05 |

## Current

| Doc | What it is | Kept current? | Checked |
|---|---|---|---|
| `HANDOFF.md` | The ledger: environment, settled decisions, code map, the step log. Read first | Yes; the step log is append-only | 2026-10-05 |
| `PASSOFF.md` | The board: what is next, one standalone prompt per item | Yes | 2026-10-05 |
| `CLAUDE.md` | The router and hazard list every session loads | Yes | 2026-10-05 |
| `docs/AGENT-PRACTICES.md` | The process standard: how work is scoped, sized, routed, recorded and closed | Yes | 2026-10-05 |
| `docs/conventions-python.md` | The code standard for every `.py` file (`tools/` and `solver/`), version 1.2.3 | Yes | 2026-10-05 |
| `docs/conventions-typescript.md` | The code standard for every `.ts` and `.tsx` file under `app/`, version 1.1.0: 21 rules, registry Z1 to Z4, a Known gaps list, real felto examples | Yes | 2026-10-05 |
| `docs/README.md` | This index | Yes | 2026-10-05 |

## Not kept current

| Doc | What it is | Why it is not current |
|---|---|---|
| `PART0-PROMPT.md` | The prompt that adapted the process standard to felto on 2026-10-04 | A one-time prompt. It is gitignored (`.gitignore:2`), and line 4 names a scratchpad path, not the repo (`HANDOFF.md`, Known facts) |

## Standing rules that outlived their doc

None on 2026-10-05: no effort has closed and been archived yet (Part 8.3).
