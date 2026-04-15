/**
 * Site-wide configuration
 */

export const siteConfig = {
  name: "Pharma Test",
  description: "Tập đoàn Dược phẩm Pharma Test - Chất lượng là trách nhiệm",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // Social links
  social: {
    facebook: "https://facebook.com/pharmatest",
    twitter: "https://twitter.com/pharmatest",
    linkedin: "https://linkedin.com/company/pharmatest",
    youtube: "https://youtube.com/@pharmatest",
    instagram: "https://instagram.com/pharmatest",
  },

  // Contact info
  contact: {
    email: "info@pharmatest.com",
    phone: "+84 123 456 789",
    address: "123 Main Street, Hanoi, Vietnam",
    mapEmbedUrl:
      process.env.NEXT_PUBLIC_CONTACT_MAP_EMBED_URL ||
      "https://www.google.com/maps?q=123+Main+Street,+Hanoi,+Vietnam&output=embed",
    mapDirectionsUrl:
      process.env.NEXT_PUBLIC_CONTACT_MAP_DIRECTIONS_URL ||
      "https://www.google.com/maps/search/?api=1&query=123+Main+Street,+Hanoi,+Vietnam",
  },

  // Default meta tags
  defaultMeta: {
    title: "Pharma Test - Tập đoàn Dược phẩm",
    description: "Chuyên cung cấp dược phẩm chất lượng cao",
    keywords: ["dược phẩm", "pharma", "thuốc", "y tế", "sức khỏe"],
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    blogPageSize: 12,
    newsPageSize: 15,
  },
} as const;

export type SiteConfig = typeof siteConfig;
