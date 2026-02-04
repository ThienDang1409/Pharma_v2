/**
 * Utility functions for slug generation
 */

/**
 * Generate URL-friendly slug from Vietnamese text
 * @param text - Input text (Vietnamese or English)
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  // Vietnamese character map
  const vietnameseMap: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
    ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
    ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
    ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
    ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
    đ: "d",
    À: "A", Á: "A", Ả: "A", Ã: "A", Ạ: "A",
    Ă: "A", Ằ: "A", Ắ: "A", Ẳ: "A", Ẵ: "A", Ặ: "A",
    Â: "A", Ầ: "A", Ấ: "A", Ẩ: "A", Ẫ: "A", Ậ: "A",
    È: "E", É: "E", Ẻ: "E", Ẽ: "E", Ẹ: "E",
    Ê: "E", Ề: "E", Ế: "E", Ể: "E", Ễ: "E", Ệ: "E",
    Ì: "I", Í: "I", Ỉ: "I", Ĩ: "I", Ị: "I",
    Ò: "O", Ó: "O", Ỏ: "O", Õ: "O", Ọ: "O",
    Ô: "O", Ồ: "O", Ố: "O", Ổ: "O", Ỗ: "O", Ộ: "O",
    Ơ: "O", Ờ: "O", Ớ: "O", Ở: "O", Ỡ: "O", Ợ: "O",
    Ù: "U", Ú: "U", Ủ: "U", Ũ: "U", Ụ: "U",
    Ư: "U", Ừ: "U", Ứ: "U", Ử: "U", Ữ: "U", Ự: "U",
    Ỳ: "Y", Ý: "Y", Ỷ: "Y", Ỹ: "Y", Ỵ: "Y",
    Đ: "D",
  };

  // Convert Vietnamese to ASCII
  let slug = text.split("").map(char => vietnameseMap[char] || char).join("");

  // Convert to lowercase and remove special characters
  slug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-")          // Replace spaces with -
    .replace(/-+/g, "-")           // Replace multiple - with single -
    .replace(/^-+|-+$/g, "");      // Trim - from start and end

  return slug;
}

/**
 * Validate if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Extract slug from a URL path
 */
export function extractSlugFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}
