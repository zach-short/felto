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
  | "wrongSoft"
  // Game feel phase 1 (GF-2): the primary button's face, raised edge and label, and the same
  // three when it is disabled
  | "button"
  | "buttonEdge"
  | "buttonInk"
  | "buttonOff"
  | "buttonOffEdge"
  | "buttonOffInk"
  // GF-4: a colour for each unit, and one for each moment that fills a screen
  | "unitHands"
  | "unitTable"
  | "unitPreflop"
  | "unitOdds"
  | "momentFinish"
  | "momentChest"
  | "momentBossPass"
  | "momentBossFail"
  // Game feel second pass (board item 46, GF-10): the kit's tones, each a face and its raised
  // edge, the inks that read on a face and on a deep edge, the fill of GameText, a bubble's key
  // word, the scrim behind a dialog or sheet, the popover's white button and the switch's knob
  | "toneGold"
  | "toneGoldEdge"
  | "toneGreen"
  | "toneGreenEdge"
  | "toneBlue"
  | "toneBlueEdge"
  | "toneRed"
  | "toneRedEdge"
  | "tonePurple"
  | "tonePurpleEdge"
  | "inkOnTone"
  | "inkOnPale"
  | "inkOnDeep"
  | "gameTextFill"
  | "bubbleKey"
  | "scrim"
  | "popoverButton"
  | "popoverButtonEdge"
  | "switchKnob";

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
    // The raised edge is the art's own extrusion: each chip colour is a face and a darker tone
    // drawn down and to the right (tools/build_icons.py:35-40). White on this blue is 4.0 to 1,
    // which passes only as large text, so the label is TYPE.heading
    button: "#2F7BF0", // the blue chip's face, tools/build_icons.py:36
    buttonEdge: "#0F47B8", // its extrusion, tools/build_icons.py:36
    buttonInk: "#FFFFFF",
    buttonOff: "#DADFEA", // the locked node's face, tools/build_icons.py:250
    buttonOffEdge: "#A4ACC0", // its extrusion, tools/build_icons.py:250
    buttonOffInk: "#5C6178",
    // The chip faces, so a unit's colour is one the art already uses
    unitHands: "#2F7BF0", // blue, tools/build_icons.py:36
    unitTable: "#22B573", // green, tools/build_icons.py:37
    unitPreflop: "#E8252F", // red, tools/build_icons.py:35
    unitOdds: "#8A5BFF", // purple, tools/build_icons.py:40
    momentFinish: "#22B573", // green, tools/build_icons.py:37
    momentChest: "#FFC83A", // gold, tools/build_icons.py:39
    momentBossPass: "#8A5BFF", // the boss node's purple, tools/build_icons.py:251
    momentBossFail: "#3A4152", // the black chip, quiet on purpose, tools/build_icons.py:38
    // The kit's tones are the chip faces and their extrusions (tools/build_icons.py:35-40). Cream
    // reads on the blue, red and purple faces at 3.7 to 4.1 to 1, which passes only as large text;
    // the gold and green faces are too pale for it and take the ink of the art's lines
    toneGold: "#FFC83A", // tools/build_icons.py:39
    toneGoldEdge: "#C98F00", // tools/build_icons.py:39
    toneGreen: "#22B573", // tools/build_icons.py:37
    toneGreenEdge: "#0E7A4B", // tools/build_icons.py:37
    toneBlue: "#2F7BF0", // tools/build_icons.py:36
    toneBlueEdge: "#0F47B8", // tools/build_icons.py:36
    toneRed: "#E8252F", // tools/build_icons.py:35
    toneRedEdge: "#8E0F1A", // tools/build_icons.py:35
    tonePurple: "#8A5BFF", // tools/build_icons.py:40
    tonePurpleEdge: "#4F2FC4", // tools/build_icons.py:40
    inkOnTone: "#FBF4EA", // CREAM, tools/common.py:9
    inkOnPale: "#1B1B24", // INKL, tools/common.py:10
    // Small text needs 4.5 to 1, which cream reaches on the blue, red and purple edges (7.4 to 8.6)
    inkOnDeep: "#FBF4EA", // CREAM, tools/common.py:9
    // GF-16: the face of the 3D game text is the art's light glyph colour on every tone
    gameTextFill: "#FBF4EA", // CREAM, tools/common.py:9
    // The purple extrusion, 8.3 to 1 on the white surface
    bubbleKey: "#4F2FC4", // tools/build_icons.py:40
    scrim: "#1B1B2473", // INKL at 45 percent
    popoverButton: "#FFFFFF",
    popoverButtonEdge: "#C9CDE2", // SHADOW, tools/common.py:8
    switchKnob: "#FFFFFF",
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
    // On the dark page the faces take each chip's lighter highlight and the label goes dark
    // (6.1 to 1); the edge keeps the deep extrusion, which still reads against the page
    button: "#5A98F5", // the blue chip's highlight, tools/build_icons.py:36
    buttonEdge: "#0F47B8", // its extrusion, tools/build_icons.py:36
    buttonInk: "#141824",
    buttonOff: "#2E3447",
    buttonOffEdge: "#1B1F2B", // the black chip's extrusion, tools/build_icons.py:38
    buttonOffInk: "#A3A8BE",
    unitHands: "#5A98F5", // tools/build_icons.py:36
    unitTable: "#45CC8F", // tools/build_icons.py:37
    unitPreflop: "#F0414A", // tools/build_icons.py:35
    unitOdds: "#A583FF", // tools/build_icons.py:40
    // A screen-filling colour is the deep extrusion tone here, so a dark room is not lit up
    momentFinish: "#0E7A4B", // tools/build_icons.py:37
    momentChest: "#C98F00", // tools/build_icons.py:39
    momentBossPass: "#4F2FC4", // tools/build_icons.py:251
    momentBossFail: "#1B1F2B", // tools/build_icons.py:38
    // On the dark page a tone's face is its chip's lighter highlight and the edge keeps the deep
    // extrusion, as the button does; the dark ink reads on every face at 4.7 to 12.9 to 1
    toneGold: "#FFD968", // tools/build_icons.py:39
    toneGoldEdge: "#C98F00", // tools/build_icons.py:39
    toneGreen: "#45CC8F", // tools/build_icons.py:37
    toneGreenEdge: "#0E7A4B", // tools/build_icons.py:37
    toneBlue: "#5A98F5", // tools/build_icons.py:36
    toneBlueEdge: "#0F47B8", // tools/build_icons.py:36
    toneRed: "#F0414A", // tools/build_icons.py:35
    toneRedEdge: "#8E0F1A", // tools/build_icons.py:35
    tonePurple: "#A583FF", // tools/build_icons.py:40
    tonePurpleEdge: "#4F2FC4", // tools/build_icons.py:40
    inkOnTone: "#141824",
    inkOnPale: "#141824",
    // The edges keep their light values here, so cream reads on them as it does in light mode
    inkOnDeep: "#FBF4EA", // CREAM, tools/common.py:9
    gameTextFill: "#FBF4EA", // CREAM, tools/common.py:9
    // The purple highlight, 5.4 to 1 on the dark surface
    bubbleKey: "#A583FF", // tools/build_icons.py:40
    scrim: "#000000A6",
    popoverButton: "#FFFFFF",
    popoverButtonEdge: "#C9CDE2", // SHADOW, tools/common.py:8
    switchKnob: "#FBF4EA", // CREAM, tools/common.py:9
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

// GF-2: the primary button's face. Its raised edge is the dial buttonEdge, because the face moves
// by exactly that much when pressed
export const BUTTON_HEIGHT = 52;

// Game feel phase 4 (board item 29): the lesson's progress bar, a rounded track with a fill, drawn
// the same on both platforms in place of the native pair, and the feedback sheet's top corners
export const PROGRESS_HEIGHT = 14;
export const SHEET_RADIUS = 24;

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

// Game feel second pass (board item 46, GF-10 and GF-16): the kit. GameText comes in three sizes,
// each with the thickness of its outline and the depth of its extrusion below the letters
export const GAME_TEXT = {
  small: { size: 28, outline: 3, depth: 3 },
  medium: { size: 44, outline: 4, depth: 5 },
  large: { size: 72, outline: 6, depth: 7 },
} as const;

export type GameSize = keyof typeof GAME_TEXT;

// D14 and registry entry Z3: the bundled Nunito ExtraBold, under the family name in the file
export const GAME_FONT = "FeltoRank";

// One tone per use of a kit piece (GF-16: gold, green or a unit's colour): its face, its raised
// edge, the ink that reads on the face, and the colour its words take on a white button. Cream on
// the blue, red and purple faces is 3.7 to 4.1 to 1 in light mode, so text on a face is large text
// (TYPE.heading, bold) or it moves to TAG_PAINT. On white, gold and the faces are too pale for
// words (1.5 to 4.4), so the label is the dark ink for gold and the deep edge for the rest (5.4 to
// 9.4)
export type Tone = "gold" | "green" | "blue" | "red" | "purple";

type TonePaint = { face: ColourName; edge: ColourName; ink: ColourName; label: ColourName };

export const TONES: Record<Tone, TonePaint> = {
  gold: { face: "toneGold", edge: "toneGoldEdge", ink: "inkOnPale", label: "inkOnPale" },
  green: { face: "toneGreen", edge: "toneGreenEdge", ink: "inkOnPale", label: "toneGreenEdge" },
  blue: { face: "toneBlue", edge: "toneBlueEdge", ink: "inkOnTone", label: "toneBlueEdge" },
  red: { face: "toneRed", edge: "toneRedEdge", ink: "inkOnTone", label: "toneRedEdge" },
  purple: { face: "tonePurple", edge: "tonePurpleEdge", ink: "inkOnTone", label: "tonePurpleEdge" },
};

// A tag's words are small, so they need 4.5 to 1: gold and green keep their face with the dark ink
// (6.5 to 13 to 1); blue, red and purple take their deep edge as the face, with cream (7.4 to 8.6)
export const TAG_PAINT: Record<Tone, { face: ColourName; ink: ColourName }> = {
  gold: { face: "toneGold", ink: "inkOnPale" },
  green: { face: "toneGreen", ink: "inkOnPale" },
  blue: { face: "toneBlueEdge", ink: "inkOnDeep" },
  red: { face: "toneRedEdge", ink: "inkOnDeep" },
  purple: { face: "tonePurpleEdge", ink: "inkOnDeep" },
};

// The kit's sizes, in points: a bubble's border, the side of the square its tail is cut from and
// the popover's arrow; the raised edge under a popover card and a dialog; the switch's track and knob;
// the widest a popover card and a dialog grow on a tablet; and a plain rolling number's line
// height as a share of its font size
export const KIT = {
  border: 2,
  tail: 14,
  arrow: 16,
  cardEdge: 4,
  pillRadius: 999,
  switchWidth: 56,
  switchHeight: 32,
  switchKnob: 24,
  switchEdge: 3,
  popoverMaxWidth: 340,
  dialogMaxWidth: 420,
  numberLine: 1.25,
} as const;
