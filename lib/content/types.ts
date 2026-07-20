export type Page = {
  id: string;
  key: string;
  title: string | null;
  eyebrow: string | null;
  subtitle: string | null;
  body: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  sections: Section[];
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
};

export type Section = {
  type: string;
  heading?: string;
  body?: string;
  image_url?: string;
  items?: { heading?: string; body?: string; image_url?: string }[];
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  tagline: string | null;
  story: string | null;
  fiber: string | null;
  applications: string[];
  hero_image_url: string | null;
  gallery: string[];
  order: number;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
};

export type Fabric = {
  id: string;
  name: string;
  code: string | null;
  color_name: string | null;
  swatch_url: string;
  texture_url: string | null;
  thumb_url: string | null;
  dominant_colors: { hex: string; ratio: number }[];
  collection_id: string | null;
  description: string | null;
  composition: string | null;
  weight: number | null;
  width: number | null;
  martindale: number | null;
  certifications: string[];
  care: string | null;
  in_visualizer: boolean;
  order: number;
};

export type Industry = {
  id: string;
  name: string;
  slug: string;
  order: number;
  description: string | null;
  story: string | null;
  image_url: string | null;
  gallery: string[];
  recommended_collection_ids: string[];
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
};

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  category: string | null;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
};

export type Furniture = {
  id: string;
  name: string;
  slug: string;
  category: string;
  base_image_url: string;
  mask_url: string | null;
  shading_url: string | null;
  thumb_url: string | null;
};
