import { type SchemaTypeDefinition } from "sanity";
import homePage from "./documents/homePage";
import siteSettings from "./documents/siteSettings";
import collection from "./documents/collection";
import fabric from "./documents/fabric";
import furniture from "./documents/furniture";
import sampleBook from "./documents/sampleBook";
import industry from "./documents/industry";
import newsItem from "./documents/newsItem";
import trend from "./documents/trend";
import author from "./documents/author";
import localeString from "./objects/localeString";
import localeText from "./objects/localeText";
import localeBlock from "./objects/localeBlock";
import seo from "./objects/seo";
import specification from "./objects/specification";
import sampleBookPage from "./objects/sampleBookPage";
import downloadAsset from "./objects/downloadAsset";
import colorway from "./objects/colorway";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    homePage, siteSettings,
    collection, fabric, furniture, sampleBook, industry, newsItem, trend, author,
    localeString, localeText, localeBlock,
    seo, specification, sampleBookPage, downloadAsset, colorway,
  ],
};
