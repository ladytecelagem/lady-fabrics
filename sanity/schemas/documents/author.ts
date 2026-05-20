import { defineType } from "sanity";
export default defineType({
  name: "author", title: "Author", type: "document",
  fields: [
    { name: "name", type: "string" },
    { name: "role", type: "string" },
    { name: "bio", type: "localeText" },
    { name: "image", type: "image", options: { hotspot: true } },
  ],
  preview: { select: { title: "name", subtitle: "role", media: "image" } },
});
