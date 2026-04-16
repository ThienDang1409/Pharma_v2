/**
 * Site-wide configuration
 */

export const siteConfig = {
  name: "VietAnh Instruments",
  description: "Tập đoàn Dược phẩm VietAnh Instruments - Chất lượng là trách nhiệm",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // Social links
  social: {
    facebook: "https://www.facebook.com/ThietBiVietAnh",
    twitter: "https://twitter.com/pharmatest",
    linkedin: "https://www.linkedin.com/in/viet-anh-instruments-5b0b609a/",
    youtube: "https://www.youtube.com/channel/UCom4SiCruEM3wOE96phgu3w?view_as=subscriber",
    instagram: "https://instagram.com/pharmatest",
  },

  // Contact info
  contact: {
    email: "va@vietanh.vn",
    phone: "+84 916 424 731",
    address: "P808, 8/F, Viwaseen Building 48 Tố Hữu, P. Đại Mỗ, Tp. Hà Nội",
    mapEmbedUrl:
      process.env.NEXT_PUBLIC_CONTACT_MAP_EMBED_URL ||
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4804635794394!2d106.7525996!3d10.7744655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317525c3593cf4d1%3A0xce6bf57685888988!2zQ8OUTkcgVFkgQ-G7lCBQSOG6pk4gVEhJ4bq-VCBC4buKIFZJ4buGVCBBTkg!5e0!3m2!1svi!2s!4v1776300876014!5m2!1svi!2s",
    mapDirectionsUrl:
      process.env.NEXT_PUBLIC_CONTACT_MAP_DIRECTIONS_URL ||
      "https://www.google.com/maps/search/?api=1&query=123+Main+Street,+Hanoi,+Vietnam",
  },

  // Default meta tags
  defaultMeta: {
    title: "VietAnh Instruments - Tập đoàn Dược phẩm",
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
