import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";

import { Screen } from "@/components/screen";
import { FIXTURE_NAMES } from "@/game/fixtures";
import { useLoadFixture } from "@/screens/use-load-fixture";
import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// Development only (BD-13). Rule U4: "loading" is the moment before the fixture is written and
// the path opens; "unknown" is the error state, a name that is not a fixture; there is no empty
// state, because the route always carries a name.
export function DevFixtureScreen() {
  const { colours } = useTheme();
  const { name } = useLocalSearchParams<{ name: string }>();
  const load = useLoadFixture(name);
  return (
    <Screen>
      <Text style={[styles.text, { color: colours.text }]}>{MESSAGES[load](name ?? "")}</Text>
    </Screen>
  );
}

const MESSAGES = {
  loading: (name: string) => `Loading the fixture "${name}"...`,
  unknown: (name: string) => `No fixture is named "${name}". Fixtures: ${FIXTURE_NAMES.join(", ")}.`,
  unavailable: () => "Fixtures load only in a development build.",
} as const;

const styles = StyleSheet.create({
  text: { fontSize: TYPE.body, padding: SPACE.md },
});
