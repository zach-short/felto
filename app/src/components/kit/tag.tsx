import { StyleSheet, Text, View } from "react-native";

import { KIT, SPACE, TAG_PAINT, TYPE, type Tone } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type TagProps = {
  label: string;
  tone?: Tone;
};

// GF-10: a small pill for a word that marks something, "NEW" or "+20 XP". Its words are small, so
// its colours are the pairs of TAG_PAINT that reach 4.5 to 1. It is flat: the deep face it takes
// for blue, red and purple leaves no deeper colour for a raised edge. The caller writes the label
// as it is to be read; the tag changes no letter case, so a screen reader hears the same words.
export function Tag({ label, tone = "gold" }: TagProps) {
  const { colours } = useTheme();
  const paint = TAG_PAINT[tone];
  return (
    <View style={[styles.tag, { backgroundColor: colours[paint.face] }]}>
      <Text style={[styles.label, { color: colours[paint.ink] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: "flex-start", borderRadius: KIT.pillRadius, paddingHorizontal: SPACE.sm, paddingVertical: SPACE.xs },
  label: { fontSize: TYPE.caption, fontWeight: "800" },
});
