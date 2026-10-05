// The phone's list of scheduled notifications is shared, so a replan, a cancel and a permission
// prompt run one after another, never interleaved. A failed task is dropped: a reminder is a
// nudge, and a notification error must never reach a screen or a session (as feedback/safely.ts).
let tail: Promise<unknown> = Promise.resolve();

export function runInTurn(task: () => Promise<unknown>): Promise<void> {
  const next = tail.then(task).then(
    () => undefined,
    () => undefined,
  );
  tail = next;
  return next;
}
