import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import { CardArt } from "@/art/card-art";
import { cardCode } from "@/cards/card";
import { MotionView } from "@/motion/motion-view";
import { useFadeIn } from "@/motion/use-fade-in";
import { CARD_GAP, KIT, SPACE, TABLE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

import { formatBb } from "./amounts";
import { TableSeat } from "./table-seat";
import type { SeatView, TableView } from "./table-view";

type Point = { x: number; y: number };

type TableFeltProps = {
  view: TableView;
  column: number;
};

// The oval table, as wide as the column, with every place drawn at its point of TABLE.places, the
// bets between the seats and the centre, and the pot with the board at the centre (BD-T5).
export function TableFelt({ view, column }: TableFeltProps) {
  const { colours } = useTheme();
  const height = column * TABLE.feltHeight;
  const playerNet = view.result === null ? null : (view.seats[0].net ?? 0);
  return (
    <View style={{ width: column, height }}>
      <View style={[styles.felt, { backgroundColor: colours.felt, borderColor: colours.feltRail }]} />
      <Centred at={TABLE.centre} column={column} height={height}>
        <PotAndBoard view={view} column={column} />
      </Centred>
      {view.seats.map((seat) =>
        seat.bet > 0 ? (
          <Centred key={`bet-${seat.place}`} at={betPoint(seat)} column={column} height={height}>
            <Chips chips={seat.bet} column={column} onRight={TABLE.places[seat.place].x > TABLE.centre.x} />
          </Centred>
        ) : null,
      )}
      {view.seats.map((seat) => (
        <Centred key={seat.place} at={TABLE.places[seat.place]} column={column} height={height}>
          <TableSeat seat={seat} column={column} playerNet={playerNet} />
        </Centred>
      ))}
    </View>
  );
}

// A seat's bet sits a share of the way from its place to the centre of the table
function betPoint(seat: SeatView): Point {
  const from = TABLE.places[seat.place];
  const share = TABLE.betShare;
  return { x: from.x + (TABLE.centre.x - from.x) * share, y: from.y + (TABLE.centre.y - from.y) * share };
}

// Centres its child on a point of the felt without measuring it: a box as wide as the column and
// as tall as the felt, centred on the point, centres what it holds.
function Centred({ at, column, height, children }: { at: Point; column: number; height: number; children: ReactNode }) {
  const box = { left: at.x * column - column / 2, top: at.y * height - height / 2, width: column, height };
  return (
    <View style={[styles.centred, box]} pointerEvents="box-none">
      {children}
    </View>
  );
}

// A bet on the right of the table puts its amount on the side toward the centre, away from the seat
function Chips({ chips, column, onRight }: { chips: number; column: number; onRight: boolean }) {
  const { colours } = useTheme();
  return (
    <View style={[styles.chips, onRight && styles.reversed]}>
      <Art name="chip_red" width={column * TABLE.betChip} />
      <Text style={[styles.amount, { color: colours.inkOnFelt }]}>{formatBb(chips)}</Text>
    </View>
  );
}

function PotAndBoard({ view, column }: { view: TableView; column: number }) {
  const { colours } = useTheme();
  return (
    <View style={styles.centre}>
      <View style={styles.chips} accessible accessibilityLabel={formatBb(view.pot)}>
        <Art name="chip_stack_gold" width={column * TABLE.potChip} />
        <Text style={[styles.pot, { color: colours.inkOnFelt }]}>{formatBb(view.pot)}</Text>
      </View>
      {view.board.length > 0 ? <Board view={view} column={column} /> : null}
    </View>
  );
}

function Board({ view, column }: { view: TableView; column: number }) {
  const fade = useFadeIn();
  return (
    <MotionView style={[styles.board, fade]}>
      {view.board.map((card) => <CardArt key={cardCode(card)} card={cardCode(card)} width={column * TABLE.boardCard} />)}
    </MotionView>
  );
}

const styles = StyleSheet.create({
  felt: { position: "absolute", left: TABLE.feltInset.x, right: TABLE.feltInset.x, top: TABLE.feltInset.y, bottom: TABLE.feltInset.y, borderRadius: KIT.pillRadius, borderWidth: TABLE.railWidth },
  centred: { position: "absolute", alignItems: "center", justifyContent: "center" },
  chips: { flexDirection: "row", alignItems: "center", gap: SPACE.xs },
  reversed: { flexDirection: "row-reverse" },
  amount: { fontSize: TYPE.caption, fontWeight: "800" },
  centre: { alignItems: "center", gap: SPACE.sm },
  pot: { fontSize: TYPE.body, fontWeight: "800" },
  board: { flexDirection: "row", gap: CARD_GAP / 2 },
});
