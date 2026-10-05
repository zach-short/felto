import { hasDuplicate, type Card } from "./card";
import { unseenCards } from "./deck";
import { categoryRank, evaluate, type HandCategory } from "./evaluate";

// An out is an unseen card that, dealt next, gives the player a hand of the named target or
// better. "Unseen" is every card not in the player's hole cards or on the board: the counter
// knows nothing of other players' cards, as the player does not. It counts one card only, the
// next one, which is how unit 4 counts outs before the rule of 2 and 4 (`DESIGN.md` D7).
//
// It does not ask whether the out also helps another player (a fourth heart on the board), and
// it counts a card that jumps past the target (a full house when the target is a flush). An
// exercise that wants either reading says so in its own text.
export function makesTarget(cards: readonly Card[], target: HandCategory): boolean {
  return categoryRank(evaluate(cards).category) >= categoryRank(target);
}

export function outsTo(hole: readonly Card[], board: readonly Card[], target: HandCategory): Card[] {
  if (hole.length !== 2) throw new Error(`a player holds two hole cards, not ${hole.length}`);
  if (board.length !== 3 && board.length !== 4) {
    throw new Error(`outs are counted on the flop or the turn, not on a board of ${board.length}`);
  }
  const known = [...hole, ...board];
  if (hasDuplicate(known)) throw new Error("the hole cards and the board share a card");
  return unseenCards(known).filter((card) => makesTarget([...known, card], target));
}
