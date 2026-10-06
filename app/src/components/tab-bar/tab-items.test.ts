import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ART_BOXES } from "@/art/sizes";
import { fitWidth, pressMoves, TAB_ITEMS, tabItemFor, tabSpeech } from "@/components/tab-bar/tab-items";

const TABS_FOLDER = fileURLToPath(new URL("../../app/(tabs)", import.meta.url));

// The route files of the tab group, without the layout: what the navigator can open
function tabRouteFiles(): string[] {
  return readdirSync(TABS_FOLDER)
    .filter((file) => file.endsWith(".tsx") && !file.startsWith("_"))
    .map((file) => file.replace(/\.tsx$/, ""))
    .sort();
}

describe("TAB_ITEMS", () => {
  it("draws Learn, Practice and Profile, in that order", () => {
    expect(TAB_ITEMS.map((item) => [item.route, item.label])).toEqual([
      ["index", "Learn"],
      ["practice", "Practice"],
      ["profile", "Profile"],
    ]);
  });

  // A tab with no route file would open nothing, and a route file with no tab would be a tab the
  // bar never draws: the navigator lists the items, so the two must match one for one
  it("has one item for each route file of app/src/app/(tabs)/, and no other", () => {
    expect(TAB_ITEMS.map((item) => item.route).sort()).toEqual(tabRouteFiles());
  });

  it("draws only art the art module has", () => {
    expect(TAB_ITEMS.filter((item) => !(item.art in ART_BOXES))).toEqual([]);
  });

  it("finds an item by its route name, and none for a name it does not hold", () => {
    expect(tabItemFor("practice")?.label).toBe("Practice");
    expect(tabItemFor("lesson")).toBeUndefined();
  });
});

describe("fitWidth", () => {
  // The height Art draws for a width keeps the art's shape (art/art.tsx)
  function drawnHeight(art: keyof typeof ART_BOXES, width: number): number {
    return (width * ART_BOXES[art].height) / ART_BOXES[art].width;
  }

  it("fits every tab icon inside the square, touching it on its longer side", () => {
    const fits = TAB_ITEMS.map((item) => {
      const width = fitWidth(item.art, 30);
      return Math.max(width, drawnHeight(item.art, width));
    });
    expect(fits.map((side) => Math.round(side * 1000) / 1000)).toEqual([30, 30, 30]);
  });

  it("narrows a tall piece of art and keeps a square or wide one at the full side", () => {
    expect(fitWidth("card_back", 30)).toBeLessThan(30);
    expect(fitWidth("node_available", 30)).toBe(30);
  });
});

describe("pressMoves", () => {
  it("moves to another tab", () => {
    expect(pressMoves(false, false)).toBe(true);
  });

  it("stays on the open tab", () => {
    expect(pressMoves(true, false)).toBe(false);
  });

  it("stays when a tabPress listener stopped the press", () => {
    expect(pressMoves(false, true)).toBe(false);
  });
});

describe("tabSpeech", () => {
  it("on iOS is a button whose label names the tab and its place", () => {
    expect(tabSpeech("Practice", 1, 3, "ios")).toEqual({ role: "button", label: "Practice, tab, 2 of 3" });
  });

  it("on Android is a tab with its label alone", () => {
    expect(tabSpeech("Practice", 1, 3, "android")).toEqual({ role: "tab", label: "Practice" });
  });
});
