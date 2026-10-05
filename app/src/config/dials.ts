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

  // game-feel: every motion value (docs/incomplete/game-feel/PLAN.md section 3, BD-G1), so no
  // screen holds a raw number. Times in milliseconds, distances in points. Proposed values, to be
  // set on the phone.
  pressScale: 0.96,
  pressDownMs: 90,
  // The spring back after a press; a damping ratio under 1 lets it overshoot a little
  pressReleaseMs: 220,
  pressReleaseDamping: 0.55,
  buttonEdge: 4,
  bounceScale: 1.08,
  bounceMs: 280,
  shakeDistance: 6,
  shakeSwings: 3,
  shakeMs: 240,
  sheetRiseMs: 320,
  // Not in the plan's table: the fade-in of phase 1 needed a time, and 200 ms is short enough
  // not to delay a reading eye
  fadeMs: 200,
  idleBobDistance: 3,
  idleBobMs: 2400,
  particleCount: 24,
  particleMs: 900,
  // GF-8: what the phone's Reduce Motion setting skips. The press and fades stay, because no
  // screen needs motion to be understood and a press with no answer feels broken
  reducedMotionSkips: ["bounce", "shake", "tilt", "pulse", "bob", "particles"],
  // GF-3: the touch each kind of press gives, named from the vocabulary of feedback/haptics.ts
  selectHaptic: "selection",
  pressHaptic: "lightImpact",

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
