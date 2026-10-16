import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Mascot } from "@/art/mascot";
import type { Pose } from "@/art/names";
import { PrimaryButton } from "@/components/button/primary-button";
import { sheetHeading } from "@/components/celebrate/celebration-copy";
import { CelebrationDisc } from "@/components/celebrate/celebration-disc";
import { useSheetFocus } from "@/components/lesson/use-sheet-focus";
import { DIALS } from "@/config/dials";
import type { CastRole } from "@/content/cast";
import { useHaptics } from "@/feedback/use-haptics";
import { useSound } from "@/feedback/use-sound";
import type { AnswerMoment } from "@/game/answer-moment";
import { MotionView } from "@/motion/motion-view";
import { useBounce } from "@/motion/use-bounce";
import { useSheetRise } from "@/motion/use-sheet-rise";
import { useTilt } from "@/motion/use-tilt";
import { ART_SCALE, LINE_HEIGHT, SHEET_RADIUS, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type FeedbackSheetProps = {
  shown: boolean;
  right: boolean;
  // The right answer in words, for the wrong-answer line
  answer: string;
  explanation: string;
  // GF-24 (board item 62): the celebration of a right answer, played above the sheet and named in
  // its heading
  moment?: AnswerMoment | null;
  onContinue: () => void;
  host?: CastRole;
};

// DESIGN.md 10.3 made the answer feedback a native sheet; Zach replaced it on 2026-10-05 (board
// item 29, an amendment of D2 under GF-2) with this view of the app's tokens, which rises on the
// spring of PLAN.md section 3. It is drawn over the lesson by LessonFrame's overlay and closes only
// by its Continue, or by Android's back button, which asks to leave (useHardwareBack). 10.5: the
// fish cheers a right answer and is sad at a wrong one, and GF-6 bounces or tilts it once the sheet
// is up. D10: the warm register. The sheet pads by the bottom inset itself, so its Continue clears
// Android's gesture bar (finding (b) of HANDOFF steps 29 and 30).
export function FeedbackSheet({ shown, right, answer, explanation, moment = null, onContinue, host = "fish" }: FeedbackSheetProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  const insets = useSafeAreaInsets();
  const buzz = useHaptics();
  const play = useSound();
  const rise = useSheetRise(shown);
  const heading = useSheetFocus(shown);
  const bounce = useBounce(shown && right, DIALS.sheetRiseMs);
  const tilt = useTilt(shown && !right, DIALS.sheetRiseMs);
  const edges = { paddingBottom: insets.bottom + SPACE.md, paddingLeft: insets.left, paddingRight: insets.right };
  const celebration = column * ART_SCALE.sheetCelebration;
  return (
    <MotionView
      onLayout={rise.onLayout}
      pointerEvents={shown ? "auto" : "none"}
      accessibilityViewIsModal={shown}
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? "auto" : "no-hide-descendants"}
      style={[styles.sheet, edges, { backgroundColor: right ? colours.rightSoft : colours.wrongSoft }, rise.style]}
    >
      {/* The art stands on the sheet's top edge, over the exercise, and takes no touch (GF-24). It is
          placed by its own size: a percentage inset resolved inside the sheet's padding and let the
          art overlap the heading on the iOS simulator */}
      {shown && moment ? (
        <View style={[styles.above, { top: -celebration - SPACE.sm }]}>
          <CelebrationDisc name={moment} size={celebration} />
        </View>
      ) : null}
      <View style={[styles.content, { width: column }]}>
        <View style={styles.body}>
          <MotionView style={bounce}>
            <MotionView style={tilt}>
              <Mascot character={host} pose={feedbackPose(host, right)} width={column * ART_SCALE.sheetMascot} />
            </MotionView>
          </MotionView>
          <View style={styles.words}>
            <Text ref={heading} accessibilityRole="header" style={[styles.heading, { color: right ? colours.right : colours.wrong }]}>
              {right ? (moment ? sheetHeading(moment) : "Nice read!") : "So close."}
            </Text>
            {/* D10's line is "So close. It was {answer}.", but an answer label is a capitalised
                phrase ("Player 1 wins"), which reads badly mid-sentence, so it gets its own line */}
            {right ? null : <Text style={[styles.answer, { color: colours.text }]}>{`The answer: ${answer}`}</Text>}
            <Text style={[styles.explanation, { color: colours.text }]}>{explanation}</Text>
          </View>
        </View>
        <PrimaryButton
          label="Continue"
          onPress={onContinue}
          pressHaptic={() => buzz(DIALS.pressHaptic)}
          pressSound={() => play(DIALS.pressSound)}
        />
      </View>
    </MotionView>
  );
}

// DESIGN.md 10.5: the guide and the squid cheer a right answer and are sad at a wrong one; the
// shark is the opponent, so it is sad when the player is right and smug when they are wrong
function feedbackPose(host: CastRole, right: boolean): Pose {
  if (host === "shark") return right ? "sad" : "smug";
  return right ? "cheer" : "sad";
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingTop: SPACE.lg,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  above: { position: "absolute", left: 0, right: 0, alignItems: "center", pointerEvents: "none" },
  content: { gap: SPACE.md },
  body: { flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingBottom: SPACE.sm },
  words: { flex: 1, gap: SPACE.xs },
  heading: { fontSize: TYPE.heading, fontWeight: "800" },
  answer: { fontSize: TYPE.body, fontWeight: "800" },
  explanation: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body },
});
