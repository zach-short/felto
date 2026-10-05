import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import colourSwap from "@/art/colour-swap.json";
import { COLOURS } from "@/theme/tokens";

// BD-25: the dark-mode swap depends on two hex values that the generators write. These
// tests make that coupling loud: if either value leaves the generators or the art, the
// gate fails here instead of the dark page quietly showing a pale shadow.
const repoRoot = resolve(process.cwd(), "..");
const readRepo = (path: string) => readFileSync(join(repoRoot, path), "utf8");

function artFiles(): string[] {
  return ["assets/icons", "assets/mascots"].flatMap((dir) =>
    readdirSync(join(repoRoot, dir), { recursive: true, encoding: "utf8" })
      .filter((name) => name.endsWith(".svg"))
      .map((name) => join(dir, name)),
  );
}

describe("the colour swap of BD-25", () => {
  it("still finds the hard shadow in tools/common.py", () => {
    expect(readRepo("tools/common.py")).toContain('SHADOW = "#C9CDE2"');
  });

  it("still finds the ring track in tools/build_icons.py", () => {
    expect(readRepo("tools/build_icons.py")).toContain('stroke="#DDE1EC"');
  });

  it.each(Object.keys(colourSwap))("finds %s in the generated art", (hex) => {
    const hits = artFiles().filter((path) => readRepo(path).includes(`"${hex}"`));
    expect(hits.length).toBeGreaterThan(0);
  });

  it("keeps the art's own values in light mode", () => {
    expect(Object.keys(colourSwap)).toEqual([COLOURS.light.artShadow, COLOURS.light.artTrack]);
  });
});
