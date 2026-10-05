import { describe, expect, it } from "vitest";

import { parseCards } from "./card";
import { categoryName, describeHand } from "./describe";
import { CATEGORIES, evaluate } from "./evaluate";

const say = (codes: string) => describeHand(evaluate(parseCards(codes.split(" "))));

describe("hand descriptions", () => {
  it.each([
    ["Th Jh Qh Kh Ah", "royal flush"],
    ["5h 6h 7h 8h 9h", "straight flush, nine high"],
    ["Ah 2h 3h 4h 5h", "straight flush, five high"],
    ["Qs Qd Qc Qh 2s", "four of a kind, queens"],
    ["Ks Kd Kc 5h 5s", "full house, kings full of fives"],
    ["Ah Jh 9h 6h 3h", "flush, ace high"],
    ["6s 7d 8c 9h Ts", "straight, ten high"],
    ["As 2d 3c 4h 5s", "straight, five high"],
    ["7s 7d 7c Ah 2s", "three of a kind, sevens"],
    ["Ks Kd 5c 5h 2s", "two pair, kings and fives"],
    ["6s 6d Ac 9h 2s", "one pair, sixes"],
    ["As Jd 9c 6h 3s", "high card, ace"],
  ])("describes %s as %j", (codes, words) => {
    expect(say(codes)).toBe(words);
  });

  it("names the hand the seven cards make, not the cards", () => {
    expect(say("Ks Kd 5c 5h 2s 2d Qc")).toBe("two pair, kings and fives");
  });

  it("gives every category a different name", () => {
    expect(new Set(CATEGORIES.map(categoryName)).size).toBe(10);
  });
});
