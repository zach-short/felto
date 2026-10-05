# GTO trainer: scope

Written 2026-10-05, after Zach asked for it in chat. Status: scope only. This document proposes
and decides nothing; the answers go under "Open questions" the turn they are given.

**The ask, in Zach's words.** Players who are more serious will breeze through units 1 to 4. He
imagines a small table with the three mascots and three more seated, and the player is dealt a
hand, a position, the previous action and a choice. Ideally the whole hand plays out and the
player sees where they went right or wrong. The deals are random, so it drills without end. Then
it is locked behind a paid tier for unlimited use.

## 1. What exists, verified 2026-10-05

| Claim | Verified state | Citation |
|---|---|---|
| Four units exist as data; more lessons need no new code | Units `hands`, `odds`, `preflop`, `table` | `app/src/content/units/`; `DESIGN.md` (app) line 283 |
| The only strategy data is a raise-first-in chart | Five seats. It never limps and says nothing about facing a raise | `app/src/content/opening-chart.ts:9-10` |
| That chart is not solver output and is tighter than it | Written from principles, "no source was checked"; roughly UTG 15 / HJ 20 / CO 27 / BTN 45 / SB 40 percent in published ranges against 11.5 / 15.5 / 24.6 / 34.2 / 28.8 percent here | `opening-chart.ts:15-30`; `RUNDOWN.md` item 6 |
| The preflop dealer deals one decision with everyone folded to you | Raise or fold, seat picked at random | `app/src/drills/preflop.ts:11-14, 63-74` |
| There are about a dozen dealt drill kinds, all single-question | Hand name, showdown, odds, outs, preflop, open kinds and others | `app/src/drills/*.ts` |
| A hand evaluator and a multi-player showdown exist | Any number of holes against a board | `app/src/cards/evaluate.ts:106`; `app/src/cards/showdown.ts` |
| "Equity" in the code means outs arithmetic, not equity against a range | `exactEquity(outs, street, cardsToCome)` | `app/src/cards/odds.ts:34`; grep of `equity` in `app/src` finds only the outs code and its tests |
| No table or seat screen exists | `grep -il seat` over `app/src/**/*.tsx` finds nothing | grep, 2026-10-05 |
| No betting engine, no bots, no solver | The grep for `solver`, `gto`, `monker`, `piosolver` finds only docs | grep over `docs`, `HANDOFF.md`, `PASSOFF.md` |
| Full hands against bots were an option and were not taken | Option 1A (path with drills) was chosen; 1C "against the mascots" needs a betting engine, side pots and bot strategy "several times the work" | `docs/incomplete/app/DESIGN.md:90-93, 250` |
| Solver-grade advice after the flop is listed as not in the first version | Non-scope line | `docs/incomplete/app/DESIGN.md:67` |
| Chips wagered on every hand can rate the app 18+ | Apple's frequent simulated gambling wording, row 19 | `docs/incomplete/app/DESIGN.md:93` |
| There are three mascots with six poses each | Fish (Flop), squid (Kicker), shark (Ace). No other characters exist | `assets/mascots/{fish,squid,shark}/`; `app/src/content/cast.ts:10-14` |
| There is no payment code | The grep for `purchase`, `revenuecat`, `paywall`, `subscri`, `premium`, `entitle`, `stripe` over `app/package.json`, `app/src` and `app/app.json` finds nothing | grep, 2026-10-05 |
| A store release is declined | "Declined except for the store release"; nothing ships; development build on simulators | `docs/incomplete/app/DESIGN.md:527-532`; `CLAUDE.md` "Never do this" |
| There are no accounts and no backend | Progress is local, behind one data module | `DESIGN.md` (app) 3A, lines 127-130 |
| Player state is stored version 4 and any change needs a version 5 and a migration | `STATE_VERSION = 4` | `app/src/storage/migrations.ts:6`; `app/src/game/player-state.ts:4` |
| An economy of lives, gems and freezes exists | Lives regain on a 4 hour clock; Practice opens at 0 hearts | `app/src/game/lives.ts`; `app/src/screens/practice-screen.tsx:16-19` |
| The repo gate passes | 63 test files, 490 tests | `HANDOFF.md`, board item 16 |

**What the audit changed.** The request assumes "GTO" can be shown to the player. Nothing in the
repo can produce a GTO answer today: the one chart is a hand-written teaching chart that is
tighter than solver output at every seat. The hard part of this work is the answer key, not the
table. Everything else (seats, hand flow, scoring, paywall) is ordinary build work on parts that
exist.

## 2. What this is, and what it is not

**This is:**
- A new mode for a player who finished or placed out of units 1 to 4.
- A 6-max table, 100 big blinds, no ante, no rake. The player sits in a random seat; five bots
  fill the rest. The player's three mascots are three of the bots.
- Random hands without end, from a seed, so a session can be replayed from its seed.
- After each hand, a review that shows each player decision against the strategy, with what it
  cost.
- A free allowance and a paid tier that lifts it.

**This is not (each line is parked, and a parked line is not reopened mid-build):**
- Real money, or links to real-money sites (`DESIGN.md` app, section 2).
- Play against other people, leaderboards, accounts and sync.
- A claim of perfect play. The copy says what the key is: a solved strategy for a stated game
  with stated simplifications.
- Tournament play, antes, straddles, other stack depths, other table sizes.
- Opponent modelling or exploitative advice. Every bot plays the same fixed strategy.
- Chips staked per hand that the player can lose and rebuy, because that is the feature that
  invites the 18+ rating.

## 3. Options

### A. Where the answers come from

**A1. Extend the hand-built chart.** Add facing-a-raise and facing-a-3-bet charts by hand, as
unit 3 did, and call the mode "strong fundamentals", not GTO. Defense: it is cheap, it needs no
new data pipeline and it matches how the repo already works. Against: it is the exact thing the
player who "breezes through chapters 1 to 4" will catch out in a week. A serious player knows
mixed frequencies, and a hand-built chart has none. It also cannot score the postflop half of a
full hand.

**A2. Own solver, offline, ship the tables (recommended).** Write an offline solver (counterfactual
regret minimisation) in this repo, run it for a fixed set of abstracted spots, and ship the
strategy tables as data the app reads. Preflop for all seat pairs and raise levels, and postflop for
single-raised heads-up pots with a short bet-size menu and bucketed boards. Defense: the key is
reproducible and owned, the app stays offline, the answers carry frequencies and EV, and the
data is the product. It is also the only option where "GTO" is a statement the repo can back.
Against: it is the largest piece of work in the repo, a solver bug yields answers that are wrong
and look right, and multiway pots do not fit. A full 6-max postflop game is not solvable at this
size. Bots in multiway pots would have to follow a simpler rule.

**A3. License or import published solver output.** Use solved charts from a commercial trainer or
published data. Defense: fastest route to credible numbers. Against: the licence is a legal
question nobody has asked, the terms probably forbid redistributing the tables inside an app, and
the repo would depend on a source it cannot regenerate (`CLAUDE.md` already treats a non
reproducible external source as a hazard).

### B. How much of "the full hand" is scored

**B1. Preflop only, as full hands (recommended first slice).** The table plays the hand to the
end, but only preflop decisions are scored against the solved key. After the flop the hand plays
out by the bots' simple rules and the review shows the result and the winner, not a verdict.
Defense: delivers the table, the seats, random hands and the review at once, on the part of the
game where the answer key is smallest and most solvable. Against: Zach said "ideally play out the
full hand and see where you went right or wrong". This gives the full hand with right or wrong on
the first street only, and a serious player may want more.

**B2. Preflop plus the flop.** The solver also covers the flop decision of the raiser and the
caller in single-raised pots, heads up. Multiway pots and 3-bet pots play out unscored. Defense:
the c-bet and the check-raise are where most serious players want feedback. Against: needs the
bucketing and bet-size abstraction, which is the hard part of A2.

**B3. All streets.** Defense: matches the ask exactly. Against: the most expensive option by a
wide margin, and the accuracy of the turn and river answers falls with the abstraction.

B1, then B2, then B3 is a path, not three separate choices: each builds on the last, and the
mode ships after B1.

### C. The three other seats

**C1. Three new characters from the generator (recommended).** Add three species to
`tools/build_mascots.py`, same pose set. Defense: deterministic, in house, one command rebuilds
the art, matches the approved style. Against: the generator draws shapes by code, so a new
species is real drawing work, and six poses times three is eighteen more SVGs to check by eye.

**C2. New Higgsfield round.** Defense: the best match to the reference art. Against: paid,
non-deterministic, and "new Higgsfield rounds" is a parked line in the app design
(`DESIGN.md` app, line 69).

**C3. Plain seats.** A chip stack and a number, no character, for the three. Defense: no art
work and the table reads clearly. Against: three mascots among three blanks looks unfinished,
and the cast is the app's main appeal.

### D. The paid tier

**D1. Build the trainer free, add the paywall at the store-release phase (recommended).** Defense:
a paywall cannot be tested without a store account and store sandbox, and a store release is
declined for now (`D13`). The trainer gets built and judged first. A free allowance is a counter,
and the seam is one function. Against: the paid tier shapes the design (what counts as one use,
what a hand costs), and building it last risks a design that does not fit it.

**D2. Build the paywall now.** Defense: the allowance is designed in from the start. Against: it
needs RevenueCat or a store module, accounts for store sandbox, and an app record, none of which
exist. An agent cannot verify a purchase at all.

Provider is a later choice, but the trade is known now: RevenueCat is a service with its own
fee on top of the store's cut, and direct StoreKit and Play Billing are free and two codebases.
With no accounts (3A), a purchase restores through the store, not through felto.

### E. How a decision is graded

GTO is a mixed strategy: the right answer is often "raise 70 percent, call 30 percent".

**E1. Frequency and EV loss (recommended).** Each decision shows the solved mix as bars and what
the player's choice cost in big blinds against the best choice. A choice that the solver plays
at least a set share of the time counts as "good". Defense: honest, and it teaches the idea that
there is rarely one correct answer. Against: a harder first read than "right or wrong".

**E2. Single best action.** The highest-frequency action is right and every other is wrong.
Defense: matches the rest of the app. Against: marks a correct mixed play as an error. A
serious player will see this at once.

## 4. Dials

Each is destined for `app/src/config/dials.ts`, not a constant written in two places.

| Dial | Recommended default | Note |
|---|---|---|
| `tableSeats` | 6 | already exists |
| `stackBigBlinds` | 100 | already exists |
| `gtoGoodFrequency` | 0.10 | a mixed action played at least this often counts as good (E1) |
| `gtoMistakeCostBb` | 0.15 | a cost above this in big blinds is shown as a mistake |
| `gtoFreeHandsPerDay` | 10 | what the free tier allows; resets on the local day (`day-key.ts`) |
| `gtoBotMixMode` | sample | bots sample their action from the mix; the other mode plays the top action |
| `gtoBetSizes` | 33, 75 percent pot flop; 2.5x open | the menu the solver and the player share (B2) |
| `gtoHandsPerSession` | 10 | a session is a fixed number of hands, then a summary |
| Price and trial | not decided | a store-release item, not this one |

## 5. Hazards this work walks into

1. **A wrong key looks right.** A solver bug, an abstraction error or a mis-mapped hand produces a
   table that compiles, passes every gate and teaches a wrong play to the very players who
   notice. This is the silent-failure case, so every phase that writes or consumes the key is
   Deep tier (Fable 5.1), with an independent Deep review (`~/.claude/rules/model-routing.md`).
   Table and screen phases are Default tier.
2. **The "GTO" label is a claim.** The existing chart is not solver output. Copy must name the
   game, the stack depth, the bet-size menu and that the strategy is an approximation.
3. **Multiway pots do not solve.** Five of the six seats can be in a pot. The scored path must
   say how it handles a hand that goes multiway (B1 sidesteps it, B2 does not).
4. **18+ rating.** Frequent simulated gambling rates 18+ (`DESIGN.md` app, row 19). The mode
   stakes no chips the player can lose; if that changes, the rating changes.
5. **The paywall needs a store release, and a store release is declined.** D1 defers it. When it
   comes, a purchase can only be proven in a store sandbox by Zach, never by an agent.
6. **A local counter is not a gate.** With no accounts, the free allowance lives in stored
   player state and a user can reset it. That is acceptable for a development build and a first
   release; it must be said plainly, not hidden.
7. **Stored state grows.** The allowance counter and the session history need version 5 and a
   migration (`migrations.ts:6`, rule Q2). Strategy tables are not player state and ship as
   bundled data; their size is unmeasured and may reach megabytes (B2).
8. **Art rules.** Never hand-edit an SVG under `assets/mascots/`. New species change
   `tools/build_mascots.py`, then the generator runs (`CLAUDE.md`). Only `app/src/art/` imports
   an SVG (rule U6).
9. **Hearts.** Practice opens at 0 hearts by design (D21). The trainer must say whether a
   mistake costs a heart; the recommendation is that it does not, because the free allowance is
   the limit.
10. **No agent can see it on a phone.** A table screen is proven by a screenshot on the iOS
    simulator and the Android emulator, and by Zach on his phone (`HANDOFF.md`).

## 6. Open questions

Asked in one batch, in chat, the turn this document was finished. Answers are recorded below with
the date they are given.

1. **Where do the answers come from?** A1 hand-built, A2 own solver (recommended), A3 import.
2. **How much of the hand is scored in the first slice?** B1 preflop (recommended), B2 plus flop,
   B3 all streets.
3. **The three other seats.** C1 new generator species (recommended), C2 Higgsfield, C3 plain.
4. **When does the paywall get built?** D1 at the store-release phase (recommended), D2 now.
5. **How is a decision graded?** E1 frequency and EV loss (recommended), E2 single best action.

### Answers

Zach, in chat, 2026-10-05:

1. **A2, own solver.** Accepted as recommended.
2. **B1, preflop scored first.** Accepted as recommended. B2 and B3 stay as later phases.
3. **C2, new Higgsfield round.** Zach chose this against the recommendation (C1). Consequences
   that follow, not yet decided:
   - It lifts the parked line "new Higgsfield rounds" in `docs/incomplete/app/DESIGN.md:69` for
     this effort only.
   - It is paid and non-deterministic, so a lost file cannot be rebuilt. New files need a home
     that is not `assets/higgsfield/`, which stays frozen (`CLAUDE.md`).
   - The app draws SVG through `app/src/art/`. The first round gave 19 PNG and 13 SVG, so how a
     new character becomes a drawable asset is open. This is a question for the plan, with the
     three characters, six poses each, as the target.
4. **D1, paywall at the store-release phase, and E1, frequency and EV loss.** Both accepted as
   recommended.
