import { Art } from "@/art/art";
import { mascotArtName, type Pose } from "@/art/names";
import type { CastRole } from "@/content/cast";

type MascotProps = {
  character: CastRole;
  pose: Pose;
  width: number;
};

// D4: the one mascot component. A move to Rive changes this file and nothing that calls it.
export function Mascot({ character, pose, width }: MascotProps) {
  return <Art name={mascotArtName(character, pose)} width={width} />;
}
