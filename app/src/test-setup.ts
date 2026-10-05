import { vi } from "vitest";

// The tests check the real heart rules (D8), so the dev dial that switches them off is off here.
vi.mock("@/config/dials", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/config/dials")>();
  return { DIALS: { ...original.DIALS, devUnlimitedLives: false } };
});
