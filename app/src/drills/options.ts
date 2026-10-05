import { shuffleWith, type Random } from "./random";

export interface PlacedOptions<O> {
  readonly options: O[];
  readonly answer: number;
}

// The key among its distractors in a seeded order, so no answer position is favoured (the
// distribution test in each dealer's test file holds this). The caller makes the distractors
// distinct from the key and from each other.
export function placeKey<O>(random: Random, key: O, distractors: readonly O[]): PlacedOptions<O> {
  const order = shuffleWith(random, [0, ...distractors.map((_, i) => i + 1)]);
  const all = [key, ...distractors];
  return { options: order.map((i) => all[i]), answer: order.indexOf(0) };
}
