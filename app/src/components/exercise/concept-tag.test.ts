import { describe, expect, it } from "vitest";

import type { CastRole } from "@/content/cast";
import { UNITS } from "@/content/catalog";
import type { Exercise } from "@/content/schema";

import { NEW_CONCEPT_LABEL, showsConceptTag } from "./concept-tag";

const WRITTEN: Exercise[] = UNITS.flatMap((unit) => unit.lessons.flatMap((lesson) => [...lesson.exercises]));

function written(id: string): Exercise {
  const ex = WRITTEN.find((e) => e.id === id);
  if (!ex) throw new Error(`no exercise ${id}`);
  return ex;
}

describe("the NEW CONCEPT tag", () => {
  it("reads 'NEW CONCEPT', written as the kit's tag draws it", () => {
    expect(NEW_CONCEPT_LABEL).toBe("NEW CONCEPT");
  });

  it("shows over a concept step that names a term, when the fish hosts", () => {
    expect(showsConceptTag(written("hands-1-07"), "fish")).toBe(true);
  });

  it("does not show when the shark hosts a boss or the squid a review", () => {
    const hosts: CastRole[] = ["shark", "squid"];
    expect(hosts.map((host) => showsConceptTag(written("hands-1-07"), host))).toEqual([false, false]);
  });

  it("does not show over a concept step that names no term, or a drill step that does", () => {
    expect(showsConceptTag(written("hands-1-05"), "fish")).toBe(false);
    expect(showsConceptTag(written("preflop-4-05"), "fish")).toBe(false);
  });

  it("shows in every unit at least once", () => {
    const tagged = UNITS.map((unit) =>
      unit.lessons.flatMap((lesson) => lesson.exercises).filter((ex) => showsConceptTag(ex, "fish")).length,
    );
    expect(tagged.every((count) => count > 0)).toBe(true);
  });
});
