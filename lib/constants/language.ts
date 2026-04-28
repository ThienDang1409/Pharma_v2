export const DEFAULT_LANGUAGE = "vi" as const;

export const LANGUAGE_COOKIE_NAME = "site_lang";
export const LANGUAGE_STORAGE_KEY = "site_lang";

export type SupportedLanguage = "vi" | "en";

export function normalizeLanguage(
  value: string | null | undefined,
  fallback: SupportedLanguage = DEFAULT_LANGUAGE
): SupportedLanguage {
  return value === "en" || value === "vi" ? value : fallback;
}
