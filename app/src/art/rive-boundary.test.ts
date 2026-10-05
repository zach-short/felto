import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("..", import.meta.url));
const RIVE = /(from|import|require\()\s*["'](rive-react-native|@rive\/)/;

// Rule U6, widened to the Rive file by board item 34: only app/src/art/ imports the runtime or the
// `.riv`, so a swap of either stays inside that folder. This test turns the rule into a gate.
describe("the Rive boundary", () => {
  it("keeps every import of the Rive runtime and file inside src/art", () => {
    const sources = readdirSync(SRC, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file));
    const outside = sources.filter((file) => !file.startsWith("art/") && RIVE.test(readFileSync(`${SRC}/${file}`, "utf8")));
    expect(outside).toEqual([]);
  });

  it("finds the art module's own import, so the scan is reading the right folder", () => {
    expect(RIVE.test(readFileSync(`${SRC}/art/flop-rive.tsx`, "utf8"))).toBe(true);
  });
});
