// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const artRoot = path.resolve(__dirname, "../assets");

// BD-6: SVG files are components, through felto's own transformer (SVGO off).
config.transformer.babelTransformerPath = require.resolve("./svg-transformer.js");
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// BD-7: the art lives in ../assets, outside the project. The watch entry reloads a
// regenerated SVG; the module path lets those files resolve react-native-svg from app/.
config.watchFolders = [...config.watchFolders, artRoot];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

module.exports = config;
