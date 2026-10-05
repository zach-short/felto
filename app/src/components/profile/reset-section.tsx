import { FieldGroup, ListItem, Text } from "@expo/ui";

import { useTheme } from "@/theme/use-theme";

// PLAN.md phase 11: reset progress, behind the platform alert (use-profile-controls.ts). It is a
// row in the wrong-answer red, as a settings screen draws a destructive row on both platforms.
export function ResetSection({ onReset }: { onReset: () => void }) {
  const { colours } = useTheme();
  return (
    <FieldGroup.Section title="Start over">
      <ListItem onPress={onReset}>
        <Text textStyle={{ color: colours.wrong }}>Reset progress</Text>
      </ListItem>
      <FieldGroup.SectionFooter>
        <Text>Your old progress is kept safe on this phone, but the app starts you from the first lesson.</Text>
      </FieldGroup.SectionFooter>
    </FieldGroup.Section>
  );
}
