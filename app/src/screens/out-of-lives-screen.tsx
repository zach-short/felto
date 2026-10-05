import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { outOfLivesOffer } from "@/components/lives/out-of-lives-offer";
import { OutOfLivesSheet } from "@/components/lives/out-of-lives-sheet";
import { refilledRoute } from "@/components/path/stop-route";
import { usePlayer } from "@/storage/use-player";

// The out-of-lives sheet over the Learn path (DESIGN.md 10.3), opened by a tap on a lesson or a
// boss at 0 lives (components/path/stop-route.ts). The route is a transparent modal, so the path
// stays in view behind the native sheet. Rule U4: no loading state (the player is read before
// the first frame); the empty state is a player without the gems for a refill, who is shown the
// wait and how gems are won; there is no error state, as the sheet needs no stored value of its
// own.
export function OutOfLivesScreen() {
  const { kind, id } = useLocalSearchParams<{ kind?: string; id?: string }>();
  const router = useRouter();
  const { state, actions } = usePlayer();
  const [now] = useState(() => new Date());
  // The sheet calls onDismiss as it closes, also after a refill has already moved on
  const leaving = useRef(false);
  const close = () => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  };
  const refill = () => {
    if (leaving.current || !actions.refillLives().ok) return;
    leaving.current = true;
    const next = refilledRoute(kind, id);
    if (next) router.replace(next);
    else router.back();
  };
  return (
    <View style={styles.fill}>
      <OutOfLivesSheet shown offer={outOfLivesOffer(state, now)} onRefill={refill} onClose={close} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
