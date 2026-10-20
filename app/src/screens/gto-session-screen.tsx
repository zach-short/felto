import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { HandReview } from "@/components/gto-session/hand-review";
import { handTitle } from "@/components/gto-session/review-words";
import { useGtoSession } from "@/components/gto-session/use-gto-session";
import { GameButton } from "@/components/kit/game-button";
import { GameSheet } from "@/components/kit/game-sheet";
import { useHardwareBack } from "@/components/lesson/use-hardware-back";
import { PokerTable } from "@/components/table/poker-table";
import { DIALS } from "@/config/dials";
import { reviewHand } from "@/gto/review";
import { GTO_SESSION, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// A session of the GTO trainer (PLAN.md phase 9, board item 44): gtoHandsPerSession hands at the
// table, or fewer when the day's allowance runs out, and after each hand its review in a sheet
// over the table (BD-T32), then the summary. The Practice tab's start button opens it with the
// first seed, and has counted the first hand. Rule U4: no loading state (the player is read
// before the first frame and each hand is computed from its seed); no empty state, since the start
// button opens it only with a hand left; no error state of its own, since it writes the player
// and reads only the day's count. The table fills the column, as on /dev/table, so the buttons sit
// at its foot.
export function GtoSessionScreen() {
  const { seed } = useLocalSearchParams<{ seed?: string }>();
  const firstSeed = seedFrom(seed);
  return <GtoSession key={firstSeed} firstSeed={firstSeed} />;
}

function GtoSession({ firstSeed }: { firstSeed: number }) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { height } = useWindowDimensions();
  // As in LessonFrame: the native SafeAreaView measured 0 at the top in this modal (iPhone 17 Pro
  // simulator, 2026-10-16), so the screen pads by the root provider's insets
  const insets = useSafeAreaInsets();
  const edges = { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right };
  const { seed, session, last, onHand, next, leave } = useGtoSession(firstSeed);
  useHardwareBack(leave);
  const review = session.reviewing === null ? null : reviewHand(session.reviewing);
  const title = handTitle(session.index + 1, DIALS.gtoHandsPerSession);
  return (
    <View style={[styles.fill, { backgroundColor: colours.page }]}>
      <View style={[styles.fill, edges]}>
        <StatusBar style="auto" />
        <View
          style={[styles.column, { width: column }]}
          accessibilityElementsHidden={review !== null}
          importantForAccessibility={review !== null ? "no-hide-descendants" : "auto"}
        >
          <View style={styles.header}>
            <Pressable onPress={leave} accessibilityRole="button" accessibilityLabel="Leave the table" hitSlop={SPACE.md}>
              <Text style={[styles.close, { color: colours.textMuted }]}>✕</Text>
            </Pressable>
            <Text style={[styles.title, { color: colours.text }]}>{title}</Text>
          </View>
          <PokerTable key={seed} seed={seed} column={column} onHand={onHand} />
        </View>
      </View>
      <GameSheet shown={review !== null} title={title} onClose={next}>
        <ScrollView style={{ maxHeight: height * GTO_SESSION.reviewMaxHeight }}>
          {review === null ? null : <HandReview review={review} />}
        </ScrollView>
        <GameButton label={last ? "See how you did" : "Next hand"} onPress={next} />
      </GameSheet>
    </View>
  );
}

// The start button passes a whole number from the clock (BD-T7); a link without one starts at 1,
// as /dev/table does
function seedFrom(param: string | undefined): number {
  const seed = Number(param);
  return Number.isInteger(seed) && seed >= 0 ? seed : 1;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { flex: 1, alignSelf: "center", paddingBottom: SPACE.sm },
  header: { flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingVertical: SPACE.sm },
  close: { fontSize: TYPE.heading, fontWeight: "700" },
  title: { fontSize: TYPE.body, fontWeight: "800" },
});
