import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ART_BOXES } from "@/art/sizes";

const ASSETS = fileURLToPath(new URL("../../../assets", import.meta.url));
const FOLDERS = ["icons/cards", "icons/path", "icons/ui", "mascots/fish", "mascots/squid", "mascots/shark"];

function viewBox(folder: string, name: string): number[] {
  const text = readFileSync(`${ASSETS}/${folder}/${name}.svg`, "utf8");
  const match = /viewBox="([^"]*)"/.exec(text);
  if (!match) throw new Error(`${folder}/${name}.svg has no viewBox`);
  return match[1].split(/\s+/).map(Number);
}

// The size table is copied from the generated files, so a generator change that moves a canvas
// must fail here, not squash the art on the phone.
describe("ART_BOXES", () => {
  it.each(Object.entries(ART_BOXES))("%s matches its file's viewBox", (name, box) => {
    const [, , width, height] = viewBox(box.folder, name);
    expect({ width, height }).toEqual({ width: box.width, height: box.height });
  });

  it("lists every SVG in the folders the app draws from", () => {
    const onDisk = FOLDERS.flatMap((folder) =>
      readdirSync(`${ASSETS}/${folder}`)
        .filter((file) => file.endsWith(".svg"))
        .map((file) => file.slice(0, -4)),
    );
    expect(Object.keys(ART_BOXES).sort()).toEqual(onDisk.sort());
  });
});
