import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";

import { extrusionDrops, gameLine, gameWidth } from "@/components/kit/game-text-box";
import { GAME_FONT, TONES, type GameSize, type Tone } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type GameTextProps = {
  text: string;
  size?: GameSize;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

// GF-16: celebration text in the style of the "2000" of photo IMG_2862: cream letters in the display
// face, a thick outline in the tone's face colour, and a block of the tone's deeper edge colour
// below. React Native text has no stroke, so the letters are SVG text, in a box sized from the
// face's own advance widths (game-text-box.ts). The outline is a stroke drawn under a second,
// unstroked copy, so it widens the letters and never thins them. A screen reader hears the text
// once, from the box, and none of the layers.
export function GameText({ text, size = "medium", tone = "gold", style }: GameTextProps) {
  const { colours } = useTheme();
  const line = gameLine(size);
  const paint = TONES[tone];
  const glyph = { x: line.outline, fontFamily: GAME_FONT, fontSize: line.fontSize, strokeLinejoin: "round" as const };
  const stroke = line.outline * 2;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[styles.box, { width: gameWidth(text, size), height: line.height }, style]}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        {extrusionDrops(line.outline, line.depth).map((drop) => (
          <SvgText key={drop} {...glyph} y={line.baseline + drop} fill={colours[paint.edge]} stroke={colours[paint.edge]} strokeWidth={stroke}>
            {text}
          </SvgText>
        ))}
        <SvgText {...glyph} y={line.baseline} fill={colours[paint.face]} stroke={colours[paint.face]} strokeWidth={stroke}>
          {text}
        </SvgText>
        <SvgText {...glyph} y={line.baseline} fill={colours.gameTextFill}>
          {text}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignSelf: "center" },
});
