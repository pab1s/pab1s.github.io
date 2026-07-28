/**
 * Astro serves this at /rss.xml. Use .js (not .xml.ts): Vite can mis-parse
 * .xml.ts and treat the TS as XML.
 *
 * API shape: Astro 5 `GET`
 */
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

/** @typedef { import('astro').APIContext } APIContext */

const description =
  "Pablo Olivares — ML engineer and data scientist. Writing about ML, statistical learning, and experiments.";

export async function GET(/** @type {APIContext} */ context) {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: "Pablo Olivares",
    description,
    site: context.site ?? new URL(context.url).origin,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description:
        typeof post.data.description === "string" && post.data.description.trim().length > 0
          ? post.data.description
          : undefined,
      link: `/blog/${post.slug}/`,
    })),
    customData: "<language>en-us</language>",
  });
}
