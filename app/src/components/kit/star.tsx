import Svg, { Path } from "react-native-svg";

// GF-17: a four-point star, the sparkle of the Duolingo photos: four curved points meeting in a
// pinched middle, drawn in a 24 box and scaled to `size` (BD-G5: SVG shapes, no canvas library)
const STAR = "M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z";

export function Star({ size, colour }: { size: number; colour: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={STAR} fill={colour} />
    </Svg>
  );
}
