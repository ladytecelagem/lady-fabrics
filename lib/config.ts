export const siteConfig = {
  name: "Lady Fabrics",
  tagline: "Architectural Textile Intelligence",
  description: "Premium textile solutions for corporate, hospitality, residential and acoustic environments.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lady-fabrics.com",
  ogImage: "/og.jpg",
  contact: {
    email: "hello@lady-fabrics.com",
    phone: "",
  },
  social: {
    linkedin: "",
    instagram: "",
  },
};

export const nav = [
  { href: "/collections", key: "collections" },
  { href: "/visualizer", key: "visualizer" },
  { href: "/sample-books", key: "sampleBooks" },
  { href: "/industries", key: "industries" },
  { href: "/intelligence", key: "intelligence" },
  { href: "/sustainability", key: "sustainability" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;
