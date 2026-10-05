import { ART_BOXES, type ArtName } from "@/art/sizes";

// The route names are the files of app/src/app/(tabs)/: Learn is index.tsx, which is "/"
export type TabRoute = "index" | "practice" | "profile";

export type TabItem = {
  route: TabRoute;
  label: string;
  art: ArtName;
};

// GF-18: the three tabs, in the order the bar draws them (DESIGN.md 10.3 and D21 of the app).
// Board item 52, part A, draws art the registry already has: the path node for the path, the card
// back the Practice tab already shows, and the XP bolt for the player's own numbers. Part B swaps
// each name for a tab icon drawn by tools/build_icons.py.
export const TAB_ITEMS: readonly TabItem[] = [
  { route: "index", label: "Learn", art: "node_available" },
  { route: "practice", label: "Practice", art: "card_back" },
  { route: "profile", label: "Profile", art: "xp_bolt" },
];

export function tabItemFor(route: string): TabItem | undefined {
  return TAB_ITEMS.find((item) => item.route === route);
}

// The width that fits a piece of art inside a square of this side. The tab icons have different
// shapes (a round node, a tall card), and each is drawn in the same square, so the three labels
// sit on one line.
export function fitWidth(art: ArtName, side: number): number {
  const box = ART_BOXES[art];
  return side * Math.min(1, box.width / box.height);
}

// The rule React Navigation's own bar keeps (expo-router's vendored bottom-tabs,
// views/BottomTabBar.js:262-271): a press on another tab moves to it unless a tabPress listener
// stopped it, and a press on the open tab stays where it is.
export function pressMoves(focused: boolean, prevented: boolean): boolean {
  return !focused && !prevented;
}

export type TabSpeech = {
  role: "tab" | "button";
  label: string;
};

// VoiceOver does not read the "tab" role as a tab, so React Navigation's own bar gives an iOS tab
// the button role and a label that says it is a tab and where it sits (vendored bottom-tabs,
// views/BottomTabItem.js:107-108 and views/BottomTabBar.js:281-285). This bar does the same;
// TalkBack reads the tab role and the selected state itself.
export function tabSpeech(label: string, index: number, count: number, os: string): TabSpeech {
  if (os !== "ios") return { role: "tab", label };
  return { role: "button", label: `${label}, tab, ${index + 1} of ${count}` };
}
