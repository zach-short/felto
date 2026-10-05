// Every number the design leaves open (BD-14). Sources: docs/incomplete/app/DESIGN.md
// section 4, section 10.2 and section 10.7. A dial lives here and nowhere else.
export const DIALS = {
  // D7 and section 10.2
  tableSeats: 6,
  stackBigBlinds: 100,

  // Section 4 and D8
  maxLives: 5,
  lifeRegainHours: 4,
  lifeRefillGems: 20,
  exercisesPerLesson: 10,
  xpPerRightAnswer: 10,
  lessonsPerUnit: 5,
  bossDraw: 10,
  bossPassRight: 8,
  reviewMaxSize: 10,
  chestGems: 20,

  // D11: the streak reminder, local time on the phone
  reminderHour: 19,
  reminderMinute: 0,

  // D2 and section 10.2
  minIosVersion: "16.4",
  minAndroidApi: 24,

  // D15
  soundEffects: 6,
  soundMaxSeconds: 1,

  // D17: every screen draws in a centred column at most this wide, in points
  columnMaxWidth: 640,

  // D19
  freezePriceGems: 10,
  freezeMaxHeld: 2,

  // D21
  practiceXpPerRight: 5,
  practiceSetSize: 10,

  // D20
  placementSize: 10,
  placementPassRight: 8,
} as const;
