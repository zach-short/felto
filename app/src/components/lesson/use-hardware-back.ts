import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

// Android's back button and back gesture reach the native stack without passing the cross, so a
// session asks "Leave?" there too (D8; the gap item 13 left open). The latest handler is kept in
// a ref, so the listener is added once and never runs a stale one. iOS has no such button.
export function useHardwareBack(onBack: () => void) {
  const latest = useRef(onBack);
  useEffect(() => {
    latest.current = onBack;
  });
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      latest.current();
      return true;
    });
    return () => subscription.remove();
  }, []);
}
