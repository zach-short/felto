import { describe, expect, it } from "vitest";

import { cardCode, hasDuplicate, parseCard, parseCards } from "./card";
import { fullDeck, unseenCards } from "./deck";

describe("card notation", () => {
  it("reads As as the ace of spades and Td as the ten of diamonds", () => {
    expect(parseCard("As")).toEqual({ rank: 14, suit: "s" });
    expect(parseCard("Td")).toEqual({ rank: 10, suit: "d" });
    expect(parseCard("2c")).toEqual({ rank: 2, suit: "c" });
  });

  it("writes every card back to the code it was read from", () => {
    for (const card of fullDeck()) expect(parseCard(cardCode(card))).toEqual(card);
  });

  it.each(["", "A", "1s", "10s", "as", "AS", "Ax", "Ass"])("refuses %j", (code) => {
    expect(() => parseCard(code)).toThrow();
  });

  it("finds a card dealt twice", () => {
    expect(hasDuplicate(parseCards(["As", "Kd", "As"]))).toBe(true);
    expect(hasDuplicate(parseCards(["As", "Ad"]))).toBe(false);
  });
});

describe("the deck", () => {
  it("holds 52 different cards, 13 of each suit and 4 of each rank", () => {
    const deck = fullDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map(cardCode)).size).toBe(52);
    expect(deck.filter((c) => c.suit === "h")).toHaveLength(13);
    expect(deck.filter((c) => c.rank === 14)).toHaveLength(4);
  });

  it("leaves 47 unseen cards after two hole cards and a flop", () => {
    const known = parseCards(["As", "Kd", "7h", "7c", "2s"]);
    const unseen = unseenCards(known);
    expect(unseen).toHaveLength(47);
    expect(unseen.some((c) => c.rank === 14 && c.suit === "s")).toBe(false);
  });
});
