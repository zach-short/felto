import { ART } from "@/art/registry";
import { ART_BOXES, type ArtName } from "@/art/sizes";
import { useTheme } from "@/theme/use-theme";

type ArtProps = {
  name: ArtName;
  width: number;
};

// Draws one piece of the generated art at a width, keeping its shape, with the two
// light-page colours filled from the theme (BD-25).
export function Art({ name, width }: ArtProps) {
  const { colours } = useTheme();
  const Svg = ART[name];
  const box = ART_BOXES[name];
  return (
    <Svg
      width={width}
      height={(width * box.height) / box.width}
      shadowColor={colours.artShadow}
      trackColor={colours.artTrack}
    />
  );
}
