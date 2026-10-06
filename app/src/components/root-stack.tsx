import { Stack } from "expo-router";

import { usePlayer } from "@/storage/use-player";

const SESSION = { presentation: "fullScreenModal", gestureEnabled: false } as const;

// The root navigator. D20: until the player is onboarded, the three first-launch screens and the
// placement check are the only part of the app that opens, and the tabs are closed; once they are
// onboarded, onboarding closes for good and the app opens straight to the path. Expo Router's
// protected screens redirect to the first screen still open, so onboarding is listed first, the
// tabs second, and the development routes (BD-13), open in both states, last: unlisted, they came
// first, and finishing onboarding after `felto://dev/fixture/fresh` landed on the fixture route.
export function RootStack() {
  const { state } = usePlayer();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!state.onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={state.onboarded}>
        <Stack.Screen name="(tabs)" />
        {/* DESIGN.md 10.3: the lesson is a full-screen modal over the tabs, closed by its own
            button, so a stray swipe cannot leave a lesson half played (D8) */}
        <Stack.Screen name="lesson/[id]" options={SESSION} />
        {/* Phase 10: the boss and the review run the lesson's loop, so they open the same way;
            the chest is the modal after a boss pass (DESIGN.md 10.3) */}
        <Stack.Screen name="boss/[unit]" options={SESSION} />
        <Stack.Screen name="review/[unit]" options={SESSION} />
        <Stack.Screen name="chest/[unit]" options={SESSION} />
        {/* Phase 15: a practice set runs the same loop over dealt exercises (D21) */}
        <Stack.Screen name="practice-set" options={SESSION} />
        {/* Unit stories, US-4: opened like a session, so the iOS swipe-back cannot take a tap
            on the left of the screen, where the story's back zone is (US-6) */}
        <Stack.Screen name="story/[unit]" options={SESSION} />
        {/* The out-of-lives sheet sits over Learn (DESIGN.md 10.3), so its route draws nothing
            but the native sheet, and the path shows through */}
        <Stack.Screen name="out-of-lives" options={{ presentation: "transparentModal", animation: "none" }} />
      </Stack.Protected>
      <Stack.Screen name="dev/fixture/[name]" />
      <Stack.Screen name="dev/art" />
      <Stack.Screen name="dev/kit" />
      <Stack.Screen name="dev/reminders" />
    </Stack>
  );
}
