import type { Story } from "./schema";

// A placeholder, written by board item 23 only so the story route can be run and seen: the
// fewest slides the dial allows, one of them with a keyed card row. Board item 24 replaces this
// file with the real hands story, whose copy goes to Zach first (docs/incomplete/unit-stories/
// PLAN.md phase 3, R7).
export const storyHands = {
  unit: "hands",
  slides: [
    {
      pose: "happy",
      title: "Meet the deck",
      body: "A deck has 52 cards. Every card has a rank and a suit, and the ace sits on top. That is all you need for now!",
    },
    {
      pose: "think",
      title: "Your two cards",
      body: "You get two cards of your own, face down. They are your hole cards, and nobody else sees them.",
      cards: ["As", "Kd"],
    },
    {
      pose: "happy",
      title: "The board",
      body: "Five more cards land face up in the middle. Everyone shares them. Together they are the board.",
    },
    {
      pose: "think",
      title: "Best five of seven",
      body: "Your hand is the best five cards you can make from your two and the five on the board.",
    },
    {
      pose: "cheer",
      title: "A flush",
      body: "Five cards of one suit make a flush. It beats a straight, and it loses to a full house.",
      cards: ["Ah", "Jh", "8h", "5h", "2h"],
      key: "flush",
    },
    {
      pose: "smug",
      title: "Off you go",
      body: "That is the whole idea. The lessons show you each hand, one at a time.",
    },
  ],
} satisfies Story;
