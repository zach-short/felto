import { useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";

import { arrowGap, arrowPlace, placeCard, type Placement, type Rect } from "@/components/kit/anchor-place";
import { GameButton } from "@/components/kit/game-button";
import { useBackClose } from "@/components/kit/use-back-close";
import { useLayerFrame } from "@/components/kit/use-layer-frame";
import { useSheetFocus } from "@/components/lesson/use-sheet-focus";
import { MotionView } from "@/motion/motion-view";
import { usePop } from "@/motion/use-pop";
import { KIT, RADIUS, SPACE, TONES, TYPE, type Tone } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

type PopoverProps = {
  // The view it points at, in window coordinates (useAnchor measures it)
  target: Rect;
  tone: Tone;
  title: string;
  line: string;
  // The label of its raised white button, as it is to be read: "START +20 XP"
  action: string;
  onAction: () => void;
  onClose: () => void;
};

// The arrow's point stops this short of the target, and the arrow keeps clear of the card's
// rounded corners
const RULES = { gap: arrowGap(KIT.arrow, SPACE.xs), margin: SPACE.md, arrowInset: RADIUS.md + KIT.arrow / 2 };

// GF-10: a card that points at a view with an arrow and springs out of it (photo IMG_2864): a node's
// lesson, with its title, a line and a raised white button. It sits below the view, or above when
// there is more room there, and stays on the screen. The caller mounts it over the whole screen to
// open it, and hides the screen beneath from a screen reader. A tap outside, Android's back button
// and the screen reader's escape gesture each close it; the reader is moved to its title.
export function Popover({ target, tone, title, line, action, onAction, onClose }: PopoverProps) {
  const { colours } = useTheme();
  const paint = TONES[tone];
  const { ref, frame, onLayout } = useLayerFrame();
  const [height, setHeight] = useState(0);
  const place = frame && height > 0 ? placeIn(frame, target, height) : null;
  const pop = usePop(place !== null);
  const heading = useSheetFocus(place !== null);
  useBackClose(true, onClose);
  const measure = (event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height);
  return (
    <View ref={ref} onLayout={onLayout} style={StyleSheet.absoluteFill} accessibilityViewIsModal onAccessibilityEscape={onClose}>
      <Pressable onPress={onClose} accessible={false} importantForAccessibility="no" style={StyleSheet.absoluteFill} />
      {frame ? (
        <MotionView onLayout={measure} style={[styles.card, cardBox(frame, place, height), pop]}>
          {place ? <View style={[styles.arrow, arrowPlace(place, KIT.arrow, height), { backgroundColor: colours[place.side === "below" ? paint.face : paint.edge] }]} /> : null}
          <View style={[styles.face, { backgroundColor: colours[paint.face], borderBottomColor: colours[paint.edge] }]}>
            <Text ref={heading} accessibilityRole="header" style={[styles.title, { color: colours[paint.ink] }]}>
              {title}
            </Text>
            <Text style={[styles.line, { color: colours[paint.ink] }]}>{line}</Text>
            <GameButton label={action} onPress={onAction} paint={{ face: "popoverButton", edge: "popoverButtonEdge", ink: paint.label }} />
          </View>
        </MotionView>
      ) : null}
    </View>
  );
}

function cardWidth(layer: Rect): number {
  return Math.min(KIT.popoverMaxWidth, layer.width - RULES.margin * 2);
}

// The target moved from the window into the layer, and the card placed against it
function placeIn(layer: Rect, target: Rect, height: number): Placement {
  const inLayer = { ...target, x: target.x - layer.x, y: target.y - layer.y };
  return placeCard(inLayer, { width: cardWidth(layer), height }, layer, RULES);
}

// Until the card has been measured it is drawn unplaced and unseen (usePop holds it see-through).
// Once placed it grows from its arrow's point.
function cardBox(layer: Rect, place: Placement | null, height: number) {
  const width = cardWidth(layer);
  if (!place) return { width, left: 0, top: 0 };
  const originY = place.side === "below" ? 0 : height;
  return { width, left: place.left, top: place.top, transformOrigin: [place.arrowX, originY, 0] };
}

const styles = StyleSheet.create({
  card: { position: "absolute" },
  // Drawn behind the face: below the card the arrow carries the face's colour, above it the edge's,
  // so either way it reads as part of the raised card
  arrow: { position: "absolute", width: KIT.arrow, height: KIT.arrow, transform: [{ rotate: "45deg" }] },
  face: { borderRadius: RADIUS.md, borderBottomWidth: KIT.cardEdge, padding: SPACE.md, gap: SPACE.sm },
  // Both lines are large text (TONES): cream on the blue, red and purple faces passes only as that
  title: { fontSize: TYPE.title, fontWeight: "800" },
  line: { fontSize: TYPE.heading, fontWeight: "700", marginBottom: SPACE.xs },
});
