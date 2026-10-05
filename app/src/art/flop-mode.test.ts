import { describe, expect, it } from "vitest";

import { flopHeight, flopMode } from "@/art/flop-mode";

describe("flopMode", () => {
  it("plays the rig when motion is allowed and the file loaded", () => {
    expect(flopMode(true, false)).toBe("rive");
  });

  it("draws the static pose under reduced motion", () => {
    expect(flopMode(false, false)).toBe("static");
  });

  it("draws the static pose when the file failed, even with motion allowed", () => {
    expect(flopMode(true, true)).toBe("static");
  });
});

describe("flopHeight", () => {
  it("keeps the 600 by 520 shape of the artboard", () => {
    expect(flopHeight(300)).toBe(260);
    expect(flopHeight(120)).toBe(104);
  });
});
