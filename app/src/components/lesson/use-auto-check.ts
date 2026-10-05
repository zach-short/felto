import { useEffect, useRef } from "react";

// Development link only (lesson-screen.tsx): press Check once, through the same path as a tap
export function useAutoCheck(on: boolean, check: () => void) {
  const done = useRef(false);
  useEffect(() => {
    if (!on || done.current) return;
    done.current = true;
    check();
  }, [on, check]);
}
