import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const GTO = fileURLToPath(new URL(".", import.meta.url));
const UI = /(from|import|require\()\s*["'](react|react-native|expo|@expo\/)[^"']*["']/;

// Board item 40: the hand engine is pure TypeScript, as rule B2 of docs/conventions-typescript.md
// asks of src/game/ and src/drills/, so its tests run in vitest in node. This test turns that into
// a gate for every file under src/gto/.
describe("the GTO folder's boundary", () => {
  it("imports no React, React Native or Expo module", () => {
    const sources = readdirSync(GTO, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file));
    expect(sources.filter((file) => UI.test(readFileSync(`${GTO}/${file}`, "utf8")))).toEqual([]);
  });

  it("finds the engine's own files, and the React imports of a screen-side file, so the scan can fail", () => {
    expect(readdirSync(GTO, { encoding: "utf8" })).toEqual(expect.arrayContaining(["turn.ts", "bots.ts", "result.ts"]));
    expect(UI.test(readFileSync(`${GTO}/../art/flop-rive.tsx`, "utf8"))).toBe(true);
  });
});
