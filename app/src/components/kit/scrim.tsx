import { Pressable, StyleSheet } from "react-native";

import { MotionView } from "@/motion/motion-view";
import { useFadeIn } from "@/motion/use-fade-in";
import { useTheme } from "@/theme/use-theme";

// GF-10: the dimmed screen behind a sheet or a dialog. It fades in when it first draws, and a tap
// on it runs `onPress` (close), when there is one. A screen reader never lands on it: the piece in
// front is the modal, and it gives its own way out.
export function Scrim({ onPress }: { onPress?: () => void }) {
  const { colours } = useTheme();
  const fade = useFadeIn();
  return (
    <MotionView style={[StyleSheet.absoluteFill, { backgroundColor: colours.scrim }, fade]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessible={false}
        importantForAccessibility="no"
        accessibilityElementsHidden
        style={StyleSheet.absoluteFill}
      />
    </MotionView>
  );
}
