import { defineType } from "sanity";

export default defineType({
  name: "fabric", title: "Fabric", type: "document",
  groups: [
    { name: "main", title: "Content", default: true },
    { name: "specs", title: "Specs" },
    { name: "visualizer", title: "Visualizer" },
  ],
  fields: [
    { name: "name", type: "string", title: "Name", group: "main", validation: r => r.required() },
    {
      name: "slug", type: "slug", title: "Slug", group: "main",
      options: { source: "name", maxLength: 96 }, validation: r => r.required(),
    },
    { name: "code", type: "string", title: "Reference code", group: "main" },
    {
      name: "collection", type: "reference", title: "Collection", group: "main",
      to: [{ type: "collection" }], validation: r => r.required(),
    },
    { name: "order", type: "number", title: "Order", group: "main", initialValue: 100 },

    { name: "mainImage", type: "image", title: "Main image", group: "main", options: { hotspot: true } },
    {
      name: "gallery", type: "array", title: "Gallery", group: "main",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    { name: "description", type: "text", rows: 3, title: "Description", group: "main" },

    {
      name: "composition", type: "string", title: "Composition", group: "specs",
      description: "Ex: 90% Wool / 10% Polyamide",
    },
    { name: "weight", type: "number", title: "Weight (g/m²)", group: "specs" },
    { name: "width", type: "number", title: "Width (cm)", group: "specs" },
    { name: "martindale", type: "number", title: "Abrasion — Martindale (cycles)", group: "specs" },
    {
      name: "certifications", type: "array", title: "Certifications / Standards", group: "specs",
      of: [{ type: "string" }], options: { layout: "tags" },
    },
    { name: "care", type: "string", title: "Care / Cleaning code", group: "specs" },

    { name: "colorways", type: "array", title: "Colorways", group: "main", of: [{ type: "colorway" }] },

    // ── VISUALIZER ────────────────────────────────────────────────
    {
      name: "visualizerSwatch", type: "image", title: "Visualizer swatch", group: "visualizer",
      description: "Foto plana do tecido (sem sombra, bem iluminada). O site gera o seamless a partir dela. Se vazio, usa a Main image.",
      options: { hotspot: false },
    },
    {
      name: "visualizerCategory", type: "string", title: "Texture category", group: "visualizer",
      description: "Ajusta o comportamento do render conforme o tipo de tecido.",
      options: { list: ["plain", "linen", "boucle", "tweed", "chenille", "jacquard", "organic"] },
      initialValue: "plain",
    },
    {
      name: "visualizerPxPerCm", type: "number", title: "Scale (px per cm)", group: "visualizer",
      description: "Quantos pixels do swatch equivalem a 1 cm real. Default 40. Aumente se a trama sair grande demais.",
      initialValue: 40,
    },
    {
      name: "inVisualizer", type: "boolean", title: "Show in visualizer", group: "visualizer",
      initialValue: false,
    },
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
