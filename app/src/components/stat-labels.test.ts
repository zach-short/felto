import { describe, expect, it } from "vitest";

import { statLabel } from "@/components/stat-values";

describe("statLabel", () => {
  it("uses the singular for 1", () => {
    expect(statLabel("lives", 1)).toBe("1 heart");
    expect(statLabel("freezes", 1)).toBe("1 streak freeze");
    expect(statLabel("gems", 1)).toBe("1 gem");
  });

  it("uses D10's warm word hearts, and the plural, for any other number", () => {
    expect(statLabel("lives", 5)).toBe("5 hearts");
    expect(statLabel("lives", 0)).toBe("0 hearts");
    expect(statLabel("freezes", 2)).toBe("2 streak freezes");
    expect(statLabel("gems", 20)).toBe("20 gems");
  });

  it("names the streak and the XP", () => {
    expect(statLabel("streak", 4)).toBe("4 day streak");
    expect(statLabel("xp", 240)).toBe("240 XP");
  });
});
