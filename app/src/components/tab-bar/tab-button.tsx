import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import { fitWidth, tabSpeech, type TabItem } from "@/components/tab-bar/tab-items";
import { DIALS } from "@/config/dials";
import { useHaptics } from "@/feedback/use-haptics";
import { useSound } from "@/feedback/use-sound";
import { MotionView } from "@/motion/motion-view";
import { usePressScale } from "@/motion/use-press-scale";
import { ART_SCALE, CHOICE_BORDER, MIN_STAT_ICON, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type TabButtonProps = {
  item: TabItem;
  index: number;
  count: number;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

// GF-18: one tab. The selected tab is raised: a face ringed in the accent, on an edge of a darker
// tone, as the primary button and the chosen answer row draw theirs (GF-2, BD-G27). A press
// shrinks the tab and sinks its face by the edge's height, with the press touch and sound of
// PrimaryButton, as the finger goes down. The resting tab keeps the same box in the bar's own
// colour, so choosing a tab moves nothing beside it.
export function TabButton({ item, index, count, selected, onPress, onLongPress }: TabButtonProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const buzz = useHaptics();
  const play = useSound();
  const { buttonStyle, faceStyle, press, release } = usePressScale(false);
  const speech = tabSpeech(item.label, index, count, Platform.OS);
  const pressIn = () => {
    press();
    buzz(DIALS.pressHaptic);
    play(DIALS.pressSound);
  };
  // Part A of board item 52 sizes the icon square as the stat bar sizes its icons; part B gives it
  // a token
  const side = Math.max(MIN_STAT_ICON, column * ART_SCALE.statIcon);
  const face = selected
    ? { borderColor: colours.accent, backgroundColor: colours.surface }
    : { borderColor: colours.page, backgroundColor: colours.page };
  return (
    <Pressable
      style={styles.slot}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={pressIn}
      onPressOut={release}
      accessibilityRole={speech.role}
      accessibilityLabel={speech.label}
      accessibilityState={{ selected }}
    >
      <MotionView style={[styles.tab, buttonStyle]}>
        {/* The face and its edge share this box, so the edge lines up under the face */}
        <View>
          {selected ? <View style={[styles.edge, { backgroundColor: colours.buttonEdge }]} /> : null}
          <MotionView style={[styles.face, face, faceStyle]}>
            <View style={[styles.icon, { width: side, height: side }]}>
              <Art name={item.art} width={fitWidth(item.art, side)} />
            </View>
            <Text numberOfLines={1} style={[styles.label, { color: selected ? colours.text : colours.textMuted }]}>
              {item.label}
            </Text>
          </MotionView>
        </View>
      </MotionView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  // The edge's own height is kept free under every tab, so the bar does not grow when one is raised
  tab: { paddingBottom: DIALS.buttonEdge, paddingHorizontal: SPACE.md },
  // The edge is a second face drawn lower by the dial, so only its bottom strip shows
  edge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: DIALS.buttonEdge,
    bottom: -DIALS.buttonEdge,
    borderRadius: RADIUS.md,
  },
  face: {
    alignItems: "center",
    gap: SPACE.xs,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.md,
    borderWidth: CHOICE_BORDER,
  },
  icon: { alignItems: "center", justifyContent: "center" },
  label: { fontSize: TYPE.caption, fontWeight: "800" },
});
