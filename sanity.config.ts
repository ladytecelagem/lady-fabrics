import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./sanity/env";

export default defineConfig({
  basePath: "/studio",
  projectId, dataset,
  schema,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list().title("Lady Fabrics").items([
          S.listItem().title("🏠 Home").child(S.document().schemaType("homePage").documentId("homePage")),
          S.listItem().title("⚙️ Site Settings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          S.divider(),
          S.documentTypeListItem("collection").title("📐 Collections"),
          S.documentTypeListItem("sampleBook").title("📕 Sample Books"),
          S.documentTypeListItem("industry").title("🏛 Industries"),
          S.divider(),
          S.documentTypeListItem("newsItem").title("📰 News"),
          S.documentTypeListItem("trend").title("📈 Trends"),
          S.divider(),
          S.documentTypeListItem("author").title("✍ Authors"),
        ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
