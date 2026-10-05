import { useRef, type ComponentRef } from "react";
import type { View } from "react-native";

import type { Rect } from "@/components/kit/anchor-place";

// The frame of a view a popover points at, in window coordinates. It is measured when asked (on a
// tap), not when the view lays out, so a target in a list that has scrolled since gives where it
// is now.
export function useAnchor() {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const measure = (then: (target: Rect) => void) => {
    ref.current?.measureInWindow((x, y, width, height) => then({ x, y, width, height }));
  };
  return { ref, measure };
}
