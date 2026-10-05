import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { SPACE } from "@/theme/tokens";

// Two native buttons one above the other, for the question's two answers (D20)
export function ButtonStack({ children }: { children: ReactNode }) {
  return <View style={styles.stack}>{children}</View>;
}

const styles = StyleSheet.create({
  stack: { gap: SPACE.sm },
});
