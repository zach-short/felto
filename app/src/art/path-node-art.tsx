import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { Art } from "@/art/art";
import { pathNodeArtName } from "@/art/names";
import { ART_BOXES } from "@/art/sizes";
import type { PathNode } from "@/game/path";
import { useTheme } from "@/theme/use-theme";

// The node geometry of tools/build_icons.py:264-278. A plain node is a 230 canvas with its disc
// centred at (106, 98); the current node is a 270 canvas centred at (130, 128) with a ring of
// radius 108 and stroke 12. Every node draws in a 270 square with the discs on one centre, so a
// column of mixed nodes lines up.
const RING = { canvas: 270, cx: 130, cy: 128, r: 108, stroke: 12 } as const;
const PLAIN = { cx: 106, cy: 98 } as const;
const CIRCUMFERENCE = 2 * Math.PI * RING.r;

type PathNodeArtProps = {
  node: PathNode;
  // The unit's finished lessons out of five, for the current lesson's arc (DESIGN.md 10.1)
  progress: number;
  size: number;
};

export function PathNodeArt({ node, progress, size }: PathNodeArtProps) {
  const name = pathNodeArtName(node);
  const box = ART_BOXES[name];
  const unit = size / RING.canvas;
  const ringed = box.width === RING.canvas;
  const offset = ringed ? null : { left: (RING.cx - PLAIN.cx) * unit, top: (RING.cy - PLAIN.cy) * unit };
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.layer, offset]}>
        <Art name={name} width={box.width * unit} />
      </View>
      {ringed && progress > 0 ? <ProgressArc progress={progress} size={size} /> : null}
    </View>
  );
}

// BD-9: the arc the generator leaves out of node_current_base, drawn from real progress. A zero
// arc is skipped, because a round cap on a zero-length dash still draws a dot.
function ProgressArc({ progress, size }: { progress: number; size: number }) {
  const { colours } = useTheme();
  const length = CIRCUMFERENCE * Math.min(1, progress);
  return (
    <Svg style={styles.layer} width={size} height={size} viewBox={`0 0 ${RING.canvas} ${RING.canvas}`}>
      <Circle
        cx={RING.cx}
        cy={RING.cy}
        r={RING.r}
        fill="none"
        stroke={colours.ringArc}
        strokeWidth={RING.stroke}
        strokeLinecap="round"
        strokeDasharray={`${length} ${CIRCUMFERENCE}`}
        transform={`rotate(-90 ${RING.cx} ${RING.cy})`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  layer: { position: "absolute", left: 0, top: 0 },
});
