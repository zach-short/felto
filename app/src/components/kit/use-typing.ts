import { useEffect, useRef, useState } from "react";

import { typedCount } from "@/components/kit/typing-steps";
import { useTalking } from "@/components/kit/use-talking";
import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

// GF-11: how many characters of a bubble's line show. It types at the dial's speed from the first
// draw, and `finish` shows the rest at once (a tap on the bubble). Reduced motion shows the line
// whole from the start, because the dial lists "typing". The count is taken from the time since the
// start, not from the number of ticks, so a slow frame never slows the line down.
export function useTyping(total: number, onTalking?: (talking: boolean) => void) {
  const allowed = motionAllowed("typing", useReducedMotion());
  const [typed, setTyped] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => {
    if (!allowed) return;
    const start = Date.now();
    timer.current = setInterval(() => {
      const next = typedCount(Date.now() - start, DIALS.typeCharMs, total);
      setTyped(next);
      if (next >= total) clearInterval(timer.current);
    }, DIALS.typeCharMs);
    return () => clearInterval(timer.current);
  }, [allowed, total]);
  const count = allowed ? typed : total;
  useTalking(count < total, onTalking);
  const finish = () => {
    clearInterval(timer.current);
    setTyped(total);
  };
  return { count, finish };
}
