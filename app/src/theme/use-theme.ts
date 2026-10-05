import { useColorScheme } from "react-native";

import { COLOURS, type Scheme } from "@/theme/tokens";

// D16: the app follows the phone's appearance. An unknown answer falls back to light,
// the page the art was drawn for.
export function useTheme() {
  const scheme: Scheme = useColorScheme() === "dark" ? "dark" : "light";
  return { scheme, colours: COLOURS[scheme] };
}
