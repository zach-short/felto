import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Rect } from "@/components/kit/anchor-place";
import { Bubble } from "@/components/kit/bubble";
import { GameButton, QUIET_BUTTON } from "@/components/kit/game-button";
import { GameDialog } from "@/components/kit/game-dialog";
import { GameSheet } from "@/components/kit/game-sheet";
import { GameSwitch } from "@/components/kit/game-switch";
import { GameText } from "@/components/kit/game-text";
import { Popover } from "@/components/kit/popover";
import { RollingNumber } from "@/components/kit/rolling-number";
import { SparkleBurst } from "@/components/kit/sparkle-burst";
import { Sparkles } from "@/components/kit/sparkles";
import { Tag } from "@/components/kit/tag";
import { useAnchor } from "@/components/kit/use-anchor";
import { Screen } from "@/components/screen";
import { LINE_HEIGHT, SPACE, TYPE } from "@/theme/tokens";
import { useTheme } from "@/theme/use-theme";

// The one piece that draws over the whole screen, when one is open
type Open = { kind: "popover"; target: Rect } | { kind: "sheet" } | { kind: "dialog"; buttons: 1 | 2 } | null;

type Opener = (open: Open) => void;

// Development only (board item 46): every piece of the kit (GF-10) in each of its states, with a
// button that replays each animation, to be looked at on a phone in light and dark. It reads no
// stored state, so it has no loading, empty or error state (rule U4). The popover, the sheet and
// the dialog draw over the whole screen, so the screen holds which one is open, one at a time, and
// draws it outside the scrolling column, hiding the column from a screen reader meanwhile.
export function DevKitScreen() {
  const [open, setOpen] = useState<Open>(null);
  const close = () => setOpen(null);
  return (
    <View style={styles.fill}>
      <View style={styles.fill} accessibilityElementsHidden={open !== null} importantForAccessibility={open ? "no-hide-descendants" : "auto"}>
        <Screen>
          <TextSection />
          <NumberSection />
          <BubbleSection />
          <TagSection />
          <SparkleSection />
          <SwitchSection />
          <OverlaySection onOpen={setOpen} />
        </Screen>
      </View>
      {open?.kind === "popover" ? (
        <Popover target={open.target} tone="blue" title="Hands, lesson 3" line="Name the hand in each deal." action="START +20 XP" onAction={close} onClose={close} />
      ) : null}
      <GameSheet shown={open?.kind === "sheet"} title="Out of hearts" onClose={close}>
        <Text style={[styles.body, useInk()]}>A heart comes back every four hours, or spend 20 gems to fill them all now.</Text>
        <GameButton label="Close" onPress={close} />
      </GameSheet>
      {open?.kind === "dialog" ? <SampleDialog buttons={open.buttons} onDone={close} /> : null}
    </View>
  );
}

function useInk() {
  const { colours } = useTheme();
  return { color: colours.text };
}

function Section({ title, onReplay, children }: { title: string; onReplay?: () => void; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text accessibilityRole="header" style={[styles.heading, useInk()]}>
          {title}
        </Text>
        {onReplay ? (
          <Pressable onPress={onReplay} accessibilityRole="button" accessibilityLabel={`Replay ${title}`} hitSlop={SPACE.sm}>
            <Tag label="REPLAY" tone="blue" />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function TextSection() {
  return (
    <Section title="GameText">
      <GameText text="2000" size="large" tone="red" />
      <GameText text="+20 XP" size="medium" tone="green" />
      <View style={styles.row}>
        <GameText text="PERFECT" size="small" tone="gold" />
        <GameText text="BOSS" size="small" tone="purple" />
        <GameText text="LEVEL 2" size="small" tone="blue" />
      </View>
    </Section>
  );
}

function NumberSection() {
  const [value, setValue] = useState(1450);
  const step = (by: number) => () => setValue((now) => Math.max(0, now + by));
  return (
    <Section title="RollingNumber">
      <RollingNumber value={value} look={{ game: { size: "medium", tone: "gold" } }} />
      <RollingNumber value={value} />
      <View style={styles.row}>
        <Grow>
          <GameButton label="+37" onPress={step(37)} />
        </Grow>
        <Grow>
          <GameButton label="-12" onPress={step(-12)} paint={QUIET_BUTTON} />
        </Grow>
        <Grow>
          <GameButton label="+1000" onPress={step(1000)} />
        </Grow>
      </View>
    </Section>
  );
}

function Grow({ children }: { children: ReactNode }) {
  return <View style={styles.grow}>{children}</View>;
}

function BubbleSection() {
  const [round, setRound] = useState(0);
  const [talking, setTalking] = useState(false);
  return (
    <Section title="Bubble" onReplay={() => setRound(round + 1)}>
      <Text style={[styles.caption, useInk()]}>{talking ? "talking: yes" : "talking: no"}</Text>
      <View key={round} style={styles.bubbles}>
        <Bubble line="Two cards of one rank make a *pair*." tail="left" onTalking={setTalking} />
        <Bubble line="Tap me to finish the line at once." tail="right" />
        <Bubble line="The *river* is the fifth card." tail="top" />
        <Bubble line="Nice read! You are getting *good* at this." tail="bottom" />
      </View>
    </Section>
  );
}

function TagSection() {
  return (
    <Section title="Tag">
      <View style={styles.row}>
        <Tag label="NEW" tone="purple" />
        <Tag label="+20 XP" tone="gold" />
        <Tag label="NEW CONCEPT" tone="blue" />
        <Tag label="BEST" tone="green" />
        <Tag label="BOSS" tone="red" />
      </View>
    </Section>
  );
}

function SparkleSection() {
  const [round, setRound] = useState(0);
  return (
    <Section title="Sparkles" onReplay={() => setRound(round + 1)}>
      <View style={styles.sparkleBox}>
        <GameText text="WOW" size="medium" tone="purple" />
        <Sparkles />
      </View>
      <View key={round} style={styles.sparkleBox}>
        <GameText text="BURST" size="small" tone="gold" />
        <SparkleBurst play />
      </View>
    </Section>
  );
}

function SwitchSection() {
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(false);
  return (
    <Section title="GameSwitch">
      <SwitchRow label="Sound" value={sound} onChange={setSound} />
      <SwitchRow label="Haptics" value={haptics} onChange={setHaptics} />
      <SwitchRow label="Locked" value onChange={() => undefined} disabled />
    </Section>
  );
}

function SwitchRow({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.switchRow}>
      <Text style={[styles.body, useInk()]}>{label}</Text>
      <GameSwitch label={label} value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

function OverlaySection({ onOpen }: { onOpen: Opener }) {
  const { ref: leftRef, measure: measureLeft } = useAnchor();
  const { ref: rightRef, measure: measureRight } = useAnchor();
  return (
    <Section title="Popover, sheet and dialog">
      <View ref={leftRef} collapsable={false}>
        <GameButton label="Popover" onPress={() => measureLeft((target) => onOpen({ kind: "popover", target }))} />
      </View>
      <View ref={rightRef} collapsable={false} style={styles.end}>
        <Pressable onPress={() => measureRight((target) => onOpen({ kind: "popover", target }))} accessibilityRole="button" accessibilityLabel="Popover at the edge">
          <Tag label="EDGE" tone="purple" />
        </Pressable>
      </View>
      <GameButton label="Sheet" onPress={() => onOpen({ kind: "sheet" })} />
      <GameButton label="Dialog, one button" onPress={() => onOpen({ kind: "dialog", buttons: 1 })} paint={QUIET_BUTTON} />
      <GameButton label="Dialog, two buttons" onPress={() => onOpen({ kind: "dialog", buttons: 2 })} paint={QUIET_BUTTON} />
    </Section>
  );
}

function SampleDialog({ buttons, onDone }: { buttons: 1 | 2; onDone: () => void }) {
  if (buttons === 1) {
    return <GameDialog title="Reminders are off" line="Turn on notifications in Settings to get a nudge each day." confirm={{ label: "OK", onPress: onDone }} />;
  }
  const cancel = { label: "Keep going", onPress: onDone };
  return <GameDialog title="Leave the lesson?" line="Your progress in this lesson will be lost." confirm={{ label: "Leave", onPress: onDone }} cancel={cancel} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  section: { gap: SPACE.md, marginBottom: SPACE.xl },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heading: { fontSize: TYPE.heading, fontWeight: "800" },
  body: { fontSize: TYPE.body, lineHeight: LINE_HEIGHT.body },
  caption: { fontSize: TYPE.caption },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: SPACE.sm },
  grow: { flex: 1 },
  bubbles: { gap: SPACE.lg, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm },
  sparkleBox: { height: TYPE.title * 4, alignItems: "center", justifyContent: "center" },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  end: { alignSelf: "flex-end" },
});
