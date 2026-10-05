import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { runInTurn } from "@/reminder/queue";
import type { PermissionState } from "@/reminder/reminder-device";
import { askPermission, readPermission } from "@/reminder/reminder-device";

// Profile shows whether a reminder can arrive at all. The answer is read again on return to the
// front, because the player may have changed it in the phone's Settings meanwhile.
export function useNotificationPermission() {
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const refresh = useCallback(() => void runInTurn(async () => setPermission(await readPermission())), []);
  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    return () => subscription.remove();
  }, [refresh]);
  const ask = useCallback(() => void runInTurn(async () => setPermission(await askPermission())), []);
  return { permission, ask };
}
