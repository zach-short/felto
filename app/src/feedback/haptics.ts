import * as Haptics from "expo-haptics";

import { safely } from "@/feedback/safely";
import { shouldBuzz } from "@/feedback/should-buzz";

const { Light, Medium, Rigid } = Haptics.ImpactFeedbackStyle;
const { Success } = Haptics.NotificationFeedbackType;

// GF-3: the app's touches, lightest first: a tick for a choice, a light impact for a button, a
// medium one for a node or a card, success for a reward, and a rigid tap for a lost heart. Each
// goes through safely(), so a phone that cannot buzz never stops a lesson (audit of item 13, B1).
// The table is not exported, so no caller can reach a touch without the switch below.
const TOUCHES = {
  selection: () => safely(Haptics.selectionAsync),
  lightImpact: () => safely(() => Haptics.impactAsync(Light)),
  mediumImpact: () => safely(() => Haptics.impactAsync(Medium)),
  success: () => safely(() => Haptics.notificationAsync(Success)),
  rigid: () => safely(() => Haptics.impactAsync(Rigid)),
} satisfies Record<string, () => void>;

export type Touch = keyof typeof TOUCHES;

// BD-G6: an off Haptics switch makes every touch a no-op
export function buzz(touch: Touch, setting: boolean): void {
  if (shouldBuzz(setting)) TOUCHES[touch]();
}
