// GF-3 and BD-G6: the Haptics switch in Profile is the one rule for every buzz the app gives, both
// the six answer and ending moments (feedback/moments.ts) and the touches of the vocabulary
// (feedback/haptics.ts). It has its own file because feedback/haptics.ts imports expo-haptics,
// which vitest in node cannot load, and moments.ts must run in node (PLAN.md BD-G15).
export function shouldBuzz(setting: boolean): boolean {
  return setting;
}
