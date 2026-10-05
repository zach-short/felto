import { CAST, type CastRole } from "@/content/cast";
import { OUTLINE } from "@/content/outline";
import { DIALS } from "@/config/dials";

// Every line of the first launch (D20) in D10's warm register, with the names from the cast
// (BD-28). Pure, so a test can read the copy without a phone.
export const WELCOME = {
  title: `Hi, I am ${CAST.fish}!`,
  line: "I will teach you poker, one short lesson at a time. No money on the table, just good reads.",
  button: "Nice to meet you",
} as const;

export const CAST_PAGE = {
  title: "Meet the table",
  line: "Three friends will play every hand with you.",
  button: "Deal me in",
} as const;

// D9: the fish guides lessons, the squid runs the review and the chest (and Practice, D21), the
// shark is the boss
export const CAST_ROWS: readonly { role: CastRole; name: string; job: string }[] = [
  { role: "fish", name: CAST.fish, job: `Your guide. ${CAST.fish} walks you through every lesson.` },
  { role: "squid", name: CAST.squid, job: `The dealer. ${CAST.squid} runs your reviews, deals practice hands and opens the chests.` },
  { role: "shark", name: CAST.shark, job: `The boss. Beat ${CAST.shark} at the end of each unit.` },
];

export const LEVEL_PAGE = {
  title: "How much poker do you know?",
  line: `Know the basics already? A quick check of ${DIALS.placementSize} questions can skip you past units 1 and 2. No hearts, no pressure.`,
  newButton: "I am new",
  basicsButton: "I know the basics",
} as const;

export type PlacementCopy = { title: string; line: string };

// D20: 8 right places past units 1 and 2 and opens unit 3, without their chests; fewer starts at
// unit 1. Either way the player goes on to the path.
export function placementCopy(passed: boolean, right: number, size: number): PlacementCopy {
  const opened = OUTLINE[2];
  if (passed) {
    return {
      title: "You know your stuff!",
      line: `${right} of ${size} right. Units 1 and 2 are done, and unit 3, ${opened.title}, is open. Beat ${CAST.shark} in units 1 and 2 any time to win their chests.`,
    };
  }
  return {
    title: "Unit 1 it is!",
    line: `${right} of ${size} right. You need ${DIALS.placementPassRight} to skip ahead, so you start at unit 1. ${CAST.fish} will get you to unit 3 in no time.`,
  };
}

export const PLACEMENT_BUTTON = "Go to the path";
