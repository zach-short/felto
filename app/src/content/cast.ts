// The mascot names of `DESIGN.md` D18 (accepted 2026-10-05) live here and nowhere else, so all
// copy reads them from this module (`PLAN.md`, BD-28). The roles are D9's: the fish guides
// lessons, the squid runs the review and the chest, the shark is the boss.
//
// Three strings in `units/` (two explanations, one prompt) pun on these names ("Flop the fish
// is named for it"): a rename here also needs those lines rewritten.
// `grep -n CAST src/content/units` finds them.
export type CastRole = "fish" | "squid" | "shark";

export const CAST: Readonly<Record<CastRole, string>> = {
  fish: "Flop",
  squid: "Kicker",
  shark: "Ace",
};
