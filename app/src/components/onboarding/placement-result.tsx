import { Mascot } from "@/art/mascot";
import { OnboardingResultBody } from "@/components/onboarding/onboarding-result-body";
import { placementCopy } from "@/components/onboarding/onboarding-copy";
import { ART_SCALE } from "@/theme/tokens";
import { useColumnWidth } from "@/theme/use-column-width";

type PlacementResultProps = { passed: boolean; right: number; size: number };

// D20: the check ends in a pass or a fail, not in the lesson's finish: no XP and no streak to
// show. DESIGN.md 10.7: the fish hosts it, cheering a pass and happy at a fail, which is a start
// at unit 1 and nothing lost.
export function PlacementResult({ passed, right, size }: PlacementResultProps) {
  const column = useColumnWidth();
  const { title, line } = placementCopy(passed, right, size);
  return (
    <OnboardingResultBody
      art={<Mascot character="fish" pose={passed ? "cheer" : "happy"} width={column * ART_SCALE.finishMascot} />}
      title={title}
      line={line}
    />
  );
}
