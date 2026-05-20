import { defineType } from "sanity";
export default defineType({
  name: "localeText", title: "Localized Text", type: "object",
  fields: [
    { name: "en", type: "text", title: "English", rows: 4 },
    { name: "pt", type: "text", title: "Português", rows: 4 },
    { name: "es", type: "text", title: "Español", rows: 4 },
  ],
});
