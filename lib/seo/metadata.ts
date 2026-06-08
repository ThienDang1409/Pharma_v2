import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { SupportedLanguage } from "@/lib/constants/language";
import type { Blog, Information } from "@/lib/types";
import { extractImageUrl } from "@/lib/utils/image/image-handler";
import { getLocalizedText, stripHtmlTags } from "@/lib/utils/string/i18n";
import { absoluteUrl } from "@/lib/seo/site";

const DEFAULT_DESCRIPTION_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  vi: "Nhà sản xuất thiết bị kiểm nghiệm giá trị cao cho ngành dược phẩm, thực phẩm và mỹ phẩm trên toàn thế giới.",
  en: "Leading manufacturer of high-value testing equipment for the pharmaceutical, food and cosmetics industry worldwide.",
};

const OPEN_GRAPH_LOCALE: Record<SupportedLanguage, string> = {
  vi: "vi_VN",
  en: "en_US",
};

const OPEN_GRAPH_ALTERNATE_LOCALE: Record<SupportedLanguage, string[]> = {
  vi: ["en_US"],
  en: ["vi_VN"],
};

const DEFAULT_OPEN_GRAPH_IMAGE = "/images/pharma-test-world.png";

type OpenGraphType = "website" | "article";

interface PageMetadataOptions {
  title: string;
  description?: string;
  path: string;
  language?: SupportedLanguage;
  noIndex?: boolean;
  image?: string;
  keywords?: string[];
  type?: OpenGraphType;
  publishedTime?: string;
  modifiedTime?: string;
}

function normalizeDescription(
  description: string | undefined,
  language: SupportedLanguage
): string {
  const fallbackDescription =
    language === "en"
      ? DEFAULT_DESCRIPTION_BY_LANGUAGE.en
      : siteConfig.description || DEFAULT_DESCRIPTION_BY_LANGUAGE.vi;

  const source = description?.trim() || fallbackDescription;
  return stripHtmlTags(source, 170);
}

function toIsoDate(value: string | Date | undefined): string | undefined {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
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
    return normalizeDescription(localizedExcerpt, language);
  }

  const localizedSectionContent = getLocalizedText(
    blog.sections?.[0]?.content || "",
    blog.sections?.[0]?.content_en || "",
    language
  );

  return normalizeDescription(localizedSectionContent, language);
}

export function buildPageMetadata({
  title,
  description,
  path,
  language = "vi",
  noIndex = false,
  image,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const normalizedDescription = normalizeDescription(description, language);
  const images = [resolveImageUrl(image || DEFAULT_OPEN_GRAPH_IMAGE)].filter(
    Boolean
  ) as string[];
  const openGraphLocale = OPEN_GRAPH_LOCALE[language];
  const alternateLocale = OPEN_GRAPH_ALTERNATE_LOCALE[language];
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description: normalizedDescription,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description: normalizedDescription,
      url: absoluteUrl(canonicalPath),
      siteName: siteConfig.name,
      locale: openGraphLocale,
      alternateLocale,
      type,
      images,
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: normalizedDescription,
      images,
    },
  };
}

export function buildBlogMetadata(
  blog: Blog,
  slug: string,
  language: SupportedLanguage = "vi"
): Metadata {
  const localizedTitle = getLocalizedText(
    blog.title,
    blog.title_en,
    language
  );
  const title = `${localizedTitle || "Article"} | ${siteConfig.name}`;
  const image = resolveImageUrl(extractImageUrl(blog.image));

  return buildPageMetadata({
    title,
    description: getBlogDescription(blog, language),
    path: `/blog/${slug}`,
    language,
    image,
    keywords: blog.tags,
    type: "article",
    publishedTime: toIsoDate(blog.publishedAt || blog.createdAt),
    modifiedTime: toIsoDate(blog.updatedAt),
  });
}

export function buildCategoryMetadata(
  category: Information,
  slug: string,
  language: SupportedLanguage = "vi"
): Metadata {
  const categoryName = getLocalizedText(
    category.name,
    category.name_en,
    language
  );
  const title = `${categoryName} | ${siteConfig.name}`;
  const description = getLocalizedText(
    category.description || "",
    category.description_en || "",
    language
  );
  const image = resolveImageUrl(extractImageUrl(category.image));

  return buildPageMetadata({
    title,
    description,
    path: `/category/${slug}`,
    language,
    image,
  });
}
