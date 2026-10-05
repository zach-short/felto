import { BottomSheet, Button, Column, RNHostView } from "@expo/ui";
import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import { Mascot } from "@/art/mascot";
import { nextLifeLine, OUT_OF_HEARTS } from "@/components/lesson/closed-copy";
import { WideLabel } from "@/components/lesson/wide-label";
import type { OutOfLivesOffer } from "@/components/lives/out-of-lives-offer";
import { DIALS } from "@/config/dials";
import { ART_SCALE, LINE_HEIGHT, MIN_STAT_ICON, RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type OutOfLivesSheetProps = {
  shown: boolean;
  offer: OutOfLivesOffer;
  onRefill: () => void;
  onClose: () => void;
};

// DESIGN.md 10.3: out of lives is a native sheet over Learn, with the heart, the gem and the fish
// asleep (10.5). D8: it says when the next heart is back and offers a full refill for gems. D10:
// the warm register.
export function OutOfLivesSheet({ shown, offer, onRefill, onClose }: OutOfLivesSheetProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <BottomSheet isPresented={shown} onDismiss={onClose} containerColor={colours.surface}>
      <Column spacing={SPACE.md}>
        <RNHostView matchContents>
          <View style={[styles.body, { width: column }]}>
            <View style={styles.row}>
              <Mascot character="fish" pose="sleep" width={column * ART_SCALE.livesMascot} />
              <View style={styles.words}>
                <Text style={[styles.heading, { color: colours.text }]}>{OUT_OF_HEARTS}</Text>
                <Text style={[styles.line, { color: colours.text }]}>{nextLifeLine(offer.nextLife)}</Text>
              </View>
            </View>
            <View style={[styles.offer, { backgroundColor: colours.page }]}>
              <Art name="lives_heart" width={MIN_STAT_ICON} />
              <Text style={[styles.line, styles.offerText, { color: colours.text }]}>{refillLine(offer)}</Text>
              <Art name="gem" width={MIN_STAT_ICON} />
              <Text style={[styles.gems, { color: colours.text }]}>{offer.gems}</Text>
            </View>
          </View>
        </RNHostView>
        {offer.canRefill ? (
          <Button onPress={onRefill}>
            <WideLabel label={`Refill for ${offer.price} gems`} />
          </Button>
        ) : null}
        <Button onPress={onClose} variant={offer.canRefill ? "outlined" : undefined}>
          <WideLabel label="Back to the path" />
        </Button>
      </Column>
    </BottomSheet>
  );
}

function refillLine(offer: OutOfLivesOffer): string {
  if (offer.canRefill) return `Or fill all ${DIALS.maxLives} hearts now for ${offer.price} gems.`;
  return `A refill costs ${offer.price} gems. Beat a boss and its chest holds ${DIALS.chestGems}.`;
}

const styles = StyleSheet.create({
  body: { gap: SPACE.md, paddingBottom: SPACE.sm },
  row: { flexDirection: "row", alignItems: "center", gap: SPACE.md },
  words: { flex: 1, gap: SPACE.xs },
  heading: { fontSize: TYPE.heading, fontWeight: "800" },
  line: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body },
  offer: { flexDirection: "row", alignItems: "center", gap: SPACE.sm, padding: SPACE.md, borderRadius: RADIUS.md },
  offerText: { flex: 1 },
  gems: { fontSize: TYPE.stat, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
