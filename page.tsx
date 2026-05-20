import { defineType } from "sanity";

export default defineType({
  name: "sampleBook", title: "Sample Book", type: "document",
  fields: [
    { name: "title", type: "string", validation: r => r.required() },
    { name: "slug", type: "slug", options: { source: "title" }, validation: r => r.required() },
    { name: "description", type: "localeText" },
    { name: "collection", type: "reference", to: [{ type: "collection" }] },
    { name: "cover", type: "image", options: { hotspot: true } },
    { name: "pdf", type: "file", title: "Source PDF", options: { accept: "application/pdf" } },
    { name: "pageCount", type: "number" },
    { name: "pages", type: "array", title: "Pages (auto-generated)",
      of: [{ type: "sampleBookPage" }] },
    { name: "parsingStatus", type: "string", title: "Parsing Status",
      options: { list: ["pending","processing","complete","failed"] }, initialValue: "pending" },
    { name: "seo", type: "seo" },
  ],
  preview: {
    select: { title: "title", subtitle: "pageCount", media: "cover" },
    prepare: ({ title, subtitle, media }) => ({ title, subtitle: subtitle ? `${subtitle} pages` : "", media }),
  },
});
