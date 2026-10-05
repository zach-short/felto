import { StyleSheet, Text } from "react-native";

import { Screen } from "@/components/screen";
import type { ScheduledList } from "@/reminder/use-scheduled-list";
import { useScheduledList } from "@/reminder/use-scheduled-list";
import { SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// Development only (PLAN.md phase 11, done-when): felto://dev/reminders lists the reminders the
// phone holds, as the phone reports them. Rule U4: "loading" is the moment before the list is
// read; "empty" is a list with none; "error" is a read the phone refused.
export function DevRemindersScreen() {
  const { colours } = useTheme();
  const list = useScheduledList();
  const lines = __DEV__ ? describe(list) : ["Development builds only."];
  return (
    <Screen>
      {lines.map((line, index) => (
        <Text key={index} style={[styles.text, { color: colours.text }]}>
          {line}
        </Text>
      ))}
    </Screen>
  );
}

function describe(list: ScheduledList): string[] {
  if (list === "loading") return ["Reading..."];
  if (list === "failed") return ["The phone did not return its scheduled reminders."];
  if (list.length === 0) return ["No reminders scheduled."];
  return [`${list.length} scheduled:`, ...list.map((item) => `${item.id}\n${item.trigger}\n${item.body}`)];
}

const styles = StyleSheet.create({
  text: { fontSize: TYPE.caption, padding: SPACE.sm },
});
