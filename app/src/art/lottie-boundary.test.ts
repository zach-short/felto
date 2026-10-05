import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("..", import.meta.url));
const LOTTIE = /(from|import|require\()\s*["'](lottie-react-native|@art\/lottie\/)/;

// Rule U6, widened to Lottie by board item 49: only app/src/art/ imports the runtime or a file under
// assets/lottie/, so a swap of either stays inside that folder. This test turns the rule into a gate.
describe("the Lottie boundary", () => {
  it("keeps every import of the Lottie runtime and files inside src/art", () => {
    const sources = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file));
    const outside = sources.filter((file) => !file.startsWith("art/") && LOTTIE.test(readFileSync(`${SRC}/${file}`, "utf8")));
    expect(outside).toEqual([]);
  });

  it("finds the art module's own import, so the scan is reading the right folder", () => {
    expect(LOTTIE.test(readFileSync(`${SRC}/art/effect.tsx`, "utf8"))).toBe(true);
  });
});
