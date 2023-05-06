import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkReadingTime } from "./remark-reading-time.mjs";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://etienne.deneuve.xyz",
  base: "/etiennedeneuve.github.io",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: "one-dark-pro",
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
    // Example: Switch to use prism for syntax highlighting in Markdown
    remarkPlugins: [remarkToc, remarkReadingTime],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
        },
      ],
    ],
  },
});
