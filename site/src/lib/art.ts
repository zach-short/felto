// Reads the generated art from `assets/` where it already lives and returns it as inline SVG
// text. Nothing is copied into this folder. The art draws a pale shadow and track that vanish on
// a dark page, so those two colours are swapped for the theme's, as the app does (BD-25).
const files = import.meta.glob("../../../assets/{icons,mascots}/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const SHADOW = "#C9CDE2"; // tools/common.py:8
const TRACK = "#DDE1EC"; // tools/build_icons.py:272

export type ArtKey = string; // e.g. "mascots/fish/fish_cheer"

export function art(key: ArtKey): string {
  const source = files[`../../../assets/${key}.svg`];
  if (source === undefined) throw new Error(`No art named ${key}`);
  const prefix = key.replace(/[^A-Za-z0-9]/g, "-");
  return source
    .replace(/<svg /, '<svg aria-hidden="true" focusable="false" ')
    .replace(/ width="\d+" height="\d+"/, "")
    .replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
    .replaceAll(`fill="${SHADOW}"`, 'style="fill:var(--art-shadow)"')
    .replaceAll(`fill="${TRACK}"`, 'style="fill:var(--art-track)"');
}

// The file exactly as generated, for places that cannot take CSS variables, such as the favicon.
export function rawArt(key: ArtKey): string {
  const source = files[`../../../assets/${key}.svg`];
  if (source === undefined) throw new Error(`No art named ${key}`);
  return source;
}
