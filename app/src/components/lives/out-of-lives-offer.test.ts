import { describe, expect, it } from "vitest";

import { outOfLivesOffer } from "./out-of-lives-offer";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import { DIALS } from "@/config/dials";
import { fixtureState } from "@/game/fixtures";
import { refillLives } from "@/game/lives";
import { recordAnswer } from "@/game/session";

const NOW = new Date(2026, 9, 5, 12, 0);
const ZERO = fixtureState("zero-lives", PATH_OUTLINE, NOW);
const HOUR = 3_600_000;

describe("outOfLivesOffer (D8)", () => {
  it("offers the refill on zero-lives, which holds 20 gems, and names the next heart's time", () => {
    const offer = outOfLivesOffer(ZERO, NOW);
    expect(offer).toMatchObject({ lives: 0, gems: 20, price: DIALS.lifeRefillGems, canRefill: true });
    expect(offer.nextLife?.getTime()).toBe(ZERO.livesClock + DIALS.lifeRegainHours * HOUR);
  });

  it("offers no refill without the gems", () => {
    expect(outOfLivesOffer({ ...ZERO, gems: DIALS.lifeRefillGems - 1 }, NOW).canRefill).toBe(false);
  });

  it("has no refill to offer after one, until the hearts are spent again", () => {
    const refill = refillLives(ZERO, NOW);
    if (!refill.ok) throw new Error(refill.reason);
    expect(outOfLivesOffer(refill.state, NOW)).toMatchObject({ lives: DIALS.maxLives, gems: 0, canRefill: false });
    let spent = refill.state;
    for (let i = 0; i < DIALS.maxLives; i++) {
      spent = recordAnswer(spent, { kind: "boss", exerciseId: `x${i}`, right: false }, NOW);
    }
    expect(outOfLivesOffer(spent, NOW)).toMatchObject({ lives: 0, gems: 0, canRefill: false });
  });
});
