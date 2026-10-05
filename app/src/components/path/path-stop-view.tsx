import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { pathNodeArtName } from "@/art/names";
import { PathNodeArt } from "@/art/path-node-art";
import { stopLabel, type PathStop } from "@/components/path/path-view-model";
import { stopRoute } from "@/components/path/stop-route";
import { usePlayer } from "@/storage/use-player";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type PathStopViewProps = {
  stop: PathStop;
  index: number;
};

// The stops swing left and right of the centre line, so the path reads as a path and not a list.
// The step between stops is in radians: 0.9 puts a full swing about every seven stops, one unit.
const SWING_STEP = 0.9;

export function PathStopView({ stop, index }: PathStopViewProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const shift = Math.sin(index * SWING_STEP) * column * ART_SCALE.pathSwing;
  const locked = stop.node.status === "locked";
  const ringed = pathNodeArtName(stop.node) === "node_current_base";
  const router = useRouter();
  const { state } = usePlayer();
  // Phase 10: every open stop opens its session, or the out-of-lives sheet at 0 lives. The time is
  // read at the tap (BD-12), so a heart that came back while the path was open counts.
  const playable = !locked;
  const open = () => {
    const href = stopRoute(stop.node, state, new Date());
    if (href) router.push(href);
  };
  return (
    <Pressable
      onPress={playable ? open : undefined}
      disabled={!playable}
      style={[styles.stop, { transform: [{ translateX: shift }] }]}
      accessibilityRole={playable ? "button" : undefined}
      accessibilityLabel={stopLabel(stop)}
    >
      <PathNodeArt node={stop.node} progress={stop.progress} size={column * ART_SCALE.pathNode} />
      <Text style={[styles.title, ringed ? null : styles.pulledUp, { color: locked ? colours.textMuted : colours.text }]}>{stop.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stop: { alignItems: "center" },
  title: { fontSize: TYPE.caption, fontWeight: "700", textAlign: "center" },
  // The 270 square leaves room under a plain node for a ring it does not have, so its title moves up
  pulledUp: { marginTop: -SPACE.md },
});
