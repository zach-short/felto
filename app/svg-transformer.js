// eslint-disable-next-line @typescript-eslint/no-require-imports
const { transform } = require("@svgr/core");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const upstream = require("@expo/metro-config/babel-transformer");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const colourSwap = require("./src/art/colour-swap.json");

// BD-25: the two art colours that assume a light page become props the art module fills
// from the theme.
const replaceAttrValues = Object.fromEntries(
  Object.entries(colourSwap).map(([hex, prop]) => [hex, `{props.${prop}}`]),
);

// BD-6: the config is fixed here rather than read from an .svgrrc, because svgr looks for
// that file beside each SVG, and the art lives in ../assets. SVGO is left out so the bytes
// the generator writes are the bytes that draw.
const svgrConfig = {
  native: true,
  plugins: ["@svgr/plugin-jsx"],
  replaceAttrValues,
};

module.exports.transform = async function transformSvg({ src, filename, ...rest }) {
  if (!filename.endsWith(".svg")) {
    return upstream.transform({ src, filename, ...rest });
  }
  const code = await transform(src, svgrConfig, { filePath: filename });
  return upstream.transform({ src: code, filename, ...rest });
};
