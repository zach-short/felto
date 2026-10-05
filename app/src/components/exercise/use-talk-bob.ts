import { useEffect, useState } from "react";

import { DIALS } from "@/config/dials";
import { evenSteps } from "@/motion/answer-steps";
import { useStepsOn } from "@/motion/use-steps-on";

// One bob: the host rises by the dial's distance and settles, in the dial's time. The plan has
// one bob, the idle bob of PLAN.md section 3, so talking uses its dials.
function bobSteps() {
  return evenSteps([-DIALS.idleBobDistance, 0], DIALS.idleBobMs);
}

// GF-11: while its line types, the host's static pose bobs, until a rig moves its mouth instead
// (GF-19). A beat every half bob starts the next bob as the last one ends, for as long as the host
// talks; the last bob settles after it stops. The kind is "bob", so reduced motion keeps the host
// still (GF-8). The motion module gives the value (BD-G3); the style holds it as it is, which
// Reanimated draws without a worklet.
export function useTalkBob(talking: boolean) {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (!talking) return;
    const timer = setInterval(() => setBeat((n) => n + 1), DIALS.idleBobMs / 2);
    return () => clearInterval(timer);
  }, [talking]);
  const rise = useStepsOn("bob", talking && beat % 2 === 0, bobSteps, 0);
  return { transform: [{ translateY: rise }] };
}
