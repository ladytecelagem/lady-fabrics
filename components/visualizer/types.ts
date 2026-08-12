export type VisFabric = {
  id: string;
  name: string;
  code: string | null;
  swatch: string;              // texture_url (tileável) ou swatch_url
  category?: string;
  dominant_colors?: { hex: string; ratio: number }[];
};

export type VisFurniture = {
  id: string;
  name: string;
  category?: string;
  base: string;                // base_image_url
  mask?: string | null;        // mask_url
  shading?: string | null;     // shading_url
  thumb?: string | null;
};
