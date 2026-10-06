import { describe, expect, it } from "vitest";

import { lineLength, parseLine, plainLine, typedCount, typedParts } from "@/components/kit/typing-steps";

const LINE = "Move your king to gain *opposition*.";

describe("parseLine", () => {
  it("marks the words between asterisks as key words and drops the asterisks", () => {
    expect(parseLine(LINE)).toEqual([
      { text: "Move your king to gain ", key: false },
      { text: "opposition", key: true },
      { text: ".", key: false },
    ]);
  });

  it("keeps a line with no marks as one plain part, and a line that starts with a key word", () => {
    expect(parseLine("Nice read!")).toEqual([{ text: "Nice read!", key: false }]);
    expect(parseLine("*Flush* beats straight.")).toEqual([
      { text: "Flush", key: true },
      { text: " beats straight.", key: false },
    ]);
  });

  it("reads to a screen reader whole, with no marks", () => {
    expect(plainLine(parseLine(LINE))).toBe("Move your king to gain opposition.");
  });
});

describe("typedCount", () => {
  it("adds one character each step and stops at the end of the line", () => {
    expect(typedCount(0, 30, 10)).toBe(0);
    expect(typedCount(29, 30, 10)).toBe(0);
    expect(typedCount(30, 30, 10)).toBe(1);
    expect(typedCount(95, 30, 10)).toBe(3);
    expect(typedCount(10_000, 30, 10)).toBe(10);
  });

  it("shows the whole line when the dial is 0", () => {
    expect(typedCount(0, 0, 10)).toBe(10);
  });
});

describe("typedParts", () => {
  const parts = parseLine(LINE);
  const total = lineLength(parts);

  it("splits a part where the typing has reached and keeps its key mark on both pieces", () => {
    expect(typedParts(parts, 26)).toEqual([
      { text: "Move your king to gain ", key: false, shown: true },
      { text: "opp", key: true, shown: true },
      { text: "osition", key: true, shown: false },
      { text: ".", key: false, shown: false },
    ]);
  });

  it("always lays out the whole line, shown or not, at every step", () => {
    for (let count = 0; count <= total; count++) {
      const typed = typedParts(parts, count);
      expect(typed.map((part) => part.text).join("")).toBe(plainLine(parts));
      expect(typed.filter((part) => part.shown).reduce((sum, part) => sum + part.text.length, 0)).toBe(count);
    }
  });

  it("counts an accented letter or an emoji as one character", () => {
    const accented = parseLine("Olé 🂡");
    expect(lineLength(accented)).toBe(5);
    expect(typedParts(accented, 5)).toEqual([{ text: "Olé 🂡", key: false, shown: true }]);
  });
});
