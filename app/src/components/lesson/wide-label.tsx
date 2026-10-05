import { Text } from "@expo/ui";

import { SPACE, TYPE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";

// A width on a native Button sizes only the space around it, so the label carries the width and
// the button grows to the column, less its own inset (DESIGN.md 10.3: Check and Continue)
export function WideLabel({ label }: { label: string }) {
  const column = useColumnWidth();
  return (
    <Text style={{ width: column - SPACE.xl }} textStyle={{ textAlign: "center", fontWeight: "700", fontSize: TYPE.body }}>
      {label}
    </Text>
  );
}
