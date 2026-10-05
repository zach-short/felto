// Every colour and size the app uses (BD-14, rule U5). Each colour has a light and a dark
// value because the app follows the phone's appearance (D16). A colour copied from the art
// cites the generator line it came from.

export type ColourName =
  | "page"
  | "text"
  | "textMuted"
  | "artShadow"
  | "artTrack"
  | "accent"
  | "ringArc"
  | "surface"
  // Phase 9: the answer choices and the feedback of the lesson
  | "line"
  | "right"
  | "rightSoft"
  | "wrong"
  | "wrongSoft";

export type Scheme = "light" | "dark";

export const COLOURS: Record<Scheme, Record<ColourName, string>> = {
  light: {
    page: "#F4F5FA",
    text: "#1B1B24", // INKL, tools/common.py:10
    textMuted: "#5C6178",
    // The art's own values, unchanged in light mode: SHADOW, tools/common.py:8, and the
    // ring track, tools/build_icons.py:272. BD-25 swaps both at import.
    artShadow: "#C9CDE2",
    artTrack: "#DDE1EC",
    accent: "#2F7BF0", // the current node's face, tools/build_icons.py:248
    ringArc: "#FFC83A", // the ring_progress stroke, tools/build_icons.py:275
    surface: "#FFFFFF",
    line: "#D8DCE8",
    right: "#1E9E5A",
    rightSoft: "#E3F6EA",
    wrong: "#D9443B",
    wrongSoft: "#FCE6E4",
  },
  dark: {
    page: "#141824",
    text: "#FBF4EA", // CREAM, tools/common.py:9
    textMuted: "#A3A8BE",
    // A pale shadow vanishes on a dark page (D16), so in dark mode the hard shadow is a
    // tone below the page and the ring track a tone above it.
    artShadow: "#0A0D16",
    artTrack: "#2A3042",
    accent: "#5B9BFF",
    // The arc keeps the art's gold in both modes: it reads on the dark ring track as it does on
    // the light one.
    ringArc: "#FFC83A",
    surface: "#1E2333",
    line: "#2E3447",
    right: "#4CD38A",
    rightSoft: "#173526",
    wrong: "#FF6B61",
    wrongSoft: "#3D1F22",
  },
};

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const TYPE = {
  title: 28,
  heading: 20,
  body: 17,
  stat: 17,
  caption: 13,
} as const;

// Line heights: body text that wraps over several lines gets a little air between them
export const LINE_HEIGHT = {
  body: TYPE.body * 1.35,
} as const;

export const RADIUS = {
  md: 14,
} as const;

// DESIGN.md 10.1: a chest is drawn faded until its boss is passed
export const OPACITY = {
  faded: 0.35,
  // Phase 9: an answer choice while a finger is on it
  pressed: 0.7,
} as const;

// BD-27: art sizes are fractions of the column width, so a phone and a tablet draw the
// same layout at different scales.
export const ART_SCALE = {
  card: 0.3,
  node: 0.42,
  mascot: 0.5,
  icon: 0.16,
  // Phase 8: the path and the stat bar. pathNode is the 270 square every node draws in.
  pathNode: 0.3,
  pathSwing: 0.2,
  pathMascot: 0.3,
  chest: 0.11,
  statIcon: 0.075,
  // Phase 9: the lesson. A card is at most this share of the column; a row of five shrinks to fit.
  lessonCard: 0.2,
  lessonMascot: 0.2,
  sheetMascot: 0.28,
  finishMascot: 0.45,
  finishIcon: 0.09,
  // Phase 10: the chest modal draws the chest and the gem large, and the squid beside them
  chestReveal: 0.42,
  gemReveal: 0.2,
  chestMascot: 0.3,
  livesMascot: 0.28,
  // Phase 15: the card back or the lock beside each kind on the Practice tab
  practiceIcon: 0.1,
  // Phase 16: the fish large on the welcome, and each of the cast beside its name
  welcomeMascot: 0.55,
  castMascot: 0.26,
} as const;

// The gap between two cards in a row, and the line around an answer choice
export const CARD_GAP = 6;
export const CHOICE_BORDER = 2;
// The thin line around a number tile, and the narrowest such tile (phase 9, the odds kinds)
export const TILE_BORDER = 1;
export const TILE_MIN_WIDTH = 64;

// The stat bar icons stay at least this many points wide, so on a narrow phone their hard
// shadow keeps a visible offset (PLAN.md phase 8, watch-for).
export const MIN_STAT_ICON = 24;
