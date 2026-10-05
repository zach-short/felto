import { DIALS } from "@/config/dials";
import { livesAt, nextLifeAt } from "@/game/lives";
import type { PlayerState } from "@/game/player-state";

export type OutOfLivesOffer = {
  lives: number;
  nextLife: Date | null;
  gems: number;
  price: number;
  canRefill: boolean;
};

// D8: the out-of-lives sheet shows when the next heart comes back and offers a full refill for
// the refill price in gems, which only a player holding that many can take. The rule that spends
// the gems is game/lives.ts refillLives; this only decides what the sheet offers.
export function outOfLivesOffer(state: PlayerState, now: Date): OutOfLivesOffer {
  const lives = livesAt(state, now);
  const price = DIALS.lifeRefillGems;
  const canRefill = lives < DIALS.maxLives && state.gems >= price;
  return { lives, nextLife: nextLifeAt(state, now), gems: state.gems, price, canRefill };
}
