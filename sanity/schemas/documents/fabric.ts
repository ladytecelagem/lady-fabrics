import { defineType } from "sanity";

export default defineType({
  name: "fabric", title: "Fabric", type: "document",
  fields: [
    { name: "name", type: "string", title: "Name", validation: r => r.required() },
    {
      name: "slug", type: "slug", title: "Slug",
      options: { source: "name", maxLength: 96 }, validation: r => r.required(),
    },
    { name: "code", type: "string", title: "Reference code" },
    {
      name: "collection", type: "reference", title: "Collection",
      to: [{ type: "collection" }], validation: r => r.required(),
    },
    { name: "order", type: "number", title: "Order", initialValue: 100 },

    { name: "mainImage", type: "image", title: "Main image", options: { hotspot: true } },
    {
      name: "gallery", type: "array", title: "Gallery",
      of: [{ type: "image", options: { hotspot: true } }],
    },

    { name: "description", type: "text", rows: 3, title: "Description" },

    {
      name: "composition", type: "string", title: "Composition",
      description: "Ex: 90% Wool / 10% Polyamide",
    },
    { name: "weight", type: "number", title: "Weight (g/m²)" },
    { name: "width", type: "number", title: "Width (cm)" },
    { name: "martindale", type: "number", title: "Abrasion — Martindale (cycles)" },
    {
      name: "certifications", type: "array", title: "Certifications / Standards",
      of: [{ type: "string" }], options: { layout: "tags" },
    },
    { name: "care", type: "string", title: "Care / Cleaning code" },

    { name: "colorways", type: "array", title: "Colorways", of: [{ type: "colorway" }] },
  ],
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", code: "code", collection: "collection.title", media: "mainImage" },
    prepare: ({ title, code, collection, media }: any) => ({
      title: code ? `${title} · ${code}` : title,
      subtitle: collection,
      media,
    }),
  },
});
