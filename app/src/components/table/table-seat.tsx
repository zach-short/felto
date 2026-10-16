import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import { CardArt } from "@/art/card-art";
import { Mascot } from "@/art/mascot";
import { cardCode } from "@/cards/card";
import { CAST } from "@/content/cast";
import { Tag } from "@/components/kit/tag";
import { MotionView } from "@/motion/motion-view";
import { useFadeIn } from "@/motion/use-fade-in";
import { CARD_GAP, KIT, OPACITY, RADIUS, SPACE, TABLE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

import { formatBb, formatNet } from "./amounts";
import type { Occupant } from "./seat-places";
import { castPose, type SeatView } from "./table-view";

type TableSeatProps = {
  seat: SeatView;
  column: number;
  // The player's result, which the cast react to once the hand is over
  playerNet: number | null;
};

// One place at the table: who sits there, the seat's position, the button marker and the stack,
// and once the hand is over what the seat won or lost. A bot's cards show over it at a showdown.
export function TableSeat({ seat, column, playerNet }: TableSeatProps) {
  const faded = seat.folded && seat.net === null;
  return (
    <View style={[styles.seat, { width: column * TABLE.seatWidth }, faded && styles.faded]}>
      {seat.occupant ? <Avatar occupant={seat.occupant} column={column} pose={castPose(seat.folded, playerNet)} /> : null}
      {seat.place !== 0 && seat.cards ? <ShownCards seat={seat} column={column} /> : null}
      <SeatPill seat={seat} column={column} />
      {seat.net !== null && seat.net !== 0 ? <NetTag net={seat.net} /> : null}
    </View>
  );
}

function Avatar({ occupant, column, pose }: { occupant: Occupant; column: number; pose: ReturnType<typeof castPose> }) {
  const width = column * TABLE.seatMascot;
  if (occupant.kind === "cast") return <Mascot character={occupant.role} pose={pose} width={width} />;
  return (
    <View style={styles.standIn}>
      <Art name="chip_stack_black" width={width} />
      <View style={styles.standInNumber}>
        <Tag label={String(occupant.number)} tone="purple" />
      </View>
    </View>
  );
}

// BD-T5: a bot's two cards, face up, over its avatar at a showdown it is in
function ShownCards({ seat, column }: { seat: SeatView; column: number }) {
  const fade = useFadeIn();
  return (
    <MotionView style={[styles.shown, fade]}>
      {seat.cards?.map((card) => <CardArt key={cardCode(card)} card={cardCode(card)} width={column * TABLE.shownCard} />)}
    </MotionView>
  );
}

function SeatPill({ seat, column }: { seat: SeatView; column: number }) {
  const { colours } = useTheme();
  const name = seat.occupant?.kind === "cast" ? `${CAST[seat.occupant.role]}, ` : "";
  const label = `${name}${seat.seat}, ${formatBb(seat.stack)}`;
  const ring = seat.toAct ? colours.accent : colours.line;
  return (
    <View style={[styles.pill, { backgroundColor: colours.surface, borderColor: ring }]} accessible accessibilityLabel={label}>
      <View style={styles.position}>
        {seat.button ? <Art name="chip_gold" width={column * TABLE.marker} /> : null}
        <Text style={[styles.positionText, { color: colours.text }]}>{seat.seat}</Text>
      </View>
      <Text style={[styles.stack, { color: colours.textMuted }]}>{formatBb(seat.stack)}</Text>
    </View>
  );
}

function NetTag({ net }: { net: number }) {
  const fade = useFadeIn();
  return (
    <MotionView style={[styles.net, fade]}>
      <Tag label={formatNet(net)} tone={net > 0 ? "green" : "red"} />
    </MotionView>
  );
}

const styles = StyleSheet.create({
  seat: { alignItems: "center" },
  faded: { opacity: OPACITY.faded },
  standIn: { alignItems: "center" },
  standInNumber: { position: "absolute", right: -SPACE.xs, top: -SPACE.xs },
  shown: { position: "absolute", top: 0, flexDirection: "row", gap: CARD_GAP / 2, zIndex: 1 },
  pill: { alignItems: "center", alignSelf: "stretch", borderRadius: RADIUS.md, borderWidth: KIT.border, paddingVertical: SPACE.xs / 2 },
  position: { flexDirection: "row", alignItems: "center", gap: SPACE.xs / 2 },
  positionText: { fontSize: TYPE.caption, fontWeight: "800" },
  stack: { fontSize: TYPE.caption, fontWeight: "700" },
  net: { marginTop: SPACE.xs / 2 },
});
