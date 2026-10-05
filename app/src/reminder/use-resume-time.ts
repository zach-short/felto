import { useEffect, useState } from "react";
import { AppState } from "react-native";

// BD-12: the time is read at the edge. It is read again each time the app comes back to the
// front, so a phone left in the background for days replans from the new today (BD-18).
export function useResumeTime(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") setNow(new Date());
    });
    return () => subscription.remove();
  }, []);
  return now;
}
