import { describe, expect, it } from "vitest";

import { parseCard, type Card } from "./card";
import { fullDeck } from "./deck";
import { allHandClasses, comboCount, handClass } from "./hand-class";

const hole = (a: string, b: string): [Card, Card] => [parseCard(a), parseCard(b)];

describe("the 169 hand classes", () => {
  it("names a pair, a suited hand and an offsuit hand, the higher rank first", () => {
    expect(handClass(hole("7s", "7d"))).toBe("77");
    expect(handClass(hole("Ks", "As"))).toBe("AKs");
    expect(handClass(hole("9c", "Td"))).toBe("T9o");
  });

  it("has 169 classes: 13 pairs, 78 suited and 78 offsuit", () => {
    const classes = allHandClasses();
    expect(new Set(classes).size).toBe(169);
    expect(classes.filter((c) => c.length === 2)).toHaveLength(13);
    expect(classes.filter((c) => c.endsWith("s"))).toHaveLength(78);
    expect(classes.filter((c) => c.endsWith("o"))).toHaveLength(78);
  });

  it("puts every one of the 1,326 starting hands in a listed class, as often as the class says", () => {
    const deck = fullDeck();
    const seen = new Map<string, number>();
    for (let i = 0; i < 52; i += 1)
      for (let j = i + 1; j < 52; j += 1) {
        const name = handClass([deck[i], deck[j]]);
        seen.set(name, (seen.get(name) ?? 0) + 1);
      }
    expect([...seen.values()].reduce((sum, n) => sum + n, 0)).toBe(1326);
    for (const name of allHandClasses()) expect(seen.get(name)).toBe(comboCount(name));
  });

  it("refuses one card held twice", () => {
    expect(() => handClass(hole("As", "As"))).toThrow();
  });
});
