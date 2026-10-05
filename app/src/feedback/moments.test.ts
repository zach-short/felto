import { describe, expect, it, vi } from "vitest";

import { feedbackMoment, prepareSound } from "./moments";
import { safely } from "./safely";

const boom = () => {
  throw new Error("audio failed");
};

describe("feedback moments (audit of item 13, B1 and finding 1)", () => {
  it("never throws when the sound or the buzz fails", async () => {
    const rejected = () => Promise.reject(new Error("no haptics"));
    const moment = feedbackMoment("answer_right", "success", { sound: true, play: boom, buzz: rejected });
    expect(moment).not.toThrow();
    // A rejected buzz must be caught, or node reports an unhandled rejection and fails the run
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  it("plays nothing with Sound off, and still buzzes", () => {
    const play = vi.fn();
    const buzz = vi.fn(() => Promise.resolve());
    feedbackMoment("answer_wrong", "error", { sound: false, play, buzz })();
    expect(play).not.toHaveBeenCalled();
    expect(buzz).toHaveBeenCalledWith("error");
  });

  it("loads no audio with Sound off, and survives a load that throws with Sound on", () => {
    const load = vi.fn();
    prepareSound(false, load);
    expect(load).not.toHaveBeenCalled();
    expect(() => prepareSound(true, boom)).not.toThrow();
  });

  it("swallows a throw and a rejected promise", async () => {
    expect(() => safely(boom)).not.toThrow();
    safely(() => Promise.reject(new Error("late")));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
