// Development only, like BD-13 and the lesson's `at` link: felto://boss/<unit>?seed=<n>&play=<rw...>
// and felto://review/<unit>?seed=<n>&play=<rw...> fix the draw and play the first answers, so a
// screenshot names a draw and not a lucky one. A release build ignores both.
export function devSeed(value: string | undefined): number | null {
  if (!__DEV__ || value === undefined) return null;
  const seed = Number(value);
  return Number.isInteger(seed) && seed >= 0 ? seed : null;
}

export function devPlay(value: string | undefined): string | null {
  if (!__DEV__ || value === undefined) return null;
  return /^[rw]+$/.test(value) ? value : null;
}
