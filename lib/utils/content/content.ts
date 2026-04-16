import type { Blog, BlogSection, InformationPreviewDto } from "@/lib/types";
import { extractImageUrl } from "@/lib/utils/image/image-handler";
import { getLocalizedText, stripHtmlTags } from "@/lib/utils/string/i18n";
import { generateSlug } from "@/lib/utils/string/slug";

export type CategoryRef = string | InformationPreviewDto | null | undefined;

export function getCategoryId(category: CategoryRef): string | null {
  if (!category) return null;
  if (typeof category === "string") return category;
  return category._id || null;
}

export function getCategoryPreview(
  category: CategoryRef
): InformationPreviewDto | null {
  if (!category || typeof category === "string") return null;
  return category;
}

export function getBlogId(blog: Pick<Blog, "id" | "_id">): string {
  return blog._id || blog.id;
}

export function getBlogImageUrl(blog: Pick<Blog, "image">): string {
  return extractImageUrl(blog.image);
}

export function getBlogExcerpt(
  blog: Pick<Blog, "excerpt" | "excerpt_en" | "sections">,
  language: "vi" | "en",
  maxLength = 180
): string {
  const localizedExcerpt = getLocalizedText(
    blog.excerpt || "",
    blog.excerpt_en || "",
    language
  );

  if (localizedExcerpt?.trim()) {
    return localizedExcerpt.trim();
  }

  const firstSection = blog.sections?.[0];
  const content = getLocalizedText(
    firstSection?.content || "",
    firstSection?.content_en || "",
    language
  );

  if (!content?.trim()) {
    return "";
  }

  return stripHtmlTags(content, maxLength);
}

export interface BlogSectionMeta {
  section: BlogSection;
  index: number;
  anchor: string;
  displayTitle: string;
  hasDisplayTitle: boolean;
}

const normalizeText = (value?: string | null): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export function getSectionDisplayTitle(
  section: BlogSection,
  language: "vi" | "en"
): string {
  const preferred =
    language === "en"
      ? normalizeText(section.title_en)
      : normalizeText(section.title);
  if (preferred) return preferred;

  const fallback =
    language === "en"
      ? normalizeText(section.title)
      : normalizeText(section.title_en);
  return fallback;
}

export function getSectionLocalizedContent(
  section: BlogSection,
  language: "vi" | "en"
): string {
  const preferred =
    language === "en"
      ? section.content_en || ""
      : section.content || "";

  if (preferred?.trim()) {
    return preferred;
  }

  const fallback =
    language === "en"
      ? section.content || ""
      : section.content_en || "";

  return fallback;
}

export function getSectionAnchor(section: BlogSection, index: number): string {
  const slug = normalizeText(section.slug);
  if (slug) return slug;

  const titleForSlug = normalizeText(section.title) || normalizeText(section.title_en);
  if (titleForSlug) {
    const generated = generateSlug(titleForSlug);
    if (generated) return generated;
  }

  return `section-${index + 1}`;
}

export function buildSectionMeta(
  sections: BlogSection[] | undefined,
  language: "vi" | "en"
): BlogSectionMeta[] {
  return (sections || []).map((section, index) => {
    const displayTitle = getSectionDisplayTitle(section, language);
    return {
      section,
      index,
      anchor: getSectionAnchor(section, index),
      displayTitle,
      hasDisplayTitle: Boolean(displayTitle),
    };
  });
}
