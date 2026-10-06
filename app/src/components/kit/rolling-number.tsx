import { StyleSheet, Text, View } from "react-native";

import { digitCellWidth, gameLine, plainDigitWidth } from "@/components/kit/game-text-box";
import { GameText } from "@/components/kit/game-text";
import { digitsOf, rollColumns, type RollColumn } from "@/components/kit/roll-steps";
import { useRollFrom } from "@/components/kit/use-roll-from";
import { MotionView } from "@/motion/motion-view";
import { useRoll } from "@/motion/use-roll";
import { GAME_FONT, KIT, TYPE, type GameSize, type Tone } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type Look = { game: { size: GameSize; tone: Tone } } | { plainSize: number };

type RollingNumberProps = {
  value: number;
  // Game text in a size and a tone, or plain text at a size from TYPE (TYPE.stat when not given)
  look?: Look;
};

// A digit's box, and how far it laps over its neighbours: in game text a column overlaps the next by
// one outline, so the digits sit as close as the letters of GameText and no outline covers a face
type Cell = { width: number; height: number; overlap: number };

// GF-15: an odometer. Each digit rolls to its new value, up through 9 to 0 when the number grows and
// down when it shrinks, over the dial's time (roll-steps.ts). Every digit is drawn in the display
// face, whose digits are all one width, so the number never shifts sideways as it rolls. A screen
// reader hears the new value, once, and never the digits on their way.
export function RollingNumber({ value, look = { plainSize: TYPE.stat } }: RollingNumberProps) {
  const roll = useRollFrom(value);
  const columns = rollColumns(roll.from, roll.to);
  const cell = cellOf(look);
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={digitsOf(value)} style={styles.row}>
      {columns.map((column, i) => (
        <RollColumnView key={`${roll.change}-${columns.length - i}`} column={column} cell={cell} look={look} />
      ))}
    </View>
  );
}

function cellOf(look: Look): Cell {
  if ("game" in look) {
    const line = gameLine(look.game.size);
    return { width: digitCellWidth(look.game.size), height: line.height, overlap: line.outline };
  }
  return { width: plainDigitWidth(look.plainSize), height: look.plainSize * KIT.numberLine, overlap: 0 };
}

function RollColumnView({ column, cell, look }: { column: RollColumn; cell: Cell; look: Look }) {
  const strip = useRoll(column.from, column.to, cell.height);
  const box = { width: cell.width, height: cell.height };
  return (
    <View style={[styles.column, box, { marginHorizontal: -cell.overlap / 2 }]}>
      <MotionView style={strip}>
        {column.strip.map((glyph, i) => (
          <View key={i} style={box}>
            <Glyph glyph={glyph} cell={cell} look={look} />
          </View>
        ))}
      </MotionView>
    </View>
  );
}

function Glyph({ glyph, cell, look }: { glyph: string; cell: Cell; look: Look }) {
  const { colours } = useTheme();
  if ("game" in look) return <GameText text={glyph} size={look.game.size} tone={look.game.tone} />;
  const plain = { fontFamily: GAME_FONT, fontSize: look.plainSize, lineHeight: cell.height, color: colours.text };
  return <Text style={[styles.plain, plain]}>{glyph}</Text>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignSelf: "center" },
  column: { overflow: "hidden" },
  plain: { textAlign: "center" },
});
