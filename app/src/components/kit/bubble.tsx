import { Pressable, StyleSheet, Text, View } from "react-native";

import { tailPlace, type TailSide } from "@/components/kit/tail-place";
import { lineLength, parseLine, plainLine, typedParts } from "@/components/kit/typing-steps";
import { useTyping } from "@/components/kit/use-typing";
import { KIT, LINE_HEIGHT, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type BubbleProps = {
  // The line, with each key word between asterisks: "Two cards of one rank make a *pair*."
  line: string;
  // The side the tail points from, toward whoever speaks
  tail?: TailSide;
  // True while the line types, false once it is whole (GF-11, GF-19)
  onTalking?: (talking: boolean) => void;
};

// GF-11: a mascot's speech bubble (photo IMG_2865): the surface with a border, a tail on any side,
// and the key word in its own colour. The line types out at the dial's speed, and a tap shows the
// rest at once. A screen reader hears the whole line at once, whatever has typed. A new line is a
// new bubble: the body is keyed by the line, so it types again from the start.
export function Bubble(props: BubbleProps) {
  return <BubbleBody key={props.line} {...props} />;
}

function BubbleBody({ line, tail = "left", onTalking }: BubbleProps) {
  const { colours } = useTheme();
  const parts = parseLine(line);
  const { count, finish } = useTyping(lineLength(parts), onTalking);
  const outline = { backgroundColor: colours.surface, borderColor: colours.line };
  return (
    <Pressable onPress={finish} accessible accessibilityRole="text" accessibilityLabel={plainLine(parts)} style={[styles.bubble, outline]}>
      <Text style={[styles.text, { color: colours.text }]}>
        {typedParts(parts, count).map((part, i) => (
          <Text key={i} style={[part.key && styles.key, { color: part.shown ? (part.key ? colours.bubbleKey : colours.text) : "transparent" }]}>
            {part.text}
          </Text>
        ))}
      </Text>
      {/* Drawn last, so it covers the bubble's own border where the tail joins it */}
      <View style={[styles.tail, tailPlace(tail, KIT.tail, KIT.border), outline]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bubble: { borderWidth: KIT.border, borderRadius: RADIUS.md, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm },
  text: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body, fontWeight: "600" },
  key: { fontWeight: "800" },
  tail: { position: "absolute", width: KIT.tail, height: KIT.tail, transform: [{ rotate: "45deg" }] },
});
