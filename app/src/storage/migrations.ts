import { isRecord } from "@/storage/check-state";

// Rule Q2 and docs/AGENT-PRACTICES.md Part 6: the stored value carries a version. A change to
// the shape of PlayerState raises STATE_VERSION, adds the step from the old version here, and
// adds a test that loads a saved value of the old shape. Read this number here, never from a doc.
export const STATE_VERSION = 2;

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
