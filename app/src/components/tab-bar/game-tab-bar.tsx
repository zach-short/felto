import type { BottomTabBarProps } from "expo-router/js-tabs";
import { StyleSheet, View } from "react-native";

import { TabButton } from "@/components/tab-bar/tab-button";
import { pressMoves, tabItemFor } from "@/components/tab-bar/tab-items";
import { SPACE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type TabRoute = BottomTabBarProps["state"]["routes"][number];

// GF-18 (amends D2 through GF-10): the tab bar is drawn by the app, not the platform. It sits on
// the page with a hairline above it, draws its tabs in the centred column every screen uses (D17,
// BD-27), and pads itself above the home indicator or Android's gesture bar with the inset the
// navigator hands it.
export function GameTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const count = state.routes.length;
  const bar = { backgroundColor: colours.page, borderTopColor: colours.line, paddingBottom: Math.max(insets.bottom, SPACE.sm) };
  return (
    <View style={[styles.bar, bar]}>
      <View style={[styles.row, { width: column }]} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const item = tabItemFor(route.name);
          if (!item) return null;
          const focused = index === state.index;
          const press = tabPresses(navigation, route, focused);
          return <TabButton key={route.key} item={item} index={index} count={count} selected={focused} {...press} />;
        })}
      </View>
    </View>
  );
}

// The events React Navigation's own bar sends, so a screen that listens for tabPress or
// tabLongPress hears this bar too (vendored bottom-tabs, views/BottomTabBar.js:262-279)
function tabPresses(navigation: BottomTabBarProps["navigation"], route: TabRoute, focused: boolean) {
  const onPress = () => {
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (pressMoves(focused, event.defaultPrevented)) navigation.navigate(route.name, route.params);
  };
  const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });
  return { onPress, onLongPress };
}

const styles = StyleSheet.create({
  bar: { alignItems: "center", paddingTop: SPACE.sm, borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row" },
});
