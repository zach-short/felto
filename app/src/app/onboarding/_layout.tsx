import { Stack } from "expo-router";

// D20: welcome, the cast and the question, then the placement check. The check is closed only by
// its own cross, which asks first, so a stray swipe cannot drop a half-answered check. The four
// screens are listed in order, because a nested stack opens on the first one listed.
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cast" />
      <Stack.Screen name="level" />
      <Stack.Screen name="placement" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
