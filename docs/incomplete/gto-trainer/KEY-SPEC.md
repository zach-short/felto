# Key spec: the game the GTO trainer solves

Written 2026-10-05 on Fable 5.1 for board item 35 (phase 1 of `PLAN.md`). This file fixes the
game the solver solves and the shape of the file it writes (BD-T2). Every screen, every line of
copy and every grader reads the game from here and from nowhere else. A change to section 2, 3
or 12 after phase 3b means a new solve, because the key carries the hash of section 12.

Status: frozen 2026-10-05. Zach answered the first three questions of section 11 in chat the same
day ("all recs"): RF-2, M1 and C1. A cold review the same day (section 10) found four places where
a correct solve of that game is wrong as poker, and a second batch of four questions went to Zach;
he kept the flat call (Q1, no) and took the other three (Q2, Q3, Q4). Sections 2.3, 2.5, 3.2, 4
and 12 are the final answers written out. Sections 8 and 10 were filled in from the researchers'
reports and the cold review.

What this document rests on: `DESIGN.md` section 6 (Zach's answers A2, B1, C2, D1, E1, all
2026-10-05), `PLAN.md` section 1 (BD-T1 to BD-T10) and the facts cited inline. Numbers in big
blinds unless said otherwise. "bb" is one big blind.

## 1. What this document fixes, and what it does not

It fixes: the seats, stacks and blinds; who may act and when; every bet size; the action tree
node by node; how a hand that ends preflop is paid; how a hand that goes to a board is valued;
the hand classes; the key's file shape; the acceptance bands the solve must land inside; and
what the app may say about the result.

It does not fix: the solver algorithm beyond its stopping rule (phase 3a), the equity table's
method (phase 2), the app's table, screens and copy (phases 5 to 10), and anything after the
flop is dealt (BD-T5: the app runs the board out with no betting).

## 2. The game

### 2.1 Seats, stacks, blinds

Six seats, named and ordered as the app already names them (`app/src/content/schema.ts:14-16`):
`UTG`, `HJ`, `CO`, `BTN`, `SB`, `BB`. That is the order of action before the flop. After the
flop the order is `SB`, `BB`, `UTG`, `HJ`, `CO`, `BTN`, so in a heads-up pot the player later in
that list is in position. The small blind posts 0.5 and the big blind posts 1. Every stack is
100 at the start of the hand, blinds included. No ante, no straddle, no rake. The two numbers
already live in the app as dials `tableSeats` and `stackBigBlinds` (`app/src/config/dials.ts:5-6`).

### 2.2 One game, with a heads-up-only rule

The solved game is one six-player game, not fifteen two-player games. It begins with `UTG` to
act with everyone else still in. A seat folds or opens. When a seat opens, every later seat in
turn folds, calls or 3-bets. The first seat that calls or 3-bets becomes the defender, and from
that moment every remaining seat is out of the hand: the game rule removes them with no decision
(this is BD-T4 stated as a rule of the game rather than as a limit of the key). The hand then
continues between the opener and the defender alone, as section 2.4 lists.

Why this matters: a solve of each seat pair on its own would let `UTG` open as if it faced one
opponent, and its range would come out as wide as the button's. In the one game, `UTG` opens
facing five seats that each defend with their own range, and its open range tightens for the
right reason. The price is named in section 4: no pot in this game ever has three players.

Because the hands of seats that fold are not dealt (section 3.3), each defender's part of the
game depends only on the opener's strategy, and the opener's open decision is the only place
where all defenders meet. The game is therefore a set of two-player games joined at the opener.
That is why counterfactual regret minimisation, which has a convergence proof for two players
and none for six, is expected to converge here; the proof is not that expectation but the
per-seat best response that phases 3a and 3b compute (`PLAN.md`, phase 3a, step 3).

### 2.3 Sizes (Zach, 2026-10-05: M1, question (b) in section 11)

One size at every level. Every size is the total amount the player has in the pot after the
action, in big blinds. The row a hand uses is fixed by who opened and who defends.

| Row | When | Open | 3-bet | 4-bet | 5-bet | Dead money | In position after the flop |
|---|---|---|---|---|---|---|---|
| `ip_defender` | `UTG`, `HJ` or `CO` opens; `HJ`, `CO` or `BTN` defends (six pairs) | 2.5 | 7.5 | 20 | 100 (all-in) | 1.5 (both blinds) | the defender |
| `sb_defender` | `UTG`, `HJ`, `CO` or `BTN` opens; `SB` defends (four pairs) | 2.5 | 10 | 22 | 100 | 1 (the big blind) | the opener |
| `bb_defender` | `UTG`, `HJ`, `CO` or `BTN` opens; `BB` defends (four pairs) | 2.5 | 10 | 22 | 100 | 0.5 (the small blind) | the opener |
| `sb_vs_bb` | `SB` opens; `BB` defends (one pair) | 3 | 9 | 23 | 100 | 0 | the defender (`BB`) |

The choices behind the rows: the open is 2.5 from every seat but the small blind, which opens to
3 because it is out of position against the one player left (the plan's dial `gtoOpenSizeBb`,
2.5 and `SB` 3, `PLAN.md` section 3). A 3-bet by a player who will be in position after the flop
is three times the open: the non-blind defenders, and the big blind against the small blind (9
over 3). A 3-bet by a blind against a non-blind opener is four times, because that blind will
play the pot out of position. A 4-bet is about 2.2 times the 3-bet when the 4-bettor is in
position and about 2.5 to 2.7 times when it is out of position, for the same reason (23 over 9
is 2.56). The 5-bet is all-in: at 100 big blinds a 5-bet that is not all-in leaves too little
behind to matter. Section 8.3 lists what published sources say about these sizes; the rows above
are a choice inside the common range, not a copy of any one source. The `sb_vs_bb` row read 10
and 25 in the first draft; Zach changed it to 9 and 23 on 2026-10-05 (section 11, Q3) after the
sources and the spec's own rule both said three times.

There is no limp: the small blind opens or folds (`sb_may_limp` is false in section 12). There is
no second open size, no second 3-bet size, no minimum raise, no cold call of a 3-bet and no
cold 4-bet, because a third player never acts (section 2.2).

### 2.4 The action tree, node by node

A decision node is a point where one seat chooses between two or three actions. The actions are
named `fold`, `open`, `call`, `3bet`, `4bet` and `5bet`. The tree has 65 decision nodes.

The open chain (5 nodes). At the root `UTG` folds or opens. After a fold, `HJ` folds or opens;
then `CO`, `BTN` and `SB`. `BB` never opens: when `SB` folds, the hand ends and `BB` wins the
small blind (a walk).

For each of the 15 opener and defender pairs, four nodes:

1. The defender's first decision: `fold`, `call` or `3bet`. It is reached when the opener opened
   and every seat between them folded.
2. The opener facing the 3-bet: `fold`, `call` or `4bet`.
3. The defender facing the 4-bet: `fold`, `call` or `5bet`.
4. The opener facing the all-in 5-bet: `fold` or `call`.

The pairs: `UTG` with each of `HJ`, `CO`, `BTN`, `SB`, `BB` (five); `HJ` with `CO`, `BTN`, `SB`,
`BB` (four); `CO` with `BTN`, `SB`, `BB` (three); `BTN` with `SB`, `BB` (two); `SB` with `BB`
(one). Five open nodes plus fifteen pairs of four nodes is 65. With 169 hand classes at each
node, the key holds 10,985 strategy rows.

Terminal nodes, where chips move: the walk (1); the open that everyone folds to (5, one per
opener); and per pair, a call of the open, a fold to the 3-bet, a call of the 3-bet, a fold to
the 4-bet, a call of the 4-bet, a fold to the 5-bet and a call of the 5-bet (7 each, 105 in
all). 111 terminals, of which 60 reach a board: 45 with chips behind (a call of the open, of the
3-bet or of the 4-bet) and 15 all-in.

### 2.5 Payoffs

A payoff is the change in a player's stack from the start of the hand, in big blinds, so a
player who posted a blind and folds has a negative payoff. Pot sizes and fold payoffs, by row:

| Row | Pot after a call of the open | Pot after a call of the 3-bet | Pot after a call of the 4-bet | Pot all-in | Opener wins when all fold | Defender wins when the opener folds to the 3-bet | Opener wins when the defender folds to the 4-bet | Defender wins when the opener folds to the 5-bet |
|---|---|---|---|---|---|---|---|---|
| `ip_defender` | 6.5 | 16.5 | 41.5 | 201.5 | +1.5 | +4 | +9 | +21.5 |
| `sb_defender` | 6 | 21 | 45 | 201 | +1.5 | +3.5 | +11 | +23 |
| `bb_defender` | 5.5 | 20.5 | 44.5 | 200.5 | +1.5 | +3 | +10.5 | +22.5 |
| `sb_vs_bb` | 6 | 18 | 46 | 200 | +1 | +3 | +9 | +23 |

Each "wins" figure is the dead money plus what the folder had put in. The folder loses what it
put in: the open (2.5, or 3 for `SB`) when it folds to a 3-bet, the 3-bet when it folds to a
4-bet, the 4-bet when it folds to the 5-bet. A seat that folds without opening loses nothing,
except a blind, which loses its blind: `SB` folding is −0.5 and `BB` folding is −1. The walk
pays `BB` +0.5 and `SB` −0.5. These fold payoffs are also the `fold` EVs the key stores, so the
grader's arithmetic is the same at every node.

## 3. How a leaf is valued

### 3.1 All-in leaves

Both players have 100 in. The payoff of the player with equity `e` is `e × pot − 100`, where
`pot` is the all-in pot of the row and `e` counts a tie as half a win. This is exact for the
game as stated: nothing is left to play.

### 3.2 Leaves with chips behind: the realization model (Zach, 2026-10-05: RF-2 in section 11, then Q2 and Q4)

When the preflop action ends with a call and both players have chips behind, real poker
continues on the flop, turn and river. This spec does not model that play. It values the leaf
as the all-in pot share, bent by one number that stands for what position and initiative do
after the flop, and, where a seat other than the big blind flats an open, cut by a second number
that stands for the squeezes and overcalls the removed seats would make. Both are
approximations, and the app says so (section 6).

**The edge.** At every such leaf one player holds the edge: the in-position player when it made
the last raise before the call, otherwise the out-of-position player, who then made the last
raise. The other player is the one the formula bends. Let `e` be that player's equity against
the edge holder's hand class (section 3.3), `P` the pot after the call, `c` a number fixed per
pot type and per who holds the edge, and `k` the curve exponent. The bent player's share is

    s = e − c × e × (1 − e)^k

and the edge holder's share is `1 − s`. The payoffs are `s × P` and `(1 − s) × P`, each less
what the player has put in. The pot is conserved. `k` is 2. With `c = 0.7`, a hand with 30
percent equity keeps 19.7 percent of the pot (it realizes 66 percent of its equity), 50 percent
keeps 41.3 (82.5 percent), 70 percent keeps 65.6 (94 percent), 90 percent keeps 89.4 (99
percent) and 100 percent keeps all of it. The edge holder's numbers run the other way: a 30
percent hand keeps 34.4 percent (115 percent of its equity), a 50 percent hand 58.8 (117
percent), a 70 percent hand 80.3 (115 percent). The first draft had `k = 1` and `c = 0.35`, a
line from 65 percent realization at zero equity to 100 at full; the cold review (section 10,
finding 4) showed that line too flat at the bottom to fit the big blind against a wide opener
and a tight opener with one `c`, and Zach took the steeper curve (section 11, Q2).

The shape comes from what solver studies of equity realization report at the range level and
not from any one table: the player without the edge realizes least with weak hands and about
all with strong ones; the edge holder realizes most with weak hands. Section 8.2 records the
range-level figures (the big blind realizes 60 to 85 percent of its equity against a button
open; the button 100 to 110) and the band the solve must meet. Who holds the edge matters
because the published figures come from the in-position raiser against the out-of-position
caller; where the caller is in position and the raiser is not, the two edges pull against each
other and the published realization is near even, so `c` is smaller there (section 10,
finding 3).

| Pot type | Reached by | `c`, edge in position | `c`, edge out of position | Tuning ranges |
|---|---|---|---|---|
| `srp` | a call of the open | `c_srp` 0.7 | `c_srp_oop` 0.3 | 0 to 1.0; 0 to 0.5 |
| `3bp` | a call of the 3-bet | `c_3bp` 0.4 | `c_3bp_oop` 0.2 | 0 to 0.6; 0 to 0.4 |
| `4bp` | a call of the 4-bet | `c_4bp` 0.2 | `c_4bp_oop` 0.1 | 0 to 0.3; 0 to 0.2 |
| `all_in` | a call of the 5-bet | 0 | 0 | fixed |

Which leaves use which column, by row of section 2.3:

| Row | `srp` (the defender flats) | `3bp` (the opener calls the 3-bet) | `4bp` (the defender calls the 4-bet) |
|---|---|---|---|
| `ip_defender` | the opener, out of position, raised last: `c_srp_oop`; the flat is taxed | the defender, in position, raised last: `c_3bp` | the opener raised last: `c_4bp_oop` |
| `sb_defender`, `bb_defender` | the opener, in position, raised last: `c_srp`; an `SB` flat is taxed, a `BB` flat is not | the blind raised last: `c_3bp_oop` | the opener raised last: `c_4bp` |
| `sb_vs_bb` | `SB`, out of position, raised last: `c_srp_oop` | `BB`, in position, raised last: `c_3bp` | `SB` raised last: `c_4bp_oop` |

**The flat tax.** When `HJ`, `CO`, `BTN` or `SB` flats an open, both shares are multiplied by
`(1 − t)` before the payoffs are taken: `s × (1 − t) × P` and `(1 − s) × (1 − t) × P`, each less
what the player put in. The share `t × P` leaves the two-player accounting; it stands for the
squeezes and overcalls by the seats the heads-up-only rule removes, which in real play make a
flat much worse than a heads-up pot with dead money. `t` is `t_ip` (0.1 to start, range 0 to
0.5) for `HJ`, `CO` and `BTN`, and `t_sb` (0.25 to start, range 0 to 0.5) for `SB`, larger
because the big blind behind a small-blind flat overcalls at the best price on the table. A big
blind flat is not taxed: nobody is behind it in real play either. Without the tax the cold review
found the button flatting about 70 percent of hands against a cutoff open, because a flat closed
the action heads-up with 1.5 of dead money in the pot (section 10, findings 1 and 2); Zach chose
to keep the flat and tax it rather than remove it (section 11, Q1 and Q4).

**Tuning.** Phase 3a tunes the nine dials (six `c`, `k`, two `t`) on four spots, then freezes
them in section 12: the button against the big blind (`c_srp`, `c_3bp_oop`, `c_4bp`), the cutoff
against the button (`t_ip`, `c_3bp`, `c_4bp_oop`), the small blind against the big blind
(`c_srp_oop`) and the button against the small blind (`t_sb`). Each spot must land inside its
bands of section 8.2, and the big blind's range-level realization against the button must land
inside its band there. Phase 3b runs the full tree with the frozen values and must land inside
every band without touching them. `k` may be set to 1 or 2 by phase 3a; it reports both. The
plan's phase 3a named one spot; the four spots are the forced change recorded under phase 1 in
`PLAN.md`.

What this model cannot do is named in section 4, items 1 and 3. One check a reader may want:
the share is convex in `e`, so applying it hand class by hand class rather than at the range
level gives the bent player `c × Var(e)` more than the range-level figure; for the widest ranges
that is under 0.03 bb (section 10, finding 8), and nothing corrects for it.

### 3.3 Hand classes, equity and card removal

A hand class is one of the 169 two-card classes the app already uses: `AA` for a pair, `AKs`
for two suited cards, `T9o` for two of different suits, the higher rank first
(`app/src/cards/hand-class.ts:3-5`). The classes hold 6, 4 and 12 of the 1,326 two-card
combinations (`comboCount`, `hand-class.ts:24-28`).

Equity `E[h][g]` is the share of the pot that class `h` wins against class `g` when both hands
go to the river with no further betting: a win counts 1, a tie counts a half, averaged over
every pair of combinations of the two classes that share no card and every five-card board
from the remaining 48 cards. Phase 2 computes the 169 by 169 table and states its method and
its error bound in the file's header (`PLAN.md`, phase 2). The same phase writes the deal
weights: `W[h][g]`, the number of ordered pairs of combinations of `h` and `g` that share no
card, divided by 1,326 × 1,225.

Card removal is applied between the two hands in play at any node: the opener's and the acting
seat's hands are dealt jointly from `W`. The hands of seats that have already folded are not
dealt: a seat's fold frequency enters as one number, its range-average fold frequency, with no
account of the cards the two live players hold. This is the one place card removal is dropped,
and section 4, item 6, names what it moves.

## 4. Simplifications, each with the hands it moves most

Every line below is a place where the solved game differs from the game at a real table. A
strong player who knows real ranges will see these differences first, in about this order. The
cold review of section 10 set the sizes.

1. **No pot has three players, and a flat is taxed in place of the squeeze** (sections 2.2 and
   3.2). A seat that flats an open closes the action: there is no squeeze, no overcall and no
   cold 4-bet behind it. Before the tax, that made a flat by `HJ`, `CO`, `BTN` or `SB` worth far
   more than in real play, and a correct solve flatted about 70 percent of hands from the button
   against the cutoff and about 45 percent from the small blind, against 3 to 5 percent in real
   play (section 10, findings 1 and 2). The tax `t` brings the rate down to a band, but it is one
   number for a whole seat type: it cannot know that a squeeze hits `KQo` harder than `55`, or
   that a suited connector flats better than an offsuit broadway because it plays a multiway pot
   well. The hands moved most: the flat ranges of those four seats, medium pairs (`66` to `TT`),
   suited broadways (`KQs` to `JTs`), `AQo` and `AJo`, and suited connectors (`76s` to `T9s`),
   whose split between flat, 3-bet and fold is set by equity and the tax alone. The big blind
   never overcalls, so `87s` in the big blind behind a flat has no node. The opener never faces
   two callers, so early opens come out wider: the last hands in from `UTG`, around `A9s`,
   `KTs`, `QJs`, `ATo` and `66`, by a few points of range.
2. **The small blind cannot limp** (section 2.3). Published small-blind strategies at 100 big
   blinds with no ante limp a large share of hands. Here every hand that would limp opens or
   folds, so the small blind's open rate is not comparable to a limp strategy's raise rate, and
   the low suited hands (`K5s` to `K2s`, `Q6s` to `Q2s`, `J7s`, `T7s`, `97s`, `86s`, `75s`,
   `64s`, `53s`) and small pairs are the hands that move. Which way depends on how the big blind
   defends: the review found the first draft's big blind defending 95 percent in position, which
   made the small blind's open tighter than a real raise-only strategy, not looser (section 10,
   finding 3); with the initiative split that over-defence is gone, and phase 3a's
   small-blind-against-big-blind spot measures the rest.
3. **The realization model knows position, initiative and pot type, and nothing about the
   hand** (section 3.2). Two hands with the same equity against a range get the same share, so
   hands that play well after the flop are undervalued and hands that play badly are overvalued.
   The hands moved most: suited connectors and one-gappers (`54s`, `65s`, `76s`, `87s`, `98s`,
   `T9s`, `86s`, `97s`, `T8s`) and small suited aces (`A2s` to `A5s`) come out too tight, as
   calls and as 3-bet bluffs; offsuit broadways and weak offsuit aces (`KJo`, `KTo`, `QTo`,
   `JTo`, `A8o` to `ATo`, `K9o`, `Q9o`) come out too loose, above all as calls out of position.
   One visible pattern follows: 3-bet bluff selection inverts, because the model picks bluffs by
   blockers and raw equity, so offsuit aces (`A8o` to `A2o`) and offsuit broadways become the
   bluffs and suited wheel aces become calls or folds, the opposite of real play, by 5 to 8
   percent of a range per spot (section 10, finding 5). RF-3 in section 11 is the named fallback.
4. **One size at every level** (section 2.3). Without a smaller 3-bet or 4-bet, the hands that
   real strategies use as a 4-bet bluff (`A5s`, `A4s`, `KJs` and the like) and the hands that
   call a 4-bet (`JJ`, `TT`, `AQs`, `AKo`) move with the chosen 4-bet size: a larger 4-bet
   turns calls into folds and 5-bets. The chosen sizes sit inside the common range (section
   8.3), so the effect is at the edges of those groups.
5. **The 5-bet is all-in** (section 2.3). At 100 big blinds this is what nearly every published
   strategy does; the hands that move are the few that would 5-bet small, and there are none of
   note.
6. **No card removal across folders** (section 3.3). When `UTG` holds `AA`, the real seats behind
   it hold fewer aces and fold more often; here they fold at their range-average rate. The hands
   moved: the premium pairs and `AK`, by a small amount, towards a lower open EV than the true
   one; the marginal ace-high opens (`A5s` to `A2s`, and `ATo` from `UTG`), which in reality face
   about 15 percent fewer 3-bets because they block the hands behind that 3-bet, under-valued by
   0.03 to 0.08 bb, enough to flip a hand at the open margin; and, after four folds, every live
   range is a little rich in high cards (about 1 percent of equity), which nothing here models
   (section 10, finding 7). No band in section 8 can see any of this.
7. **No rake** (section 2.1). Online charts are mostly solved with rake, which tightens blind
   defence by several points. The bands in section 8 record each source's rake, and a band from
   a raked source is read as a lower bound for blind defence here.
8. **Stacks are exactly 100 at every seat.** No short stack, no deep stack, no table with a
   player away from the hand.

## 5. What BD-T4 leaves out, and what the table does there

The key has no node for a second defender. In the solved game that seat has no decision, and
the app's bots follow the solved game: once an opener and a defender are in the pot, every bot
behind them folds, which is exactly the strategy the key was solved against. The player is not
a bot. When the player sits behind a bot defender, the table lets the player act, and that
decision has no node and no grade: the review says it is outside the solved game (BD-T4 names
this "multiway, not scored"). What the bots then do if the player raises into a pot the key does
not cover is the hand engine's rule, decided in phase 5 (BD-T4 names a plain fold-or-call rule
from the unit 3 chart as the default); the key takes no part in it. After preflop the app runs
the board out with no betting and shows the winner (BD-T5); nothing after the flop is scored,
and the runout is not the game of section 3.2, which stands in for real postflop play.

## 6. What the app may claim (Zach, 2026-10-05: C1, question (c) in section 11)

The key is an approximate equilibrium strategy for the game of sections 2 and 3, found by a
solver and measured by exploitability. It is not a claim about real poker and not a claim of
perfect play (`DESIGN.md`, section 2, "what this is not", and hazard 2).

The rule: the mode may carry the name "GTO trainer", because the term is the one players
search for and every trainer on the market solves an abstraction. Beyond the name, the word
"GTO" never qualifies an answer. A verdict names the solver ("the solver folds this 70 percent
and calls 30 percent"), never "the GTO play". From every verdict, one tap reaches the statement
of the game: six seats, 100 big blinds, no ante, no rake, one size at every raise, heads-up pots
only, a simplified model of play after the flop. The words "unexploitable", "perfect" and
"optimal" do not appear. The copy itself is phase 10 work, written in variations for Zach to
choose from (`docs/AGENT-PRACTICES.md`, R7).

## 7. The key schema

Frozen 2026-10-05. The key is one JSON file. Phase 4 writes it to `app/src/gto/data/` and
`app/src/gto/key.ts` is its only reader (BD-T8). `solver/validate_key.py` is the solver-side
check (section 7.6).

### 7.1 File shape

```json
{
  "schema": "felto-gto-key/1",
  "spec_hash": "<64 hex characters, section 7.5>",
  "game": { "...": "the object of section 12, verbatim" },
  "solver": {
    "method": "CFR+",
    "iterations": 12000,
    "exploitability_bb": { "UTG": 0.004, "HJ": 0.003, "CO": 0.004, "BTN": 0.005, "SB": 0.004, "BB": 0.005 },
    "seed": 1,
    "date": "2026-10-05",
    "equity_table_sha256": "<64 hex characters>"
  },
  "hands": ["AA", "AKs", "AKo", "AQs", "AQo", "...", "22"],
  "nodes": {
    "UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold": {
      "actor": "BB",
      "actions": ["fold", "call", "3bet"],
      "totals": [null, 2.5, 10],
      "reach": 0.1234,
      "strategy": [[0.0, 0.3, 0.7], "... one row per hand, 169 rows"],
      "ev": [[-1.0, 1.84, 2.11], "... one row per hand, 169 rows"],
      "hand_reach": [0.0045, "... one number per hand, 169 numbers"]
    }
  }
}
```

Field by field:

- `schema`: the string `felto-gto-key/1`. A later shape takes `/2`; a reader refuses a version it
  does not know.
- `spec_hash`: section 7.5.
- `game`: the object of section 12, copied as it is. The hash is computed from this copy.
- `solver`: provenance. `exploitability_bb` is the best-response gain per seat in big blinds per
  hand at the end of the run; every value must be at or below the dial `gtoExploitabilityBb`
  (`PLAN.md` section 3, 0.005). `equity_table_sha256` names the equity file of phase 2 the run
  used.
- `hands`: the 169 class names in the fixed order of section 7.3. Every per-hand array in the
  file follows this order.
- `nodes`: one entry per decision node, keyed by the node id of section 7.2. A full key holds
  65 entries.
- `actor`: the seat that acts.
- `actions`: the legal actions at the node in the order the arrays use, from the names of
  section 2.4.
- `totals`: for each action, the actor's total in the pot after it; `null` for `fold`.
- `reach`: the probability, under the key's strategies and the deal, that the hand reaches this
  node at all.
- `strategy`: 169 rows, one number per action, the frequency the actor takes that action with
  that hand at this node. Each row sums to 1 (section 7.4).
- `ev`: 169 rows, one number per action: the actor's expected payoff (section 2.5) from taking
  that action with that hand at this node and following the key afterwards, while every other
  seat follows the key, averaged over the other seats' hands as they reach this node. The `fold`
  entry equals the fold payoff of section 2.5. Where no opposing hand reaches the node under the
  key (`reach` is 0), the opposing range used is the plain deal, so the number exists and the
  consumer reads `reach` to know what it is worth.
- `hand_reach`: 169 numbers, the probability that the hand reaches this node with the actor
  holding that class. A grader treats a decision at a node whose `reach` is below the solver
  dial `reachFloor` (section 9, table) as "the solver never gets here": no EV loss is shown.

### 7.2 Node ids

A node id is the history of actions that reaches it, written as `SEAT:action` tokens joined by
`/`, in the order the actions happened. The root, where `UTG` acts first, is the word `root`.
Seats that the heads-up-only rule removes without a decision (section 2.2) are not written.
Examples, with the actor in brackets:

- `root` (`UTG`), `UTG:fold` (`HJ`), `UTG:fold/HJ:fold/CO:fold/BTN:fold` (`SB`).
- `UTG:open` (`HJ`), `UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold` (`BB`).
- `UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet` (`UTG`).
- `UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet/UTG:4bet` (`BB`).
- `UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet/UTG:4bet/BB:5bet` (`UTG`).
- `CO:open/BTN:3bet` is wrong: the opener's folds come first. `UTG:fold/HJ:fold/CO:open/BTN:3bet`
  (`CO`) is the id.

Terminal nodes have no entry: the engine knows a terminal from the rules of section 2.4.

### 7.3 Hand order

The order of `allHandClasses()` in `app/src/cards/hand-class.ts:16-22`: for each rank from ace
down to deuce, the pair, then for each lower rank the suited class and then the offsuit class.
`AA`, `AKs`, `AKo`, `AQs`, `AQo`, and so on to `A2o`, then `KK`, `KQs`, `KQo`, down to `22`.
`solver/validate_key.py` builds the same list and refuses a file whose `hands` differ; the
arrays carry no names, so this order is the contract between the solver and the app.

### 7.4 Numbers and precision

Frequencies are written to four decimal places. A row of frequencies sums to 1 within 0.001 (the
validator's `SUM_TOLERANCE`); three values rounded to four places can miss 1 by 0.00015, and the
tolerance leaves room for that and nothing else. EVs are written to four decimal places in big
blinds. `reach` and `hand_reach` are written to six decimal places. A number that is an integer
is written without a decimal point in the `game` object (section 7.5 depends on it) and may be
written either way elsewhere.

### 7.5 The spec hash

`spec_hash` is the SHA-256, as 64 lowercase hex characters, of the canonical JSON of the `game`
object: keys sorted, no whitespace, `,` and `:` as the only separators, ASCII only. In Python
that is `json.dumps(game, sort_keys=True, separators=(",", ":"), ensure_ascii=True)` encoded as
UTF-8 (`solver/validate_key.py`, `canonical` and `spec_hash`). Integral values are written as
integers (`100`, not `100.0`), so that the Python writer and any other writer agree.

The app does not recompute the hash: `app/src/gto/key.ts` holds the expected hash as a constant
and refuses a key whose `spec_hash` differs (BD-T2; phase 4). The solver-side validator does
recompute it, so a key whose `game` object was edited after the solve fails before export.

The hash of the proposed `game` object of section 12, computed 2026-10-05 by `spec_hash` in
`solver/validate_key.py`, is `fd66084e4602dfb7101d507148e02e406593d9964b10caf877c75a1d440ddce3`.
It changes when phase 3a freezes the nine leaf-model dials, and the final value is recorded here then.

### 7.6 The validator

`solver/validate_key.py` (`python3 solver/validate_key.py <key.json>`) refuses a key that lacks a
hand (fewer or more than 169 rows at any node), a frequency row that does not sum to 1 within
the tolerance, a node without an `ev` array of the same shape as `strategy`, a `hands` list in
any other order, a `schema` string other than `felto-gto-key/1`, or a `spec_hash` that is not the
hash of its own `game` object. It prints one finding per line and exits 1; a valid key prints
`valid` and exits 0. It imports only the standard library. On 2026-10-05 it accepted a one-node
fixture and refused five mutants of it (a row removed, one row summing to 1.1, the `ev` array
removed, an open size changed under the hash, the hands reversed), each with one finding naming
the fault (`HANDOFF.md`, step 41). It does not check the tree (65 nodes, the right actions at
each) or `reach`; phase 4's loader does, and the stub grows then.

## 8. Acceptance bands

Collected 2026-10-05 by two Opus 5.5 researchers, each read-only in its own worktree (both
worktrees were clean on return), from public pages read that day. A band is a pass or fail line
for the solve: phase 3a must land the button-against-big-blind spot inside its bands, phase 3b
the whole tree, and phase 4 reads them again. No hand list and no table from any source was
copied; only the aggregate percentages below (BD-T1).

### 8.1 What the sources are, and what none of them is

Three source families say where their numbers come from. GTO Wizard's blog states its solver and
its rake (NL500 GTO Wizard rake). Poker Academy's blog states GG rake at NL50 or NL200 and gives
fold, call and 3-bet triples. RangeConverter's chart set, quoted by PokerTube, is solver-derived
with no rake stated. ThinkGTO quotes "GTO Ranges+" data with no rake stated. The rest (VIP-Grinders,
Preflop Wizard, GTO Gecko, PokerSkill) are 2025 and 2026 guides that name no solver and round
their numbers, and two of them contradict each other on big blind defence against an early open.

No source found states numbers for a game with no rake, which is this game. Rake mostly removes
big blind calls and late-position opens: GTO Wizard's 2024-03-19 article on raise sizing, at 200
big blinds, has the hijack, cutoff and button entering 25 to 35 percent fewer hands in the raked
game and the big blind calling a minimum raise "barely 60% as often" as unraked; VIP-Grinders'
2026-06-15 big blind article gives a rake scale from 8 to 10 points tighter at NL10 to "baseline
or wider" at NL500. So a rakeless solve should land at or above the top of every published
defence figure. Each band below therefore has a floor, the lowest solver-claimed figure, and a
ceiling, the highest published figure plus a no-rake allowance. The allowances are this spec's
own choice, not a sourced number: 3 points on an open rate (5 for the small blind, whose
published figures mix limps in), 10 points on a blind's total defence, 2 points on a 3-bet rate,
and 8 points below the floor of an opener's fold rate, because a rakeless opener calls more. A
solve outside a band is a finding for Zach, not a number to tune away, unless section 4 already
predicts the direction (noted per row).

### 8.2 The bands

Open rates (raise first in), percent of hands:

| Seat | Published figures (source, date) | Floor | Ceiling | Note |
|---|---|---|---|---|
| `UTG` | 17.6 (PokerTube "GTO Ranges by Position", 2026-06-26); about 18 (GTO Gecko, 2026-06-11); 15 to 17 (Preflop Wizard, 2026-08); 14.3 (PokerSkill, a non-solver page, 2026-10-04) | 14 | 21 | Section 4, item 1, predicts the top half |
| `HJ` | 21.4 (PokerTube); about 22 (GTO Gecko); 19 to 22 (Preflop Wizard); 18.9 (PokerSkill) | 18 | 25 | |
| `CO` | 27.18 (RangeConverter via PokerTube, 2025-12-29); 27.8 (PokerTube); about 28 (GTO Gecko); 25 to 28 (Preflop Wizard) | 24 | 31 | Narrow agreement |
| `BTN` | 44.2 (GTO Wizard, Brokos, 2024-08-19, the one named solver); 43.5 (PokerTube); about 43 (GTO Gecko); 40 to 45 (Preflop Wizard) | 40 | 48 | |
| `SB`, raise or fold | 40 to 50 (VIP-Grinders, 2026-05-14); 39 to 47 (Preflop Wizard); 40 to 48 raise plus limp (GTO Gecko); 46 enter, raise plus limp (GTO Wizard, Heberle, 2025-08-15); 33.1 raise plus 20.5 limp (ThinkGTO, 2026-08-11); 25 raise plus 33 complete (PokerSkill) | 38 | 55 | Section 4, item 2: a no-limp tree opens some hands a limp tree limps, so the top half is expected |

Big blind defence, percent of hands; "defend" is call plus 3-bet:

| Spot | Published figures (source, date) | Floor | Ceiling | Note |
|---|---|---|---|---|
| vs `BTN` 2.5, defend | 40.8 (Poker Academy, Pedzich, GG NL50, 2026-09-17); 40.5 (Poker Academy, Brzeski, GG NL200, 2026-09-17); 52 to 58 (VIP-Grinders, 2026-06-15); about 65 (Preflop Wizard); 45 to 50 (GTO Gecko) | 50 | 75 | Floor is VIP-Grinders' low end: GG rake is heavy and no rake is not |
| vs `BTN` 2.5, 3-bet | 10.6 (Poker Academy NL50); 11.5 (Poker Academy NL200); 11 to 13 (VIP-Grinders); about 11 (Preflop Wizard) | 9 | 15 | Close agreement |
| vs `BTN` 2.5, call | 30.2, 29.0 (Poker Academy); 41 to 45 (VIP-Grinders); about 54 (Preflop Wizard) | 38 | 62 | Rake removes calls, so the floor is VIP-Grinders' |
| vs `CO` 2.5, defend and 3-bet | 40 to 48 defend, 8 to 10 3-bet (VIP-Grinders); about 58 and 10 (Preflop Wizard); 38 to 42 (GTO Gecko) | 42 / 7 | 68 / 13 | Two sources with a split |
| vs `UTG` 2.5, defend and 3-bet | 25 to 30 defend, 4 to 6 3-bet (VIP-Grinders); about 50 and 8 (Preflop Wizard); 28 to 35 (GTO Gecko); 5.4 3-bet vs a 2 bb open (GTO Wizard, Vanja, 2025-09-02) | 28 / 4 | 60 / 10 | Thin and wide: the two split sources disagree by 20 points |
| vs `SB` 3, defend and 3-bet | 43.3 defend, 16.4 3-bet (Poker Academy NL50); 55.5 and 16.9 (ThinkGTO, 2026-08-11, rake unstated, a tree with an SB limp); about 55 and 13 (Preflop Wizard); 55 to 62 and 13 to 16 against 2.5 (VIP-Grinders) | 48 / 12 | 70 / 20 | |

Other defenders:

| Spot | Published figures (source, date) | Floor | Ceiling | Note |
|---|---|---|---|---|
| `SB` vs `BTN` 2.5, 3-bet and call | 12 to 16 3-bet (VIP-Grinders, 2026-05-14); 10 to 12 (VIP-Grinders, 2026-05-28); "barely calls anything" (GTO Wizard, Vanja, 2024-07-16) | 9 / 0 | 18 / 5 | One publisher for the number; the call band is what `t_sb` is tuned to (section 3.2) |
| `BTN` vs `CO`, 3-bet and call | about 12 and 5 against a 2.3 open (GTO Wizard, Heberle, 2024-12-02); 12.5 and 3.0 (Poker Academy NL200); 13.7 and 0.6 (RangeConverter) | 10 / 0 | 17 / 10 | The flat band is what `t_ip` is tuned to (section 3.2); before the tax the solve flatted about 70 percent here (section 10) |
| `HJ` or `CO` vs `UTG` 2.5, call | No figure found; real play flats a few percent of hands here | 0 | 10 | A rate above 10 is a finding on `t_ip` |

The opener facing a 3-bet, percent of the opening range:

| Spot | Published figures (source, date) | Floor | Ceiling | Note |
|---|---|---|---|---|
| `CO` opens, `BTN` 3-bets: fold, call, 4-bet | 63.7, 17.2, 19.1 (Poker Academy NL200, 4-bet to 17.2); 69.8, 6.3, 23.9 (RangeConverter); fold 55 to 60 (VIP-Grinders 3-bet guide, 2026-05-28, a heuristic) | fold 52, 4-bet 15 | fold 72, 4-bet 28 | Two solver sources and one heuristic |
| `SB` opens 3, `BB` 3-bets to 9: fold, call, 4-bet | 74.5, 18.3, 7.1 (ThinkGTO, a tree with an SB limp, so the raise range is the stronger part) | fold 55 | fold 80 | One source; thin |
| `BTN` opens, `BB` 3-bets; `UTG` opens, `BB` 3-bets | No spot-specific figure found in two passes. Generic: "most openers fold 55% to 65% of their range to a 3-bet" (VIP-Grinders, 2026-06-15) | fold 45 | fold 70 | Thin: the phase 4 Deep review judges these spots hand by hand |

Range-level equity realization, as a check on section 3.2 (the big blind's realized share of its
raw equity against a button open, averaged over its defending range):

| Published figures (source, date) | Floor | Ceiling |
|---|---|---|
| 60 to 75 percent for the big blind, 100 to 110 for the button (GTO Gecko, 2026-02-17, no solver named); 70 to 85 (VIP-Grinders, 2026-06-15); 85 for the big blind and 110 for the button in heads-up 100 bb, own CFR solver (GitHub `allenlong2007/poker-preflop`, undated) | 0.65 | 0.90 |

Phase 3a reports the big blind's range-average realization under the frozen `c` values and it
must sit inside this band; the button's is then fixed by conservation.

### 8.3 Sizes, as published

The rows of section 2.3 against what the sources state. 3-bet in position: 3.0 times the open
(Poker Academy, button over a 2.5 open to 7.5; VIP-Grinders, 2026-05-28; ThinkGTO, 2026-01-17;
PokerCoaching, Little, 2025-10-30, "about three times"); 3.2 in an Upswing example (Brady,
2025-02-14). 3-bet from a blind: 4.4 times (Poker Academy, big blind to 11 over 2.5), 4 times
(VIP-Grinders, 2026-06-15), 3.5 to 4 (ThinkGTO), "closer to four times" (PokerCoaching). 4-bet in
position: about 2.3 times the 3-bet (Upswing), "roughly double" (GTO Wizard, Brokos, 2025-01-28).
4-bet out of position: 2.29 (Poker Academy, cutoff to 17.2 over 7.5), 2.5 to 2.6 (Upswing), 2.2
to 2.5 (VIP-Grinders), 21 bb from the cutoff (GTO Wizard, Brokos, 2025-01-27). Big blind 3-bet
over a 3 bb small blind open: 2.63 times (Poker Academy, to 7.9) and 3.0 (ThinkGTO, to 9). 5-bet
all-in at 100 big blinds: no source states it as a rule; VIP-Grinders names a "5-bet shove range"
at 100 big blinds and Upswing says all-in 5-bets become common nearer 50.

Section 2.3 sits inside these: 3.0 in position, 4.0 from a blind against a non-blind opener,
2.2 and 2.56 to 2.67 for the 4-bets. The `sb_vs_bb` row read 10 and 25 in the first draft, which
is 3.33 times the open where the sources say 2.63 to 3.0 and the spec's own rule says three times
in position; Zach changed it to 9 and 23 on 2026-10-05 (section 11, Q3).

### 8.4 What two passes did not find

A rakeless source for any quantity; a spot-specific fold-to-3-bet figure for the button or `UTG`
against the big blind; a second source for the small blind facing a big blind 3-bet; a solver-
provenanced small blind 3-bet rate against the button; a 6-max equity realization figure from a
named solver. The pages not reachable by fetch (PokerTube, VIP-Grinders) were read in the browser
pane; `preflopwizard.app` and `gtogecko.com` name no solver and no rake and are kept only as the
loose top of a band. The books named in the plan (Acevedo, Janda, Brokos) were not opened. A
third pass is possible; nothing above blocks phases 2 and 3a, whose own proof is the
button-against-big-blind spot, where the bands are widest and best sourced.

## 9. Feasibility

The question of `PLAN.md` phase 1, step 4: can a numpy solver solve the full tree in under an
hour on this Mac? Yes, with a wide margin, so the solver is written in Python with numpy and
`docs/conventions-rust.md` is not written (BD-T3).

The arithmetic. The tree has 65 decision nodes and 60 leaves that reach a board (section 2.4).
Every leaf is a 169 by 169 payoff table, built once from the equity table, the deal weights and
the row's pot (section 3): 60 tables of 28,561 numbers, about 14 MB as 64-bit floats. One
iteration of counterfactual regret minimisation multiplies each leaf table by a reach vector for
each of the two players (120 products of a 169 by 169 matrix and a 169-vector) and updates
regrets and strategies at each node (about a dozen small array operations per node).

The measurement, 2026-10-05, on this Mac (Apple M4, 10 cores, 16 GB; Python 3.14.6, numpy
2.4.3), of exactly those operations on random tables: the 120 products take 0.32 ms, the 780
node operations take 9.5 ms, so one iteration costs about 10 ms, nearly all of it Python call
overhead rather than arithmetic. At that cost 10,000 iterations take 1.6 minutes and the hour is
reached past 350,000 iterations. CFR+ on preflop trees of this size reaches an exploitability of
a tenth of a percent of the pot within a few thousand iterations; the dial
`gtoExploitabilityBb` (0.005) is that order on a 5 bb pot. The margin is above thirty times. A
menu with two sizes at the open and at the 3-bet (M3 in section 11) multiplies the nodes and
leaves by about four and still fits in ten minutes. The script that took the measurement was a
scratch file and is not kept; the operations it timed are the ones named above.

What this estimate does not cover: the equity table of phase 2 is a one-time cost of a different
kind, 1,712,304 boards for every distinct pair of combinations up to suit symmetry, and phase 2
chooses exact enumeration or sampling with a stated bound; the solver's run time does not depend
on that choice. Memory is not a constraint at any size discussed here.

The dials this spec adds or fixes, all for `solver/config.py` (the plan's section 3 puts solver
dials there):

| Dial | Value | Fixed by |
|---|---|---|
| `gtoExploitabilityBb` | 0.005 | `PLAN.md` section 3; the stop rule of phases 3a and 3b |
| `c_srp`, `c_3bp`, `c_4bp` | 0.7, 0.4, 0.2 to start | section 3.2; the edge in position; frozen by phase 3a |
| `c_srp_oop`, `c_3bp_oop`, `c_4bp_oop` | 0.3, 0.2, 0.1 to start | section 3.2; the edge out of position; frozen by phase 3a |
| `k` | 2 (1 allowed) | section 3.2; the curve exponent; set by phase 3a |
| `t_ip`, `t_sb` | 0.1, 0.25 to start | section 3.2; the flat tax; frozen by phase 3a |
| `reachFloor` | 0.0001 | section 7.1: a node reached less often than this is "never" to the grader |
| sizes | the table of section 2.3 | section 2.3 |
| `gtoChartMinOpen` | 0.5 | `PLAN.md` section 3; the containment test of phase 4 |

The other dials of `PLAN.md` section 3 belong to the app, not to the key, and read it as follows.
`gtoGoodFrequency` (0.10) reads `strategy`: a chosen action with a frequency at or above it is
good. `gtoMistakeCostBb` (0.15) reads `ev`: the best action's EV less the chosen action's EV,
shown as a mistake above it; it must sit above the `exploitability_bb` the run records, or the
label is noise (`PLAN.md` phase 6, watch for). `gtoBotMixMode` (`sample`) reads `strategy` to
pick a bot's action. `gtoPostflopMode` (`runout`) is BD-T5 and reads nothing from the key.
`gtoHandsPerSession`, `gtoFreeHandsPerDay` and `gtoRequiresUnit` do not touch the key.
`tableSeats` and `stackBigBlinds` must equal the `seats` length and `stack_bb` of section 12; a
test in phase 4 checks that.

## 10. Independent review

Done 2026-10-05 by a Fable 5.1 subagent in its own worktree, read-only (its `git status --short`
was empty on return). It read this file alone, by absolute path, at its state of 17:04 that day:
sections 1 to 7, 9, 11 (first batch) and 12 written; sections 8 and 10 empty; the first draft's
game (`k = 1`, `c = 0.35` per pot type with the bonus always to the in-position player, no flat
tax, `sb_vs_bb` 3-bet 10 and 4-bet 25). It answered the one question, can a correct solver of
this game still produce a strategy a strong player would call wrong, and where, with yes and nine
findings, ranked by when a strong player would see them. In brief, with what changed in response:

1. **In-position flats covered most of the deck.** A flat by `HJ`, `CO` or `BTN` closed the
   action heads-up with 1.5 of dead money and no squeeze behind it; at `c = 0.35` the button's
   break-even equity against a cutoff open was 31 percent, about 70 percent of hands, and no
   value of `c` fixed it, because at `c = 0` the flat was still about 40 percent of hands. Real
   play flats 3 to 5 percent there. The review's first choice was to remove the flat for every
   seat but the big blind. Zach kept the flat (section 11, Q1) and took the flat tax instead
   (Q4); section 3.2 has it, and section 4, item 1, now carries the finding at its real size.
2. **The small blind flatted.** The same mechanism: a small-blind flat against the button at
   about 45 percent of hands, where real play flats 3 to 5; and because the flat was cheap, the
   small blind's 3-bet range came out value-only (`A5s` against a button open had a higher EV as
   a flat than as a 3-bet). The tax `t_sb` is the response; section 4, item 1.
3. **The in-position bonus ignored initiative.** The first draft gave the in-position player the
   bonus whether it had raised last or merely called, where the published realization figures
   come from the in-position raiser. In the big blind against a small-blind open the break-even
   equity was 26.5 percent (about 95 percent defence against about 63 real); the button called a
   small-blind 3-bet with about 80 percent of its opening range (real 40 to 45), so the blinds'
   3-bets came out at about half of real. Zach took the split (Q2): `c` now depends on who holds
   the edge (section 3.2), and phase 3a tunes on four spots, because the button against the big
   blind sees neither the in-position caller in a single raised pot nor the in-position raiser
   in a 3-bet pot.
4. **One `c` on a line too flat at the bottom.** `r(e) = 1 − c(1 − e)` fitted at the range level
   gave the big blind 85 to 90 percent defence against the button; pushing `c` to fit the button
   spot made the big blind fold `KJo`, `QJo`, `JTo`, `A9o`, `65s`, `54s` and `22` to `55`
   against `UTG`, and lifted the in-position raiser's junk to 130 percent realization. Zach took
   `k = 2` (Q2); section 3.2 has the new worked numbers.
5. **Hand-feature blindness is real and section 4, item 3, had it about right**, with one
   pattern to add: 3-bet bluff selection inverts, so offsuit aces and offsuit broadways become
   the bluffs and suited wheel aces become calls or folds, 5 to 8 percent of a range per spot.
   Added to item 3. RF-3 stays the fallback.
6. **Arithmetic.** Every pot and fold payoff of section 2.5, the 4-bet multiples, the node and
   terminal counts of section 2.4 and the two figures of section 9 were right. One error in
   section 3.2's worked numbers (the 70 percent case read 63.7 and 91; the right values were
   62.7 and 89.5), found the same day by this session's own script and fixed before the review
   returned; the section has since been rewritten for `k = 2`. The review also called "close to
   it" for the strong in-position hand generous (110 percent); the new text gives the numbers.
7. **Card removal across folders.** The entry in section 4, item 6, was adequate; two additions:
   marginal ace-high opens (`A5s` to `A2s`, `ATo` from `UTG`) face about 15 percent fewer 3-bets
   in reality because they block the hands behind that 3-bet, an under-valuation of 0.03 to 0.08
   bb, enough to flip a hand at the open margin; and after four folds the live ranges are a
   little rich in high cards (about 1 percent of equity). Both added to item 6.
8. **Applying a range-level shape hand by hand** gains the bent player `c × Var(e)`, under 0.03
   bb for the widest ranges. Sound; one line added to section 3.2.
9. **The 4x rationale sentence** in section 2.3 said a blind 3-bets bigger because it plays out
   of position, which implied 9 for the big blind against the small blind while the table said
   10. The sentence is fixed, and Zach changed the size (Q3).

The review's verdict on the first draft: the game could carry the section 6 claim in the narrow
sense (an equilibrium of this game, not of poker) and could not carry the product, because the
one-tap statement did not prepare a player for a solver that flats most of the deck and defends
95 percent in the big blind against a small-blind open. What phase 3a could not see from the
button-against-big-blind spot alone: findings 1, 2 and 3. Section 3.2's four tuning spots, and
the bands of section 8.2 for the button's flat rate against the cutoff, the small blind's against
the button, the big blind's defence against the small blind and the opener's calls against a
blind's 3-bet, are the response. The review did not see the spec as it now stands; the phase 4
Deep review of the key is the next cold read, and `PLAN.md` phase 4 names it.

What stands as a known miss after the changes: the realization model knows nothing about the
hand (section 4, item 3); the flat tax is a hand-set number per seat type, not a model of the
real squeeze (item 1); card removal across folders (item 6); and every band in section 8 comes
from a raked game.

## 11. Decisions

Three questions were Zach's, asked in one batch in chat on 2026-10-05 after this draft was
written. Each option carries the reason for and against it; the recommendation is marked. Zach
answered the same day, in chat, "all recs": every recommendation stands, and the answer lines
below record it. A later change to any of the three is a dated supersession here, not an edit.

**(a) The realization model, section 3.2.**

- RF-1, a constant factor per position: the out-of-position player keeps `R × e` of the pot with
  one `R` per pot type. For: one number, easy to read. Against: it fails the bands. With `R =
  0.9` the big blind calls any hand with more than 30 percent equity against a 2.5 open, which is
  nearly every hand, because the price is 1.5 to win 5.5. Real big-blind defence is near 60 to
  70 percent without rake.
- RF-2, the equity-shaped model of section 3.2 (recommended): the share is `e − c × e × (1 − e)`,
  one `c` per pot type, tuned in phase 3a. For: weak hands out of position realize least and
  strong hands realize about all, which is the shape the published realization studies report;
  the pot is conserved; three dials. Against: it cannot tell a suited connector from an offsuit
  broadway with the same equity (section 4, item 3), and the dials tuned on one spot must hold on
  fifteen.
- RF-3, RF-2 plus a per-class adjustment from hand features (suited, connected, pair, high
  card). For: it fixes the one failure RF-2 cannot. Against: the coefficients are hand-written,
  which puts the hand-built chart problem of `DESIGN.md` section 1 one level down, and the
  adjustment breaks pot conservation. Named here as the fallback if the phase 4 Deep review finds
  the composition of the ranges wrong while the bands hold.
- RF-4, realization rolled out from a fixed postflop policy. For: the number comes from play,
  not from a formula. Against: a postflop model and a policy to build and defend; out of this
  effort's scope (`PLAN.md` section 4 reserves postflop scoring).

Answer: RF-2 (Zach, in chat, 2026-10-05). RF-3 stays the named fallback.

**(b) The bet-size menu, section 2.3.**

- M1, the table of section 2.3 (recommended): one open size (2.5, `SB` 3), one 3-bet size per
  row, one 4-bet size per row, 5-bet all-in, no limp. For: 65 nodes, one solve of minutes, one
  button per action at the table, a grade that never has to judge a size. Against: a strong
  player knows the small blind limps at this depth and that a smaller 3-bet is common online.
- M2, M1 plus a small-blind limp: the small blind may limp; the big blind then checks or raises
  (to 4); after a raise the small blind folds, calls or 3-bets. For: it matches published
  small-blind play. Against: three more nodes and a new pot type (a limped pot, where the
  realization model has no studied shape), and the one spot that gains is the least played at a
  six-seat table.
- M3, two sizes at the open and at the 3-bet. For: closer to the mixed sizing solvers show.
  Against: about four times the nodes, two more buttons on a phone screen, and a grader that must
  score a size choice, which the design (E1) does not describe.

Answer: M1 (Zach, in chat, 2026-10-05). The table of section 2.3 is the menu.

**(c) What the app may claim, section 6.**

- C1 (recommended): "GTO trainer" may be the mode's name; "GTO" never qualifies an answer; a
  verdict says "the solver"; the game statement is one tap away. For: the name is what players
  look for and is used the same way by every product in the category; the honesty lives where the
  player reads a verdict. Against: the name is still a claim the small print qualifies.
- C2: the word "GTO" appears nowhere; the mode is "Solver trainer" or "Table trainer". For:
  nothing to qualify. Against: the player who wants this mode calls it GTO and will not find it.
- C3: "GTO" is used freely, with one disclosure on first open. For: the shortest copy. Against:
  `DESIGN.md` hazard 2 says the copy must name the game and the approximation, and one screen
  seen once does not.

Answer: C1 (Zach, in chat, 2026-10-05). Section 6 is the rule.

### Second batch, 2026-10-05, after the cold review

Asked in one batch in chat after section 10's review returned. Zach answered the same day: "do
not remove cold calling... otherwise all recs", then "yes" to Q4.

**Q1. Remove the flat for `HJ`, `CO`, `BTN` and `SB`** (fold or 3-bet; the big blind keeps fold,
call, 3-bet). For: it removes section 10, findings 1 and 2, outright, shrinks the tree to 101
terminals and keeps every pot heads-up with no new dial. Against: real play flats 3 to 5 percent
from the button against the cutoff and a little from the other seats, and those flats would be
outside the game, unscored. Recommended yes. **Answer: no.** Zach keeps the flat as a legal,
graded action at every seat. The consequence is Q4.

**Q2. Let the realization bonus follow initiative, and steepen the curve.** The bonus goes to the
in-position player when it raised last and to the out-of-position raiser otherwise, each with its
own `c`, and the curve is `(1 − e)^2`. For: it fixes findings 3 and 4; the published shape (the
weakest hands near 65 percent, strong hands near 95) is matched; the pot stays conserved.
Against: three more dials, and four tuning spots in phase 3a in place of one. Recommended yes.
**Answer: yes.** Section 3.2. This supersedes the "one `c` per pot type" of the first answer (a);
the RF-2 family stands.

**Q3. `sb_vs_bb` 3-bet 9 and 4-bet 23**, in place of 10 and 25. For: the sources (2.63 to 3.0
times the open) and the spec's own rule. Against: a one-line change to a table Zach had approved.
Recommended yes. **Answer: yes.** Sections 2.3, 2.5 and 12.

**Q4. Tax the flat leaf.** Both shares at a flat by a seat other than the big blind are
multiplied by `(1 − t)`, with `t_ip` and `t_sb` tuned in phase 3a to the button's flat band
against the cutoff and the small blind's against the button. For: it keeps the flat Zach wants
and brings its rate from 70 percent of hands to the real shape, the middling hands at about 10
percent. Against: two more hand-set dials, and the opener's EV when flatted falls too, which is
also real. Recommended yes; the alternative was to record finding 1 as a whole-deck
simplification and ship bots that flat most hands. **Answer: yes.** Section 3.2.

## 12. The game object

The object the key embeds and hashes (section 7.5). The values are the answers of sections 2 and
3 as they stand on 2026-10-05; phase 3a replaces the nine leaf-model dials with the frozen ones
and this section is amended with the date.

```json
{
  "schema_game": 1,
  "seats": ["UTG", "HJ", "CO", "BTN", "SB", "BB"],
  "postflop_order": ["SB", "BB", "UTG", "HJ", "CO", "BTN"],
  "stack_bb": 100,
  "blinds_bb": {"SB": 0.5, "BB": 1},
  "ante_bb": 0,
  "rake": 0,
  "max_live_players": 2,
  "sb_may_limp": false,
  "sizes_bb": {
    "ip_defender": {"open": 2.5, "3bet": 7.5, "4bet": 20, "5bet": 100},
    "sb_defender": {"open": 2.5, "3bet": 10, "4bet": 22, "5bet": 100},
    "bb_defender": {"open": 2.5, "3bet": 10, "4bet": 22, "5bet": 100},
    "sb_vs_bb": {"open": 3, "3bet": 9, "4bet": 23, "5bet": 100}
  },
  "leaf_model": {
    "kind": "edge_realization",
    "formula": "bent_share = e - c * e * (1 - e)^k; edge_share = 1 - bent_share; a flat by a seat other than BB multiplies both shares by (1 - t)",
    "k": 2,
    "c_edge_in_position": {"srp": 0.7, "3bp": 0.4, "4bp": 0.2, "all_in": 0},
    "c_edge_out_of_position": {"srp": 0.3, "3bp": 0.2, "4bp": 0.1, "all_in": 0},
    "flat_tax": {"ip": 0.1, "sb": 0.25, "bb": 0}
  },
  "card_removal": "two_live_hands",
  "hand_classes": 169
}
```

`max_live_players` is the heads-up-only rule of section 2.2. `card_removal` is section 3.3. The
edge rule and the tax are section 3.2. `hand_classes` is the count the `hands` array must have.
