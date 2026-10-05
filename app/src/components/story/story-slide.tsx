import { StyleSheet, Text, useWindowDimensions, View, type AccessibilityActionEvent } from "react-native";

import { Mascot } from "@/art/mascot";
import { CardRow } from "@/components/exercise/card-row";
import { slidePosition, STORY_ACTION_LABELS } from "@/components/story/story-copy";
import type { Slide } from "@/content/stories/schema";
import { ART_SCALE, LINE_HEIGHT, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type StorySlideProps = {
  slide: Slide;
  index: number;
  count: number;
  onForward: () => void;
  onBack: () => void;
};

// US-7: the fish in the slide's pose, the title, about 30 words and an optional row of cards. The
// slide takes no touch, so a tap on it reaches the tap layer. On a screen wider than it is tall
// the fish sits beside the words, so a phone on its side still fits one slide (D17). A screen
// reader cannot tap a side of the screen, so the slide is one adjustable element: swipe up or
// down to move, double tap to go forward.
export function StorySlide({ slide, index, count, onForward, onBack }: StorySlideProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { width, height } = useWindowDimensions();
  const beside = width > height;
  const mascot = column * (beside ? ART_SCALE.castMascot : ART_SCALE.finishMascot);
  const words = beside ? column - mascot - SPACE.md : column;
  const onAction = (event: AccessibilityActionEvent) => (event.nativeEvent.actionName === "decrement" ? onBack() : onForward());
  return (
    <View
      style={[styles.slide, { width: column }, beside ? styles.beside : null]}
      pointerEvents="none"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={spoken(slide)}
      accessibilityValue={{ text: slidePosition(index, count) }}
      accessibilityActions={ACTIONS}
      onAccessibilityAction={onAction}
    >
      <Mascot character="fish" pose={slide.pose} width={mascot} />
      <View style={[styles.words, { width: words }]}>
        <Text style={[styles.title, { color: colours.text }]}>{slide.title}</Text>
        <Text style={[styles.body, { color: colours.text }]}>{slide.body}</Text>
        {slide.cards ? <CardRow group={{ label: null, cards: slide.cards }} width={words} /> : null}
      </View>
    </View>
  );
}

const ACTIONS = [
  { name: "increment", label: STORY_ACTION_LABELS.next },
  { name: "decrement", label: STORY_ACTION_LABELS.previous },
  { name: "activate" },
];

// The slide groups its children for a screen reader, so the cards are read out with the words,
// in the card codes CardRow itself reads
function spoken(slide: Slide): string {
  const words = `${slide.title}. ${slide.body}`;
  return slide.cards ? `${words} Cards: ${slide.cards.join(" ")}` : words;
}

const styles = StyleSheet.create({
  slide: { alignItems: "center", gap: SPACE.md },
  beside: { flexDirection: "row" },
  words: { alignItems: "center", gap: SPACE.sm },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  body: { fontSize: TYPE.body, fontWeight: "600", lineHeight: LINE_HEIGHT.body, textAlign: "center" },
});
