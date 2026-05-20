import { defineType } from "sanity";
export default defineType({
  name: "industry", title: "Industry", type: "document",
  fields: [
    { name: "name", type: "string", validation: r => r.required() },
    { name: "slug", type: "slug", options: { source: "name" } },
    { name: "order", type: "number", initialValue: 100 },
    { name: "description", type: "localeText" },
    { name: "story", type: "localeBlock" },
    { name: "image", type: "image", options: { hotspot: true } },
    { name: "gallery", type: "array", of: [{ type: "image" }] },
    { name: "recommendedCollections", type: "array",
      of: [{ type: "reference", to: [{ type: "collection" }] }] },
    { name: "seo", type: "seo" },
  ],
  preview: { select: { title: "name", media: "image" } },
});
