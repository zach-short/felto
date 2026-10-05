import { describe, expect, it } from "vitest";

import { slidePosition, storyButtonLabel } from "@/components/story/story-copy";
import { OUTLINE } from "@/content/outline";

describe("the story copy", () => {
  it("labels the header button with the unit title in lower case (US-5)", () => {
    expect(OUTLINE.map((unit) => storyButtonLabel(unit.title))).toEqual([
      "Learn about hands",
      "Learn about the table",
      "Learn about preflop",
      "Learn about outs and odds",
    ]);
  });

  it("counts slides from 1 for a screen reader", () => {
    expect(slidePosition(0, 6)).toBe("Slide 1 of 6");
    expect(slidePosition(5, 6)).toBe("Slide 6 of 6");
  });
});
