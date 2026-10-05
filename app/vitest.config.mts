import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// BD-12: the test script also sets TZ=America/New_York, so day-boundary and
// daylight-saving cases run in one known zone, not the machine's.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
