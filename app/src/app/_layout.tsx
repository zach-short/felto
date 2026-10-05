import { RootProviders } from "@/components/root-providers";
import { RootStack } from "@/components/root-stack";

// Rule U1: the navigator and nothing else. What sits above every route is in RootProviders; the
// navigator reads the player too (D20: onboarding first), so it is its own component under them
// (components/root-stack.tsx).
export default function RootLayout() {
  return (
    <RootProviders>
      <RootStack />
    </RootProviders>
  );
}
