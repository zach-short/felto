import { useRef, useState, type ComponentRef } from "react";
import type { View } from "react-native";

import type { Rect } from "@/components/kit/anchor-place";

// A full-screen layer's own frame in window coordinates, so a target measured in the window
// (useAnchor) can be placed in it. Measured each time the layer lays out, which covers a rotation
// and a resize as well as the first draw.
export function useLayerFrame() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [frame, setFrame] = useState<Rect | null>(null);
  const onLayout = () => {
    ref.current?.measureInWindow((x, y, width, height) => setFrame({ x, y, width, height }));
  };
  return { ref, frame, onLayout };
}
