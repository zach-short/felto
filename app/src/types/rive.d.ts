// Board item 34: assets/rive/flop.riv is a binary asset that Metro bundles, so an import gives the
// asset id that rive-react-native loads.
declare module "*.riv" {
  const source: number;
  export default source;
}
