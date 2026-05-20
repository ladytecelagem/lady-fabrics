import { defineType } from "sanity";
export default defineType({
  name: "newsItem", title: "News / Article", type: "document",
  fields: [
    { name: "title", type: "string", validation: r => r.required() },
    { name: "slug", type: "slug", options: { source: "title" } },
    { name: "publishedAt", type: "datetime" },
    {
      name: "category", type: "string",
      options: { list: ["market","sustainability","trend","workplace","hospitality","acoustic","wool","linen","press"] },
    },
    { name: "excerpt", type: "localeText" },
    { name: "body", type: "localeBlock" },
    { name: "coverImage", type: "image", options: { hotspot: true } },
    { name: "author", type: "reference", to: [{ type: "author" }] },
    { name: "aiGenerated", type: "boolean", title: "AI-curated", initialValue: false },
    { name: "seo", type: "seo" },
  ],
  orderings: [{ name: "publishedAtDesc", title: "Newest", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "category", media: "coverImage" } },
});
