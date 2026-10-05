# Plan: GTO trainer

Status: `APPROVED` 2026-10-05 (GATE 2, Zach in chat). Scope and Zach's answers are in `DESIGN.md`
(section 6, "Answers"): own solver (A2), preflop scored first (B1), new Higgsfield round (C2),
paywall at the store-release phase (D1), grading by frequency and EV loss (E1). This plan says
in what order, by whom and done when. Read `docs/AGENT-PRACTICES.md` and
`docs/conventions-typescript.md` first (and `docs/conventions-python.md` for any `.py` file). The
whole-repo gate and the hazards are in `CLAUDE.md` and `HANDOFF.md`.

**What no gate can see.** Typecheck, lint and vitest cannot tell whether a strategy table is
right. A solver can converge to a wrong game, and a grader can read the right table wrongly, and
every test can still pass. Phases that write or read the key are therefore proven by an
independent cross-check, named in each done-when, and the key itself is reviewed by a Deep
reviewer. A screen is proven by a screenshot on both platforms, and a feel only by Zach.

## 0. Facts verified 2026-10-05 (these win over the design where they differ)

The question this section answers first: does a public dataset of solved 6-max, 100 big blind
preflop strategy exist, so the solver can be skipped?

| # | Fact | Source |
|---|---|---|
| 1 | No clean, solver-origin, openly licensed dataset turned up. The searches found three kinds of thing: hand-written charts, repos of unclear provenance, and paid products | web searches and the checks below, 2026-10-05 |
| 2 | `byw1/poker-trainer`: MIT, raise-first-in only, and its own README says the lists are "not a solver dump" | <https://github.com/byw1/poker-trainer> |
| 3 | `jensbaagaard/poker-practice` has the right shape (271 scenario keys of 169 hands: open, call, 3-bet, 4-bet, 5-bet, per position pair, with frequencies). Its README says MIT, but GitHub reports no licence file (`license: null`), and its data README describes pulling the ranges out of another app's bundled JavaScript ("the app ships all built-in ranges inline as `JSON.parse` blobs; there is no API", with chunk names). That reads like data copied from a commercial app, so it is not safe to ship and is not used as data | `gh api repos/jensbaagaard/poker-practice`; its `data/openSourcePokerData/README.md` |
| 4 | `michaellhan/preflop` returned 404 | fetch, 2026-10-05 |
| 5 | `poker-tui` on PyPI uses "hand-calibrated charts modeled on published solver baselines" and states no licence | <https://pypi.org/project/poker-tui/> |
| 6 | Full preflop solutions are sold (poker.academy, Simple GTO, others). Their licences were not read; the usual term forbids redistributing the tables inside another product, which is what an app does | search results, not verified |
| 7 | TexasSolver is open source (AGPL) but solves postflop only. It is a possible offline tool for the later flop phase, not for this one | <https://github.com/bupticybee/TexasSolver> |
| 8 | `RZ412/PokerBench` (Apache-2.0) holds "optimal decisions computed by solvers" as text, preflop and postflop. It was not opened. It is a possible cross-check set, not a source: sizes and rake are unknown | <https://huggingface.co/datasets/RZ412/PokerBench> |
| 9 | What the public repos are good for: the schema shape in row 3, and a place to read published frequencies. What they cannot give is a key the repo can regenerate and defend | rows 2 to 5 |
| 10 | The repo has no solver, no table, no betting engine and no payment code | `DESIGN.md` section 1 |
| 11 | Python in `tools/` is standard library only; the app is TypeScript under `app/src/` | `CLAUDE.md` Stack |
| 12 | Player state is stored version 4 | `app/src/storage/migrations.ts:6` |
| 13 | The git tree has uncommitted work from another session: `HANDOFF.md`, `PASSOFF.md`, `assets/appicon/`, `scripts/felto`, `tools/build_appicon.py` | `git status --short`, 2026-10-05 |

**Consequence for the plan.** Answer A2 stands, and the first phase is a feasibility check on it
before any solver code is written, because the key is the one part nothing can fall back on.

## 1. Decisions taken since ratification

| BD | Decision | Reversal |
|---|---|---|
| BD-T1 | No public repo's range data is shipped or copied (facts 3 and 5). Published charts may be read to set the acceptance numbers of phase 1, with the source named, never pasted | Buy a licence for a vendor's tables and replace phases 2 to 4 |
| BD-T2 | The game being solved is fixed in `KEY-SPEC.md` (phase 1) and nowhere else: 6 players, 100 big blinds, no ante, no straddle, no rake, fixed open, 3-bet, 4-bet and all-in sizes. Every screen and every line of copy names these assumptions | Change the spec and re-solve; the key carries the spec hash, so a mismatch fails a test |
| BD-T3 | The solver is a development tool that writes data. The app never runs it. It lives in `solver/`, not `tools/`, and uses Python with numpy (2.4.3 is installed): the standard-library-only rule of `tools/` cannot reach the speed a 169-hand tree needs, and `docs/conventions-python.md` already governs the code. The output is committed JSON. Zach asked 2026-10-05 "why not rust or go?". Rust is the faster language and its output would be as deterministic, but the repo has no Rust standard (Part 8.1 needs one before the first file), and a vectorised numpy run may be fast enough. Go has no speed advantage over numpy for this work. Phase 1 settles it from the node count: if the estimate is over an hour, the solver is written in Rust (installed, 1.86) and phase 1 adds a Rust code standard first | Write the solver in Rust (see left), or in TypeScript under bun at slower speed |
| BD-T4 | Multiway is not solved. The scored path is: the opener, then any one defender who calls or re-raises. Every other player folds in the solved tree. Bots that act in a spot the solved tree does not cover follow a plain fold-or-call rule from the unit 3 chart, and the review marks the hand "multiway, not scored" | Solve a multiway abstraction later |
| BD-T5 | After preflop, a hand with two or more players left runs out the board and goes to showdown with no postflop betting (dial `gtoPostflopMode` = `runout`). The review shows the winner and the pot. The player sees "scored on preflop only" in plain words | Add the flop phase (option B2) |
| BD-T6 | The key stores, per decision node and hand class, one frequency per action and one EV per action in big blinds. The grader reads only these. A table with no EV cannot be graded, so a key without EV fails validation | Grade by frequency alone (option E2) |
| BD-T7 | A dealt hand is a seed. The same seed gives the same deal, the same bot choices and the same review, so a session can be replayed and a bug reproduced (`app/src/game/seeded-random.ts`, `app/src/drills/random.ts`) | Draw from the system generator |
| BD-T8 | Strategy tables ship as bundled JSON read through one module, `app/src/gto/key.ts`. No other file imports a table. Their size is measured in phase 4 and recorded | Fetch from a server (needs the backend that does not exist) |
| BD-T9 | The free allowance is a function, `handsLeftToday(state, now)`, called from the one start button. Phase 9 builds it with a dial and no paywall; the store phase later replaces what it returns. Nothing else knows about a tier | Build the paywall in phase 9 (option D2) |
| BD-T10 | Higgsfield output goes to a new folder, `assets/higgsfield-table/`, kept as received. `assets/higgsfield/` stays frozen. How a character becomes a drawable asset is decided in phase 8, with Zach | Put the files in `assets/higgsfield/` (a violation of `CLAUDE.md`) |
| BD-T11 | Phase 1, 2026-10-05. The solved game is one six-player game with a heads-up-only rule: the first seat that calls or 3-bets becomes the defender and every later seat is removed with no decision (`KEY-SPEC.md` 2.2). It is not fifteen separate two-player solves, which would open `UTG` as wide as the button because it would face one opponent. BD-T4 stands and is now a rule of the game | Solve the pairs separately (wrong opener ranges), or a multiway abstraction later |
| BD-T12 | Phase 1, 2026-10-05, Zach's answer (a). A called pot is valued by all-in equity bent by one number per pot type: the out-of-position share is `e − c × e × (1 − e)`, the in-position share the rest; `c` is 0 all-in (`KEY-SPEC.md` 3.2, option RF-2). Phase 3a tunes the `c` values to the bands and freezes them; phase 3b may not touch them. Superseded in part by BD-T18 the same day: `c` also depends on who holds the edge, the curve is `(1 − e)^2`, and a flat is taxed (BD-T17) | RF-3 (a per-class adjustment from hand features) if the phase 4 Deep review finds the composition wrong while the bands hold; RF-4 (a rolled-out postflop model) is a later effort |
| BD-T13 | Phase 1, 2026-10-05, Zach's answer (b). One size at every level: open 2.5 (`SB` 3), 3-bet 7.5 in position and 10 from a blind, 4-bet 20, 22 or 25 by row, 5-bet all-in, no limp (`KEY-SPEC.md` 2.3, option M1). This replaces the dial `gtoOpenSizeBb` of section 3 with the spec's table. Superseded in part by BD-T19 the same day: `sb_vs_bb` is 9 and 23, not 10 and 25 | A limp (M2) or a second size (M3) is a new tree and a new solve |
| BD-T14 | Phase 1, 2026-10-05, Zach's answer (c). "GTO trainer" may be the mode's name; "GTO" never qualifies an answer; a verdict says "the solver"; the game statement is one tap from every verdict (`KEY-SPEC.md` 6, option C1). Phase 10 writes the copy under this rule | Drop the word (C2) |
| BD-T15 | Phase 1, 2026-10-05. The key schema is `felto-gto-key/1` (`KEY-SPEC.md` 7): node ids are the action history as `SEAT:action` tokens joined by `/`, hands follow `allHandClasses()` of `app/src/cards/hand-class.ts`, and `spec_hash` is the SHA-256 of the canonical JSON of the embedded `game` object, pinned as a constant in `app/src/gto/key.ts` and recomputed only by `solver/validate_key.py` | Hash the whole spec file (every prose edit would then invalidate the key) |
| BD-T17 | Phase 1, 2026-10-05, after the cold review (`KEY-SPEC.md` 10) and Zach's answers Q1 (no) and Q4 (yes). The flat call stays a legal, graded action at every seat, and a flat by `HJ`, `CO`, `BTN` or `SB` is taxed: both pot shares at that leaf are multiplied by `(1 − t)`, `t_ip` for the three in-position seats and `t_sb` for the small blind, tuned in phase 3a to the flat bands (`KEY-SPEC.md` 3.2). Without it a correct solve flatted about 70 percent of hands from the button | Remove the flat for every seat but the big blind (the review's first choice, which Zach declined), or a squeeze subtree with a third live player |
| BD-T18 | Phase 1, 2026-10-05, Zach's answer Q2. The realization bonus goes to the player with the edge: the in-position player when it raised last, otherwise the out-of-position raiser; `c` is one value per pot type for each case (six dials), and the curve is `s = e − c × e × (1 − e)^k` with `k = 2` (`KEY-SPEC.md` 3.2). Phase 3a tunes on four spots (button against big blind, cutoff against button, small blind against big blind, button against small blind), not one; this is the forced change to phase 3a | `k = 1` and one `c` per pot type (the first draft), or RF-3 |
| BD-T19 | Phase 1, 2026-10-05, Zach's answer Q3. The `sb_vs_bb` row is open 3, 3-bet 9, 4-bet 23, 5-bet all-in; the sources say 2.63 to 3.0 times the open and the big blind is in position (`KEY-SPEC.md` 2.3, 8.3) | 10 and 25, as the first draft had |
| BD-T16 | Phase 1, 2026-10-05. The solver is Python with numpy. One iteration over the 65-node tree costs about 10 ms on this Mac, so the hour of BD-T3 is reached only past 350,000 iterations (`KEY-SPEC.md` 9). No Rust standard is written | Rust, if phase 3b measures a run above the hour; `docs/conventions-rust.md` first, to the shape of Part 8.1 |

## 2. Phases

Lanes: **S** (the key: phases 1 to 4), **T** (the table: phases 5 to 7, 9, 10) and **A** (art:
phase 8, mostly Zach). Lane T starts at phase 5 on a fixture key as soon as phase 1 freezes the
key's schema. Lane A runs beside both.

| # | Phase | Driver | Subagents | Est. context | Why that shape |
|---|---|---|---|---|---|
| 1 | Game spec, schema and feasibility | Deep (Fable 5.1) | Default researcher, own worktree: collect published aggregate frequencies with sources | comfortable | Every later phase depends on these decisions, and a wrong one is silent |
| 2 | Preflop equity table | Default (Opus 5.5) | none | comfortable | Deterministic, checkable against well-known matchups |
| 3a | Solver core: one spot | Deep | none | tight | The risk of the effort: if the solver is wrong here, nothing after it matters. Kept small so the proof is complete |
| 3b | Solver: the full tree and convergence | Deep | none | tight | Scale-up of 3a; split because Deep has half a normal phase |
| 4 | Key export, validation, containment check | Default | Deep reviewer, own worktree, review only | full | The writer is Default; the verdict on the key is Deep |
| 5 | Hand engine | Default | none | full | Pure TypeScript state machine over a fixture key; loud failures |
| 6 | Grading and review model | Default | Deep reviewer on `grade.ts` only, own worktree | comfortable | A short load-bearing file that reads the key |
| 7 | Table screen and seats | Default | none | full | Screens; proven by screenshots |
| 8 | Three new characters | Default, with Zach | none | comfortable | Zach runs Higgsfield; the agent files and wires the output |
| 9 | Session flow, storage and the free allowance | Default | none | full | Stored version 5, the Practice entry, summary |
| 10 | Copy, runtime pass, close-out | Mechanical (Sonnet 5) | none | comfortable | Reconcile docs and list what only a person can check |

### Phase 1: Game spec, schema and feasibility

**BUILT 2026-10-05** (board item 35, lane H, on `main`, `HANDOFF.md` step 41; the commit is Zach's and
pending). Built: `KEY-SPEC.md` (the game, the tree, the payoffs, the leaf model, the simplifications
with the hands they move, the schema, the bands, the feasibility estimate, the cold review),
`solver/validate_key.py` (the stub), BD-T11 to BD-T19, and a scope amendment to
`docs/conventions-python.md` (1.2.2). The estimate chose numpy (BD-T16), so no Rust standard was
written. Zach answered two batches in chat the same day (`KEY-SPEC.md` 11). What this phase forces
on later phases: (1) phase 2 also writes the deal-weight table `W` beside the equity table `E`
(`KEY-SPEC.md` 3.3), and brings the dated amendment to rule M4 of the Python standard before the first
numpy import; (2) phase 3a tunes nine leaf-model dials on four spots, not one (`KEY-SPEC.md` 3.2,
BD-T18), and its done-when gains the bands of `KEY-SPEC.md` 8.2 for those spots, including the
button's flat rate against the cutoff and the small blind's against the button; (3) phase 4's loader
pins the hash of `KEY-SPEC.md` 12 as frozen by phase 3a, and its Deep review is the next cold read,
because the review of this phase saw the first draft, not the game as it now stands (`KEY-SPEC.md`
10); (4) the bands are thin where `KEY-SPEC.md` 8.4 says, and none is rakeless. Deviation from the
plan's text: the `done when` asked for three named sources per band; the open rates, the big blind
against the button and the button against the cutoff have three or more, the opener facing a 3-bet
has two solver sources and one heuristic, and two spots have none (8.4). Gate: the app gate ran
green and unchanged on 2026-10-05, 86 test files and 629 tests (the live count; the plan's 63 and
490 were the count when it was written).

1. Write `docs/incomplete/gto-trainer/KEY-SPEC.md`: the exact game (BD-T2), the action tree
   (open, 3-bet, 4-bet, all-in, by position), the sizes, how the leaf value is computed
   (all-in equity with a position-based realization factor, stated as an approximation), and
   what BD-T4 leaves out.
2. Freeze the key's JSON schema: node ids, hand classes, frequencies, EVs (BD-T6), the spec
   hash. The shape may follow fact 3 (scenario keys of 169 hands) and is written fresh here.
3. Collect published aggregate numbers (open rates by seat, 3-bet and fold-to-3-bet rates) from
   at least three named public sources, as the acceptance bands of phase 4. Record the source
   and date of each.
4. Prototype nothing. Write down whether a numpy solver can solve the full tree in under an
   hour on this Mac, from the node count and the table size. If it cannot, the fallback is Rust
   (BD-T3), and this phase also writes `docs/conventions-rust.md` before any Rust file exists.

Subagents: Default researcher for step 3, in its own worktree, report only.

**Done when:** `KEY-SPEC.md` exists and states every dial of section 3; the schema has a
validator stub under `solver/`; every acceptance band cites a source and a date. Proof a gate
cannot give: a Deep reviewer reads `KEY-SPEC.md` cold and answers one question, "can a correct
solver of this game still produce a strategy a strong player would call wrong, and where?".
Gate: `bun run --cwd app typecheck && bun run --cwd app lint && bun run --cwd app test` (no app
change expected, so unchanged at 63 test files, 490 tests).

**Watch for:** an equity-realization shortcut that is wrong for one position pair and right for
the rest. Name each simplification and which hands it moves most (suited connectors, offsuit
broadways, small pairs).

### Phase 2: Preflop equity table

Status: `PLANNED`.

1. `solver/equity.py` writes a 169 by 169 matrix of all-in equity between hand classes, from
   exact enumeration with suit symmetry, or from a sampling run with its error bound stated.
2. Write it to a committed file with a header (date, method, error bound).
3. Tests: the matrix is complementary (each cell plus its mirror is 1, counting ties), and ten
   well-known matchups hold (AA against KK, AKs against QQ, 72o against AA and others) to the
   stated bound.

**Done when:** the tests pass and the matrix header names its method. Proof: five matchups
chosen by the reviewer, not the builder, agree with the matrix to the bound.

**Watch for:** card removal. Two classes that share a rank cannot use every suit combination.

### Phase 3a: Solver core, one spot

Status: `PLANNED`.

1. `solver/cfr.py`: CFR+ over the spec's tree for one spot only: the button opens, the big
   blind defends, everyone else has folded.
2. Report convergence as the exploitability of the resulting strategy against its best response,
   in big blinds per hand, within the abstraction.
3. A best-response checker written separately from the solver, so a bug in one does not hide in
   the other.

**Done when:** exploitability falls below the dial `gtoExploitabilityBb` and keeps falling as
iterations double. Proof a green gate cannot give: the button's open frequency and the big
blind's defend frequency land inside the phase 1 bands, and pairs open at 100 percent from the
button.

**Watch for:** a solver that converges quickly to something wrong. A low exploitability against
its own best-response checker proves the strategy is stable, not that the game is the right one.
That is why the bands in phase 1 are the proof.

### Phase 3b: Solver, the full tree

Status: `PLANNED`.

1. Extend to every seat pair and every node of the spec's tree (BD-T4).
2. Run to the exploitability dial. Record run time and node count.
3. Write the raw strategy and EV per node.

**Done when:** every acceptance band of phase 1 holds, and the run is reproducible: two runs
from the same seed give the same file byte for byte. If the first run needs more than the hour
phase 1 estimated, stop and report; the abstraction is cut, not the proof.

**Watch for:** unreachable nodes with arbitrary strategy. Mark them in the output so no deal
lands on one.

### Phase 4: Key export, validation, containment

Status: `PLANNED`.

1. Export to `app/src/gto/data/` as JSON in the frozen schema, with the spec hash, and measure
   the size (BD-T8).
2. `app/src/gto/key.ts` reads and validates it; a table with a missing hand, a frequency sum
   other than 1 or a missing EV fails the load.
3. A test of containment: every hand on the unit 3 `OPENING_CHART` for a seat has an open
   frequency of at least the dial `gtoChartMinOpen` in the key. A failure is a finding about
   the chart or the solver, and goes to Zach before either is changed.

**Subagents:** Deep reviewer, own worktree, review only. It receives the spec, the key and the
bands, and returns a verdict and a list of hands it believes are wrong.

**Done when:** gates green, the load test fails on a table with one hand deleted, and the Deep
review finds no wrong strategy for the hand classes it checks.

**Watch for:** the chart is deliberately tighter than solver output (`opening-chart.ts:15-30`).
Lessons in unit 3 may now contradict the key. Record them; do not rewrite lessons here.

### Phase 5: Hand engine

Status: `PLANNED`.

1. `app/src/gto/` holds the pure engine: seats, dealer button, blinds, the action tree, the
   deal from a seed (BD-T7), bot actions sampled from the key (dial `gtoBotMixMode`), and the
   runout to showdown (BD-T5) through `app/src/cards/showdown.ts`.
2. The engine works from a fixture key until phase 4 lands.
3. Tests: every action offered is legal; chips are conserved; the same seed replays the same
   hand; a hand never reaches a node the key marks unreachable.

**Done when:** gates green and a recorded hand log of 1,000 seeded hands has no illegal action
and conserves chips in every one.

**Watch for:** the player's seat is random, so every position, including the blinds, is dealt.

### Phase 6: Grading and the review model

Status: `PLANNED`.

1. `app/src/gto/grade.ts`: for each player decision, the key's frequency of the chosen action,
   its EV loss against the best action, and a label from the dials (E1).
2. The review model: the list of the hand's player decisions with the mix and the cost, plus the
   unscored postflop line (BD-T5).
3. Tests built from hand-worked cases, not from the key's own output.

**Subagents:** Deep reviewer on `grade.ts` alone.

**Done when:** gates green and the Deep reviewer finds no case where a correct mixed play is
marked a mistake.

**Watch for:** an EV difference smaller than the solver's own error is noise. The dial
`gtoMistakeCostBb` must sit above the error the run in 3b recorded.

### Phase 7: Table screen and seats

Status: `PLANNED`.

1. A table component in `app/src/components/`: six seats, a button marker, stacks, bets, the
   player's two cards and the action buttons. Fish, squid and shark sit as three of the five
   bots. The other three seats show a stand-in (chip stack and a number) until phase 8.
2. The mascot reacts by pose to the player's result (`app/src/art/`, rule U6).
3. Light and dark, portrait, one-handed reach for the buttons, reduced motion respected.

**Done when:** gates green; a screenshot on the iOS simulator and the Android emulator, light
and dark, of a hand at each street; the table fits the smallest supported phone.

**Watch for:** six seats and the action buttons on a small screen. Check the layout at the
smallest size before polishing anything.

### Phase 8: Three new characters

Status: `PLANNED`. Needs Zach for the Higgsfield run.

1. Zach runs the round: three new characters in the style of the existing three (`CLAUDE.md`
   lists the style), six poses each, or fewer if he chooses.
2. The files go in `assets/higgsfield-table/` as received (BD-T10).
3. Decide with Zach how each becomes a drawable asset. The first round gave PNG and SVG, and the
   app draws SVG through `app/src/art/`. If the output is PNG only, the plan names the
   conversion before any file is renamed.
4. Wire them into the table and add them to `assets/gallery.html`.

**Done when:** each character renders at table size on both platforms, in a screenshot of the
SVG itself and not a preview page.

**Watch for:** the round is paid and not repeatable. Nothing may rename or move a file after it
is filed, and a copy is kept outside the repo.

### Phase 9: Session flow, storage and the free allowance

Status: `PLANNED`.

1. A session of `gtoHandsPerSession` hands from a start button on the Practice tab, then a
   summary: decisions graded, total EV lost, the worst mistake with its hand.
2. Stored version 5: the day's hand count and the session history, with a migration and a test
   (rule Q2, `migrations.ts`).
3. `handsLeftToday` (BD-T9): the free allowance, reset on the local day (`day-key.ts`), with no
   paywall. When it reaches zero the start button says so in plain words.
4. Who may start: every player, or only after unit 3? This is dial `gtoRequiresUnit`, default
   none, because a serious player placing out should not be gated.

**Done when:** gates green; a migration test loads a version 4 save and keeps every field; a
screenshot of the empty allowance state.

**Watch for:** the free allowance is a local counter and can be reset by the user (`DESIGN.md`
hazard 6). Say so in the code comment and the ledger, not in copy.

### Phase 10: Copy, runtime pass, close-out

Status: `PLANNED`.

1. Copy for the mode in the register of `DESIGN.md` D10 (two or three variations offered to
   Zach, as the standard requires), including the plain statement of the game and that the key
   is an approximation.
2. `RUNTIME-PASS.md` for this effort: what only a person on a phone can check.
3. Update `HANDOFF.md`, `PASSOFF.md`, `docs/README.md`, and the Part 7 hand-back.

**Done when:** the docs index lists every file of the effort and the whole-repo gate is green.

**Watch for:** the word "GTO" in the interface. The spec decides what the app may claim.

## 3. Dials

All destined for `app/src/config/dials.ts`, in one block under `// gto-trainer`, except the
solver dials, which live in `solver/config.py`.

| Dial | Default | Note |
|---|---|---|
| `tableSeats`, `stackBigBlinds` | 6, 100 | exist |
| `gtoExploitabilityBb` | 0.005 | solver stop point; confirmed in phase 3a |
| `gtoChartMinOpen` | 0.5 | containment test of phase 4 |
| `gtoGoodFrequency` | 0.10 | a mixed action played at least this often is good |
| `gtoMistakeCostBb` | 0.15 | above the solver error of phase 3b |
| `gtoBotMixMode` | `sample` | the other mode plays the top action |
| `gtoPostflopMode` | `runout` | `scored` arrives with option B2 |
| `gtoHandsPerSession` | 10 | |
| `gtoFreeHandsPerDay` | 10 | free allowance |
| `gtoRequiresUnit` | none | |
| `gtoOpenSizeBb` | 2.5 (SB 3) | in the spec; the key carries it. Since phase 1 (BD-T13) this row is the `open` column of the sizes table in `KEY-SPEC.md` 2.3, which also fixes the 3-bet, 4-bet and 5-bet sizes |
| `c_srp`, `c_3bp`, `c_4bp`; `c_srp_oop`, `c_3bp_oop`, `c_4bp_oop` | 0.7, 0.4, 0.2; 0.3, 0.2, 0.1 to start | phase 1 (BD-T12, BD-T18), `solver/config.py`; phase 3a tunes them inside the ranges of `KEY-SPEC.md` 3.2 on four spots and freezes them in the game object |
| `k` | 2 (1 allowed) | phase 1 (BD-T18), `solver/config.py`; the curve exponent of `KEY-SPEC.md` 3.2 |
| `t_ip`, `t_sb` | 0.1, 0.25 to start | phase 1 (BD-T17), `solver/config.py`; the flat tax of `KEY-SPEC.md` 3.2, tuned in phase 3a to the flat bands |
| `reachFloor` | 0.0001 | phase 1, `solver/config.py`; a node reached less often than this is one the grader treats as never reached (`KEY-SPEC.md` 7.1) |

## 4. Seams reserved, deliberately not built

- **Postflop scoring (B2, B3).** Offline TexasSolver output is the likely source. The hand
  engine's `runout` mode is the seam.
- **The paywall.** `handsLeftToday` is the seam (BD-T9). Provider, price and trial belong to the
  store-release item.
- **Multiway solving** (BD-T4).
- **Other stack depths, ante games, tournaments, other table sizes.**
- **Opponent modelling.** Every bot plays the key.

## 5. Repo hazards, with live numbers

1. **Uncommitted work from another session** (fact 13). Zach commits before a worktree is cut.
2. **The key and its spec are the product.** A change to `KEY-SPEC.md` after phase 3b means a
   new run; the spec hash makes a stale key fail the load test.
3. **Bundle size** of the strategy tables is unmeasured until phase 4.
4. **`assets/higgsfield/` is frozen** (BD-T10); `assets/gallery.html` links its 32 files by name.
5. **Parallel lanes** write different folders (`solver/` and `app/src/gto/`); only phase 4 and
   phase 9 touch shared files (`dials.ts`, `migrations.ts`), so those two are serial.

## 6. Session protocol

`docs/AGENT-PRACTICES.md`, Parts 3, 5, 6 and 7. One phase per session, on the driver named in
the table; a Deep phase is never run on a lower tier, and a phase assigned to a tier is checked
against the running model first (`~/.claude/rules/model-routing.md`). Board items for these
phases are added to `PASSOFF.md` at GATE 2, not before.

## 7. GATE 2 record

Zach, in chat, 2026-10-05: plan approved. BD-T3 left open as a question ("why not rust or go?"),
answered in BD-T3 with a default and a trigger for Rust. BD-T4 and BD-T5 accepted as written
(runout, scored on preflop). Access: anyone, no unit gate (`gtoRequiresUnit` = none).
