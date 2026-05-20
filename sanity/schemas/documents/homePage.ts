import { defineType } from "sanity";

export default defineType({
  name: "homePage", title: "Home Page", type: "document",
  fields: [
    {
      name: "hero", type: "object", title: "Hero",
      fields: [
        { name: "eyebrow", type: "localeString" },
        { name: "title", type: "localeString" },
        { name: "subtitle", type: "localeText" },
        { name: "video", type: "file", title: "Hero Video (mp4)" },
        { name: "image", type: "image", title: "Hero Image", options: { hotspot: true } },
      ],
    },
    {
      name: "philosophy", type: "object", title: "Philosophy",
      fields: [
        { name: "title", type: "localeString" },
        { name: "body", type: "localeText" },
        { name: "image", type: "image", options: { hotspot: true } },
      ],
    },
    { name: "featuredCollections", type: "array", title: "Featured Collections",
      of: [{ type: "reference", to: [{ type: "collection" }] }], validation: r => r.max(6) },
    { name: "featuredIndustries", type: "array", title: "Featured Industries",
      of: [{ type: "reference", to: [{ type: "industry" }] }] },
    { name: "intelligenceFeed", type: "array", title: "Intelligence Feed",
      of: [{ type: "reference", to: [{ type: "newsItem" }, { type: "trend" }] }] },
    {
      name: "sustainabilityBlock", type: "object", title: "Sustainability",
      fields: [
        { name: "title", type: "localeString" },
        { name: "body", type: "localeText" },
        { name: "image", type: "image", options: { hotspot: true } },
      ],
    },
    { name: "seo", type: "seo" },
  ],
  preview: { prepare: () => ({ title: "Home Page" }) },
});
