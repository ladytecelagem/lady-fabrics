import { defineType } from "sanity";
export default defineType({
  name: "downloadAsset", title: "Download", type: "object",
  fields: [
    { name: "title", type: "string", title: "Title" },
    { name: "kind", type: "string", title: "Type", options: { list: ["technical-sheet","sample-book","care-guide","sustainability-doc","cad","other"] } },
    { name: "file", type: "file", title: "File" },
  ],
});
