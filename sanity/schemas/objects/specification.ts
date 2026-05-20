import { defineType } from "sanity";
export default defineType({
  name: "specification", title: "Specification", type: "object",
  fields: [
    { name: "label", type: "string", title: "Label" },
    { name: "value", type: "string", title: "Value" },
    { name: "unit", type: "string", title: "Unit" },
    { name: "standard", type: "string", title: "Standard (e.g. ISO 12947)" },
  ],
  preview: {
    select: { title: "label", subtitle: "value" },
  },
});
