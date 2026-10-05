import { rawArt } from "../lib/art";

// The red chip, served straight from the generated art, so the site holds no copy of it.
export function GET() {
  return new Response(rawArt("icons/chips/chip_red"), {
    headers: { "Content-Type": "image/svg+xml" },
  });
}
