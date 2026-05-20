import { defineType } from "sanity";
export default defineType({
  name: "trend", title: "Trend", type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "slug", type: "slug", options: { source: "title" } },
    { name: "summary", type: "localeText" },
    { name: "body", type: "localeBlock" },
    { name: "coverImage", type: "image", options: { hotspot: true } },
    { name: "season", type: "string", options: { list: ["SS25","FW25","SS26","FW26"] } },
    { name: "tags", type: "array", of: [{ type: "string" }] },
  ],
  preview: { select: { title: "title", subtitle: "season", media: "coverImage" } },
});
