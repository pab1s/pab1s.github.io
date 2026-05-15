import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";

export default defineConfig({
  site: "https://pab1s.github.io",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark-high-contrast",
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeSlug, rehypeKatex],
  },
});
