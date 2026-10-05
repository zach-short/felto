import { useEffect, useRef, type ComponentRef } from "react";
import { AccessibilityInfo, type Text } from "react-native";

// The native sheet moved a screen reader into itself when it rose. Its replacement (board item 29)
// does the same by hand: when the sheet is shown, the reader's focus goes to its heading, so the
// verdict is the first thing heard and the Continue button is the next.
export function useSheetFocus(shown: boolean) {
  const heading = useRef<ComponentRef<typeof Text>>(null);
  useEffect(() => {
    if (shown && heading.current) AccessibilityInfo.sendAccessibilityEvent(heading.current, "focus");
  }, [shown]);
  return heading;
}
