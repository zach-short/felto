import type { ErrorBoundaryProps } from "expo-router";
import { Button, Host } from "@expo/ui";
import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import { ROUTE_ERROR_LINE, ROUTE_ERROR_RETRY } from "@/components/route-error-copy";
import { ART_SCALE, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

// Rule U4: a screen that throws while drawing shows this, not a blank page, and can try again
export function RouteError({ retry }: ErrorBoundaryProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <View style={[styles.page, { backgroundColor: colours.page }]}>
      <Mascot character="fish" pose="sad" width={column * ART_SCALE.pathMascot} />
      <Text style={[styles.text, { color: colours.text }]}>{ROUTE_ERROR_LINE}</Text>
      <Host matchContents>
        <Button label={ROUTE_ERROR_RETRY} onPress={retry} />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACE.md, padding: SPACE.md },
  text: { fontSize: TYPE.body, fontWeight: "600", textAlign: "center" },
});
