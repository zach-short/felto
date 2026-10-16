import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { CelebrationName } from "@/art/celebrations";
import { PrimaryButton } from "@/components/button/primary-button";
import type { LayerCopy } from "@/components/celebrate/celebration-copy";
import { CelebrationDisc } from "@/components/celebrate/celebration-disc";
import { GameText } from "@/components/kit/game-text";
import { gameWidth } from "@/components/kit/game-text-box";
import { useBackClose } from "@/components/kit/use-back-close";
import { useSheetFocus } from "@/components/lesson/use-sheet-focus";
import { DIALS } from "@/config/dials";
import { useHaptics } from "@/feedback/use-haptics";
import { useSound } from "@/feedback/use-sound";
import { MotionView } from "@/motion/motion-view";
import { useFadeIn } from "@/motion/use-fade-in";
import { ART_SCALE, LINE_HEIGHT, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type CelebrationLayerProps = { name: CelebrationName; copy: LayerCopy; onContinue: () => void };

// GF-24: one celebration, full screen over the tabs, or over the path after a refill: the art, its
// title in GameText with the number in it (GF-21), the line, and Continue. A screen reader is moved
// to the line, which carries the title too, and kept on the layer; the reader's escape gesture and
// Android's back button press Continue, as GameDialog's do for its cancel. The title shrinks to the
// small size when the medium one would run past the column, as "100 day streak!" does on a narrow
// phone.
export function CelebrationLayer({ name, copy, onContinue }: CelebrationLayerProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const insets = useSafeAreaInsets();
  const fade = useFadeIn();
  const heading = useSheetFocus(true);
  useBackClose(true, onContinue);
  const buzz = useHaptics();
  const play = useSound();
  const { title, line } = copy;
  const edges = { paddingTop: insets.top + SPACE.xl, paddingBottom: insets.bottom + SPACE.md };
  return (
    <MotionView
      accessibilityViewIsModal
      onAccessibilityEscape={onContinue}
      style={[StyleSheet.absoluteFill, styles.page, edges, { backgroundColor: colours.page }, fade]}
    >
      <View style={[styles.body, { width: column }]}>
        <CelebrationDisc name={name} size={column * ART_SCALE.celebration} />
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <GameText text={title} size={gameWidth(title, "medium") <= column ? "medium" : "small"} />
        </View>
        <Text
          ref={heading}
          accessibilityRole="header"
          accessibilityLabel={`${title} ${line}`}
          style={[styles.line, { color: colours.text }]}
        >
          {line}
        </Text>
      </View>
      <View style={{ width: column }}>
        <PrimaryButton
          label="Continue"
          onPress={onContinue}
          pressHaptic={() => buzz(DIALS.pressHaptic)}
          pressSound={() => play(DIALS.pressSound)}
        />
      </View>
    </MotionView>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: "center", justifyContent: "space-between" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACE.md },
  line: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body, textAlign: "center" },
});
