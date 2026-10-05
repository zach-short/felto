import { Tabs } from "expo-router/js-tabs";

import { GameTabBar } from "@/components/tab-bar/game-tab-bar";
import { TAB_ITEMS } from "@/components/tab-bar/tab-items";
import { useTheme } from "@/theme/use-theme";

// DESIGN.md 10.3 and D21: three tabs. GF-18 (board item 52) replaced the native tabs with
// expo-router's JavaScript tabs and the app's own bar, because a native tab bar cannot take the
// raised, coloured tab of the references. The router, deep links and the "/" route are as before.
// backBehavior "initialRoute" is the native tabs' own default (expo-router
// build/native-tabs/NativeBottomTabsNavigator.js:52), so Android's back button still returns to
// Learn before it leaves the app. The scene takes the page colour, so a tab never flashes the
// navigator's light default in dark mode.
export function AppTabs() {
  const { colours } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <GameTabBar {...props} />}
      backBehavior="initialRoute"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colours.page } }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen key={item.route} name={item.route} options={{ title: item.label }} />
      ))}
    </Tabs>
  );
}
