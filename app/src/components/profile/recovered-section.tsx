import { FieldGroup, Text } from "@expo/ui";

// Rule U4, the error state, as Learn's banner says it (components/recovered-banner.tsx)
export function RecoveredSection() {
  return (
    <FieldGroup.Section>
      <Text>
        We could not read your saved progress, so you are starting fresh. Your old save is kept safe on this phone.
      </Text>
    </FieldGroup.Section>
  );
}
