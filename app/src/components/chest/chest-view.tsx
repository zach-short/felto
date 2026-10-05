import { StyleSheet, Text, View } from "react-native";

import { Art } from "@/art/art";
import { Mascot } from "@/art/mascot";
import type { Pose } from "@/art/names";
import type { ChestMoment } from "@/components/chest/chest-moment";
import { CAST } from "@/content/cast";
import { DIALS } from "@/config/dials";
import { ART_SCALE, OPACITY, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type ChestViewProps = {
  moment: ChestMoment;
  gems: number;
};

// DESIGN.md 10.3 and 10.5: after a boss pass the squid opens the chest, cheering. The art has one
// chest and no open state or animation, so the opening is a plain reveal: the chest gives way to
// the gem and the count (PLAN.md phase 10).
export function ChestView({ moment, gems }: ChestViewProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const { pose, title, line } = chestCopy(moment, gems);
  const revealed = moment === "just-opened";
  return (
    <View style={styles.view}>
      <View style={styles.scene}>
        <Mascot character="squid" pose={pose} width={column * ART_SCALE.chestMascot} />
        <View style={{ opacity: moment === "closed" || moment === "missing" ? OPACITY.faded : 1 }}>
          <Art name={revealed ? "gem" : "chest"} width={column * (revealed ? ART_SCALE.gemReveal : ART_SCALE.chestReveal)} />
        </View>
      </View>
      <Text style={[styles.title, { color: revealed ? colours.accent : colours.text }]}>{title}</Text>
      <Text style={[styles.line, { color: colours.textMuted }]}>{line}</Text>
    </View>
  );
}

function chestCopy(moment: ChestMoment, gems: number): { pose: Pose; title: string; line: string } {
  const prize = DIALS.chestGems;
  if (moment === "ready") {
    return { pose: "happy", title: `${CAST.squid} found a chest!`, line: `You beat ${CAST.shark}, so what is inside is yours.` };
  }
  if (moment === "just-opened") return { pose: "cheer", title: `+${prize} gems!`, line: `You have ${gems} gems now.` };
  if (moment === "opened") {
    return { pose: "happy", title: "This chest is empty.", line: `${CAST.squid} already gave you its ${prize} gems.` };
  }
  if (moment === "closed") return { pose: "think", title: "Not open yet.", line: `Beat ${CAST.shark} to open this chest.` };
  return { pose: "sad", title: "Chest not found.", line: "This unit is not on the path." };
}

const styles = StyleSheet.create({
  view: { alignItems: "center", gap: SPACE.md, paddingTop: SPACE.xl },
  scene: { flexDirection: "row", alignItems: "flex-end", gap: SPACE.md },
  title: { fontSize: TYPE.title, fontWeight: "800", textAlign: "center" },
  line: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
});
