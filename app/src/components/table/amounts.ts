import type { GtoAction } from "@/gto/key";
import { toBigBlinds } from "@/gto/table";
import type { Option } from "@/gto/turn";

// BD-T28: every amount on the table is in big blinds, as in the key and the review. The engine
// counts tenths of a big blind (gto/table.ts), so an amount has at most one decimal.
export function formatBb(chips: number): string {
  return String(toBigBlinds(chips));
}

// A net result with its sign, so a win and a loss read apart without a word: "+7.5", "-2.5", "0"
export function formatNet(chips: number): string {
  return chips > 0 ? `+${formatBb(chips)}` : formatBb(chips);
}

// BD-T29, the terse register Zach chose on 2026-10-16: the button names the action the review
// grades. A raise shows the seat's total after it, the way a raise is said ("raise to"); a call
// shows the chips it adds, which is what the player pays (BD-T30). Item 45 writes the final words.
const VERBS: Readonly<Record<Exclude<GtoAction, "fold" | "call">, string>> = {
  open: "Open",
  "3bet": "3-bet",
  "4bet": "4-bet",
  "5bet": "All in",
};

export function actionLabel(option: Option, alreadyIn: number): string {
  if (option.action === "fold") return "Fold";
  if (option.action === "call") return `Call ${formatBb(option.total - alreadyIn)}`;
  return `${VERBS[option.action]} ${formatBb(option.total)}`;
}
