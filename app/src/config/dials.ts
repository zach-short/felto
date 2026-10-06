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
  // Temporary, for building with no users and no release: a wrong answer costs no heart and
  // nothing closes at 0. Set it to false, or delete it with its two checks in game/lives.ts,
  // before any build that real players get.
  devUnlimitedLives: true,
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
  // screen needs motion to be understood and a press with no answer feels broken. Board item 46
  // adds the kit's flourishes: a number's roll and a bubble's typing (each then shows its end at
  // once) and a popover's or dialog's spring (it then fades in)
  reducedMotionSkips: ["bounce", "shake", "tilt", "pulse", "bob", "particles", "swim", "roll", "typing", "pop"],
  // Board item 34: how long the rigged Flop idles before it darts, so the screen's own entrance
  // finishes first
  flopPerfectDelayMs: 300,
  // GF-3: the touch each kind of press gives, named from the vocabulary of feedback/haptics.ts
  selectHaptic: "selection",
  pressHaptic: "lightImpact",
  // GF-5: the effect a press plays, named from art/sounds.ts, so a name that is not an effect fails
  // the typecheck where it is played (the reason of BD-G18)
  pressSound: "tap",
  // Game feel phase 4, the answer loop (board item 29). Values the plan's table does not give are
  // proposed here, to be set on the phone. A choice row rests on an edge of its border colour, and
  // the chosen row's face rises by chooseLift above it
  choiceEdge: 4,
  chooseLift: 3,
  liftMs: 120,
  // The right answer's row flashes the right colour over its face, and fades back
  flashOpacity: 0.35,
  flashMs: 320,
  // The host tilts its head on a wrong answer: out, a smaller swing back, then rest
  tiltDegrees: 8,
  tiltMs: 360,
  // The heart in the header drops and shrinks for a moment when a heart is lost
  heartDropDistance: 6,
  heartDropScale: 0.8,
  heartDropMs: 300,
  // A damping ratio of 1 or more stops the sheet's spring from overshooting its resting place
  sheetRiseDamping: 1,
  progressFillMs: 300,
  // The touch and the effect of choosing an option, and the effect of a lost heart (GF-3, GF-5)
  selectSound: "option_select",
  heartSound: "heart_lost",

  // game-feel second pass (board item 46, DESIGN.md GF-10, GF-11, GF-15 to GF-17): the kit's
  // motion. Proposed values, to be set on the phone. A rolling number turns every digit to its new
  // value in this time (GF-15)
  rollMs: 600,
  // A speech bubble types its line at one character per this many milliseconds (GF-11)
  typeCharMs: 30,
  // A popover and a dialog spring in from this share of their size; a ratio under 1 overshoots
  popFromScale: 0.6,
  popMs: 360,
  popDamping: 0.6,
  // The twinkling stars of a box (GF-17): how many, the largest in points, one twinkle's period,
  // and the share of its size a star shrinks to as it fades. A burst's stars fly this far from the
  // middle; their count and time are particleCount and particleMs above
  sparkleCount: 6,
  sparkleSize: 16,
  sparklePeriodMs: 1800,
  sparkleMinScale: 0.4,
  burstDistance: 64,
  // A switch's knob slides across in this time, and a flip gives the touch and the effect of a
  // choice (GF-3, GF-5)
  switchSlideMs: 160,
  switchHaptic: "selection",
  switchSound: "option_select",

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

  // unit-stories: the unit story (docs/incomplete/unit-stories/DESIGN.md US-6 and US-7). A tap
  // left of this share of the screen width goes back a slide, and a tap right of it goes forward.
  storyBackZone: 0.3,
  // The most words in a slide's body: "about 30", read at a glance
  storyWordsPerSlide: 30,
  storySlidesPerUnit: { min: 6, max: 8 },
  // US-1 and US-3 (docs/incomplete/unit-stories/DESIGN.md): the lessons that deal fresh hands
  // into their drill slots each time they open
  dealtLessons: ["hands-3", "hands-5"],
} as const;
