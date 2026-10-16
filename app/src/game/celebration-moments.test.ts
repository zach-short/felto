import { describe, expect, it } from "vitest";

import { stateMoments } from "@/game/celebration-moments";
import { addDays, dayKey } from "@/game/day-key";
import { buyFreeze } from "@/game/freeze";
import { completeOnboarding } from "@/game/placement";
import { freshState, type PlayerState } from "@/game/player-state";
import { finishSession, type SessionResult } from "@/game/session";
import { resetProgress } from "@/game/settings";

// The test script sets TZ=America/New_York (BD-12), so these local times are New York times.
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);
const lesson = (right: number): SessionResult => ({ kind: "lesson", id: "hands-1", size: 10, answered: 10, right });

const today = at(2026, 10, 15);
const player = (fields: Partial<PlayerState> = {}): PlayerState => ({ ...freshState(at(2026, 10, 1)), onboarded: true, ...fields });
const withStreak = (length: number, lastDay: string | null, fields: Partial<PlayerState> = {}) =>
  player({ streak: { length, lastDay }, ...fields });
const yesterday = addDays(dayKey(today), -1);

describe("the moments the celebration layer plays (GF-24, GF-26)", () => {
  it("welcomes a player once onboarding ends, and never again", () => {
    const fresh = freshState(today);
    const onboarded = completeOnboarding(fresh);
    expect(stateMoments(fresh, onboarded, today)).toEqual([{ name: "welcome" }]);
    expect(stateMoments(onboarded, completeOnboarding(onboarded), today)).toEqual([]);
  });

  it("extends the streak for the first finish of a new day, and starts it at 1 for a first finish", () => {
    const first = player();
    expect(stateMoments(first, finishSession(first, lesson(0), today), today)).toEqual([{ name: "streak_extended", count: 1 }]);
    const alive = withStreak(4, yesterday);
    expect(stateMoments(alive, finishSession(alive, lesson(0), today), today)).toEqual([{ name: "streak_extended", count: 5 }]);
  });

  it("plays nothing for a second finish on the same day", () => {
    const once = finishSession(withStreak(4, yesterday), lesson(0), today);
    expect(stateMoments(once, finishSession(once, lesson(0), at(2026, 10, 15, 20)), at(2026, 10, 15, 20))).toEqual([]);
  });

  it("plays a milestone in place of the extension on a milestone day", () => {
    for (const mark of [3, 7, 14, 30, 50, 100, 365]) {
      const eve = withStreak(mark - 1, yesterday);
      expect(stateMoments(eve, finishSession(eve, lesson(0), today), today)).toEqual([{ name: "streak_milestone", count: mark }]);
    }
  });

  it("starts again at 1 after a break, which is no milestone", () => {
    const broken = withStreak(6, addDays(dayKey(today), -3));
    expect(stateMoments(broken, finishSession(broken, lesson(0), today), today)).toEqual([{ name: "streak_extended", count: 1 }]);
  });

  it("plays nothing when a freeze covers a missed day, though the streak's last day moves", () => {
    const missed = withStreak(1, addDays(dayKey(today), -2), { freezes: 1, gems: 10 });
    const outcome = buyFreeze(missed, today);
    if (!outcome.ok) throw new Error(outcome.reason);
    expect(outcome.state.streak.lastDay).toBe(yesterday);
    expect(stateMoments(missed, outcome.state, today)).toEqual([]);
  });

  it("does not count a finish from before midnight against the next day", () => {
    const eve = withStreak(2, addDays(yesterday, -1));
    const late = finishSession(eve, lesson(0), at(2026, 10, 14, 23));
    expect(late.streak).toEqual({ length: 3, lastDay: yesterday });
    expect(stateMoments(eve, late, today)).toEqual([]);
  });

  it("plays an XP milestone when the total passes one, and the higher of two passed at once", () => {
    const near = withStreak(1, dayKey(today), { xp: 200 });
    expect(stateMoments(near, finishSession(near, lesson(10), today), today)).toEqual([{ name: "xp_milestone", count: 250 }]);
    expect(stateMoments(player({ xp: 240 }), player({ xp: 510 }), today)).toEqual([{ name: "xp_milestone", count: 500 }]);
    expect(stateMoments(player({ xp: 250 }), player({ xp: 260 }), today)).toEqual([]);
  });

  it("plays the streak before the XP when one finish brings both", () => {
    const both = withStreak(6, yesterday, { xp: 950 });
    expect(stateMoments(both, finishSession(both, lesson(10), today), today)).toEqual([
      { name: "streak_milestone", count: 7 },
      { name: "xp_milestone", count: 1000 },
    ]);
  });

  it("celebrates nothing across a reset or a fixture, which is another player", () => {
    const veteran = withStreak(30, yesterday, { xp: 4000 });
    expect(stateMoments(veteran, resetProgress(veteran, today), today)).toEqual([]);
    const fixture = { ...freshState(at(2026, 10, 15, 9)), onboarded: true, xp: 6000, streak: { length: 7, lastDay: dayKey(today) } };
    expect(stateMoments(freshState(today), fixture, today)).toEqual([]);
  });
});
