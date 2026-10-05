// Turns the app's design tokens into CSS variables, so the site and the app read one source:
// `app/src/theme/tokens.ts`. Nothing is copied. A token added there shows up here on the next build.
import {
  BUTTON_HEIGHT,
  COLOURS,
  RADIUS,
  SPACE,
  type ColourName,
  type Scheme,
} from "../../../app/src/theme/tokens";

const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function colourBlock(scheme: Scheme): string {
  const entries = Object.entries(COLOURS[scheme]) as [ColourName, string][];
  return entries.map(([name, value]) => `--${kebab(name)}:${value};`).join("");
}

function sizeBlock(): string {
  const space = Object.entries(SPACE).map(([name, px]) => `--space-${name}:${px}px;`);
  return [...space, `--radius-md:${RADIUS.md}px;`, `--button-height:${BUTTON_HEIGHT}px;`].join("");
}

// Light is the default. A phone or laptop set to dark gets the dark values, the same way the app
// follows the phone (D16).
export const THEME_CSS =
  `:root{color-scheme:light dark;${colourBlock("light")}${sizeBlock()}}` +
  `@media (prefers-color-scheme:dark){:root{${colourBlock("dark")}}}`;
