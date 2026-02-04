/**
 * Helper functions for i18n content
 */

export type Language = "vi" | "en";

/**
 * Get localized text based on current language
 * Falls back to Vietnamese if English version is not available
 */
export function getLocalizedText(
  viText: string,
  enText: string | undefined | null,
  language: Language
): string {
  if (language === "en" && enText) {
    return enText;
  }
  return viText;
}

/**
 * Get localized field name for API queries
 */
export function getLocalizedFieldName(
  fieldName: string,
  language: Language
): string {
  if (language === "en") {
    return `${fieldName}_en`;
  }
  return fieldName;
}

/**
 * Strip HTML tags from text and truncate
 * @param html - HTML string to clean
 * @param maxLength - Max character length (default 150)
 */
export function stripHtmlTags(html: string, maxLength: number = 150): string {
  if (!html) return "";
  
  const stripped = html
    .replace(/<[^>]*>/g, "")           // Remove HTML tags
    .replace(/&nbsp;/g, " ")           // Replace nbsp
    .replace(/&lt;/g, "<")             // Replace &lt;
    .replace(/&gt;/g, ">")             // Replace &gt;
    .replace(/&amp;/g, "&")            // Replace &amp;
    .trim();
  
  if (stripped.length <= maxLength) {
    return stripped;
  }
  
  return stripped.substring(0, maxLength).trimEnd() + "...";
}
