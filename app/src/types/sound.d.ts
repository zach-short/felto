// D15: the effects under @art/sounds/ are WAV files that Metro bundles as assets, so an import
// gives the asset id that expo-audio plays.
declare module "*.wav" {
  const source: number;
  export default source;
}
