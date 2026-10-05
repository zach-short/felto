import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { OPENING_CHART, UNITS } from "./catalog";
import { computeKey } from "./compute-key";
import { OUTLINE } from "./outline";
import type { Unit } from "./schema";
import { validateUnits } from "./validate";

// Rule Q3 and `DESIGN.md` 10.4: every key a program can check is written twice, once by the
// author and once here. A mismatch is resolved by reading both, never by copying this answer
// into the data unread.
const exercises = UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.exercises));

// The unit ids that have a file in `units/`, by the naming rule in `catalog.ts`.
function unitFileIds(): string[] {
  // vitest runs from `app/`, as `src/art/colour-swap.test.ts` also assumes.
  const folder = join(process.cwd(), "src/content/units");
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
    .map((name) => name.replace(/\.ts$/, ""));
}

// What a catalog leaves out: a unit file it does not list, and an outline lesson missing from a
// unit it does list. Empty when both `units/` and the catalog are empty.
function missingFromCatalog(fileIds: readonly string[], units: readonly Unit[]): string[] {
  const listed = new Set(units.map((unit) => unit.id));
  const lessonIds = new Set(units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)));
  const unlisted = fileIds.filter((id) => !listed.has(id as Unit["id"])).map((id) => `unit file "${id}"`);
  const lessons = OUTLINE.filter((unit) => listed.has(unit.id))
    .flatMap((unit) => unit.lessons.map((lesson) => lesson.id))
    .filter((id) => !lessonIds.has(id))
    .map((id) => `lesson "${id}"`);
  return [...unlisted, ...lessons];
}

describe("the written content", () => {
  it("passes the structural validator", () => {
    expect(validateUnits(UNITS)).toEqual([]);
  });

  it("has every checkable key equal to the computed key", () => {
    const wrong = exercises
      .map((ex) => ({ id: ex.id, written: ex.answer, computed: computeKey(ex, { chart: OPENING_CHART }) }))
      .filter(({ written, computed }) => computed !== null && computed !== written);
    expect(wrong).toEqual([]);
  });

  // Passes with nothing to check while `units/` holds no file and the catalog is empty.
  it("lists every unit file in the catalog, with every lesson of the outline", () => {
    expect(missingFromCatalog(unitFileIds(), UNITS)).toEqual([]);
  });
});

describe("the catalog guard itself", () => {
  it("finds a unit file the catalog does not list, and a listed unit short of a lesson", () => {
    const short: Unit = { id: "hands", title: "Hands", lessons: [{ id: "hands-1", title: "Ranks and suits", exercises: [] }] };
    expect(missingFromCatalog(["table"], [])).toEqual(['unit file "table"']);
    expect(missingFromCatalog(["hands"], [short])).toEqual([
      'lesson "hands-2"', 'lesson "hands-3"', 'lesson "hands-4"', 'lesson "hands-5"',
    ]);
    expect(missingFromCatalog([], [])).toEqual([]);
  });
});
