// BD-6: every SVG under @art/ is a react-native-svg component. BD-25: the two light-page
// colours of the art arrive as these two props, so the art module must always pass them.
declare module "*.svg" {
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";

  interface ArtSvgProps extends SvgProps {
    shadowColor: string;
    trackColor: string;
  }

  const ArtSvg: FC<ArtSvgProps>;
  export default ArtSvg;
}
