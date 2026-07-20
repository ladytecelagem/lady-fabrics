export type FabricVis = {
  id: string;
  name: string;
  code?: string;
  collection?: string;
  swatch: string;            // URL do visualizerSwatch (ou mainImage)
  category?: string;
  pxPerCm?: number;
};

export type FurnitureVis = {
  id: string;
  name: string;
  category?: string;
  base: string;              // URL baseImage
  mask?: string;             // URL maskImage
  shading?: string;          // URL shadingImage
  swatchScale?: number;
};
