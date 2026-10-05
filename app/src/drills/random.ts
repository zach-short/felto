import { seededRandom } from "@/game/seeded-random";

// BD-26 and rule B3: every dealer takes a seed and draws only from this generator, so a test
// (or a bug report) replays any deal exactly. Nothing in `src/drills/` reads Math.random.
export type Random = () => number;

export function randomFrom(seed: number): Random {
  return seededRandom(seed);
}

// Inclusive at both ends: randomInt(r, 2, 20) can return 20, which the pot sizes rely on.
export function randomInt(random: Random, low: number, high: number): number {
  return low + Math.floor(random() * (high - low + 1));
}

export function pickOne<T>(random: Random, items: readonly T[]): T {
  if (items.length === 0) throw new Error("cannot pick from an empty list");
  return items[Math.floor(random() * items.length)];
}

export function shuffleWith<T>(random: Random, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickSome<T>(random: Random, items: readonly T[], count: number): T[] {
  return shuffleWith(random, items).slice(0, count);
}

// Weights need not sum to 1; they are relative, so a table can weight one entry 0.25.
export function pickWeighted<T>(random: Random, entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let left = random() * total;
  for (const [item, weight] of entries) {
    left -= weight;
    if (left < 0) return item;
  }
  return entries[entries.length - 1][0];
}

// A seed for a nested draw, taken from the outer generator so the whole chain replays.
export function childSeed(random: Random): number {
  return Math.floor(random() * 4_294_967_296);
}

// Dealers build a spot and keep it only when it meets their conditions. The limit turns a
// condition that can never be met into a loud error instead of a hang; the seeded tests show
// that no seed reaches it.
export function firstAccepted<T>(what: string, attempt: () => T | null, limit = 2000): T {
  for (let i = 0; i < limit; i += 1) {
    const found = attempt();
    if (found !== null) return found;
  }
  throw new Error(`no ${what} found in ${limit} attempts`);
}
