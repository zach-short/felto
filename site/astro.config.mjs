import { defineConfig } from "astro/config";

// A static site: every page is built to dist/ and served as plain files.
export default defineConfig({
  output: "static",
});
