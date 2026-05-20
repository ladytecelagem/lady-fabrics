import { defineType } from "sanity";
export default defineType({
  name: "localeBlock", title: "Localized Rich Text", type: "object",
  fields: [
    { name: "en", type: "array", title: "English", of: [{ type: "block" }, { type: "image" }] },
    { name: "pt", type: "array", title: "Português", of: [{ type: "block" }, { type: "image" }] },
    { name: "es", type: "array", title: "Español", of: [{ type: "block" }, { type: "image" }] },
  ],
});
