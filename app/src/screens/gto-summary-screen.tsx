import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { CardArt } from "@/art/card-art";
import { Mascot } from "@/art/mascot";
import { cardCode } from "@/cards/card";
import { DecisionRow } from "@/components/gto-session/decision-row";
import { bigBlinds, mistakesLead } from "@/components/gto-session/review-words";
import { GameButton } from "@/components/kit/game-button";
import { RecoveredBanner } from "@/components/recovered-banner";
import { Screen } from "@/components/screen";
import { replayHand } from "@/game/gto-session";
import type { GtoSessionRecord, GtoWorst } from "@/game/player-state";
import { reviewHand } from "@/gto/review";
import { usePlayer } from "@/storage/use-player";
import { ART_SCALE, CARD_GAP, GTO_SESSION, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// The summary of the latest finished session of the GTO trainer (PLAN.md phase 9, board item 44),
// read from the stored record: the count of mistakes first (BD-T34, Zach's answer (c)), then the
// total cost and the worst mistake with its hand, played again from its seed (BD-T38). Rule U4: no
// loading state (the player is read before the first frame); the empty state is a player with no
// finished session, who sees one line and the way back; the error state is the banner of a save
// that could not be read, as on Practice.
export function GtoSummaryScreen() {
  const router = useRouter();
  const { status, state } = usePlayer();
  const { colours } = useTheme();
  const column = useColumnWidth();
  const record = state.gto.sessions.at(-1) ?? null;
  return (
    <Screen>
      {status === "recovered" ? <RecoveredBanner /> : null}
      <View style={styles.host}>
        <Mascot character="squid" pose={record === null || record.mistakes > 0 ? "happy" : "cheer"} width={column * ART_SCALE.pathMascot} />
        <Text accessibilityRole="header" style={[styles.title, { color: colours.text }]}>
          {record === null ? "No session yet" : "Nice session!"}
        </Text>
      </View>
      {record === null ? null : <SessionSummary record={record} />}
      <View style={styles.back}>
        <GameButton label="Back to practice" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

function SessionSummary({ record }: { record: GtoSessionRecord }) {
  const { colours } = useTheme();
  return (
    <View style={styles.sections}>
      <Section heading="Spots to work on">
        <Text style={[styles.lead, { color: colours.text }]}>{mistakesLead(record.mistakes, record.decisions)}</Text>
      </Section>
      <Section heading="Chips left on the table">
        <Text style={[styles.figure, { color: colours.text }]}>{bigBlinds(record.costBb)}</Text>
      </Section>
      <Section heading="The one to look at again">
        {record.worst === null ? (
          <Text style={[styles.body, { color: colours.textMuted }]}>No mistakes this time.</Text>
        ) : (
          <WorstHand worst={record.worst} />
        )}
      </Section>
    </View>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  const { colours } = useTheme();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.heading, { color: colours.textMuted }]}>
        {heading}
      </Text>
      {children}
    </View>
  );
}

// The worst mistake's hand, dealt again from its seed and graded again by reviewHand
function WorstHand({ worst }: { worst: GtoWorst }) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const hand = replayHand(worst.seed, worst.actions);
  const decision = hand === null ? undefined : reviewHand(hand)?.decisions[worst.decision];
  if (hand === null || decision === undefined) {
    return <Text style={[styles.body, { color: colours.textMuted }]}>This hand cannot be dealt again.</Text>;
  }
  return (
    <View style={styles.worst}>
      <View style={styles.cards}>
        {hand.deal.holes[hand.deal.playerSeat].map((card) => (
          <CardArt key={cardCode(card)} card={cardCode(card)} width={column * GTO_SESSION.summaryCard} />
        ))}
      </View>
      <DecisionRow decision={decision} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flexDirection: "row", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg },
  title: { flex: 1, fontSize: TYPE.title, fontWeight: "800" },
  sections: { gap: SPACE.lg },
  section: { gap: SPACE.xs },
  heading: { fontSize: TYPE.caption, fontWeight: "800" },
  lead: { fontSize: TYPE.title, fontWeight: "800" },
  figure: { fontSize: TYPE.heading, fontWeight: "800" },
  body: { fontSize: TYPE.body, fontWeight: "600" },
  worst: { gap: SPACE.sm },
  cards: { flexDirection: "row", gap: CARD_GAP },
  back: { marginTop: SPACE.xl },
});
