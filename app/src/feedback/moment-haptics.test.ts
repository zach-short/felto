import { describe, expect, it, vi } from "vitest";

import type { Effect } from "@/art/sounds";

import { feedbackMoment } from "./moments";

function devices(sound: boolean, haptics: boolean) {
  return { sound, haptics, play: vi.fn(), buzz: vi.fn(() => Promise.resolve()) };
}

// The six moments of use-answer-feedback.ts, each with the touch it gives
const MOMENTS: [Effect, string][] = [
  ["answer_right", "success"],
  ["answer_wrong", "error"],
  ["lesson_finish", "success"],
  ["boss_pass", "success"],
  ["boss_fail", "error"],
  ["chest_open", "success"],
];

describe("the six moments and the Haptics switch (GF-3, board item 27)", () => {
  it.each(MOMENTS)("%s buzzes nothing with Haptics off, and still plays its sound", (effect, touch) => {
    const phone = devices(true, false);
    feedbackMoment(effect, touch, phone)();
    expect(phone.buzz).not.toHaveBeenCalled();
    expect(phone.play).toHaveBeenCalledWith(effect);
  });

  it.each(MOMENTS)("%s buzzes once with Haptics on", (effect, touch) => {
    const phone = devices(false, true);
    feedbackMoment(effect, touch, phone)();
    expect(phone.buzz).toHaveBeenCalledTimes(1);
    expect(phone.buzz).toHaveBeenCalledWith(touch);
  });

  it("does nothing at all with Sound and Haptics both off", () => {
    const phone = devices(false, false);
    feedbackMoment("answer_right", "success", phone)();
    expect(phone.play).not.toHaveBeenCalled();
    expect(phone.buzz).not.toHaveBeenCalled();
  });
});
