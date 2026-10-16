import { View } from "react-native";

import { Celebration } from "@/art/celebration";
import type { CelebrationName } from "@/art/celebrations";

type CelebrationDiscProps = { name: CelebrationName; size: number };

// Board item 62: a celebration's rays run to the edges of its square canvas, so on a screen they
// stopped in a hard square that read as a mistake (seen on the iOS simulator, 2026-10-15). Drawn in a
// circle, the rays end in a round burst behind the hero. The hero fills 70% of the canvas, so its
// corners stay inside the circle at rest; a particle that flies past the edge is cut there.
export function CelebrationDisc({ name, size }: CelebrationDiscProps) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", pointerEvents: "none" }}>
      <Celebration name={name} width={size} />
    </View>
  );
}
