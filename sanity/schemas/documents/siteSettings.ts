import { defineType } from "sanity";
export default defineType({
  name: "siteSettings", title: "Site Settings", type: "document",
  fields: [
    { name: "contactEmail", type: "string", title: "Contact Email" },
    { name: "contactPhone", type: "string", title: "Contact Phone" },
    { name: "address", type: "text", title: "Address", rows: 3 },
    {
      name: "social", type: "object", title: "Social",
      fields: [
        { name: "linkedin", type: "url" }, { name: "instagram", type: "url" },
      ],
    },
    { name: "seo", type: "seo" },
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
