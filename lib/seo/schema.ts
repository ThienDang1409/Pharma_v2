import { siteConfig } from "@/config/site";
import type { SupportedLanguage } from "@/lib/constants/language";
import type { Blog, Information } from "@/lib/types";
import { extractImageUrl } from "@/lib/utils/image/image-handler";
import { getLocalizedText, stripHtmlTags } from "@/lib/utils/string/i18n";
import { getSeoRouteCopy } from "@/lib/seo/copy";
import { absoluteUrl, siteUrl } from "@/lib/seo/site";

interface JsonLdObject {
  [key: string]: unknown;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

function toIsoDate(value: string | Date | undefined): string | undefined {
  if (!value) return undefined;

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function resolveImageUrl(image: string | undefined): string | undefined {
  if (!image) return undefined;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return absoluteUrl(image);
}

function getBlogDescription(blog: Blog, language: SupportedLanguage): string {
  const localizedExcerpt = getLocalizedText(
    blog.excerpt || "",
    blog.excerpt_en || "",
    language
  );

  if (localizedExcerpt.trim()) {
    return stripHtmlTags(localizedExcerpt, 180);
  }

  const firstSectionContent = getLocalizedText(
    blog.sections?.[0]?.content || "",
    blog.sections?.[0]?.content_en || "",
    language
  );

  return stripHtmlTags(firstSectionContent, 180);
}

export function buildOrganizationJsonLd(
  language: SupportedLanguage = "vi"
): JsonLdObject {
  const copy = getSeoRouteCopy(language);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteUrl,
    description: copy.organizationDescription,
    logo: absoluteUrl("/images/logo_pharma_test.svg"),
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    sameAs: Object.values(siteConfig.social),
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      availableLanguage: ["vi", "en"],
    },
  };
}

export function buildBlogArticleJsonLd(
  blog: Blog,
  slug: string,
  language: SupportedLanguage = "vi"
): JsonLdObject {
  const localizedTitle = getLocalizedText(
    blog.title,
    blog.title_en,
    language
  );
  const localizedDescription = getBlogDescription(blog, language);
  const articleImage = resolveImageUrl(extractImageUrl(blog.image));
  const publishedTime = toIsoDate(blog.publishedAt || blog.createdAt);
  const modifiedTime = toIsoDate(blog.updatedAt) || publishedTime;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${slug}`),
    },
    headline: localizedTitle,
    description: localizedDescription,
    ...(articleImage ? { image: [articleImage] } : {}),
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      "@type": "Person",
      name: blog.author || siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo_pharma_test.svg"),
      },
    },
    inLanguage: language === "en" ? "en-US" : "vi-VN",
    ...(blog.tags?.length ? { keywords: blog.tags.join(", ") } : {}),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildBlogBreadcrumbJsonLd(
  blog: Blog,
  slug: string,
  language: SupportedLanguage = "vi"
): JsonLdObject {
  const blogTitle = getLocalizedText(blog.title, blog.title_en, language) || slug;

  return buildBreadcrumbJsonLd([
    {
      name: language === "en" ? "Home" : "Trang chủ",
      path: "/",
    },
    {
      name: language === "en" ? "Blog" : "Blog",
      path: "/blog",
    },
    {
      name: blogTitle,
      path: `/blog/${slug}`,
    },
  ]);
}

export function buildCategoryBreadcrumbJsonLd(
  category: Information,
  allCategories: Information[],
  language: SupportedLanguage = "vi"
): JsonLdObject {
  const ancestors: Information[] = [];
  let currentParentId = category.parentId ?? null;

  while (currentParentId) {
    const parent = allCategories.find((item) => item._id === currentParentId);
    if (!parent) break;
    ancestors.unshift(parent);
    currentParentId = parent.parentId ?? null;
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    {
      name: language === "en" ? "Home" : "Trang chủ",
      path: "/",
    },
    ...ancestors
      .filter((item) => Boolean(item.slug))
      .map((item) => ({
        name: getLocalizedText(item.name, item.name_en, language),
        path: `/category/${item.slug}`,
      })),
    {
      name: getLocalizedText(category.name, category.name_en, language),
      path: `/category/${category.slug}`,
    },
  ];

  return buildBreadcrumbJsonLd(breadcrumbItems);
}

export function buildProductJsonLd(
  blog: Blog,
  slug: string,
  language: SupportedLanguage = "vi"
): JsonLdObject {
  const productName = getLocalizedText(blog.title, blog.title_en, language) || slug;
  const productDescription = getBlogDescription(blog, language);
  const productImage = resolveImageUrl(extractImageUrl(blog.image));
  const categoryName =
    typeof blog.informationId === "object" && blog.informationId
      ? getLocalizedText(blog.informationId.name, blog.informationId.name_en, language)
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: productDescription,
    url: absoluteUrl(`/blog/${slug}`),
    ...(productImage ? { image: [productImage] } : {}),
    ...(categoryName ? { category: categoryName } : {}),
    ...(blog.tags?.length ? { keywords: blog.tags.join(", ") } : {}),
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}
