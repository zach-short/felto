import { Button, Host } from "@expo/ui";

import { WideLabel } from "@/components/lesson/wide-label";
import { useColumnWidth } from "@/theme/use-column-width";

type LessonButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

// DESIGN.md 10.3: Check and Continue are the native Button, as wide as the column (rule U2)
export function LessonButton({ label, onPress, disabled = false }: LessonButtonProps) {
  const column = useColumnWidth();
  return (
    <Host matchContents={{ vertical: true }} style={{ width: column }}>
      <Button onPress={onPress} disabled={disabled}>
        <WideLabel label={label} />
      </Button>
    </Host>
  );
}
