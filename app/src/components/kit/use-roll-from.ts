import { useState } from "react";

export type Roll = { from: number; to: number; change: number };

// GF-15: the value a rolling number rolls from, which is the one it showed before `value` changed.
// The count of changes keys the columns, so each change mounts them afresh and every one rolls
// from its start. The state is adjusted while drawing, React's own pattern for state that follows
// a prop, so the first draw with a new value already rolls toward it.
export function useRollFrom(value: number): Roll {
  const [roll, setRoll] = useState<Roll>({ from: value, to: value, change: 0 });
  if (roll.to === value) return roll;
  const next = { from: roll.to, to: value, change: roll.change + 1 };
  setRoll(next);
  return next;
}
