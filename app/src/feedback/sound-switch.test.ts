import { describe, expect, it, vi } from "vitest";

import { playThrough } from "./sound-switch";

describe("an effect played on its own through the Sound switch (GF-5, board item 28)", () => {
  it("plays the effect once with Sound on", () => {
    const play = vi.fn();
    playThrough("tap", true, play);
    expect(play).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith("tap");
  });

  it("plays nothing with Sound off", () => {
    const play = vi.fn();
    playThrough("tap", false, play);
    expect(play).not.toHaveBeenCalled();
  });

  it("never throws into the press that asked for it", () => {
    const play = vi.fn(() => {
      throw new Error("the player could not load");
    });
    expect(() => playThrough("tap", true, play)).not.toThrow();
  });
});
