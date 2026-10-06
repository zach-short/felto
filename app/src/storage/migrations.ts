import { isRecord } from "@/storage/check-state";

// Rule Q2 and docs/AGENT-PRACTICES.md Part 6: the stored value carries a version. A change to
// the shape of PlayerState raises STATE_VERSION, adds the step from the old version here, and
// adds a test that loads a saved value of the old shape. Read this number here, never from a doc.
export const STATE_VERSION = 5;

// Key n turns a stored player of version n into version n + 1. Each step is written against the
// old shape as it was stored, so it never imports today's types or defaults.
export const MIGRATIONS: Record<number, (old: unknown) => unknown> = {
  // Version 2 (PLAN.md phase 11, D11): settings gain the daily reminder, on at 19:00. The time is
  // written out, not read from the dial, because it is what version 2 meant when it was written;
  // a later change to the dial must not change what an old save turns into. Every field of
  // version 1 is kept as it was. A value that is not a version 1 player is passed on unchanged,
  // so the check after the migration fails and the load backs it up.
  1: (old) => {
    if (!isRecord(old) || !isRecord(old.settings)) return old;
    const reminder = { on: true, hour: 19, minute: 0 };
    return { ...old, settings: { ...old.settings, reminder } };
  },
  // Version 3 (game-feel GF-3, board item 27): settings gain the Haptics switch, on. The value is
  // written out for the same reason as the reminder above. Every field of version 2 is kept, and a
  // value that is not a version 2 player is passed on unchanged, so the load backs it up.
  2: (old) => {
    if (!isRecord(old) || !isRecord(old.settings)) return old;
    return { ...old, settings: { ...old.settings, haptics: true } };
  },
  // Version 4 (Logan Mode): settings gain the Logan Mode switch, off. Written out for the same
  // reason as above. Every field of version 3 is kept, and a value that is not a version 3 player
  // is passed on unchanged, so the load backs it up.
  3: (old) => {
    if (!isRecord(old) || !isRecord(old.settings)) return old;
    return { ...old, settings: { ...old.settings, loganMode: false } };
  },
  // Version 5 (game-feel GF-13, board item 50): the player gains the chest seed. A version 4 save
  // holds no value fixed for the player, so the seed is taken from its lives clock, a millisecond
  // time, as a 32-bit number. The same stored save always gives the same seed, so a ready chest
  // keeps its tier until the first save writes the seed down. Written out, not imported, for the
  // reason above. Every field of version 4 is kept, and a value with no numeric lives clock is
  // passed on unchanged, so the load backs it up.
  4: (old) => {
    if (!isRecord(old) || typeof old.livesClock !== "number") return old;
    return { ...old, chestSeed: old.livesClock >>> 0 };
  },
};

export function migrate(player: unknown, fromVersion: number): unknown | null {
  let value = player;
  for (let version = fromVersion; version < STATE_VERSION; version++) {
    const step = MIGRATIONS[version];
    if (!step) return null;
    value = step(value);
  }
  return value;
}
