import { useRouter } from "expo-router";
import { useState } from "react";

import { handsLeftToday } from "@/game/gto-allowance";
import { sessionRecord } from "@/game/gto-session";
import type { Hand } from "@/gto/hand";
import { usePlayer } from "@/storage/use-player";

import { canMoveOn, handEnded, isLastHand, nextHand, startSession } from "./session-state";

// A session of the GTO trainer (PLAN.md phase 9, step 1): the hands at the table, the review after
// each, and the record of the session at its end. The start button counted the first hand; each
// next hand is counted as it is dealt (BD-T33), and a refused count ends the session. The clock is
// read here, at the edge (B3).
export function useGtoSession(firstSeed: number) {
  const router = useRouter();
  const { state, actions } = usePlayer();
  const [session, setSession] = useState(() => startSession(firstSeed));
  const last = isLastHand(session, handsLeftToday(state, new Date()));
  const onHand = (hand: Hand) => setSession((current) => handEnded(current, hand));
  const finish = () => {
    actions.finishGtoSession(sessionRecord(session.played, firstSeed, new Date()));
    router.replace("/gto-summary");
  };
  const next = () => {
    if (!canMoveOn(session)) return;
    if (last || !actions.dealGtoHand().ok) return finish();
    setSession((current) => nextHand(current, firstSeed));
  };
  return { seed: firstSeed + session.index, session, last, onHand, next, leave: () => router.back() };
}
