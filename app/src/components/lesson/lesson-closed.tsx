import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import type { Pose } from "@/art/names";
import type { Session } from "@/components/lesson/lesson-run";
import { nextLifeLine, OUT_OF_HEARTS } from "@/components/lesson/closed-copy";
import { CAST, type CastRole } from "@/content/cast";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

export type ClosedReason = "no-lives" | "locked" | "missing";

type LessonClosedProps = {
  reason: ClosedReason;
  // When the next life comes back, for "no-lives"
  nextLife: Date | null;
  kind?: Session["kind"];
  // The session's own host (D9, D21): the squid for a practice set
  host?: CastRole;
};

// A session that cannot be played: out of lives (D8), not yet open, or not found (rule U4, the
// error state). The path opens the out-of-lives sheet with the refill (phase 10) before a closed
// session is reached; this plain stop is what a session shows when its last life goes mid-way,
// and the fish sleeps as DESIGN.md 10.5 says.
export function LessonClosed({ reason, nextLife, kind = "lesson", host = "fish" }: LessonClosedProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { pose, title, line } = closedCopy(reason, nextLife, kind);
  return (
    <View style={styles.closed}>
      <Mascot character={host} pose={pose} width={column * ART_SCALE.finishMascot} />
      <Text style={[styles.title, { color: colours.text }]}>{title}</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>{line}</Text>
    </View>
  );
}

function closedCopy(reason: ClosedReason, nextLife: Date | null, kind: Session["kind"]): { pose: Pose; title: string; line: string } {
  if (reason === "no-lives") return { pose: "sleep", title: OUT_OF_HEARTS, line: nextLifeLine(nextLife) };
  if (reason === "locked") return { pose: "think", title: "Not open yet.", line: LOCKED_LINES[kind] };
  if (kind !== "lesson") return { pose: "sad", title: "Unit not found.", line: "This unit is not on the path." };
  return { pose: "sad", title: "Lesson not found.", line: "This lesson is not on the path." };
}

const LOCKED_LINES: Record<Session["kind"], string> = {
  lesson: "Finish the lesson before this one.",
  boss: `Finish this unit's five lessons, then ${CAST.shark} is waiting.`,
  review: `Beat ${CAST.shark} first, and ${CAST.squid} will open the review.`,
  practice: `Finish unit 1, and ${CAST.squid} will deal you practice hands.`,
  placement: `You have taken the check already. ${CAST.fish} is waiting on the path.`,
};

const styles = StyleSheet.create({
  closed: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
});
