import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("..", import.meta.url));
const MOTION_LIBRARY = /(from|import|require\()\s*["']react-native-(reanimated|worklets)/;

// BD-G3: only app/src/motion/ imports the motion library, so a swap to the built-in Animated (the
// GF-1 fallback) stays inside that folder. This test turns the rule into a gate.
describe("the motion boundary", () => {
  it("keeps every import of Reanimated and worklets inside src/motion", () => {
    const sources = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file));
    const outside = sources.filter((file) => !file.startsWith("motion/") && MOTION_LIBRARY.test(readFileSync(`${SRC}/${file}`, "utf8")));
    expect(outside).toEqual([]);
  });

  it("finds the motion module's own imports, so the scan is reading the right folder", () => {
    expect(MOTION_LIBRARY.test(readFileSync(`${SRC}/motion/motion-view.ts`, "utf8"))).toBe(true);
  });
});
