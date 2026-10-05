import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useTheme } from "@/theme/use-theme";

// DESIGN.md 10.3 and D21: three native tabs. The tab bar is this one file, because
// unstable-native-tabs can change its API between SDK releases (D2).
export function AppTabs() {
  const { colours } = useTheme();
  return (
    <NativeTabs tintColor={colours.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Learn</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "map", selected: "map.fill" }} md="route" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="practice">
        <NativeTabs.Trigger.Label>Practice</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "suit.spade", selected: "suit.spade.fill" }} md="playing_cards" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
