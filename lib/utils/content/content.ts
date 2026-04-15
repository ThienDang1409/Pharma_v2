import type { Blog, InformationPreviewDto } from "@/lib/types";
import { extractImageUrl } from "@/lib/utils/image/image-handler";
import { getLocalizedText, stripHtmlTags } from "@/lib/utils/string/i18n";

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
