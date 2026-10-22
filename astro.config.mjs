// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://gaurav.raheja.dev",
  base: "/",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/og-template") &&
        !page.includes("/download-simple-docx"),
    }),
  ],
  server: {
    port: 3500,
  },
});
