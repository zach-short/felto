import { describe, expect, it } from "vitest";

import { chestMoment } from "./chest-moment";
import { PATH_OUTLINE } from "@/components/path/path-outline";
import { DIALS } from "@/config/dials";
import { chestPrize, openChest } from "@/game/chest";
import { fixtureState } from "@/game/fixtures";
import { finishSession } from "@/game/session";

const NOW = new Date(2026, 9, 5, 12, 0);
const UNIT = PATH_OUTLINE.units[0].id;
const READY = fixtureState("boss-ready", PATH_OUTLINE, NOW);
const result = (right: number) => ({ kind: "boss" as const, id: UNIT, size: DIALS.bossDraw, answered: DIALS.bossDraw, right });

describe("the chest after a boss (PLAN.md phase 10)", () => {
  it("is closed after a failed boss and ready after a pass", () => {
    expect(chestMoment(finishSession(READY, result(7), NOW), UNIT, false)).toBe("closed");
    expect(chestMoment(finishSession(READY, result(8), NOW), UNIT, false)).toBe("ready");
  });

  it("gives its tier's gems once: a second open and a second pass give nothing more (watch-for)", () => {
    const passed = finishSession(READY, result(8), NOW);
    const opened = openChest(passed, UNIT);
    // Since GF-13 the chest pays the gems of its tier, not a fixed 20
    expect(opened.gems).toBe(READY.gems + chestPrize(passed, UNIT));
    expect(chestMoment(opened, UNIT, true)).toBe("just-opened");
    expect(openChest(opened, UNIT).gems).toBe(opened.gems);
    const again = finishSession(opened, result(10), NOW);
    expect(chestMoment(again, UNIT, false)).toBe("opened");
    expect(openChest(again, UNIT).gems).toBe(opened.gems);
  });

  it("names an unknown unit missing", () => {
    expect(chestMoment(READY, "nowhere", false)).toBe("missing");
  });
});
