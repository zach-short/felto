// Audio and haptics are decoration: a sound that fails to load or play must never stop a lesson,
// spend a second life or leave a session stuck (audit of item 13, finding B1). Every call into
// expo-audio or expo-haptics goes through one of these two, and a failure is dropped silently.
export function safely(effect: () => unknown): void {
  try {
    const result = effect();
    if (result instanceof Promise) result.catch(() => undefined);
  } catch {
    // Dropped on purpose: see above
  }
}

export function quietly(promise: Promise<unknown>): void {
  promise.catch(() => undefined);
}
