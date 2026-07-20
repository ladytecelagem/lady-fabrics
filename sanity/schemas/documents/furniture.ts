import { defineType } from "sanity";

export default defineType({
  name: "furniture", title: "Furniture", type: "document",
  fields: [
    { name: "name", type: "string", title: "Name", validation: r => r.required() },
    {
      name: "slug", type: "slug", title: "Slug",
      options: { source: "name", maxLength: 96 }, validation: r => r.required(),
    },
    {
      name: "category", type: "string", title: "Category",
      options: { list: ["sofa", "armchair", "chair", "bench", "ottoman", "headboard", "panel"] },
    },
    { name: "order", type: "number", title: "Order", initialValue: 100 },

    {
      name: "baseImage", type: "image", title: "Base photo",
      description: "Foto do móvel (estofado neutro, boa luz).",
      options: { hotspot: true }, validation: r => r.required(),
    },
    {
      name: "maskImage", type: "image", title: "Mask (B/W)",
      description: "Branco = área que recebe o tecido; preto = resto. Gerada no editor de máscara.",
    },
    {
      name: "shadingImage", type: "image", title: "Shading (optional)",
      description: "Mapa de sombras pré-extraído. Se vazio, é derivado da base em tempo real.",
    },

    {
      name: "swatchScale", type: "number", title: "Swatch scale",
      description: "Multiplicador da escala física do tecido neste móvel (default 1.0).",
      initialValue: 1,
    },
    {
      name: "active", type: "boolean", title: "Active in visualizer",
      initialValue: true,
    },
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "category", media: "baseImage" },
  },
});
