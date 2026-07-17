import { defineType } from "sanity";

export default defineType({
  name: "colorway", title: "Colorway", type: "object",
  fields: [
    { name: "name", type: "string", title: "Color name", validation: r => r.required() },
    { name: "code", type: "string", title: "Code" },
    {
      name: "hex", type: "string", title: "Hex (ex: #C8B9A6)",
      description: "Usado quando não houver swatch. Formato #RRGGBB.",
    },
    { name: "swatch", type: "image", title: "Swatch photo", options: { hotspot: true } },
  ],
  preview: { select: { title: "name", subtitle: "code", media: "swatch" } },
});
