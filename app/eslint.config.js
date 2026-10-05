// https://docs.expo.dev/guides/using-eslint/
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defineConfig } = require("eslint/config");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["ios/*", "android/*", ".expo/*"],
  },
]);
