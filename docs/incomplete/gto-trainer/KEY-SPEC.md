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
reports and the cold review. Section 13 (2026-11-05, board item 60) is the scope of RF-3: the
ground truth, the options and the GATE 1 batch; nothing in it is decided until section 11 records
Zach's fourth batch.

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

*Note, 2026-10-06 (board item 37, `HANDOFF.md` step 52).* Phase 3a could not land every band.
No setting of the nine dials inside the ranges above lands the 3-bet-pot bands of 8.2, and no
steeper curve (`k` 3 and 4), no floor on the share, no symmetric bend and no setting past the
ceilings does either (`HANDOFF.md` steps 50 and 51). The dials are frozen provisionally at the
best setting inside the ranges (section 12; 8.5 has every band's value; section 11, Q5, has
Zach's choice), with six bands missed. The sentence above, "each spot must land inside its
bands", is not met by this model: what those bands describe is section 4, item 3, and board item
60 (RF-3) amends this section.

What this model cannot do is named in section 4, items 1 and 3. One check a reader may want:
the share is convex in `e`, so applying it hand class by hand class rather than at the range
level gives the bent player `c × Var(e)` more than the range-level figure; for the widest ranges
that is under 0.03 bb (section 10, finding 8), and nothing corrects for it.

**Amended 2026-11-05 (board item 60, RF-3; Zach's answers in section 11, fourth batch; the
options in section 13).** The bent share `s` above is no longer the share paid. Each hand class
`h` has a playability score

    z(h) = a_pair × pair(h) + a_suited × suited(h) + a_connected × connected(h) + a_ace_high × ace_high(h) + a_high_card × high_card(h)

where `pair` is 1 for a pair, `suited` 1 for a suited non-pair, `connected` 1, 0.5 or 0.25 for a
non-pair with no rank, one rank or two ranks between its two cards (`98`, `97`, `96`; the "gap"
of `solver/cfr.py` and of the `features` string in section 12 counts those ranks between, so
gap 0 is adjacent ranks; the ace counts high only, so `A5s` is not connected),
`ace_high` 1 for a non-pair whose higher card is an ace, and `high_card` is (the higher card's
rank − 10) / 4 with the ace 14, so `AKo` scores +1 and `22` scores −2 on that feature; every
other feature is 0. The five coefficients are in log-odds units and frozen in section 12. At a
leaf with chips behind, with `R = exp(z(h_bent) − z(h_edge))`, the bent player's share is

    s' = s × R / (s × R + 1 − s)

and the edge holder's share is `1 − s'`: the odds of the bent player's share are multiplied by
`R`, so two hands of the same class are unchanged against each other, a share of 0 or 1 stays
where it is, the pot is conserved at every matchup, and every coefficient at 0 gives `R` = 1 and
the model above to one floating-point ulp, not bitwise: `s × 1 / (s × 1 + 1 − s)` can differ
from `s` in the last bit, so a key solved with zero coefficients is not promised byte-identical
to the key of 2026-10-06. The flat tax then applies to both shares as before, and the all-in leaf (3.1) is
not adjusted. The adjustment applies at every leaf with chips behind: `srp`, `3bp` and `4bp`
(section 13.3 (iv-b)). Worked example, from the hand-worked case of `solver/cfr_test.py`: `SB`
calls a `BB` 3-bet to 9 at 40 percent equity, `c_3bp` 0.4, `k` 2, so `s` = 0.3424 and `SB`
keeps 6.163 of 18; with `z(h_bent) − z(h_edge)` = −0.3, `R` = 0.7408, `s'` = 0.2784 and `SB`
keeps 5.010, a cut of 1.153 bb. The coefficients are a fit to the bands of 8.2 under the bounds
and the signs of section 13.4, not a measurement: section 13.1 found no published realization
figure by hand feature from a named solver (13.3 (iii-c)). Both `solver/cfr.py` (`features`,
`scores`, `shift`, `adjusted`, `shares`) and `solver/best_response.py` (`playability`,
`odds_shift`, `split`) carry their own copy of this arithmetic. The tuning paragraph above now
reads over fourteen dials, the nine of this section and the five coefficients, tuned together by
`solver/tune.py` (section 13.4) and frozen in section 12; the result is the dated paragraph of
8.5.

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
   *As amended 2026-11-05 (board item 60, RF-3).* The model now sees five features of the hand
   (3.2 as amended): pair, suited, connectedness, ace-high and the higher card's rank, each with
   one coefficient across every pot type. What it fixes is what those features can carry: a
   suited connector and an offsuit broadway of equal equity now take different shares, and both
   players' hands count, so a 3-bettor's weak offsuit ace loses as well as a caller's. What it
   still cannot do: the coefficients are a fit to the bands of 8.2 (13.3 (iii-c)), not a
   measurement, because no published figure by feature exists (13.1); the features are five
   fixed shapes, so two hands with the same features (`K9s` and `K2s`, `A9o` and `A2o`) still
   differ only by equity; a feature's weight is the same in a single raised pot and a 3-bet pot
   (13.3 (ii-a)), where real realization is nearer to equity; and the hands 8.5 records as still
   outside their bands after the freeze, if any, are this item's findings.
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

Note, 2026-10-05 (board item 36, `HANDOFF.md` step 46): phase 2 writes one file,
`solver/data/equity.json`, which holds both tables of section 3.3, `E` and `W`.
`equity_table_sha256` is the SHA-256 of that file's bytes, so it names both. The file of
2026-10-05 hashes to `bb81c98be345d83fac13797a1a4bafb87f332bebf56d64f21240a83bac31861f`, and
`python3 solver/equity.py` writes the same bytes again. The file stores `W` as integer counts;
the deal probability of section 3.3 is `W[h][g] / 1,624,350`, the file's `meta.pairs_total`.

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

The hash of the `game` object of section 12 as proposed on 2026-10-05, computed that day by
`spec_hash` in `solver/validate_key.py`, was
`fd66084e4602dfb7101d507148e02e406593d9964b10caf877c75a1d440ddce3`. Phase 3a froze the nine
leaf-model dials provisionally on 2026-10-06 (section 11, Q5; board item 37, `HANDOFF.md` step
52), and the hash of the object as it stands in section 12 is
`659cdfd1072b0ea27a0b74737ce6f3a67c63a329ed18595c6f1f8233ffe845a7`, computed the same day by
the same function and pinned in `solver/cfr_test.py` (`SPEC_HASH`). Board item 60 (RF-3) changes
the leaf model and this hash again; phase 4 pins in `app/src/gto/key.ts` whichever value stands
when it runs, and item 60 re-pins it. Board item 60 re-froze the object on 2026-11-05 (section 12
as amended; 8.5, the dated paragraph of 2026-11-05), and the hash of the object as it stands is
`ef9007126f5d63461e6fd0a44cf83f87cba41b5b8bbb5ce21e6797ed6d742681`, computed that day by the
same function and pinned in `solver/cfr_test.py` (`SPEC_HASH`) and in `app/src/gto/key.ts`
(`SPEC_HASH`). The hash of the object with `schema_game` 2, the `class_adjustment` fields and
every dial at its 2026-10-06 value, which stood while the item was built and before the freeze,
was `9520e77db0235971b225fbeff34a8bf865f9c43f2688b56dd999319917ddd295`; no key was exported
under it.

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
the whole tree, and phase 4 reads them again. (Phase 3a's result is 8.5, 2026-10-06: six rows
missed and frozen as provisional, board item 60.) No hand list and no table from any source was
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

### 8.5 The provisional freeze of phase 3a, 2026-10-06

Board item 37 (`HANDOFF.md` steps 50 to 52) tuned the nine dials of 3.2 on the CO, BTN and SB
subtrees, which answer 19 of the rows above, and froze the best setting inside the ranges as
provisional (section 11, Q5; `PLAN.md` BD-T20): `k` 2, `c_srp` 0.5, `c_srp_oop` 0.2, `c_3bp`
0.4, `c_3bp_oop` 0, `c_4bp` 0.1, `c_4bp_oop` 0.05, `t_ip` 0.1, `t_sb` 0.25 (section 12). Solved
2026-10-06 at 4,000 iterations by `python3 solver/cfr.py`: every seat's gain at most 0.00001 bb
per hand given the subtree's root, and two runs gave the same output. Each row marked missed is
a finding for Zach under 8.1, not a number tuned away; the six are the subject of board item 60
(RF-3), and until it lands the key the app carries misses them.

| Row of 8.2 | Solved | Band | Verdict |
|---|---|---|---|
| `CO` opens | 24.3 | 24 to 31 | inside |
| `BTN` opens | 34.3 | 40 to 48 | missed, provisional |
| `SB` opens | 50.4 | 38 to 55 | inside |
| `BB` against `BTN`, defend | 63.8 | 50 to 75 | inside |
| `BB` against `BTN`, 3-bet | 15.047 | 9 to 15 | missed by 0.047, provisional |
| `BB` against `BTN`, call | 48.8 | 38 to 62 | inside |
| `BB` against `CO`, defend | 52.2 | 42 to 68 | inside |
| `BB` against `CO`, 3-bet | 10.3 | 7 to 13 | inside |
| `BB` against `SB`, defend | 63.6 | 48 to 70 | inside |
| `BB` against `SB`, 3-bet | 27.5 | 12 to 20 | missed, provisional |
| `SB` against `BTN`, 3-bet | 17.5 | 9 to 18 | inside |
| `SB` against `BTN`, call | 0.0 | 0 to 5 | inside |
| `BTN` against `CO`, 3-bet | 14.1 | 10 to 17 | inside |
| `BTN` against `CO`, call | 1.2 | 0 to 10 | inside |
| `CO` folds to a `BTN` 3-bet | 18.0 | 52 to 72 | missed, provisional |
| `CO` 4-bets a `BTN` 3-bet | 17.2 | 15 to 28 | inside |
| `SB` folds to a `BB` 3-bet | 35.2 | 55 to 80 | missed, provisional |
| `BTN` folds to a `BB` 3-bet | 35.7 | 45 to 70 | missed, provisional |
| `BB` realizes against `BTN` | 82.8 | 65 to 90 | inside |

The button opens every pair at 100 percent. What the six misses share: each is a rate in a
3-bet pot, or the button's open rate, which `c_3bp_oop` moves against the button's fold rate;
no setting inside or outside the ranges, no curve from `k` 1 to 4, no floor and no symmetric
bend lands them (steps 50 and 51), and the hands they describe differ by features, not by
equity (section 4, item 3). The rows the UTG and HJ subtrees answer are phase 3b's (board item
38), which records them here as a dated paragraph.

**The full tree, 2026-10-06 (board item 38, `HANDOFF.md` step 53).** Phase 3b solved all five
subtrees at 12,000 iterations with the provisional dials above (`python3 solver/cfr.py`, 105 s
on a quiet Mac, two runs byte-identical by `cmp`). Every seat's best-response gain per dealt hand
is at most 0.000003 bb at 12,000 iterations (0.000032 at 3,000, 0.000009 at 6,000), under the
dial 0.005 and falling as the iterations double. The 19 rows above keep their verdicts at 12,000
iterations; four values move by at most 0.3 from the 4,000-iteration table (`BB` against `CO`
defends 51.9, `BB` against `SB` defends 63.4, `SB` against `BTN` 3-bets 17.4, `CO` folds to a
`BTN` 3-bet 18.3). The seven rows the `UTG` and `HJ` subtrees answer:

| Row of 8.2 | Solved | Band | Verdict |
|---|---|---|---|
| `UTG` opens | 14.9 | 14 to 21 | inside |
| `HJ` opens | 18.8 | 18 to 25 | inside |
| `BB` against `UTG`, defend | 35.1 | 28 to 60 | inside |
| `BB` against `UTG`, 3-bet | 6.5 | 4 to 10 | inside |
| `HJ` against `UTG`, call | 1.2 | 0 to 10 | inside |
| `CO` against `UTG`, call | 1.2 | 0 to 10 | inside |
| `UTG` folds to a `BB` 3-bet | 41.2 | 45 to 70 | missed, a finding |

The seventh miss is new and is a finding for Zach under 8.1, not a number tuned away: no dial
moved in phase 3b (BD-T12, BD-T20). It is the mechanism of the five 3-bet-pot misses above, an
opener that folds too little to a blind's 3-bet (section 4, item 3), and belongs with them to
board item 60 unless Zach says otherwise (question (c) of item 38's prompt, open in step 53). The
row "`HJ` or `CO` against `UTG`, call" of 8.2 is measured per seat. One node is reached less
often than `reachFloor` (0.0001) per dealt hand: `UTG` facing the big blind's all-in 5-bet,
`UTG:open/HJ:fold/CO:fold/BTN:fold/SB:fold/BB:3bet/UTG:4bet/BB:5bet`, at 0.000088; the schema
marks it by its `reach` alone (7.1, BD-T15), and the grader shows no EV loss there. The subtrees
are reached per dealt hand at 1 (`UTG`), 0.8507 (`HJ`), 0.6912 (`CO`), 0.5232 (`BTN`) and 0.3437
(`SB`), the products of the fold rates of the seats before each opener (3.3). The raw key is
`solver/data/key.json` (608,670 bytes, 65 nodes, 10,985 strategy rows, the shape of 7.1;
`python3 solver/validate_key.py solver/data/key.json` prints `valid`), the file phase 4 exports.

**The RF-3 re-freeze, 2026-11-05 (board item 60, `PLAN.md` BD-T39).** The leaf model gained the
class adjustment of 3.2 as amended, and `solver/tune.py` re-tuned the nine dials of 3.2 together
with the five coefficients inside the ranges of 3.2 and 13.4 (two runs, 13.4 as amended). The
pick, by the rule of 13.4 (the most rows inside, then the smallest total miss, then the
patterns, then the 4-bet expectation; the button's pairs at 100 percent is phase 3a's done-when
and holds), is `k` 2, `c_srp` 0.5, `c_srp_oop` 0.125, `c_3bp` 0.45, `c_3bp_oop` 0, `c_4bp` 0.3,
`c_4bp_oop` 0.2, `t_ip` 0.5, `t_sb` 0.5, `a_pair` 0.3, `a_suited` 0, `a_connected` 0.15,
`a_ace_high` 0, `a_high_card` 0 (section 12; hash in 7.5). It is frozen as provisional again, not
final: it lands 21 of the 26 rows of 8.2 against 19 before, and the five it misses are findings
for Zach under 8.1, not numbers tuned away. Solved by `python3 solver/cfr.py` at 12,000 iterations
over the five subtrees, 105 s; two runs byte-identical by `cmp`; every seat's best-response gain
per dealt hand at most 0.000003 bb (0.000040 at 3,000, 0.000011 at 6,000). The button opens every
pair at 100 percent. The same one node is under `reachFloor`, at the same place as above. Every
row, at 12,000 iterations:

| Row of 8.2 | 2026-10-06 | 2026-11-05 | Band | Verdict |
|---|---|---|---|---|
| `UTG` opens | 14.9 | 15.1 | 14 to 21 | inside |
| `HJ` opens | 18.8 | 18.7 | 18 to 25 | inside |
| `CO` opens | 24.3 | 24.6 | 24 to 31 | inside |
| `BTN` opens | 34.3 | 35.5 | 40 to 48 | missed, provisional |
| `SB` opens | 50.4 | 51.6 | 38 to 55 | inside |
| `BB` against `BTN`, defend | 63.8 | 59.6 | 50 to 75 | inside |
| `BB` against `BTN`, 3-bet | 15.047 | 13.8 | 9 to 15 | inside, was missed |
| `BB` against `BTN`, call | 48.8 | 45.8 | 38 to 62 | inside |
| `BB` against `CO`, defend | 51.9 | 46.9 | 42 to 68 | inside |
| `BB` against `CO`, 3-bet | 10.3 | 10.0 | 7 to 13 | inside |
| `BB` against `UTG`, defend | 35.1 | 26.6 | 28 to 60 | missed, new, provisional |
| `BB` against `UTG`, 3-bet | 6.5 | 6.2 | 4 to 10 | inside |
| `BB` against `SB`, defend | 63.4 | 68.6 | 48 to 70 | inside |
| `BB` against `SB`, 3-bet | 27.5 | 25.8 | 12 to 20 | missed, provisional |
| `SB` against `BTN`, 3-bet | 17.4 | 17.2 | 9 to 18 | inside |
| `SB` against `BTN`, call | 0.0 | 0.0 | 0 to 5 | inside |
| `BTN` against `CO`, 3-bet | 14.1 | 14.4 | 10 to 17 | inside |
| `BTN` against `CO`, call | 1.2 | 0.0 | 0 to 10 | inside |
| `HJ` against `UTG`, call | 1.2 | 0.0 | 0 to 10 | inside |
| `CO` against `UTG`, call | 1.2 | 0.0 | 0 to 10 | inside |
| `CO` folds to a `BTN` 3-bet | 18.3 | 33.9 | 52 to 72 | missed, provisional |
| `CO` 4-bets a `BTN` 3-bet | 17.2 | 21.2 | 15 to 28 | inside |
| `SB` folds to a `BB` 3-bet | 35.2 | 43.4 | 55 to 80 | missed, provisional |
| `BTN` folds to a `BB` 3-bet | 35.7 | 45.1 | 45 to 70 | inside, was missed |
| `UTG` folds to a `BB` 3-bet | 41.2 | 46.4 | 45 to 70 | inside, was missed |
| `BB` realizes against `BTN` | 82.8 | 82.0 | 65 to 90 | inside |

Of the seven rows item 60 set out to land, three are inside (`BB` against `BTN` 3-bets, `BTN`
folds, `UTG` folds) and four stay missed; `BB` against `UTG` defends is newly missed, by 1.4,
so BD-T39's done-when is not met and the freeze stays provisional. What the five misses share
is what 8.5 found on 2026-10-06: each is a rate in a 3-bet pot or the button's open rate, and
the two fold rates moved 16 and 8 points toward their bands without reaching them. The dials
that moved most: `t_ip` and `t_sb` from 0.1 and 0.25 to the ceiling 0.5 of their ranges, which
is what made the three flat rows 0.0 and the three fold rates rise; `c_4bp` and `c_4bp_oop` to
their ceilings 0.3 and 0.2; `a_pair` to 0.3, `a_connected` to 0.15; `a_suited`, `a_ace_high`
and `a_high_card` stayed at 0, so of the features section 4, item 3, names, suitedness and the
weak ace moved nothing in this fit. Five of the fourteen dials sit at a ceiling, a finding for
the ranges, which are Zach's.

The hand-level patterns of 13.3 (v), read from the committed key at 12,000 iterations with
`tune.pattern_lines` and `tune.vs4_rows` over its strategies (`cfr.py` does not print them; the
500-iteration screening showed P1 met against `BTN` and P4 met in three spots, which the solve
does not confirm): P1 NOT MET against `BTN` (`A2s`-`A5s` 3-bet less than `A2o`-`A9o`) and met
against `SB`; P2 met for `CO` against a `BTN` 3-bet, not met for `SB` against a `BB` 3-bet; P3
not met (the button opens the gap-0 suited connectors less often than `A2o`-`A9o`); P4 met in
one of five spots (`BB` against a `BTN` 4-bet), not met for `CO` against a `BTN` 3-bet, `BTN`
against a `CO` 4-bet, `SB` against a `BTN` 4-bet and `BB` against an `SB` 4-bet. So the key the
app carries still has its bluff selection inverted against the button: the big blind 3-bets the
offsuit weak aces more than the suited ones, the inversion section 4, item 3, describes (the
Deep audit of 2026-11-05 lists it as its hazard 6), a finding for section 10. The
4-bet expectation of 13.3 (v) (b), fold 35 to 60 and call 20 to 45, no verdict, at 12,000
iterations: `BTN` against a `CO` 4-bet folds 28.6, calls 52.7; `SB` against a `BTN` 4-bet folds
25.5, calls 56.7; `BB` against a `BTN` 4-bet folds 27.8, calls 54.3; `BB` against an `SB` 4-bet
folds 32.0, calls 48.6. Every 4-bet is called more and folded to less than the one source
expects, as 13.1 Part C found of the 2026-10-06 key.

`k` 1 and 2, as 3.2 asks. The best `k` 1 setting of the two runs (`c_srp` 0.25, `c_3bp` 0.6,
`c_4bp` 0.3, `c_srp_oop` 0.125, `c_3bp_oop` 0, `c_4bp_oop` 0.2, `t_ip` 0, `t_sb` 0.312, `a_pair`
0.6, `a_suited` 0, `a_connected` 0.3, `a_ace_high` 0, `a_high_card` 0.15; 13.4 as amended) was
solved once at 12,000 iterations for the comparison: 19 rows inside, total miss 15.0 points.
It brings `CO` folds to 51.0, `SB` folds to 53.5 and `BTN` opens to 37.4, and the 4-bet rows
near the expectation (`BTN` against `CO` folds 39.0 and calls 34.0 at the screening), but it
misses `CO` 4-bets at 30.0, `BB` against `CO` defends at 41.2 and `BB` against `UTG` defends at
27.9, and it has `a_pair`, `c_3bp` and `c_4bp` at their ceilings. The pick rule puts rows inside
first, so `k` 2 stands; the `k` 1 setting is the one to start from if Zach widens the ranges.
The raw key is `solver/data/key.json` (609,882 bytes, 65 nodes, `python3 solver/validate_key.py
solver/data/key.json` prints `valid`), copied byte for byte to `app/src/gto/data/key.json`.

**Zach, 2026-11-05, on the misses and the bot test (board item 60, round 1).** The freeze stays
provisional as built; each of the five misses above is a finding under 8.1; no band is widened
and no range moved. The key of this freeze leaves one row at the uniform start that a
key-following bot reaches with the hand: `HJ` holding `A4s` against `BTN`'s 5-bet
(`UTG:fold/HJ:open/CO:fold/BTN:3bet/HJ:4bet/BTN:5bet`, strategy 0.5006 and 0.4994, EVs −20.0
and −41.37), because `HJ` opens `A4s` at 0.0002 and 4-bets it at 0.0004, so its own reach there
is about 8e-8, under the grader's line `gtoNeverHeldReach` (1e-6, BD-T24) but above zero, where
`app/src/gto/bots.test.ts` drew its line. Zach chose to change the test to the grader's line and
not the solver, and not to re-solve; the solver still writes the uniform start for a row it
never reaches, and the grader hides it (7.1, BD-T24).

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

### Second review, 2026-10-06: the key (board item 39, phase 4)

Done 2026-10-06 by a Fable 5.1 subagent in its own worktree, review only; the harness removed
that worktree on return, which it does only for one with no changes, and the builder's checkout
held no file but the builder's own (`git status --short`). It read this file, `solver/data/key.json`
(12,000 iterations, `spec_hash` `659cdfd1...e845a7`, the provisional dials of section 12) and
`solver/data/equity.json` by absolute path on branch `gto-equity`, and answered one question: is
a hand a strong player would call wrong (A) the game of this spec giving that answer, or (B) a
fault in the key, a number the stated game does not imply? It did not re-judge the seven band
misses of 8.5.

**Verdict: no fault of class B.** By script over the 65 nodes: the fold EV equals the payoff of
2.5 at every node (10,985 rows); `totals` match 2.3 at every node; at the 4,178 rows whose
`hand_reach` is above 0.0001, the strategy puts more than 0.05 only on actions within 0.02 bb of
the row's best EV; every row sums to 1 within 0.001; each node's `reach` equals the sum of its
`hand_reach` within 0.0001, and no node is reached more often than its parent. The reviewer also
recomputed the call EV at all 60 terminal-call leaves from `equity.json` and the formulas of 3.2
with the dials of 12 (largest difference 0.000055 bb at a flat, 0.000098 at a call of a 3-bet,
0.00031 at a call of a 4-bet, 0.0024 at a call of a 5-bet, where a few hands at frequencies
rounded to four places move the weights), and checked `E` (symmetric; `AA` against `KK` 0.8195;
six Monte Carlo spot checks within 0.5 points). Every hand it names is class A: section 4, item 3
(the model cannot see suitedness, connectedness or set value) at nearly every node, item 1 (one
flat tax per seat type) at the flats, and items 4 and 5 (one 4-bet size, an all-in 5-bet) at the
4-bet and 5-bet nodes. The key is fit for bots and a grader to read in the mechanical sense.
Section 6's statement covers the open and defend layers, in the reviewer's judgment, but does not
prepare a player for three patterns a strong player calls absurd within a few hands: the big blind
3-bets small pairs at 100 percent against the button and the small blind; openers call 3-bets and
4-bets with small pairs and weak suited aces while they fold offsuit broadways; and at the 5-bet
nodes the bots fold `QQ`, `JJ` and sometimes `KK` to a shove while they call with `TT`.

**The hands it names, by node.** The action is the key's, at a frequency of 1 unless given; class
A, item 3, unless marked.

- `root` (UTG opens): opens `A8o`; folds `A5s`, `A4s`, `A3s`, `A2s`, `QTs`, `JTs`, `T9s`, `98s`,
  `33` and `22`; opens `44` at 0.40.
- `UTG:fold` (HJ opens): opens `A8o`, `A7o` and `A6o` (0.715); folds `A2s`, `K9s`, `T9s`, `98s`,
  `87s`, `76s`, `33` and `22`.
- `UTG:fold/HJ:fold` (CO opens): opens `A6o`, `A5o` and `A4o`; folds `K8s` to `K5s`, `Q8s`,
  `J9s`, `T9s`, `98s`, `87s`, `76s`, `65s`, `QTo`, `JTo` and `22`.
- `UTG:fold/HJ:fold/CO:fold` (BTN opens): folds `T8s`, `98s`, `97s`, `87s`, `86s`, `76s`, `75s`,
  `65s`, `64s`, `54s`, `K3s`, `K2s`, `Q7s` to `Q2s`, `J8s` to `J5s`, `T9o`, `J9o` and `Q8o`, while it
  opens `K7o`, `K8o` and `Q9o`.
- `UTG:fold/HJ:fold/CO:fold/BTN:fold` (SB opens): opens `Q5o` and `Q4o`; folds `97s`, `87s`, `86s`,
  `76s`, `75s`, `65s`, `64s`, `54s`, `T6s`, `98o` and `T8o`.
- The big blind against a BTN open: 3-bets `33` to `88`, `A9o` and `JTs` (a strong player calls).
  Against a CO open: 3-bets `55` to `99`; calls `A5s` and `A4s` (a strong player 3-bets a share).
  Against a UTG open: calls `A2o` to `A8o`, `KTo`, `QTo`, `JTo`, `T9o`, `K5s` and `K6s` (fold);
  3-bets `88` and `99`. Against an SB open: 3-bets `22` to `66`, `A2o` to `A8o` (26 percent of its
  3-bet range), `T7s` and `J8s` (call).
- SB against a BTN open: 3-bets `A8o`, `A9o` and `A7o` (0.27); folds `A2s`, `K9s`, `QTs`, `JTs`,
  `T9s`, `98s`, `87s` and `76s` (a strong player 3-bets a share of them).
- BTN against a CO open: flats `A8o` and `A7s` (0.999) and no other hand (A, item 1 and item 3);
  folds `A5s` (0.926) and `JTs` to `65s`; 3-bets `33`, `44` and `55`. HJ against a UTG open: flats
  `ATo` alone with `ATs`, the same two hands flat for CO and BTN against UTG, `AJo` (0.80) for SB
  against UTG and `A9s` for CO and BTN against HJ (item 1); 3-bets `66` to `88`.
- CO facing a BTN 3-bet: calls `A2s`, `A3s`, `A5s`, `A8o`, `A9o`, `K9s`, `Q9s`, `QTs`, `KJo`, `33`,
  `44` and `55` (mostly fold).
- SB facing a BB 3-bet: 4-bets `AJo`, `88`, `77` (0.45) and `KQo` (0.65) (call); calls `A2o`, `A5o`,
  `22`, `33`, `44`, `KTo`, `QJo` and `98s` (fold).
- BTN facing a BB 3-bet: 4-bets `TT` and `JJ` (item 4); calls `22` to `55`, `A2s`, `K7s`, `K8s`,
  `A8o` and `QJo` (fold). BTN facing an SB 3-bet: 4-bets `TT`, `JJ` and `AQo` (item 4); calls `22`
  to `44`, `A2s`, `A6o`, `A4o`, `K6s` and `K7s` (fold). UTG facing a BB 3-bet is close to a real
  strategy; no hand named.
- The calls of a 4-bet (items 4 and 5, and the dials `c_4bp` and `c_4bp_oop`, which no band of 8.2
  checks): BTN against a CO 4-bet calls `44` to `88`, `A8s` and `KTs`; SB against a BTN 4-bet calls
  `33` to `99`, `A3s` to `A9s`, `KTs`, `KJo` and `KQo`; BB against a BTN 4-bet calls `33` to `99`,
  `A4s`, `A5s`, `A7s`, `QJs` and `JTs`; BB against an SB 4-bet calls `22` to `44`, `A9o`, `A5o`,
  `A4o`, `KTo`, `JTo`, `87s`, `98s`, `T8s` and `J8s`, and shoves `KJs`, `KQs` and `66` (0.50).
- The 5-bet nodes (items 4 and 5): `QQ` folds 0.89 to 0.91 to the HJ, CO and BTN shoves after a UTG
  4-bet, with the call EV within 0.001 bb of the fold; `KK` folds 0.664 to the BB's shove after a
  UTG 4-bet (reach 0.000087, under `reachFloor`) and 0.269 to the SB's; `QQ` folds to every shove
  after an HJ 4-bet and to the BB's after a CO 4-bet; `JJ` folds to three shoves where `TT` calls
  0.59 to 0.80. These rows sit at indifference, and `E` holds the real effect of a pair against an
  overpair (`TT` 0.1925 against `AA`, `JJ` 0.1885, `QQ` 0.1845), so the smaller pair calls.

**What it says a builder must know**, and where each goes under Zach's answer (c) of 2026-10-06
(a hand of class A goes to board item 60 and blocks nothing; a fault of class B would block item
41):

1. 2,777 rows at hands the actor never holds at that node (`hand_reach` under 1e-6) carry the
   uniform strategy, the CFR+ default; their EVs are valid and their frequencies are not. A grader
   that reads `strategy` there calls every action good (`gtoGoodFrequency`), a 4-bet with `72o`
   included. Item 41 reads `hand_reach` before `strategy`. Bots never hold those hands.
2. At the 15 opener-facing-5-bet nodes the folds of `QQ`, `JJ` and `KK` come from EV gaps under
   0.001 bb, while a player's call there is graded a mistake of 0.38 to 0.52 bb at six nodes, above
   `gtoMistakeCostBb` (0.15). The reviewer suggests bots that play the best-EV action at those
   nodes and a grader that treats actions within the solver's noise as equal. Item 40 asks Zach
   about the bots, item 41 about the grader.
3. No band of 8.2 covers a 4-bet or 5-bet quantity, and `c_4bp` and `c_4bp_oop` were tuned on
   nothing. The reviewer recommends a band, or a stated expectation, for the defender's call of a
   4-bet per row before item 60 is judged done. Item 60, in its GATE 1 batch.
4. The inversion of section 4, item 3, is the main pattern of the key, so section 6's statement
   should name it in plain words, or the player concludes the solver is broken. Phase 10 (item 45),
   copy under R7.
5. Each flat of HJ, CO, BTN and SB is one or two hands at the fold margin, which a player reads as
   a tell. Item 40, with item 2.

**Re-checked by the builder against the file**, 2026-10-06, `python3` over `solver/data/key.json`:
`QQ` at `UTG:open/HJ:3bet/UTG:4bet/HJ:5bet` folds 0.9043 (fold −20.0, call −20.0009); `KK` at the
BB's 5-bet after UTG's 4-bet folds 0.6636 at reach 0.000087; the big blind against a BTN open
3-bets `33`, `55`, `88` and `99` and calls `22` (the verdict's "22 to 88" joins its two spots
against the button and the small blind); `72o` at `UTG:fold/HJ:fold/CO:open/BTN:3bet` has the
strategy 0.3333 three times and `hand_reach` 0; 6,420 rows have `hand_reach` under 1e-6, and 2,783
of them are uniform within 0.001 (the reviewer's 2,777 used a tighter test).

`PLAN.md` phase 4's done-when, "the Deep review finds no wrong strategy for the hand classes it
checks", is not met: the provisional freeze (BD-T20) cannot meet it, and the hands go to item 60.
Phase 4 is `BUILT` with that deviation recorded under it.

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

### Third batch, 2026-10-06, after the tuning of phase 3a

Asked in chat on 2026-10-05 (`HANDOFF.md` step 50) and again on 2026-10-06 (step 51), after
phase 3a's solver was built and no setting of the nine dials inside the ranges of 3.2 landed
every band of 8.2. Zach answered the first round on 2026-10-05, "all recs": (a) the solver tests
join the whole-repo gate at phase 3b (board item 38), when the solver writes its output; (b)
supersede the leaf model (BD-T18) and re-tune, with ranges wider than 3.2 as the fallback. The
second round (step 51) then found that no shape of the equity-bent family lands the 3-bet-pot
bands: steeper curves (`k` 3 and 4, `c` up to 1.5), a floor on the share, a symmetric bend and
ranges past the ceilings of 3.2 were all tried, and the two settings that come closest do so by
never calling a 3-bet and by folding a small pair on the button. The hands the bands describe
differ by features, not by equity (section 4, item 3), so answer (b) could not be carried out
inside the family, and the question was put again with three choices.

**Q5. What to freeze, now that the model cannot land every band.**

- (1) Freeze the best setting inside the ranges as provisional (recommended): `k` 2, `c_srp`
  0.5, `c_srp_oop` 0.2, `c_3bp` 0.4, `c_3bp_oop` 0, `c_4bp` 0.1, `c_4bp_oop` 0.05, `t_ip` 0.1,
  `t_sb` 0.25, which lands 13 of the 19 bands the CO, BTN and SB subtrees answer and opens
  every pair from the button. Record the six misses in section 8.5 marked provisional, let
  phases 3b and 4 build on it, and open a board item for RF-3 (option (a) of the first batch)
  whose output re-freezes the dials and re-solves. For: it unblocks the full tree, the key
  export and the table work; the record says plainly what holds and what does not; the solver
  re-runs in minutes once the model changes. Against: a key with six known misses exists for a
  while, and the hash phase 4 pins is replaced when RF-3 lands.
- (2) Scope RF-3 first and freeze nothing until it lands. For: one freeze and one hash.
  Against: every later phase waits on a design with hand-set coefficients, the slowest kind of
  decision this effort has.
- (3) Freeze the same setting as final and let the phase 4 Deep review judge the hands. For: no
  new item. Against: it records six bands as met when they are not, which 8.1 forbids.

**Answer: (1)** (Zach, in chat, 2026-10-06: "provisional freeze, open the rf-3 item"). Sections
3.2, 7.5, 8.5 and 12 carry the freeze; `PLAN.md` BD-T20 records it with its reversal; board
item 60 is RF-3.

### Fourth batch, 2026-11-05, the GATE 1 batch of RF-3 (board item 60)

Asked in one batch in chat on 2026-11-05 after section 13 was written (13.6 has each question
with its options, the argument against each and the recommendation). Zach answered the same day
in chat: every recommendation.

- **Q1. Build RF-3, or keep the provisional freeze as final?** Answer: build it. The alternative,
  the first reversal of BD-T20, was declined.
- **Q2. The shape.** Answer: (i-c), the renormalized two-sided factor in log-odds form (3.2 as
  amended).
- **Q3. The features and their sharing.** Answer: (ii-a), the five features with one coefficient
  each across pot types; the two pot-type scales of (ii-b) only as the fallback if the harness
  cannot land the rows.
- **Q4. How the coefficients are set.** Answer: (iii-c), a bounded fit to the bands with the
  signs of section 4, item 3, fixed and every coefficient inside −0.6 to 0.6, recorded as a fit.
- **Q5. Pot types.** Answer: (iv-b), every leaf with chips behind.
- **Q6. Done.** Answer: as 13.3 (v) states it: the seven rows of 8.5 including `UTG` folds to a
  `BB` 3-bet, no row of 8.2 newly missed, the button's pairs at 100 percent, the realization band,
  the four patterns P1 to P4 as a tiebreak and as recorded findings, the bands first when they
  conflict.
- **Q7. The 4-bet rows.** Answer: (b), a stated expectation (fold 35 to 60, call 20 to 45 percent
  of the 3-bet range) printed by the harness, a tiebreak only, recorded in 8.5 without a verdict.
- **Q8. `schema_game`.** Answer: 2; the key schema stays `felto-gto-key/1`.

These answers are written out in 3.2 (the amendment), 4 item 3 (the "as amended" note), 12 (the
object) and 8.5 (the result); `PLAN.md` BD-T39 records the decision with its reversal.

## 12. The game object

The object the key embeds and hashes (section 7.5). The values are the answers of sections 2 and
3 as they stand on 2026-10-05; phase 3a replaces the nine leaf-model dials with the frozen ones
and this section is amended with the date. Amended 2026-10-06 (board item 37, `HANDOFF.md` step
52): the nine leaf-model dials below are the provisional freeze of section 11, Q5. The starting
values of 3.2 (`c` 0.7, 0.4, 0.2 with the edge in position; 0.3, 0.2, 0.1 with it out of
position; `t` 0.1 and 0.25; `k` 2) stay in `RANGES` of `solver/config.py` as the record of where
the tuning began. Board item 60 (RF-3) amends this object and section 3.2 again. Amended
2026-11-05 (board item 60, RF-3, section 11 fourth batch, `PLAN.md` BD-T39): `leaf_model` gains
`class_adjustment`, the five coefficients of 3.2 as amended with their feature legend, the nine
old dials are re-frozen with them by `solver/tune.py` (8.5, the dated paragraph of 2026-11-05),
and `schema_game` is 2 because the object's meaning changed (Q8). The freeze is provisional
again: 8.5 records which rows it lands and which it misses. With every coefficient 0 the object
values every leaf as the object of 2026-10-06 did to one floating-point ulp, not bitwise (3.2
as amended). `formula` and `features` are prose
for a reader of the key; the arithmetic that binds is 3.2.

```json
{
  "schema_game": 2,
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
    "formula": "bent_share = e - c * e * (1 - e)^k; R = exp(z_bent - z_edge); share = bent_share * R / (bent_share * R + 1 - bent_share); edge_share = 1 - share; a flat by a seat other than BB multiplies both shares by (1 - t)",
    "k": 2,
    "c_edge_in_position": {"srp": 0.5, "3bp": 0.45, "4bp": 0.3, "all_in": 0},
    "c_edge_out_of_position": {"srp": 0.125, "3bp": 0, "4bp": 0.2, "all_in": 0},
    "flat_tax": {"ip": 0.5, "sb": 0.5, "bb": 0},
    "class_adjustment": {
      "kind": "log_odds_shift",
      "features": "z = a_pair * pair + a_suited * suited + a_connected * connected + a_ace_high * ace_high + a_high_card * high_card; pair, suited and ace_high are 0 or 1 (suited and ace_high are 0 for a pair); connected is 1, 0.5, 0.25 for a non-pair with a gap of 0, 1, 2 between its ranks, the ace high only, else 0; high_card is (rank of the higher card - 10) / 4 with the ace 14",
      "a_pair": 0.3,
      "a_suited": 0,
      "a_connected": 0.15,
      "a_ace_high": 0,
      "a_high_card": 0
    }
  },
  "card_removal": "two_live_hands",
  "hand_classes": 169
}
```

`max_live_players` is the heads-up-only rule of section 2.2. `card_removal` is section 3.3. The
edge rule, the tax and the class adjustment are section 3.2. `hand_classes` is the count the
`hands` array must have. The coefficients that are integers (`0`) are written as integers, as 7.5
asks, so `a_suited`, `a_ace_high` and `a_high_card` are `0` and not `0.0` in the canonical JSON.

## 13. RF-3: options

Written 2026-11-05 on Fable 5.1 for board item 60 (`PASSOFF.md`), Stage 2 of
`docs/AGENT-PRACTICES.md` 2.2. This section proposes and decides nothing. It holds the ground
truth of Stage 1 (13.1), what RF-3 is and is not (13.2), the option space with the strongest
argument against each option and a marked recommendation (13.3), the dials it would add (13.4),
the hazards (13.5) and the GATE 1 batch (13.6). Zach's answers become the fourth batch of section
11, dated, and steps 3 to 7 of the item follow from them. Until then sections 3.2, 8.5 and 12
stand as written.

### 13.1 Ground truth, verified 2026-11-05

Stage 1 research for board item 60 (RF-3). An Opus 5.5 researcher subagent did the work in its
own worktree, read-only (its `git status --short` was empty on return). The key read is
`solver/data/key.json` (12,000 iterations, `spec_hash` 659cdfd1...e845a7, the dials of section
12: `k` 2, `c_srp` 0.5, `c_srp_oop` 0.2, `c_3bp` 0.4, `c_3bp_oop` 0, `c_4bp` 0.1, `c_4bp_oop`
0.05, `t_ip` 0.1, `t_sb` 0.25). The script is a scratch copy of the `measure` arithmetic in
`solver/cfr.py` lines 422-436, not kept; the builder re-checked two band values and five EV gaps
against the file the same day. Numbers are in big blinds unless a line says otherwise.

#### 1. What exists, verified 2026-11-05

| Claim | Verified state | Citation |
|---|---|---|
| BTN opens | 34.306 (8.5: 34.3). Band 40 to 48 | key, node `UTG:fold/HJ:fold/CO:fold` |
| BB 3-bets a BTN open | 15.055 (8.5: 15.047 at 4,000 iterations; the key has 12,000 iterations and strategies rounded to 4 places). Band 9 to 15 | key, `.../BTN:open/SB:fold` |
| BB 3-bets an SB open | 27.499 (8.5: 27.5). Band 12 to 20 | key, `.../SB:open` |
| CO folds to a BTN 3-bet | 18.275 (8.5: 18.3 at 12,000 iterations). Band 52 to 72 | key, `UTG:fold/HJ:fold/CO:open/BTN:3bet` |
| SB folds to a BB 3-bet | 35.172 (8.5: 35.2). Band 55 to 80 | key, `.../SB:open/BB:3bet` |
| BTN folds to a BB 3-bet | 35.696 (8.5: 35.7). Band 45 to 70 | key, `.../BTN:open/SB:fold/BB:3bet` |
| UTG folds to a BB 3-bet | 41.190 (8.5: 41.2). Band 45 to 70 | key, `UTG:open/.../BB:3bet` |
| Spot 1 finding | BTN folds 87.5 percent of each suited connector class (gap 0, 1, 2) at a class mean open EV of about -0.53. The 5.7 points it needs cost at most 0.115 bb per hand, and most of them are K-x and Q-x hands. | 13.1.3, spot 1 |
| Spot 2 finding | Over the band by 0.055 points. KTs and QTs are indifferent (gap 0.0001). This is a rounding miss, not a feature miss. | spot 2 |
| Spot 3 finding | BB 3-bets 100 percent of all pairs, all aces and suited broadways. The 7.5 points it needs cost up to 0.25 bb per hand. The movers are offsuit broadways, A2o to A5o and suited connectors and one-gappers. | spot 3 |
| Spot 4 finding | CO calls 100 percent of 22-55 and A2s-A9s, and 82 to 93 percent of broadways. 33.7 points must fold, at gaps up to 0.75 bb. The movers include the classes real play keeps (suited aces, suited broadways). | spot 4 |
| Spot 5 finding | SB calls 100 percent of offsuit aces A2o-A9o (14.4 percent of its range) and 22-55. 19.8 points must fold, at gaps up to 0.58 bb. | spot 5 |
| Spot 6 finding | 9.3 points must fold, at gaps up to 0.20 bb (K-x and Q-x suited, QJo, A2s, J9s, Q9s). | spot 6 |
| Spot 7 finding | 3.8 points must fold. 55 and AJo are indifferent (gap below 0.0001), so the miss costs about 0 bb. | spot 7 |
| Edge in the 3-bet pots | The BTN and UTG calls of a BB 3-bet use `c_3bp_oop`, which is 0: the caller there realizes its raw equity. The CO and SB calls use `c_3bp` 0.4. | 3.2 table, key `leaf_model` |
| Published realization by feature, preflop range level | Not found for any of the five features from a named solver with stated rake. All figures found are single hands on single flops, or position-level ranges. | 13.1.2 |
| Published realization in 3-bet pots by feature | Not found. Three sources were checked and none gives a 3-bet pot figure. | 13.1.2 |
| Published 3-bettor fold, call and 5-bet rates against a 4-bet at 100 bb | One source, with no solver named: GTO Gecko, BB against a BTN 4-bet, fold about 47, call about 29, jam about 24. A second source with a solver named was not found. | 13.1.4 |

#### 2. Part A: published realization figures by feature

Sixteen web searches and fetches were made on 2026-11-05. No source gives a preflop, range-level
realization figure for a hand feature from a named solver with stated rake. What exists is shown
below. The values are aggregates or single named hands. No chart was copied.

**Position-level figures (context for every feature).**

| Figure | Spot | Rake | Solver | Source, URL, read |
|---|---|---|---|---|
| IP 1.14 to 1.17, OOP 0.78 to 0.87 (range EQR on the flop) | MTT 20 bb BTN vs BB; 6-max cash 100 bb LJ vs BB (IP 1.14, OOP 0.86 to 0.87); HU 30 bb SB limp | not stated | the site's own, engine not named | Poker Academy, "Equity realization (EQR) in poker", Doro, updated 2026-09-17, https://poker.academy/blog/post/how-to-understand-equity-realisation-eqr, read 2026-11-05 |
| BB 70 to 75 percent, BTN 105 to 110 percent, for 76s | BTN open, BB defend, stack not stated | not stated | none | ThinkGTO glossary "Equity Realization", undated (copyright 2026), https://thinkgto.com/glossary/equity-realization, read 2026-11-05 |

**(1) Suited against offsuit at the same ranks.**

| Figure | Spot | Rake, solver | Source |
|---|---|---|---|
| KJs 102.8 against KJo 87.0 percent (gap about 16 points, one pair of hands) | BB defends against a BTN min-raise, MTT 20 bb, 9-handed, ante 0.13 | rake not stated; Simple Preflop Holdem models realization | PokerNews, Gareth James, 2020-11-02, https://www.pokernews.com/strategy/bb-defense-holdem-resources-vs-simple-preflop-holdem-38183.htm, read 2026-11-05 |
| Suited broadways realize about twice their offsuit form on one flop (KJs 38 against KJo 19, QTs 37 against QTo 16, QJs 34 against QJo 14 percent) | BTN vs BB, MTT 20 bb, flop 975 rainbow, BB OOP | not stated, engine not named | Poker Academy, above |
| KQs 117 against KQo about 47 percent on one flop | UTG vs BTN SRP, flop A92 two-tone, UTG OOP | not stated, GTO Wizard | PokerStrategy, Barry Carter, "Which hands over or under realise equity?", updated 2026-02-21, https://www.pokerstrategy.com/news/content/Which-hands-over-or-under-realise-equity_131327/, read 2026-11-05 |

These are flop-specific and do not give a preflop factor.

**(2) Connectedness (gap 0, 1, 2).** One preflop figure was found. Suited connectors average
about 98 percent (KJs, QJs, 76s) and the one-gapper J9s is about 95 percent, in the PokerNews
BB-defence spot above. These figures rest on 3 hands and 1 hand. Flop-level figures: 32s 87
percent, 98s below 25 percent without a backdoor flush draw and near 50 percent with one, BB OOP,
HJ vs BB, MTT 50 bb, flop JT9 two-tone, GTO Wizard, Andrew Brokos, "Equity Realization",
2022-11-16, https://blog.gtowizard.com/equity-realization/. A per-hand model in a GitHub project
(allenlong2007/poker-preflop, CFR+, BTN vs BB at 100 bb, no rake) measured suited connectors at
1.3 to 1.4 times their equity on the BTN and 1.0 to 1.2 in the BB. Its own playability bonuses
are "hand-picked" and its postflop rules are simple, so it is not a solver source. No two-gapper
figure was found.

**(3) Pairs (22-66, 77-TT).** No preflop figure from a solver was found. The GitHub project above
measured small pairs at about 1.4 times their equity on the BTN, under its own postflop rules.
PokerStrategy (above) gives 44 at 46 to 56 percent on one A-high flop, OOP. Medium pairs: absent.

**(4) Suited wheel aces against weak offsuit aces.** No preflop factor was found. A8o is 90.9
percent in the PokerNews spot (one hand). A2s is about 100 percent IP and below 2 percent OOP on
one flop in GTO Wizard's 2022 article. The GitHub project measured weak offsuit aces and kings at
0.8 to 0.9 on the BTN. A suited wheel ace preflop figure: absent.

**(5) Offsuit broadways (KJo, KTo, QTo, JTo).** KJo and QTo average about 83.5 percent in the
PokerNews spot (two hands, 20 bb). Flop-level: 14 to 19 percent on 975 rainbow (Poker Academy).
The GitHub project measured offsuit broadways at 1.0 to 1.2 in the BB. No 100 bb cash figure was
found.

**3-bet pots.** No figure for any feature was found. Poker Academy, GTO Wizard 2022,
PokerStrategy and ThinkGTO give none. The GitHub project uses the same formula in 3-bet pots as
in single raised pots.

**Absence, stated plainly.** Two sources with a named solver and stated rake exist for none of
the five features. The direction is agreed (suited over offsuit, connected over unconnected, IP
over OOP), but the size is not sourced at the preflop range level. An RF-3 per-class term
therefore cannot be set from published figures. It can only be tuned against the bands of 8.2,
and the sizes in 13.1.3 bound that tuning.

#### 3. Part B: the key at the seven missed spots

Each table gives: the class share of the actor's range at the node, in percent (for spots 1 to 3
this is percent of all dealt hands, because those rows are rates of hands by the plain deal); the
percent of the class that takes each action; and the class mean EV of each action, in bb. The EV
is weighted by the same range weight over every hand in the class, whatever the hand does.
"Cheapest movers" are the hands currently on the wrong side, ordered by the EV gap (current
action EV minus the best EV of the action the band needs). "Points" are percent points of the
measured base. Hands whose current frequency is below 0.01 are left out.

##### Spot 1: BTN opens 34.3, band 40 to 48 (node `UTG:fold/HJ:fold/CO:fold`)

| Class | Share | fold | open | EV fold | EV open |
|---|---|---|---|---|---|
| pairs 22-55 | 1.8 | 0.0 | 100.0 | 0 | +0.464 |
| pairs 66-99 | 1.8 | 0.0 | 100.0 | 0 | +1.321 |
| pairs TT-AA | 2.3 | 0.0 | 100.0 | 0 | +3.842 |
| suited aces A2s-A5s | 1.2 | 0.0 | 100.0 | 0 | +0.395 |
| suited aces A6s-A9s | 1.2 | 0.0 | 100.0 | 0 | +0.652 |
| suited aces ATs-AKs | 1.2 | 0.0 | 100.0 | 0 | +1.621 |
| offsuit aces A2o-A9o | 7.2 | 0.0 | 100.0 | 0 | +0.305 |
| offsuit aces ATo-AKo | 3.6 | 0.0 | 100.0 | 0 | +1.386 |
| suited broadways | 1.8 | 0.0 | 100.0 | 0 | +0.496 |
| offsuit broadways | 5.4 | 0.0 | 100.0 | 0 | +0.251 |
| suited connectors gap 0 | 2.4 | 87.5 | 12.5 | 0 | -0.544 |
| suited one-gappers | 2.4 | 87.5 | 12.5 | 0 | -0.526 |
| suited two-gappers | 2.4 | 87.5 | 12.5 | 0 | -0.524 |
| other suited K and Q | 4.5 | 53.3 | 46.7 | 0 | -0.044 |
| other suited | 6.3 | 100.0 | 0.0 | 0 | -0.715 |
| other offsuit | 54.3 | 93.2 | 6.8 | 0 | -0.824 |
| all | 100 | 65.7 | 34.3 | | |

Move needed: 5.7 points from fold to open (to the floor, 40). Cheapest movers (gap = open EV
short of 0, bb):

| Hand | Class | Points | Cumulative | Gap |
|---|---|---|---|---|
| K6o | other offsuit | 0.84 | 0.84 | 0.0001 |
| K3s | other suited K and Q | 0.30 | 1.14 | 0.009 |
| J8s | suited two-gappers | 0.30 | 1.44 | 0.014 |
| T8s | suited one-gappers | 0.30 | 1.74 | 0.019 |
| 98s | suited connectors gap 0 | 0.30 | 2.04 | 0.041 |
| K5o | other offsuit | 0.90 | 2.95 | 0.052 |
| Q7s | other suited K and Q | 0.30 | 3.25 | 0.053 |
| K2s | other suited K and Q | 0.30 | 3.55 | 0.063 |
| Q6s | other suited K and Q | 0.30 | 3.85 | 0.087 |
| J9o | other offsuit | 0.90 | 4.76 | 0.096 |
| Q8o | other offsuit | 0.90 | 5.66 | 0.115 |
| Q5s | other suited K and Q | 0.30 | 5.97 | 0.130 |

The cheapest path is mostly offsuit and low suited K-x and Q-x, which section 4 item 3 says
should move the other way. A feature-led path is all three suited connector classes: 6.3 points
at up to 7.2 points of hands. It needs about +0.5 bb per hand on the open EV of those classes,
and the class means sit at -0.52 to -0.54.

##### Spot 2: BB 3-bets a BTN open 15.055, band 9 to 15 (node `.../BTN:open/SB:fold`)

| Class | Share | fold | call | 3bet | EV fold | EV call | EV 3bet |
|---|---|---|---|---|---|---|---|
| pairs 22-55 | 1.8 | 0.0 | 25.0 | 75.0 | -1 | -0.122 | +0.078 |
| pairs 66-99 | 1.8 | 0.0 | 0.0 | 100.0 | -1 | +0.396 | +1.214 |
| pairs TT-AA | 2.3 | 0.0 | 0.0 | 100.0 | -1 | +1.401 | +5.048 |
| suited aces A2s-A5s | 1.2 | 0.0 | 50.0 | 50.0 | -1 | -0.180 | -0.197 |
| suited aces A6s-A9s | 1.2 | 0.0 | 25.1 | 74.9 | -1 | +0.086 | +0.177 |
| suited aces ATs-AKs | 1.2 | 0.0 | 0.0 | 100.0 | -1 | +0.706 | +1.934 |
| offsuit aces A2o-A9o | 7.2 | 0.0 | 87.5 | 12.5 | -1 | -0.212 | -0.471 |
| offsuit aces ATo-AKo | 3.6 | 0.0 | 0.0 | 100.0 | -1 | +0.589 | +1.543 |
| suited broadways | 1.8 | 0.0 | 29.8 | 70.2 | -1 | -0.204 | -0.043 |
| offsuit broadways | 5.4 | 0.0 | 79.4 | 20.6 | -1 | -0.370 | -0.521 |
| suited connectors gap 0 | 2.4 | 12.5 | 87.5 | 0.0 | -1 | -0.793 | -1.394 |
| suited one-gappers | 2.4 | 12.5 | 87.5 | 0.0 | -1 | -0.812 | -1.464 |
| suited two-gappers | 2.4 | 0.0 | 100.0 | 0.0 | -1 | -0.830 | -1.524 |
| other suited K and Q | 4.5 | 0.0 | 100.0 | 0.0 | -1 | -0.698 | -1.087 |
| other suited | 6.3 | 33.4 | 66.6 | 0.0 | -1 | -0.967 | -1.951 |
| other offsuit | 54.3 | 61.7 | 38.3 | 0.0 | -1 | -1.033 | -2.177 |
| all | 100 | 36.2 | 48.7 | 15.1 | | | |

Move needed: 0.055 points from 3-bet to call. Cheapest movers: KTs (3-bet 0.102, 0.03 points,
gap 0.0001) and QTs (3-bet 0.109, 0.03 points, gap 0.0001), both suited broadways. The pattern
section 10 names is visible here. Small pairs 3-bet 75 percent. Offsuit aces A2o-A9o 3-bet 12.5
percent, which is 0.9 points of hands. Suited wheel aces 3-bet 50 percent (0.6 points). No suited
connector class 3-bets.

##### Spot 3: BB 3-bets an SB open 27.5, band 12 to 20 (node `.../BTN:fold/SB:open`)

| Class | Share | fold | call | 3bet | EV fold | EV call | EV 3bet |
|---|---|---|---|---|---|---|---|
| pairs 22-55 | 1.8 | 0.0 | 0.0 | 100.0 | -1 | -0.071 | +0.714 |
| pairs 66-99 | 1.8 | 0.0 | 0.0 | 100.0 | -1 | +0.504 | +1.931 |
| pairs TT-AA | 2.3 | 0.0 | 0.0 | 100.0 | -1 | +1.478 | +6.624 |
| suited aces A2s-A5s | 1.2 | 0.0 | 0.0 | 100.0 | -1 | +0.056 | +0.557 |
| suited aces A6s-A9s | 1.2 | 0.0 | 0.0 | 100.0 | -1 | +0.276 | +1.073 |
| suited aces ATs-AKs | 1.2 | 0.0 | 0.0 | 100.0 | -1 | +0.764 | +3.009 |
| offsuit aces A2o-A9o | 7.2 | 0.0 | 0.0 | 100.0 | -1 | +0.006 | +0.330 |
| offsuit aces ATo-AKo | 3.6 | 0.0 | 0.0 | 100.0 | -1 | +0.648 | +2.606 |
| suited broadways | 1.8 | 0.0 | 0.0 | 100.0 | -1 | +0.057 | +0.506 |
| offsuit broadways | 5.4 | 0.0 | 40.8 | 59.2 | -1 | -0.100 | -0.045 |
| suited connectors gap 0 | 2.4 | 12.5 | 50.0 | 37.5 | -1 | -0.821 | -0.928 |
| suited one-gappers | 2.4 | 12.5 | 62.5 | 25.0 | -1 | -0.826 | -0.978 |
| suited two-gappers | 2.4 | 24.6 | 62.9 | 12.5 | -1 | -0.814 | -1.032 |
| other suited K and Q | 4.5 | 0.0 | 93.4 | 6.6 | -1 | -0.467 | -0.719 |
| other suited | 6.3 | 52.2 | 47.8 | 0.0 | -1 | -0.996 | -1.387 |
| other offsuit | 54.3 | 59.0 | 41.0 | 0.0 | -1 | -1.002 | -1.614 |
| all | 100 | 36.6 | 35.9 | 27.5 | | | |

Move needed: 7.5 points from 3-bet to call (to the ceiling, 20). Cheapest movers (gap = 3-bet EV
minus call EV, bb):

| Hand | Class | Points | Cumulative | Gap |
|---|---|---|---|---|
| JTo | offsuit broadways | 0.42 | 0.42 | 0.0000 |
| KTo | offsuit broadways | 0.20 | 0.62 | 0.0000 |
| QJo | offsuit broadways | 0.78 | 1.41 | 0.0000 |
| K9s | other suited K and Q | 0.30 | 1.71 | 0.003 |
| J8s | suited two-gappers | 0.30 | 2.01 | 0.007 |
| 87s | suited connectors gap 0 | 0.30 | 2.31 | 0.034 |
| A2o | offsuit aces A2o-A9o | 0.90 | 3.22 | 0.088 |
| T8s | suited one-gappers | 0.30 | 3.52 | 0.102 |
| 98s | suited connectors gap 0 | 0.30 | 3.82 | 0.102 |
| J9s | suited one-gappers | 0.30 | 4.12 | 0.112 |
| A3o | offsuit aces A2o-A9o | 0.90 | 5.03 | 0.121 |
| KJo | offsuit broadways | 0.90 | 5.93 | 0.122 |
| A4o | offsuit aces A2o-A9o | 0.90 | 6.83 | 0.164 |
| T9s | suited connectors gap 0 | 0.30 | 7.14 | 0.232 |
| QTs | suited broadways | 0.30 | 7.44 | 0.246 |
| A5o | offsuit aces A2o-A9o | 0.90 | 8.34 | 0.246 |

By class, the feature-led move is offsuit aces A2o-A9o (7.2 points, at 0.09 to about 0.47 bb)
plus offsuit broadways (3.2 points still 3-bet). The 3-bet EV of A2o-A9o must fall relative to
the call by about 0.32 bb on the class mean. The pairs 22-55 3-bet at a gap of 0.79 bb, so moving
them is expensive.

##### Spot 4: CO folds to a BTN 3-bet 18.3, band 52 to 72 (node `UTG:fold/HJ:fold/CO:open/BTN:3bet`; CO's call is bent by `c_3bp` 0.4)

| Class | Share | fold | call | 4bet | EV fold | EV call | EV 4bet |
|---|---|---|---|---|---|---|---|
| pairs 22-55 | 5.6 | 0.0 | 100.0 | 0.0 | -2.5 | -1.303 | -3.903 |
| pairs 66-99 | 7.4 | 0.0 | 77.6 | 22.4 | -2.5 | +0.208 | -0.311 |
| pairs TT-AA | 9.3 | 0.0 | 0.0 | 100.0 | -2.5 | +3.666 | +8.622 |
| suited aces A2s-A5s | 5.0 | 0.0 | 100.0 | 0.0 | -2.5 | -2.138 | -5.897 |
| suited aces A6s-A9s | 5.0 | 0.0 | 100.0 | 0.0 | -2.5 | -1.816 | -3.787 |
| suited aces ATs-AKs | 5.0 | 0.0 | 60.1 | 39.9 | -2.5 | +0.544 | -0.266 |
| offsuit aces A2o-A9o | 22.4 | 66.8 | 33.2 | 0.0 | -2.5 | -2.457 | -6.137 |
| offsuit aces ATo-AKo | 14.9 | 0.0 | 75.0 | 25.0 | -2.5 | +0.122 | -0.802 |
| suited broadways | 7.4 | 0.0 | 92.8 | 7.2 | -2.5 | -1.755 | -3.257 |
| offsuit broadways | 14.9 | 18.1 | 81.9 | 0.0 | -2.5 | -2.190 | -3.814 |
| suited two-gappers | 1.2 | 0.0 | 100.0 | 0.0 | -2.5 | -2.360 | -7.294 |
| other suited K and Q | 1.2 | 0.0 | 100.0 | 0.0 | -2.5 | -2.335 | -4.071 |
| other offsuit | 0.6 | 100.0 | 0.0 | 0.0 | -2.5 | -2.918 | -9.054 |
| all | 100 | 18.3 | 64.5 | 17.2 | | | |

Classes not listed have no weight in CO's opening range. Move needed: 33.7 points from call to
fold (to the floor, 52). Cheapest movers (gap = call EV minus fold EV, bb):

| Hand | Class | Points | Cumulative | Gap |
|---|---|---|---|---|
| KTo | offsuit broadways | 1.03 | 1.03 | -0.0007 |
| QJo | offsuit broadways | 3.72 | 4.76 | 0.063 |
| A8o | offsuit aces A2o-A9o | 3.72 | 8.48 | 0.116 |
| Q9s | suited two-gappers | 1.24 | 9.72 | 0.140 |
| K9s | other suited K and Q | 1.24 | 10.96 | 0.165 |
| A2s | suited aces A2s-A5s | 1.24 | 12.21 | 0.207 |
| A3s | suited aces A2s-A5s | 1.24 | 13.45 | 0.276 |
| KJo | offsuit broadways | 3.72 | 17.17 | 0.320 |
| A4s | suited aces A2s-A5s | 1.24 | 18.41 | 0.414 |
| A6s | suited aces A6s-A9s | 1.24 | 19.65 | 0.444 |
| QTs | suited broadways | 1.24 | 20.90 | 0.470 |
| A9o | offsuit aces A2o-A9o | 3.72 | 24.62 | 0.486 |
| A5s | suited aces A2s-A5s | 1.24 | 25.86 | 0.550 |
| JTs | suited broadways | 1.24 | 27.10 | 0.559 |
| A7s | suited aces A6s-A9s | 1.24 | 28.34 | 0.563 |
| KTs | suited broadways | 1.24 | 29.58 | 0.574 |
| QJs | suited broadways | 1.24 | 30.83 | 0.625 |
| A8s | suited aces A6s-A9s | 1.24 | 32.07 | 0.696 |
| 33 | pairs 22-55 | 1.86 | 33.93 | 0.750 |

The miss is too large for a feature term alone. Offsuit aces and offsuit broadways that still
call give only about 15 points (A2o-A9o at 33 percent call, 7.4 points; offsuit broadways at 82
percent call, 12.2 points). Landing 52 also folds suited aces and suited broadways, at 0.2 to
0.75 bb per hand. That points to a pot-type cut on the out-of-position caller in a 3-bet pot,
with the feature term on top. Poker Academy's figure for this spot (NL200, GG rake) is fold 63.7,
call 17.2, 4-bet 19.1 percent of the opening range (Pawel Brzeski, updated 2026-09-17,
https://poker.academy/blog/post/what-is-a-3-bet-in-poker-a-theoretical-and-strategic-guide). The
key's call is 64.5 against 17.2 there.

##### Spot 5: SB folds to a BB 3-bet 35.2, band 55 to 80 (node `.../SB:open/BB:3bet`; SB's call is bent by `c_3bp` 0.4)

| Class | Share | fold | call | 4bet | EV fold | EV call | EV 4bet |
|---|---|---|---|---|---|---|---|
| pairs 22-55 | 3.6 | 0.0 | 100.0 | 0.0 | -3 | -1.176 | -3.102 |
| pairs 66-99 | 3.6 | 0.0 | 38.0 | 62.0 | -3 | +0.584 | +0.923 |
| pairs TT-AA | 4.5 | 0.0 | 0.0 | 100.0 | -3 | +3.687 | +12.109 |
| suited aces A2s-A5s | 2.4 | 0.0 | 100.0 | 0.0 | -3 | -1.910 | -3.813 |
| suited aces A6s-A9s | 2.4 | 0.0 | 100.0 | 0.0 | -3 | -0.923 | -2.059 |
| suited aces ATs-AKs | 2.4 | 0.0 | 2.8 | 97.2 | -3 | +1.311 | +2.851 |
| offsuit aces A2o-A9o | 14.4 | 0.0 | 100.0 | 0.0 | -3 | -1.978 | -4.296 |
| offsuit aces ATo-AKo | 7.2 | 0.0 | 25.0 | 75.0 | -3 | +0.918 | +1.911 |
| suited broadways | 3.6 | 0.0 | 83.3 | 16.7 | -3 | -1.748 | -2.304 |
| offsuit broadways | 10.8 | 0.0 | 89.2 | 10.8 | -3 | -2.319 | -3.675 |
| suited connectors gap 0 | 1.2 | 0.0 | 100.0 | 0.0 | -3 | -2.584 | -6.430 |
| suited one-gappers | 1.2 | 0.0 | 100.0 | 0.0 | -3 | -2.621 | -6.425 |
| suited two-gappers | 1.4 | 16.2 | 83.8 | 0.0 | -3 | -2.676 | -6.063 |
| other suited K and Q | 9.0 | 47.7 | 52.3 | 0.0 | -3 | -2.961 | -6.446 |
| other suited | 1.5 | 100.0 | 0.0 | 0.0 | -3 | -3.256 | -8.044 |
| other offsuit | 31.0 | 94.2 | 5.8 | 0.0 | -3 | -3.437 | -8.514 |
| all | 100 | 35.2 | 48.6 | 16.2 | | | |

Move needed: 19.8 points from call to fold. Cheapest movers (gap = call EV minus fold EV, bb):

| Hand | Class | Points | Cumulative | Gap |
|---|---|---|---|---|
| Q6s | other suited K and Q | 0.05 | 0.06 | -0.001 |
| K4s | other suited K and Q | 0.45 | 0.51 | 0.0004 |
| Q7s | other suited K and Q | 0.60 | 1.11 | 0.036 |
| K9o | other offsuit | 1.79 | 2.90 | 0.104 |
| K5s | other suited K and Q | 0.60 | 3.50 | 0.124 |
| J8s | suited two-gappers | 0.60 | 4.10 | 0.206 |
| T8s | suited one-gappers | 0.60 | 4.70 | 0.249 |
| K6s | other suited K and Q | 0.60 | 5.30 | 0.250 |
| A2o | offsuit aces A2o-A9o | 1.79 | 7.09 | 0.256 |
| 98s | suited connectors gap 0 | 0.60 | 7.69 | 0.283 |
| Q8s | other suited K and Q | 0.60 | 8.29 | 0.324 |
| K7s | other suited K and Q | 0.60 | 8.89 | 0.338 |
| JTo | offsuit broadways | 1.79 | 10.68 | 0.343 |
| QTo | offsuit broadways | 1.79 | 12.48 | 0.374 |
| A3o | offsuit aces A2o-A9o | 1.79 | 14.27 | 0.403 |
| K8s | other suited K and Q | 0.60 | 14.87 | 0.418 |
| J9s | suited one-gappers | 0.60 | 15.47 | 0.508 |
| T9s | suited connectors gap 0 | 0.60 | 16.07 | 0.549 |
| A4o | offsuit aces A2o-A9o | 1.79 | 17.86 | 0.550 |
| QJo | offsuit broadways | 1.79 | 19.66 | 0.573 |
| Q9s | suited two-gappers | 0.60 | 20.25 | 0.579 |

A feature-led move folds offsuit aces A2o-A9o (14.4 points, class mean call EV -1.98, so about
1.0 bb above fold) and offsuit broadways (9.6 points still calling, mean gap about 0.68 bb). Those
two classes cover the 19.8 points, at about 0.7 to 1.0 bb per hand.

##### Spot 6: BTN folds to a BB 3-bet 35.7, band 45 to 70 (node `.../BTN:open/SB:fold/BB:3bet`; BTN's call uses `c_3bp_oop` 0, so it is not bent)

| Class | Share | fold | call | 4bet | EV fold | EV call | EV 4bet |
|---|---|---|---|---|---|---|---|
| pairs 22-55 | 5.3 | 0.0 | 100.0 | 0.0 | -2.5 | -1.393 | -4.388 |
| pairs 66-99 | 5.3 | 0.0 | 97.8 | 2.2 | -2.5 | +0.579 | -0.011 |
| pairs TT-AA | 6.6 | 0.0 | 0.0 | 100.0 | -2.5 | +4.371 | +9.052 |
| suited aces A2s-A5s | 3.5 | 0.0 | 100.0 | 0.0 | -2.5 | -2.131 | -5.990 |
| suited aces A6s-A9s | 3.5 | 0.0 | 100.0 | 0.0 | -2.5 | -1.629 | -3.839 |
| suited aces ATs-AKs | 3.5 | 0.0 | 50.0 | 50.0 | -2.5 | +1.043 | +0.710 |
| offsuit aces A2o-A9o | 21.1 | 72.1 | 27.9 | 0.0 | -2.5 | -2.591 | -7.451 |
| offsuit aces ATo-AKo | 10.6 | 0.0 | 74.6 | 25.4 | -2.5 | +0.552 | -0.273 |
| suited broadways | 5.3 | 0.0 | 100.0 | 0.0 | -2.5 | -1.639 | -3.621 |
| offsuit broadways | 15.8 | 44.8 | 55.2 | 0.0 | -2.5 | -2.307 | -5.926 |
| suited connectors gap 0 | 0.9 | 0.0 | 100.0 | 0.0 | -2.5 | -2.172 | -6.401 |
| suited one-gappers | 0.9 | 0.0 | 100.0 | 0.0 | -2.5 | -2.304 | -7.015 |
| suited two-gappers | 0.9 | 0.0 | 100.0 | 0.0 | -2.5 | -2.301 | -6.833 |
| other suited K and Q | 6.2 | 42.9 | 57.1 | 0.0 | -2.5 | -2.522 | -6.366 |
| other offsuit | 10.7 | 100.0 | 0.0 | 0.0 | -2.5 | -3.085 | -9.258 |
| all | 100 | 35.7 | 53.2 | 11.1 | | | |

Move needed: 9.3 points from call to fold. Cheapest movers: KTo (offsuit broadways, 0.82 points,
gap -0.0001), A7o (offsuit aces, 0.62, 0.0000), K7s (0.88, 0.029), Q8s (0.88, 0.030), K8s (0.88,
0.083), QJo (offsuit broadways, 2.64, 0.096), A2s (suited aces A2s-A5s, 0.88, 0.175), J9s
(one-gapper, 0.88, 0.196), Q9s (two-gapper, 0.88, 0.199). The cumulative total reaches 9.35.
Feature-led: offsuit broadways still calling (8.7 points, mean gap about 0.19 bb) plus the calling
part of A2o-A9o (5.9 points, near 0 bb gap) cover it at about 0.2 bb per hand.

##### Spot 7: UTG folds to a BB 3-bet 41.2, band 45 to 70 (node `UTG:open/.../BB:3bet`; `c_3bp_oop` 0)

| Class | Share | fold | call | 4bet | EV fold | EV call | EV 4bet |
|---|---|---|---|---|---|---|---|
| pairs 22-55 | 4.3 | 66.0 | 34.0 | 0.0 | -2.5 | -2.525 | -4.200 |
| pairs 66-99 | 12.1 | 0.0 | 100.0 | 0.0 | -2.5 | -2.030 | -3.667 |
| pairs TT-AA | 15.2 | 0.0 | 40.3 | 59.7 | -2.5 | +3.082 | +5.236 |
| suited aces A2s-A5s | 0.0 | 57.0 | 42.9 | 0.2 | -2.5 | -2.534 | -3.053 |
| suited aces A6s-A9s | 6.6 | 99.5 | 0.5 | 0.0 | -2.5 | -2.655 | -3.240 |
| suited aces ATs-AKs | 8.1 | 0.0 | 80.5 | 19.5 | -2.5 | -0.923 | -1.218 |
| offsuit aces A2o-A9o | 12.1 | 100.0 | 0.0 | 0.0 | -2.5 | -3.354 | -4.325 |
| offsuit aces ATo-AKo | 24.3 | 25.9 | 67.4 | 6.7 | -2.5 | -1.547 | -2.068 |
| suited broadways | 8.1 | 50.6 | 49.4 | 0.0 | -2.5 | -2.597 | -3.317 |
| offsuit broadways | 9.3 | 100.0 | 0.0 | 0.0 | -2.5 | -3.009 | -4.357 |
| all | 100 | 41.2 | 46.5 | 12.3 | | | |

Move needed: 3.8 points from call to fold. Cheapest movers: A9s (0.03 points, gap -0.001), 55
(pairs 22-55, call 0.477, 1.45 points, gap 0.0000), AJo (offsuit aces ATo-AKo, call 0.965, 5.85
points, gap 0.0000). 55 plus 40 percent of AJo lands the floor at about 0 bb. This miss is a near
tie, not a feature miss. The 66-99 class calls 100 percent at a mean gap of 0.47 bb, which is the
set-value pattern of section 10.

#### 4. Part C: the defender facing a 4-bet

Rates are percent of the defender's 3-bet range: weight = deal weight x 3-bet frequency at the
defend node, the same form as the `vs3` rows. Sizes: `ip_defender` 3-bet 7.5, 4-bet 20;
`sb_defender` and `bb_defender` 3-bet 10, 4-bet 22; `sb_vs_bb` 3-bet 9, 4-bet 23; 5-bet all-in at
100.

| Row and node | Fold | Call | 5-bet |
|---|---|---|---|
| BTN vs CO 4-bet, `UTG:fold/HJ:fold/CO:open/BTN:3bet/CO:4bet` | 22.3 | 61.0 | 16.7 |
| SB vs BTN 4-bet, `.../BTN:open/SB:3bet/BTN:4bet` | 14.8 | 71.6 | 13.6 |
| BB vs BTN 4-bet, `.../BTN:open/SB:fold/BB:3bet/BTN:4bet` | 15.1 | 71.1 | 13.8 |
| BB vs SB 4-bet, `.../SB:open/BB:3bet/SB:4bet` | 19.2 | 65.2 | 15.5 |

Calling hands by class. A frequency is given where it is below 0.95. Hands below 0.05 are left
out.

- BTN vs CO: pairs 33 (0.89) to 55, 66-99, TT, JJ, QQ (0.71); A5s; A7s (0.85), A8s, A9s (0.46);
  AQs (0.63), AJs, ATs; AQo, AJo; KQs, KJs, KTs, QJs.
- SB vs BTN: 33-55, 66-99, TT, JJ, QQ (0.53); A3s, A4s, A5s (0.85); A6s-A9s; AQs, AJs, ATs; AQo,
  AJo, ATo (0.42); KQs, KJs, KTs, QJs; KQo, KJo.
- BB vs BTN: 33-55, 66-99, TT, JJ, QQ (0.89); A4s, A5s; A7s, A8s, A9s; AQs (0.53), AJs, ATs; AKo
  (0.25), AQo, AJo; KQs, KJs, KTs, QJs, QTs, JTs; KQo (0.77).
- BB vs SB: 22-55 (55 0.87), 66-99 (66 0.50), TT (0.38); A2s-A5s; A6s-A9s; AQs, AJs, ATs; A9o,
  A5o, A4o; AQo, AJo, ATo; KTs (0.74), QJs, QTs, JTs; KQo, KJo, KTo, JTo; T9s, 98s, 87s; J9s, T8s;
  J8s; K9s.

Pairs 22-99 call 96 to 100 percent of their weight in all four rows, at mean call EVs 1.0 to 2.3
bb above folding. Calling is 61 to 72 percent of the 3-bet range in every row.

Published 3-bettor responses to a 4-bet at 100 bb:

| Figure | Spot | Rake | Solver | Source |
|---|---|---|---|---|
| Fold 46.6 to 46.9, call 29.3 to 29.6, jam 23.8 to 23.9 percent of BB's 3-bet range (totals under A5s and A9s card removal) | 6-max cash, 100 bb, BTN opens 2.5, BB 3-bets 12, BTN 4-bets 24 | 5 percent, cap 4 bb | not named ("owned preflop library"; the article says it is a fixed exported policy) | GTO Gecko, "A5s Four-Bets: When Calling Is Worth More", 2026-09-21, https://gtogecko.com/blog/wheel-ace-fourbet-study, read 2026-11-05 |
| 3-bet ranges that never flat a 4-bet jam "around 40 to 46 percent" | general, 100 bb cash | not stated | none (book theory) | Matthew Janda, *Applications of No-Limit Hold'em*, quoted second-hand in an Advanced Poker Training forum post, https://www.advancedpokertraining.com/poker/forum/discussion/comment/308, read 2026-11-05; the book was not opened |

A second source with a named solver is absent. GTO Wizard's "OOP 4-Betting in Deep-Stacked Cash
Games" (Andrew Brokos, 2025-01-27) covers the 4-bettor only. Poker Academy's 3-bet article covers
the opener facing a 3-bet only. On the one comparable row (BB vs BTN), the key calls 71.1 against
about 29 and folds 15.1 against about 47. The sizes differ: 10 and 22 in the key, 12 and 24 in
the source.

#### 5. Partition and weighting, for the tuning harness

Hand order is the `hands` array of `solver/data/key.json`, which matches `equity.json`. Rank
index: A=0, K=1, ..., 2=12. For a non-pair hand, `a` is the higher rank, `b` the lower rank, and
gap = index(b) - index(a) - 1. The classes are tested in this order, and the first match wins:

| Class | Rule | Hands (169-grid classes, combos) |
|---|---|---|
| pairs 22-55 | pair, rank 5 or lower | 4, 24 |
| pairs 66-99 | pair, 6 to 9 | 4, 24 |
| pairs TT-AA | pair, T or higher | 5, 30 |
| suited aces A2s-A5s | A, suited, b in 5432 | 4, 16 |
| suited aces A6s-A9s | A, suited, b in 9876 | 4, 16 |
| suited aces ATs-AKs | A, suited, b T or higher | 4, 16 |
| offsuit aces A2o-A9o | A, offsuit, b 9 or lower | 8, 96 |
| offsuit aces ATo-AKo | A, offsuit, b T or higher | 4, 48 |
| suited broadways | both in KQJT, suited | KQs KJs KTs QJs QTs JTs: 6, 24 |
| offsuit broadways | both in KQJT, offsuit | KQo KJo KTo QJo QTo JTo: 6, 72 |
| suited connectors gap 0 | suited, gap 0, a in T..3 | T9s 98s 87s 76s 65s 54s 43s 32s: 8, 32 |
| suited one-gappers | suited, gap 1, a in J..4 | J9s T8s 97s 86s 75s 64s 53s 42s: 8, 32 |
| suited two-gappers | suited, gap 2, a in Q..5 | Q9s J8s T7s 96s 85s 74s 63s 52s: 8, 32 |
| other suited K and Q | suited, a in KQ | K9s-K2s, Q8s-Q2s: 15, 60 |
| other suited | suited, the rest | 21, 84 |
| other offsuit | offsuit, the rest | 60, 720 |

The totals are 169 classes and 1,326 combos. The script asserts both.

Weighting, copied from `measure` (`solver/cfr.py` lines 422-436). Let `p = W.sum(axis=1) /
W.sum()`, which is combos/1326 per hand (6, 4 or 12 over 1326).

- Open rows: weight `p`. Value = 100 x sum(p x strategy[:, open]).
- Defend rows: weight `p` at the defender's first node, with no reach and no opener weighting.
  Value = 100 x sum(p x strategy[:, cols]).
- vs3 rows: weight `opens = p x strategy_at_opener_open_node[:, 1]`. Value = 100 x sum(opens x
  strategy_vs3[:, col]) / sum(opens).
- Part C: weight `p x strategy_at_defend_node[:, 2]`, normalized by its own sum.
- Class share = class weight / total weight. Class action rate = sum(w x strategy[:, j]) / class
  weight. Class mean EV of action j = sum(w x ev[:, j]) / class weight, over every hand in the
  class whatever its action. `ev` is the key's per-action EV in bb at the node.
- Movers: for each hand with mass in a wrong-side action, gap = ev[current] - max(ev[target
  actions]). Points = 100 x w x strategy[current] / base, with base = 1 for open and defend rows
  and sum(opens) for vs3 rows. Hands are sorted by gap, ascending, and accumulated until the
  needed points are reached.

### 13.2 What RF-3 is, and what it is not

It is: a change to how a leaf with chips behind is valued (3.2), so that two hands of equal
equity against a range take different shares of the pot by their features; the re-tune of the
nine dials of 3.2 together with the new coefficients; a new hash; a re-solve and a re-export.

It is not: a postflop model (RF-4, `PLAN.md` section 4); a second size or a limp (M2, M3); a
change to any band of 8.2 (8.1: a miss is a finding, never a number tuned away); a change to the
equity table (`solver/equity.py`); a change to the key schema (`felto-gto-key/1` stays, 7.1); a
change to the hand engine, the grader or the screens (lane I) beyond the hash constant in
`app/src/gto/key.ts`, the exported key in `app/src/gto/data/` and the pinned list `PINNED_UNDER`
in `app/src/gto/key.test.ts`; a copy of any published range (BD-T1).

### 13.3 Options

Each option carries the argument for it, the strongest argument against it and a marked
recommendation. The roman numerals match step 2 of the item's prompt.

**(i) The shape of the adjustment.** Write z(h) for a hand class's playability score, a sum of
feature terms (option ii), and s for the bent player's share of 3.2.

- (i-a) Additive on the bent player's share: s' = s + z(h_bent), clipped to 0 to 1; the edge
  holder takes 1 − s'. For: the simplest reading, one term per leaf. Against: the edge holder's
  own hand plays no part, so a 3-bettor with `A7o` keeps the whole bonus the formula takes from a
  caller's `A9o`. The record shows this is the failure itself (step 51: aggression pays at every
  seat), and spot 3 of 13.1 needs the 3-bettor's weak offsuit aces to lose, not gain. The clip
  also breaks the monotone shape at the ends.
- (i-b) Multiplicative on the bent player's share: s' = s × (1 + z(h_bent)), clipped. For: a hand
  with no equity keeps none. Against: the same one-sided fault as (i-a), and a hand near full
  equity can be pushed past 1.
- (i-c) A factor on each player's share, renormalized (recommended): with R = exp(z(h_bent) −
  z(h_edge)), s' = s × R / (s × R + (1 − s)), and the edge holder takes 1 − s'. Read in log-odds:
  the odds of the bent player's share are multiplied by R, so logit(s') = logit(s) + z(h_bent) −
  z(h_edge). For: both hands' features count; the pot is conserved at every matchup, so the
  two-player games stay zero-sum and CFR+ stays in the regime where the best response of phases
  3a and 3b is the proof; a share of 0 or 1 stays where it is; two hands of the same class are
  unchanged against each other; and every coefficient at 0 gives R = 1 and the model of 3.2 to
  one floating-point ulp, so the leaf cases of `solver/cfr_test.py` hold at a zero adjustment
  within their tolerance. The effect grows
  with the pot: a shift that moves 1 bb in a single raised pot moves about 3 bb in a 3-bet pot,
  which is where the misses are. Against: it is the "bonus to the other player" the item names,
  in a bounded form: whatever a hand loses against a better-playing class, that class gains, even
  when both hands are weak in absolute terms. And real realization is nearer to equity in a
  3-bet pot (less stack left to play) than in a single raised pot, so a shift of fixed size in
  log-odds is, if anything, too large in the big pots; option (ii-b) carries the hedge. Worked
  example, from the hand-worked case of `solver/cfr_test.py`: `SB` calls a `BB` 3-bet to 9 at 40
  percent equity, `c_3bp` 0.4, `k` 2, so s = 0.3424 and `SB` keeps 6.163 of 18. With z(h_bent) −
  z(h_edge) = −0.3, R = 0.7408, s' = 0.2784 and `SB` keeps 5.010: a cut of 1.153 bb, the size
  spot 5 of 13.1 needs on an offsuit ace (0.7 to 1.0 bb), from a shift under a third of a
  log-odds unit.
- (i-d) Independent factors with no renormalization: each player's share is its own bent share
  times its own factor, and the pot is not conserved. For: it is the literal reading of
  "realization" per hand. Against: the two-player games become general-sum; CFR+ has no
  convergence guarantee there and can cycle, so a stable key would rest on luck; and the leaked
  or created chips have no meaning in the game of section 2. The item names this cost, and the
  recommendation avoids it.

**(ii) The features, and how the coefficients are shared.** The features are the ones section 4,
item 3, names, each a fixed function of the 169 classes with one coefficient `a` in log-odds
units:

| Feature | x(h) | Fixed shape (a build-level call, each with its reversal) |
|---|---|---|
| pair | 1 for a pair, else 0 | |
| suited | 1 for a suited non-pair, else 0 | |
| connected | 1, 0.5, 0.25 for a non-pair with a gap of 0, 1, 2 between the ranks; 0 otherwise and for pairs | the ace counts high only, so `A2s` is not connected (reversal: wheel aces count from the low side); the weights halve by gap (reversal: three coefficients) |
| ace-high | 1 for a non-pair whose higher card is an ace, else 0 | |
| high card | (r − 10) / 4, where r is the higher card's rank, 2 to 14; a pair uses its rank | centered at the ten, so `AKo` is +1 and `22` is −2 (reversal: the lower card's rank, or the mean of the two) |

z(h) = a_pair × pair + a_suited × suited + a_connected × connected + a_ace_high × ace-high +
a_high_card × high card. Under this shape `A5s` scores a_suited + a_ace_high + a_high_card, `A5o`
scores a_ace_high + a_high_card, `76s` scores a_suited + a_connected − 0.75 a_high_card, `KJo`
scores 0.5 a_connected + 0.75 a_high_card, and `22` scores a_pair − 2 a_high_card.

- (ii-a) One coefficient per feature across pot types, five dials (recommended). For: five
  hand-set numbers, the fewest that name every feature of item 3; the pot-size leverage of (i-c)
  already makes the same shift three times larger in bb in a 3-bet pot than in a single raised
  pot, which is the direction the misses need (a small pair's set value is worth a little in a
  5.5 pot and costs a lot as a call of a 3-bet, spots 4 to 6 and Part C of 13.1); a descent over
  five new dials and nine old ones is inside the budget of 13.4. Against: one sign per feature
  for every pot. If the fit needs the pair term positive in a single raised pot (the button opens
  every pair) and negative in a 3-bet pot, five dials cannot give it, and the leverage argument
  is a first-order reading, not a sourced one.
- (ii-b) (ii-a) plus a scale per pot type: z is multiplied by m_srp (fixed at 1), m_3bp and m_4bp
  (two dials, range 0.5 to 1.5, start 1). For: it meets the counter-argument of (i-c) with two
  numbers. Against: two more hand-set numbers that a fit can use to hide a wrong feature shape.
  Named as the fallback: if the harness cannot land the bands under (ii-a), the two scales are
  added by a dated amendment inside this item, before the freeze.
- (ii-c) One coefficient per feature per pot type, fifteen dials. For: the most freedom. Against:
  fifteen hand-set numbers against seven missed rows is a fit that can land anything and means
  nothing; the grid of step 50 (408 settings over nine dials) was already at the limit of what a
  session can screen; it is the hand-built chart problem of `DESIGN.md` section 1 in full.

**(iii) How the coefficients are set.**

- (iii-a) From the published figures of 13.1. Against: 13.1 found no range-level figure by
  feature from a named solver with a stated rake, for any of the five features, and none at all
  in 3-bet pots. There is nothing to set them from. Not available.
- (iii-b) Fit to the bands of 8.2, free signs. For: the bands are the one sourced acceptance this
  spec has. Against: a free fit over fourteen dials can land a band with a feature pointing the
  wrong way (a negative suited term that lands the button's open rate through `K6o`, the cheapest
  mover of spot 1), and then the hand-level patterns of item 3 come out wrong while the table
  reads green.
- (iii-c) A bounded fit (recommended): the signs section 4, item 3, states are constraints
  (a_suited ≥ 0, a_connected ≥ 0, a_ace_high ≤ 0, because a weak ace-high hand is dominated when
  it hits and worthless when it does not; a_pair and a_high_card free), every coefficient inside
  −0.6 to 0.6 (odds of at most 1.8 to one: a share of 0.50 moves to at most 0.64 or 0.36), and the
  record says the values are a fit to the bands, not a measurement. For: it keeps the fit honest
  in the one way the record can check, the hand-level patterns of (v); the sizes 13.1 measured
  (0.1 to 1.0 bb per hand at the 3-bet pots, 0.5 bb at the button's suited connectors) are
  reached inside those bounds, as the worked example of (i-c) shows. Against: the bounds and the
  signs are themselves hand-set, and a sign that is wrong as poker forces the fit onto the other
  features. Section 4, item 3, is the source of each sign, and 13.1 Part A agrees on the direction
  for suited and connected.

**(iv) Which pot types.**

- (iv-a) 3-bet pots only, where six of the seven misses are. For: the smallest change; the
  single raised pot bands all hold today and stay untouched. Against: spot 1 (the button opens
  34.3) is a single raised pot failure, because the suited connectors' open EV is set at the flat
  leaf; spot 3 moves only if the big blind's offsuit aces also lose as callers of the small
  blind's open, or the call becomes the new home of every hand the 3-bet loses. The adjustment
  would also say that a suited connector plays well after a 3-bet and no better after a call,
  which is false as poker.
- (iv-b) Every leaf with chips behind, `srp`, `3bp` and `4bp` (recommended); the all-in leaf
  stays exact (3.1). For: one rule everywhere a board is played; the mechanism of spot 1; the
  4-bet pot carries the pair pattern of Part C. Against: the twelve single raised pot rows that
  hold today can move. The done-when of (v) says none may be newly missed, and the re-tune of the
  nine old dials is there to hold them.

**(v) What done means.**

- The seven rows of 8.5 inside their bands: the six of the provisional freeze and the seventh,
  `UTG` folds to a `BB` 3-bet (item 38's finding, which "belongs with them to board item 60
  unless Zach says otherwise"). Recommended: all seven; the seventh is the same mechanism (13.1,
  spot 7, a near tie that costs about 0 bb).
- No row of 8.2 newly missed; the button opening every pair at 100 percent (phase 3a's
  done-when); the big blind's realization against the button inside 65 to 90.
- Hand-level patterns, from section 4, item 3, and section 10 (second review), as ordinal checks
  between class rates at named nodes, so that no published number is copied (BD-T1); the classes
  are those of 13.1 Part 5:
  P1, bluff selection: at the big blind's defend node against the button and against the small
  blind, the class 3-bet rate of `A2s`-`A5s` is above that of `A2o`-`A9o`.
  P2, calls out of position: at `CO` facing a `BTN` 3-bet and at `SB` facing a `BB` 3-bet, the
  class call rate of suited broadways is above that of offsuit broadways, and that of `A2s`-`A9s`
  above that of `A2o`-`A9o`.
  P3, suited connectors as opens: at the button's open node, the class open rate of suited
  connectors gap 0 is at or above that of `A2o`-`A9o`.
  P4, set value: at `CO` facing a `BTN` 3-bet and at each of the four nodes where a defender
  faces a 4-bet (Part C), the class call rate of `22`-`55` is below that of `66`-`99`.
  Today P1 holds at one node of two, P2 at one node of two, P3 fails, and P4 fails at every node
  (13.1).
- Precedence when they conflict (R9), recommended: the bands first; the patterns as the tiebreak
  among settings that land the same rows; a pattern still failing at the pick is recorded in 8.5
  as a finding, not tuned by a band change. A row the fit still misses is recorded as 8.1 says: a
  finding, frozen provisional again with the reason, never a widened band.
- The 4-bet rows (section 10, second review, item 3): no band of 8.2 covers the defender facing a
  4-bet, and `c_4bp` and `c_4bp_oop` were tuned on nothing. 13.1 Part C found one published
  figure with no solver named (GTO Gecko, 2026-09-21: the big blind folds about 47, calls about 29
  and jams about 24 percent of its 3-bet range to a button 4-bet, at sizes 12 and 24 where this
  game has 10 and 22) and one book figure quoted second-hand (Janda: 3-bet ranges fold 40 to 46
  percent to a 4-bet). Under 8.1 one source with no solver named cannot make a band. Options:
  (a) a band anyway, call 20 to 45 percent of the 3-bet range at each of the four rows; (b) a
  stated expectation (recommended): the harness prints the defender's fold, call and 5-bet rates
  at the four rows of Part C beside "fold 35 to 60, call 20 to 45", marked as an expectation from
  one source, uses them as a tiebreak after the bands and the patterns, and 8.5 records them
  without a verdict; (c) nothing. For (b): `c_4bp` and `c_4bp_oop` get an anchor without a band
  the sources cannot carry. Against (b): a number that is printed and never fails is read as a
  band by the next reader; the label must say otherwise every time.

**(vi) `schema_game`.** 2 (recommended): the object's meaning changes (a new `class_adjustment`
field under `leaf_model`, and the `formula` string changes). The key schema stays
`felto-gto-key/1`, because the app reads only `spec_hash` and the fields of 7.1, none of which
change. Against: a reader that compared `schema_game` would refuse the new key, and none does;
the number is a record for people.

### 13.4 Dials

Every number below goes to `solver/config.py` (`GAME["leaf_model"]["class_adjustment"]`,
`RANGES`, `DIAL_PATH`), never to a constant in `cfr.py` or `best_response.py`, which each carry
their own copy of the arithmetic (step 4 of the item).

| Dial | Start | Range | Note |
|---|---|---|---|
| `a_pair` | 0 | −0.6 to 0.6 | free sign |
| `a_suited` | 0 | 0 to 0.6 | sign from section 4, item 3 |
| `a_connected` | 0 | 0 to 0.6 | sign from section 4, item 3 |
| `a_ace_high` | 0 | −0.6 to 0 | sign from section 4, item 3 |
| `a_high_card` | 0 | −0.6 to 0.6 | free sign |
| `m_3bp`, `m_4bp` | 1 | 0.5 to 1.5 | only under (ii-b), the fallback |
| the nine dials of 3.2 | the provisional values of 12 | the ranges of 3.2 | re-tuned together with the new ones |

At every start value the model is the one of 3.2, so until the freeze the hash changes only
through `schema_game` and the new fields. The tuning harness (`solver/tune.py`, step 5 of the
item) screens a setting at 500 iterations over the five subtrees; from the per-iteration costs of
step 50 (1.2, 2.5 and 4.0 ms on the `SB`, `BTN` and `CO` subtrees) and the larger `HJ` and `UTG`
subtrees, one screening is about 10 s, so a coordinate descent of three sweeps over fourteen
dials at three to five values each is about 200 screenings, under an hour, and the pick is
re-solved at 12,000 iterations (105 s). The pick is the setting with the most rows inside, then
the smallest total miss, then the patterns, then the 4-bet expectation; `k` 1 and 2 are both
reported, as 3.2 asks.

**Amended 2026-11-05, after the two runs of `solver/tune.py` (board item 60, step 5).** One
screening took about 5 s, not 10. The harness searches in two phases: 120 settings drawn from a
numpy stream seeded with the constant 1, inside the ranges, then a coordinate descent from the
best of those and the start (five values per dial, at most three sweeps, one half-step sweep).
The two runs differ in the order the descent compares two settings. Run 1 compared by the pick
rule above (rows inside first, then total miss): from the 2026-10-06 freeze it reached 22 of 26
rows inside with a total miss of 38.1 points at `k` 2 and stalled, because a step that closes a
far miss while it nudges a near row out counts as worse under that order. Run 2 compared by total
miss first and started from run 1's pick: at `k` 2 it traded one row (`BB` against `UTG` defends,
28 to 60, at 26.3) for seven points of miss, 21 rows inside at 31.1; at `k` 1 it reached 21 rows
inside at 13.9 points, with `a_pair`, `c_3bp` and `c_4bp` at their ceilings and `t_ip` at 0.
The committed harness keeps run 2's order, and its docstring says so; the pick rule of this
section is applied by the reader on the printed reports, and the pick of 2026-11-05 is run 1's
setting at `k` 2 (8.5, the dated paragraph). The `k` 1 setting of run 2 is a finding there: it
brings `CO` folds to a `BTN` 3-bet to 51.0 (52 to 72) and `SB` folds to a `BB` 3-bet to 53.5 (55
to 80), within 1.5 points, but it misses `CO` 4-bets a `BTN` 3-bet at 30.0 (15 to 28) and `BB`
against `CO` defends at 41.2 (42 to 68), two rows the pick lands, so at 12,000 iterations it has
19 rows inside against the pick's 21 and is worse under the pick rule. A screening at 500
iterations is about two points off on a defend rate: `BB` against `UTG` defends screened at 28.2
for the pick and solved at 26.6, and `BB` against `CO` defends screened at 42.4 for the `k` 1
setting and solved at 41.2, so a row within two points of a band edge in a screening report is
not yet landed, and a pick is made on the 12,000-iteration solves. Whether the ceilings move is
Zach's, under 8.1.

### 13.5 Hazards

1. The fit lands a 3-bet pot row by breaking a single raised pot row. The no-new-miss rule of (v)
   is the guard, and the nine old dials move with the new ones so the harness has room.
2. A negative pair term folds `22` from the button. The pairs-at-100-percent check of phase 3a
   stays in the pick.
3. Five more hand-set numbers. They are recorded as a fit (iii-c), their signs come from section
   4, item 3, and the app's statement of section 6 already says "a simplified model of play
   after the flop"; the words do not change here, and item 45 writes the copy.
4. The fixed feature shapes (gap weights 1, 0.5, 0.25; the ace high only; the high card centered
   at the ten) are build-level calls. Each has its reversal in (ii); none is a decision of Zach's
   unless he takes one in 13.6.
5. A new hash and a new key: `SPEC_HASH` in `solver/cfr_test.py` and `app/src/gto/key.ts` are
   re-pinned, `PINNED_UNDER` in `app/src/gto/key.test.ts` is re-read hand by hand, the bots of
   item 40 play the new file, and a stored worst hand of item 44 that no longer replays shows its
   counts without the hand (BD-T38).
6. The cold review of step 7 judges the amended 3.2 and the hands at the seven spots. It can find
   the composition still wrong while the bands hold, which is the condition under which RF-3 was
   named (11 (a)); the answer then is a finding in section 10, not a second round of tuning
   inside this item.
7. The best-response gain is the proof of convergence, not the band table (phase 3a, watch for).
   Under (i-c) the pairs stay zero-sum; under (i-d) they would not, and the proof would be lost.

### 13.6 Open questions: the GATE 1 batch

Asked in one batch in chat on 2026-11-05 (R6). Every answer may be no. The answers are recorded
as the fourth batch of section 11 with their date, and steps 3 to 7 of board item 60 follow from
them.

- Q1. Build RF-3, or keep the provisional freeze as final? Recommended: build it, in the shape of
  Q2 to Q8. The alternative, "keep the provisional freeze as final", is the first reversal of
  BD-T20: it strikes "provisional" from 3.2, 7.5, 8.5, 12 and `solver/config.py`, leaves the
  seven misses as recorded findings, and closes item 60 as `SETTLED AS NO`. For building: the
  seven misses are one mechanism, the three patterns the second review calls absurd within a few
  hands are that mechanism at hand level, 13.1 measured the sizes (0.1 to 1.0 bb per hand), and
  the worked example of (i-c) reaches them inside the bounds. For keeping: the fit is five
  hand-set numbers, it may still miss spot 4 (33.7 points of the cutoff's opening range at gaps
  to 0.75 bb), and the app's bots and grader run today on the provisional key.
- Q2. The shape: (i-c), the renormalized two-sided factor in log-odds form (recommended); or
  (i-a), (i-b) or (i-d).
- Q3. The features and their sharing: the five features of (ii) with one coefficient each across
  pot types (ii-a, recommended), with the two pot-type scales of (ii-b) as the named fallback,
  added only if the harness cannot land the rows; or (ii-c).
- Q4. Setting: a bounded fit to the bands, recorded as a fit (iii-c, recommended); or a free fit
  (iii-b). (iii-a) is not available.
- Q5. Pot types: every leaf with chips behind (iv-b, recommended); or 3-bet pots only (iv-a).
- Q6. Done: the seven rows including `UTG` folds to a `BB` 3-bet, no new miss, the button's
  pairs, the realization band, and the four patterns P1 to P4 as a tiebreak and as recorded
  findings, with the bands first when they conflict (recommended); or the six rows alone; or the
  patterns as a gate.
- Q7. The 4-bet rows: a stated expectation printed by the harness and recorded without a verdict
  ((v) (b), recommended); or a band from the one source ((a)); or nothing ((c)).
- Q8. `schema_game` 2 (recommended), or 1 kept.
