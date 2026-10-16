// Board item 61: assets/celebrations/*.lottie are dotLottie archives that Metro bundles as assets,
// so an import gives the asset id that lottie-react-native resolves and loads.
declare module "*.lottie" {
  const source: number;
  export default source;
}
