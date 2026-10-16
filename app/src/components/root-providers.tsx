import type { ReactNode } from "react";

import { CelebrationHost } from "@/components/celebrate/celebration-host";
import { ReminderSync } from "@/reminder/reminder-sync";
import { PlayerProvider } from "@/storage/player-provider";

// Rule U1: the root layout holds the navigator only, so what sits above every route lives here.
// D3 and rule B4: the one PlayerProvider, so each screen reads the same player through usePlayer.
// D11 and BD-18: ReminderSync draws nothing and keeps the scheduled reminders in step with it.
// GF-24: CelebrationHost comes after the navigator, so its layer draws over the tabs and their bar.
export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <ReminderSync />
      {children}
      <CelebrationHost />
    </PlayerProvider>
  );
}
