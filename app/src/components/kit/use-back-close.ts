import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

// GF-10: Android's back button reaches an open popover, sheet or dialog first, as it reached the
// native ones, and runs `onBack` (most close it). While the piece is closed the listener is gone, so
// back leaves the screen as before. The latest handler is kept in a ref, as useHardwareBack keeps
// it, so the listener is added once per opening and never runs a stale one. iOS has no such button.
export function useBackClose(open: boolean, onBack: () => void) {
  const latest = useRef(onBack);
  useEffect(() => {
    latest.current = onBack;
  });
  useEffect(() => {
    if (!open) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      latest.current();
      return true;
    });
    return () => subscription.remove();
  }, [open]);
}
