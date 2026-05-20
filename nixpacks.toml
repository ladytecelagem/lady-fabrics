import { defineType } from "sanity";
export default defineType({
  name: "seo", title: "SEO", type: "object",
  fields: [
    { name: "title", type: "localeString", title: "Meta Title" },
    { name: "description", type: "localeText", title: "Meta Description" },
    { name: "ogImage", type: "image", title: "Open Graph Image", options: { hotspot: true } },
    { name: "noIndex", type: "boolean", title: "Hide from search engines" },
  ],
});
