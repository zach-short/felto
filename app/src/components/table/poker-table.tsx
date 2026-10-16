import { StyleSheet, View } from "react-native";

import { CardArt } from "@/art/card-art";
import { cardCode } from "@/cards/card";
import { CARD_GAP, SPACE, TABLE } from "@/theme/tokens";

import { ActionBar } from "./action-bar";
import { TableFelt } from "./table-felt";
import { useTableHand } from "./use-table-hand";

type PokerTableProps = {
  seed: number;
  column: number;
};

// The table of the GTO trainer (PLAN.md phase 7): the felt with the six places, the player's two
// cards below it, large, and the options of the player's turn at the foot. It plays one hand from
// its seed; the session around it is item 44's.
export function PokerTable({ seed, column }: PokerTableProps) {
  const { view, choose } = useTableHand(seed);
  const player = view.seats[0];
  return (
    <View style={styles.table}>
      <View style={styles.felt}>
        <TableFelt view={view} column={column} />
      </View>
      <View style={styles.hole}>
        {player.cards?.map((card) => <CardArt key={cardCode(card)} card={cardCode(card)} width={column * TABLE.playerCard} />)}
      </View>
      <ActionBar turn={view.turn} alreadyIn={player.bet} onAct={choose} />
    </View>
  );
}

const styles = StyleSheet.create({
  // The felt takes the height left over and centres in it, so the buttons stay at the foot
  table: { flex: 1, gap: SPACE.md },
  felt: { flex: 1, justifyContent: "center" },
  hole: { flexDirection: "row", justifyContent: "center", gap: CARD_GAP },
});
