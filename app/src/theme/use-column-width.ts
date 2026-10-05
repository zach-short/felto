import { useWindowDimensions } from "react-native";

import { DIALS } from "@/config/dials";
import { SPACE } from "@/theme/tokens";

// BD-27: one centred column on every screen, as wide as the window allows up to the dial.
export function useColumnWidth(): number {
  const { width } = useWindowDimensions();
  return Math.min(width - SPACE.md * 2, DIALS.columnMaxWidth);
}
