import { Button, Host } from "@expo/ui";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import type { PathUnit } from "@/components/path/path-view-model";
import { storyButtonLabel } from "@/components/story/story-copy";
import { SPACE } from "@/theme/tokens";

type StoryButtonProps = {
  unit: Pick<PathUnit, "id" | "title">;
};

// US-5: the way into a unit's story, under the unit's title. A native button (D2, rule U2), in
// the outlined style the out-of-lives sheet uses for its second choice, since the story is never
// the step the path is waiting for. It opens the story and stores nothing.
export function StoryButton({ unit }: StoryButtonProps) {
  const router = useRouter();
  const open = () => router.push({ pathname: "/story/[unit]", params: { unit: unit.id } });
  return (
    <Host matchContents style={styles.host}>
      <Button label={storyButtonLabel(unit.title)} variant="outlined" onPress={open} />
    </Host>
  );
}

const styles = StyleSheet.create({
  host: { alignSelf: "flex-start", marginTop: SPACE.sm },
});
