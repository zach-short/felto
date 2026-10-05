import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { useReducedMotion as useReducedMotionAtLaunch } from "react-native-reanimated";

// BD-G4: the one place the phone's Reduce Motion setting is read; every animation asks this hook
// and passes the answer to motionAllowed. Reanimated answers at once, so the first frame is right,
// but only with the value the app launched with, so a change made later comes from the system.
export function useReducedMotion(): boolean {
  const atLaunch = useReducedMotionAtLaunch();
  const [reduced, setReduced] = useState(atLaunch);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((now) => live && setReduced(now));
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      live = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
