import { defineType } from "sanity";
export default defineType({
  name: "sampleBookPage", title: "Sample Book Page", type: "object",
  fields: [
    { name: "pageNumber", type: "number", title: "Page #" },
    { name: "image", type: "image", title: "Page Image", options: { hotspot: true } },
    { name: "patterns", type: "array", title: "Patterns/Codes detected", of: [{ type: "string" }] },
    { name: "notes", type: "text", title: "Notes", rows: 2 },
  ],
  preview: {
    select: { title: "pageNumber", media: "image" },
    prepare: ({ title, media }) => ({ title: `Page ${title}`, media }),
  },
});
