import type { Story } from "./schema";

// The hands story (docs/incomplete/unit-stories/PLAN.md phase 3, board item 24), in the order unit
// 1 teaches its terms: the deck and ranks, hole cards and the board, best five of seven
// (`hands-1`), the ten hands from high card up (`hands-2`), kickers, then the pot (`hands-4`).
// Zach chose the warm register on 2026-10-05 (R7, D10). The last slide promises no lesson,
// because its only button goes back to the path (US-6).
export const storyHands = {
  unit: "hands",
  slides: [
    {
      pose: "happy",
      title: "Meet the deck",
      body: "Here is the whole deck: 52 cards in four suits, like these four aces. Ranks run from the 2 up to the ace on top. No suit beats another!",
      cards: ["As", "Ah", "Ad", "Ac"],
    },
    {
      pose: "smug",
      title: "Your two cards",
      body: "In Texas hold'em you get two cards face down, your hole cards. Only you see them. Then five shared cards land face up in the middle: the board.",
      cards: ["Ks", "Qh"],
    },
    {
      pose: "think",
      title: "Best five of seven",
      body: "Your two plus the board make seven cards, but a hand is always five: the best five. You can use both of yours, just one, or none at all.",
    },
    {
      pose: "happy",
      title: "The ten hands",
      body: "Ten hands, from the bottom: high card, with no match. Then a pair, two of one rank. Then two pair, and three of a kind, like these eights.",
      cards: ["8s", "8h", "8d", "Kc", "3s"],
      key: "three-of-a-kind",
    },
    {
      pose: "think",
      title: "Straights and flushes",
      body: "A straight is five ranks in a row, and the suits can mix, like these. A flush is five cards of one suit in any order. It beats the straight!",
      cards: ["5d", "6c", "7h", "8s", "9d"],
      key: "straight",
    },
    {
      pose: "cheer",
      title: "The big hands",
      body: "A full house is three of a kind plus a pair. Then four of a kind, and the straight flush: a straight in one suit. On top: this royal flush!",
      cards: ["As", "Ks", "Qs", "Js", "Ts"],
      key: "royal-flush",
    },
    {
      pose: "smug",
      title: "Kickers break ties",
      body: "This pair of aces plays with three side cards: the king, 9 and 4. Those are kickers. When two players hold the same pair, the higher kicker wins.",
      cards: ["Ah", "Ac", "Kd", "9s", "4h"],
      key: "one-pair",
    },
    {
      pose: "cheer",
      title: "Who wins the pot?",
      body: "At the end, the best five-card hand wins the pot, all the chips bet in the hand. Equal hands split it. That is the whole idea. Have fun!",
    },
  ],
} satisfies Story;
