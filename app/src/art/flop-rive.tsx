import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Rive, { AutoBind, Fit, useRive, useRiveBoolean } from "rive-react-native";

import flopFile from "@rive/flop.riv";

import { flopHeight, flopMode } from "@/art/flop-mode";
import { Mascot } from "@/art/mascot";
import { DIALS } from "@/config/dials";
import { motionAllowed } from "@/motion/reduced-motion";
import { useReducedMotion } from "@/motion/use-reduced-motion";

type FlopRiveProps = {
  perfect: boolean;
  width: number;
};

// The names the Rive file holds (HANDOFF step 34): the state machine `flop` plays `idle`, and moves
// to `frantic` while the view-model boolean `perfect` is true.
const ARTBOARD = "Flop";
const STATE_MACHINE = "flop";
const PERFECT = "perfect";

// Board item 34: the rigged fish, as a second body for the one mascot (D4). Rule U6 keeps the
// `.riv` and the runtime inside src/art/. It draws the static happy pose when the phone asks for
// reduced motion (GF-8) or the file fails to load.
export function FlopRive({ perfect, width }: FlopRiveProps) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  if (flopMode(motionAllowed("swim", reduced), failed) === "static") {
    return <Mascot character="fish" pose="happy" width={width} />;
  }
  return <FlopPlayer perfect={perfect} width={width} onFail={() => setFailed(true)} />;
}

function FlopPlayer({ perfect, width, onFail }: FlopRiveProps & { onFail: () => void }) {
  const [setRiveRef, riveRef] = useRive();
  const [, setPerfect] = useRiveBoolean(riveRef, PERFECT);
  // The delay lets the screen's own entrance finish before the dart begins (dial flopPerfectDelayMs)
  useEffect(() => {
    if (riveRef === null) return;
    const timer = setTimeout(() => setPerfect(perfect), perfect ? DIALS.flopPerfectDelayMs : 0);
    return () => clearTimeout(timer);
  }, [perfect, riveRef, setPerfect]);
  return (
    <View style={[styles.stage, { width, height: flopHeight(width) }]}>
      <Rive
        ref={setRiveRef}
        source={flopFile}
        artboardName={ARTBOARD}
        stateMachineName={STATE_MACHINE}
        dataBinding={AutoBind(true)}
        fit={Fit.Contain}
        onError={onFail}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignSelf: "center" },
  fill: { flex: 1 },
});
