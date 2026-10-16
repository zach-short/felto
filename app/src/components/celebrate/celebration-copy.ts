import { CAST } from "@/content/cast";
import { DIALS } from "@/config/dials";
import type { AnswerMoment } from "@/game/answer-moment";
import type { StateMoment } from "@/game/celebration-moments";

export type LayerCopy = { title: string; line: string };

// GF-27 (Zach, 2026-10-15): the lines, in the warm register of D10. The number is part of the
// title, which GameText draws over the art (GF-21).
export function layerCopy(moment: StateMoment): LayerCopy {
  if (moment.name === "welcome") {
    return { title: "Welcome aboard!", line: `${CAST.fish}, ${CAST.squid} and ${CAST.shark} are glad you sat down.` };
  }
  if (moment.name === "xp_milestone") {
    return { title: `${grouped(moment.count)} XP!`, line: "Every right answer got you here." };
  }
  const title = `${grouped(moment.count)} day streak!`;
  if (moment.name === "streak_milestone") {
    return { title, line: `${moment.count} days in a row. ${CAST.fish} is proud of you.` };
  }
  return { title, line: "You came back. That is how it sticks." };
}

// GF-27: the out-of-lives screen's layer after a refill with gems
export const HEARTS_REFILLED: LayerCopy = { title: "Hearts full!", line: "Back to the table." };

// GF-27: the feedback sheet's heading, in place of "Nice read!"
export function sheetHeading(moment: AnswerMoment): string {
  if (moment === "royal_flush") return "Royal flush!";
  if (moment === "all_in_win") return "All in, and right!";
  return `${DIALS.hotStreakRun} in a row!`;
}

// Thousands with a comma, written out, so the title is the same on every phone whatever its locale
function grouped(count: number): string {
  return String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
