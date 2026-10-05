// The second computation of every dealt key (rule Q3), for the tests in this folder only; no
// dealer imports it. It shares no code with `src/cards/`: it reads card codes itself, finds the
// category from rank and suit bit masks instead of rank groups, and picks a showdown winner by
// trying all 21 five-card choices of each player (`PLAN.md` phase 14, done-when). So a fault in
// the evaluator and the same fault here would have to be written twice, two ways.

const RANK_ORDER = "23456789TJQKA";
const SUIT_ORDER = "shdc";

// Category indexes, weakest first, as `CATEGORIES` in `cards/evaluate.ts` orders them.
export const CATEGORY_ORDER = [
  "high-card", "one-pair", "two-pair", "three-of-a-kind", "straight",
  "flush", "full-house", "four-of-a-kind", "straight-flush", "royal-flush",
] as const;

export interface Parsed {
  readonly rank: number; // 2 to 14
  readonly suit: number; // 0 to 3
}

export function parse(code: string): Parsed {
  const rank = RANK_ORDER.indexOf(code[0]) + 2;
  const suit = SUIT_ORDER.indexOf(code[1]);
  if (rank < 2 || suit < 0 || code.length !== 2) throw new Error(`bad card ${code}`);
  return { rank, suit };
}

export function allCodes(): string[] {
  return [...RANK_ORDER].flatMap((r) => [...SUIT_ORDER].map((s) => `${r}${s}`));
}

// The top rank of the highest straight in a rank bit mask (bit n is rank n), or 0. Bit 1 stands
// for the ace playing low.
export function straightTop(mask: number): number {
  const withLowAce = mask & (1 << 14) ? mask | 2 : mask;
  for (let top = 14; top >= 5; top -= 1) {
    const run = 0b11111 << (top - 4);
    if ((withLowAce & run) === run) return top;
  }
  return 0;
}

function bitCount(n: number): number {
  let count = 0;
  for (let m = n; m; m &= m - 1) count += 1;
  return count;
}

function straightFlushTop(suitMasks: readonly number[]): number {
  return Math.max(0, ...suitMasks.filter((m) => bitCount(m) >= 5).map(straightTop));
}

function multiples(cards: readonly Parsed[]): number[] {
  const counts = new Array<number>(15).fill(0);
  for (const card of cards) counts[card.rank] += 1;
  return counts.filter((n) => n >= 2).sort((a, b) => b - a);
}

// The category index of the best hand in five to seven cards.
export function categoryIndex(cards: readonly Parsed[]): number {
  const suitMasks = [0, 0, 0, 0];
  for (const card of cards) suitMasks[card.suit] |= 1 << card.rank;
  const sf = straightFlushTop(suitMasks);
  if (sf) return sf === 14 ? 9 : 8;
  const [first = 1, second = 1] = multiples(cards);
  if (first === 4) return 7;
  if (first === 3 && second >= 2) return 6;
  if (suitMasks.some((m) => bitCount(m) >= 5)) return 5;
  if (straightTop(suitMasks.reduce((a, b) => a | b, 0))) return 4;
  if (first === 3) return 3;
  return first === 2 ? (second === 2 ? 2 : 1) : 0;
}

// A five-card hand as a tuple that compares the way hands do: the category, then the ranks
// that break a tie, most important first.
export function fiveCardTuple(five: readonly Parsed[]): number[] {
  const category = categoryIndex(five);
  const mask = five.reduce((m, c) => m | (1 << c.rank), 0);
  if (category === 4 || category === 8 || category === 9) return [category, straightTop(mask)];
  const counts = new Map<number, number>();
  for (const card of five) counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  const ranks = [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0]).map(([rank]) => rank);
  return [category, ...ranks];
}

export function compareTuples(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return Math.sign(d);
  }
  return 0;
}

export function chooseFive<T>(items: readonly T[]): T[][] {
  const out: T[][] = [];
  const n = items.length;
  for (let mask = 0; mask < 1 << n; mask += 1) {
    if (bitCount(mask) === 5) out.push(items.filter((_, i) => mask & (1 << i)));
  }
  return out;
}

export function bestTuple(cards: readonly Parsed[]): number[] {
  return chooseFive(cards)
    .map(fiveCardTuple)
    .reduce((best, t) => (compareTuples(t, best) > 0 ? t : best));
}

// The winners of a showdown, by brute force over each player's 21 five-card choices.
export function bruteWinners(board: readonly string[], players: readonly (readonly string[])[]): number[] {
  const tuples = players.map((hole) => bestTuple([...hole, ...board].map(parse)));
  const best = tuples.reduce((a, b) => (compareTuples(a, b) >= 0 ? a : b));
  return tuples.flatMap((t, i) => (compareTuples(t, best) === 0 ? [i] : []));
}

// Every card left in the deck that, dealt next, gives the target category or better.
export function bruteOuts(hole: readonly string[], board: readonly string[], target: number): string[] {
  const known = [...hole, ...board];
  return allCodes()
    .filter((code) => !known.includes(code))
    .filter((code) => categoryIndex([...known, code].map(parse)) >= target);
}

// The share of deals whose key sits at each option position, grouped by the number of options.
export function answerShares(exercises: readonly { options: readonly unknown[]; answer: number }[]) {
  const byCount = new Map<number, number[]>();
  for (const ex of exercises) {
    const tally = byCount.get(ex.options.length) ?? new Array<number>(ex.options.length).fill(0);
    tally[ex.answer] += 1;
    byCount.set(ex.options.length, tally);
  }
  return [...byCount].map(([count, tally]) => {
    const total = tally.reduce((a, b) => a + b, 0);
    return { count, total, maxShare: Math.max(...tally) / total };
  });
}

// The stated limit (`PLAN.md` phase 14 brief): with n options, no position holds the key in
// more than 1/n + 10 points of the deals. A fair shuffle sits at 1/n.
export function shareLimit(count: number): number {
  return 1 / count + 0.1;
}
