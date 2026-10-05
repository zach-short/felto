// Hazard 9 and BD-12: a streak day is the phone's local calendar date, so every date here is
// built with local methods. Noon is used for day arithmetic because no daylight-saving change
// moves noon to another date.

export function dayKey(time: Date): string {
  const month = String(time.getMonth() + 1).padStart(2, "0");
  const day = String(time.getDate()).padStart(2, "0");
  return `${time.getFullYear()}-${month}-${day}`;
}

function noonOf(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const hours = (noonOf(toKey).getTime() - noonOf(fromKey).getTime()) / 3_600_000;
  return Math.round(hours / 24);
}

export function addDays(key: string, days: number): string {
  const noon = noonOf(key);
  noon.setDate(noon.getDate() + days);
  return dayKey(noon);
}
