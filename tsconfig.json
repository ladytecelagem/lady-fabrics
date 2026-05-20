import { defineType } from "sanity";

export default defineType({
  name: "collection", title: "Collection", type: "document",
  fields: [
    { name: "title", type: "string", validation: r => r.required() },
    { name: "slug", type: "slug", options: { source: "title" }, validation: r => r.required() },
    { name: "order", type: "number", initialValue: 100 },
    {
      name: "fiber", type: "string", title: "Primary Fiber",
      options: { list: ["wool", "linen", "polyester", "blend", "acoustic", "technical"] },
    },
    {
      name: "applications", type: "array", title: "Applications",
      of: [{ type: "string" }],
      options: {
        list: ["workplace", "hospitality", "residential", "acoustic", "furniture", "contract"],
      },
    },
    { name: "tagline", type: "localeString" },
    { name: "story", type: "localeBlock", title: "Story / Description" },
    { name: "heroImage", type: "image", title: "Hero Image", options: { hotspot: true } },
    { name: "gallery", type: "array", title: "Gallery",
      of: [{ type: "image", options: { hotspot: true } }] },
    { name: "composition", type: "string", title: "Composition (e.g. 90% Wool / 10% Polyamide)" },
    { name: "specifications", type: "array", title: "Specifications",
      of: [{ type: "specification" }] },
    { name: "colorways", type: "array", title: "Colorways",
      of: [{ type: "object", fields: [
        { name: "name", type: "string" },
        { name: "code", type: "string" },
        { name: "swatch", type: "image" },
      ]}] },
    { name: "downloads", type: "array", title: "Downloads",
      of: [{ type: "downloadAsset" }] },
    { name: "sampleBook", type: "reference", title: "Digital Sample Book",
      to: [{ type: "sampleBook" }] },
    { name: "related", type: "array", title: "Related Collections",
      of: [{ type: "reference", to: [{ type: "collection" }] }] },
    { name: "seo", type: "seo" },
  ],
  preview: {
    select: { title: "title", subtitle: "fiber", media: "heroImage" },
  },
});
