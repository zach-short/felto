import { BottomSheet, Column, RNHostView } from "@expo/ui";
import { StyleSheet, Text, View } from "react-native";

import { Mascot } from "@/art/mascot";
import type { Pose } from "@/art/names";
import { PrimaryButton } from "@/components/button/primary-button";
import type { CastRole } from "@/content/cast";
import { ART_SCALE, LINE_HEIGHT, SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";
import { useTheme } from "@/theme/use-theme";

type FeedbackSheetProps = {
  shown: boolean;
  right: boolean;
  // The right answer in words, for the wrong-answer line
  answer: string;
  explanation: string;
  onContinue: () => void;
  // The sheet closed without its button: a swipe, or Android's back button (session-steps.ts)
  onDismiss: () => void;
  host?: CastRole;
};

// DESIGN.md 10.3: the answer feedback is a native sheet over the lesson. 10.5: the fish cheers a
// right answer and is sad at a wrong one. D10: the warm register. GF-2: its Continue is the
// primary button, so it is drawn inside the hosted React Native view with the words.
export function FeedbackSheet({ shown, right, answer, explanation, onContinue, onDismiss, host = "fish" }: FeedbackSheetProps) {
  const { colours } = useTheme();
  const column = useColumnWidth();
  return (
    <BottomSheet isPresented={shown} onDismiss={onDismiss} containerColor={colours.surface}>
      <Column>
        <RNHostView matchContents>
          <View style={[styles.sheet, { width: column }]}>
            <View style={styles.body}>
              <Mascot character={host} pose={feedbackPose(host, right)} width={column * ART_SCALE.sheetMascot} />
              <View style={styles.words}>
                <Text style={[styles.heading, { color: right ? colours.right : colours.wrong }]}>
                  {right ? "Nice read!" : "So close."}
                </Text>
                {/* D10's line is "So close. It was {answer}.", but an answer label is a capitalised
                    phrase ("Player 1 wins"), which reads badly mid-sentence, so it gets its own line */}
                {right ? null : (
                  <Text style={[styles.answer, { color: colours.text }]}>{`The answer: ${answer}`}</Text>
                )}
                <Text style={[styles.explanation, { color: colours.text }]}>{explanation}</Text>
              </View>
            </View>
            <PrimaryButton label="Continue" onPress={onContinue} />
          </View>
        </RNHostView>
      </Column>
    </BottomSheet>
  );
}

// DESIGN.md 10.5: the guide and the squid cheer a right answer and are sad at a wrong one; the
// shark is the opponent, so it is sad when the player is right and smug when they are wrong
function feedbackPose(host: CastRole, right: boolean): Pose {
  if (host === "shark") return right ? "sad" : "smug";
  return right ? "cheer" : "sad";
}

const styles = StyleSheet.create({
  sheet: { gap: SPACE.md },
  body: { flexDirection: "row", alignItems: "center", gap: SPACE.md, paddingBottom: SPACE.sm },
  words: { flex: 1, gap: SPACE.xs },
  heading: { fontSize: TYPE.heading, fontWeight: "800" },
  answer: { fontSize: TYPE.body, fontWeight: "800" },
  explanation: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body },
});
