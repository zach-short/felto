import type { ArtName } from "@/art/sizes";
import type { CardCode, RankChar, Suit } from "@/cards/card";
import type { CastRole } from "@/content/cast";
import type { PathNode } from "@/game/path";

// The six poses every character has (tools/build_mascots.py:336-337)
export type Pose = "cheer" | "happy" | "sad" | "sleep" | "smug" | "think";

const SUIT_WORDS: Record<Suit, string> = { s: "spades", h: "hearts", d: "diamonds", c: "clubs" };

// The card code writes the ten as "T" so every code is two characters; the art files say "10"
export function cardArtName(code: CardCode): ArtName {
  const rank = code.charAt(0) as RankChar;
  const suit = code.charAt(1) as Suit;
  return `card_${rank === "T" ? "10" : rank}_${SUIT_WORDS[suit]}` as ArtName;
}

export function mascotArtName(character: CastRole, pose: Pose): ArtName {
  return `${character}_${pose}`;
}

// DESIGN.md 10.1, the table of node states. A current lesson draws node_current_base, and the app
// draws its arc (BD-9).
export function pathNodeArtName(node: PathNode): ArtName {
  if (node.status === "locked") return "node_locked";
  if (node.kind === "review") return "node_review";
  if (node.status === "complete") return "node_complete";
  return node.kind === "boss" ? "node_boss" : "node_current_base";
}
