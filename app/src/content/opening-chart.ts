import type { OpeningChart } from "./schema";

// The opening chart of unit 3 (`DESIGN.md` D7, `PLAN.md` phase 7): the hands each seat raises
// with when every seat before it has folded ("raise first in"). Every hand not listed for a seat
// is a fold there; the chart never limps (just calls the big blind), and it says nothing about
// what to do after someone else has raised.
//
// Assumptions, each a reason a hand is in or out:
// - No-limit hold'em cash game, a 6-max table, every stack 100 big blinds (`D7`, the dials
//   `tableSeats` and `stackBigBlinds`).
// - Blinds only: no ante and no straddle, so the pot before the first raise is 1.5 big blinds.
// - Raise first in only. The small blind raises or folds; it never completes.
// - Opponents are unknown and play reasonably. Rake is not modelled.
//
// Where it comes from. It is written from the principles of preflop opening, not copied from a
// training site or a solver output (`PLAN.md` phase 7, watch-for): fewer players behind and
// acting last after the flop let a seat open more hands; pairs, suited hands and connected
// ranks play well after the flop; high offsuit cards with weak kickers do not. It is a
// simplified chart for learning, on the careful side: each seat opens fewer hands than the
// solver-based raise-first-in ranges commonly published for 6-max at 100 big blinds, which open
// roughly UTG 15%, HJ 20%, CO 27%, BTN 45% and SB 40% when the small blind may not limp. Those
// shares are approximate and from memory; no source was checked. What those ranges add: small
// pairs, weaker suited aces, 87s and 76s from the first two seats; weaker suited kings and
// suited gappers from the cutoff; every offsuit ace, low suited kings and queens, and more
// offsuit broadway hands and gappers from the button; much more from the small blind. No hand
// on this chart is one those ranges fold. Lesson `preflop-2` tells the player that this is a
// simple chart.
//
// Share of the 1,326 two-card starting hands each seat opens, counted by `comboCount` and pinned
// by `opening-chart.test.ts`: UTG 152 (11.5%), HJ 206 (15.5%), CO 326 (24.6%), BTN 454 (34.2%),
// SB 382 (28.8%). The small blind opens fewer hands than the button because it must play every
// later round before the big blind, which acts after it.
//
// Every list holds pairs, then suited hands, then offsuit hands, each from high to low, so a
// reader can check it against the line above it. Each seat from UTG to BTN opens every hand of
// the seat before it, and the small blind opens every hand the cutoff does and nothing the
// button folds (`opening-chart.test.ts`).
export const OPENING_CHART = {
  // Pairs 55 and up; suited AT and up, KT and up, QT and up, JT, T9; offsuit AJ and up, KQ.
  UTG: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55",
    "AKs", "AQs", "AJs", "ATs", "KQs", "KJs", "KTs", "QJs", "QTs", "JTs", "T9s",
    "AKo", "AQo", "AJo", "KQo",
  ],
  // UTG, plus 44; suited A9, A5, K9, Q9, J9, 98; offsuit AT, KJ.
  HJ: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A5s", "KQs", "KJs", "KTs", "K9s", "QJs", "QTs", "Q9s",
    "JTs", "J9s", "T9s", "98s",
    "AKo", "AQo", "AJo", "ATo", "KQo", "KJo",
  ],
  // Every pair; every suited ace; suited K8 and up, Q9 and up, J9 and up, T8 and up, 97 and up,
  // 87, 76, 65; offsuit A9 and up, KT and up, QT and up, JT.
  CO: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "QJs", "QTs", "Q9s", "JTs", "J9s", "T9s", "T8s",
    "98s", "97s", "87s", "76s", "65s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "KQo", "KJo", "KTo", "QJo", "QTo", "JTo",
  ],
  // Every pair; every suited ace; suited K5 and up, Q6 and up, J7 and up, T7 and up, 96 and up,
  // 86 and up, 75 and up, 64 and up, 54; offsuit A7 and up, K9 and up, Q9 and up, J9 and up, T9.
  BTN: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s",
    "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s", "JTs", "J9s", "J8s", "J7s",
    "T9s", "T8s", "T7s", "98s", "97s", "96s", "87s", "86s", "76s", "75s", "65s", "64s", "54s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "A7o", "KQo", "KJo", "KTo", "K9o",
    "QJo", "QTo", "Q9o", "JTo", "J9o", "T9o",
  ],
  // Every pair; every suited ace; suited K5 and up, Q7 and up, J7 and up, T7 and up, 97 and up,
  // 86 and up, 75 and up, 65, 54; offsuit A8 and up, KT and up, QT and up, JT.
  SB: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s",
    "QJs", "QTs", "Q9s", "Q8s", "Q7s", "JTs", "J9s", "J8s", "J7s",
    "T9s", "T8s", "T7s", "98s", "97s", "87s", "86s", "76s", "75s", "65s", "54s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "KQo", "KJo", "KTo", "QJo", "QTo", "JTo",
  ],
} as const satisfies OpeningChart;
