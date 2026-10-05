import { describe, expect, it } from "vitest";

import { parseCards } from "./card";
import { showdownWinners } from "./showdown";

const cards = (codes: string) => parseCards(codes.split(" "));
const winners = (board: string, ...holes: string[]) => showdownWinners(cards(board), holes.map(cards));

describe("showdown", () => {
  it("gives the pot to the better hand", () => {
    expect(winners("Ks 9d 4c 2h 7s", "Ah Kd", "Qh Qc")).toEqual([0]);
  });

  it("splits when the board plays for both players", () => {
    expect(winners("Ts Jd Qc Kh As", "2h 3d", "4c 5s")).toEqual([0, 1]);
  });

  it("splits when both players play the same five with different suits", () => {
    expect(winners("Ks Kd 9c 9h 2s", "As 3d", "Ac 4h")).toEqual([0, 1]);
  });

  it("does not split when a kicker in the hole plays", () => {
    expect(winners("Ks Kd 9c 9h 2s", "As 3d", "Qc 4h")).toEqual([0]);
  });

  it("lets a flush on a four-flush board win by the higher hole card", () => {
    expect(winners("Ah 9h 6h 3h Kc", "Qh 2c", "Jh Tc")).toEqual([0]);
  });

  it("finds the winner among three players, or the two who split", () => {
    expect(winners("8s 8d 4c Jh 2s", "As Ad", "8h 3c", "Js Jd")).toEqual([2]);
    expect(winners("Ts Jd Qc 2h 3s", "Ah Kd", "Ac Kh", "9h 8h")).toEqual([0, 1]);
  });

  it("refuses a card dealt twice", () => {
    expect(() => winners("Ts Jd Qc 2h 3s", "Ts Kd", "Ac Kh")).toThrow();
  });
});
